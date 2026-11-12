"""TikTok "ghost patch": a Python port of MaxUpload's Variant 3 (CompressBase's "17/3 ghost ratio" patch).

What it does to a fast-start MP4 (ftyp, moov, mdat):
  * appends round(videoSamples * 17/3) fake 8-byte video samples (one empty type-0 NAL, which decoders skip),
    each in its own chunk, all pointing at one copy stored at the very end of mdat;
  * moves the video clock to ~90 kHz and makes the last real frame one tick long, so the ghosts take ~0 s;
  * interleaves audio and video sample by sample in decode order (as ffmpeg muxes);
  * zeroes mvhd/tkhd/mdhd creation and modification times, and rewrites ftyp like the CompressBase API does.
The picture and sound bytes are copied untouched. Usage: python3 -I tiktok_ghost_patch.py in.mp4 out.mp4
"""
import struct, sys

GHOSTS_PER_SAMPLE = 17 / 3
GHOST_TIMESCALE = 90_000
GHOST_SAMPLE = bytes([0, 0, 0, 4, 0, 0, 0, 0])
FREE_BOX = bytes([0, 0, 0, 8]) + b'free'
CONTAINERS = {b'moov', b'trak', b'edts', b'mdia', b'minf', b'stbl'}
MAX_U32 = 0xFFFFFFFF


def top_boxes(f, size):
    out, off = [], 0
    while off < size:
        f.seek(off)
        sz, typ = struct.unpack('>I4s', f.read(8))
        hl = 8
        if sz == 1:
            sz = struct.unpack('>Q', f.read(8))[0]; hl = 16
        elif sz == 0:
            sz = size - off
        out.append((typ, off, hl, sz))
        off += sz
    return out


def parse(b):
    boxes, off = [], 0
    while off < len(b):
        sz, typ = struct.unpack_from('>I4s', b, off)
        if sz < 8 or off + sz > len(b):
            raise ValueError('Invalid MP4 metadata.')
        payload = b[off + 8:off + sz]
        boxes.append({'type': typ, 'children': parse(payload)} if typ in CONTAINERS else {'type': typ, 'payload': payload})
        off += sz
    return boxes


def ser(box):
    body = b''.join(ser(c) for c in box['children']) if 'children' in box else box['payload']
    return struct.pack('>I4s', 8 + len(body), box['type']) + body


def child(box, typ):
    for c in box['children']:
        if c['type'] == typ:
            return c
    raise ValueError(f'MP4 metadata has no {typ} box.')


def find(box, typ):
    return next((c for c in box['children'] if c['type'] == typ), None)


def stbl_of(trak): return child(child(child(trak, b'mdia'), b'minf'), b'stbl')
def handler_of(trak): return child(child(trak, b'mdia'), b'hdlr')['payload'][8:12]
def timescale_of(mdhd): return struct.unpack_from('>I', mdhd, 20 if mdhd[0] == 1 else 12)[0]
def count_of(p): return struct.unpack_from('>I', p, 4)[0]
def words(b, off, n): return list(struct.unpack_from(f'>{n}I', b, off))


def table(count, values):
    return struct.pack(f'>II{len(values)}I', 0, count, *values)


def read_samples(trak):
    stbl = stbl_of(trak)
    ts = timescale_of(child(child(trak, b'mdia'), b'mdhd')['payload'])
    stsz = child(stbl, b'stsz')['payload']
    fixed, n = words(stsz, 4, 2)
    sizes = [fixed] * n if fixed else words(stsz, 12, n)
    if find(stbl, b'stco') is None:
        raise ValueError('Needs 32-bit chunk offsets (stco), file is too big or uses co64.')
    stco = child(stbl, b'stco')['payload']
    chunk_offsets = words(stco, 8, count_of(stco))
    stsc = child(stbl, b'stsc')['payload']
    runs = words(stsc, 8, 3 * count_of(stsc))
    offsets, descs, run = [], [], 0
    for chunk, at in enumerate(chunk_offsets):
        if len(offsets) >= n:
            break
        while 3 * (run + 1) < len(runs) and runs[3 * (run + 1)] - 1 <= chunk:
            run += 1
        for _ in range(runs[3 * run + 1]):
            if len(offsets) >= n:
                break
            offsets.append(at); descs.append(runs[3 * run + 2]); at += sizes[len(offsets) - 1]
    stts = child(stbl, b'stts')['payload']
    pr = words(stts, 8, 2 * count_of(stts))
    deltas = [d for c, d in zip(pr[0::2], pr[1::2]) for _ in range(c)]
    if len(offsets) != n or len(deltas) < n:
        raise ValueError('MP4 sample tables do not match.')
    times, t = [], 0
    for d in deltas[:n]:
        times.append(t / ts); t += d
    return {'sizes': sizes, 'offsets': offsets, 'descs': descs, 'times': times}


def interleaved_chunks(tracks):
    order = sorted(((s['times'][i], ti, i) for ti, s in enumerate(tracks) for i in range(len(s['times']))))
    starts = []
    for k, (_, ti, i) in enumerate(order):
        if k:
            _, pt, pi = order[k - 1]
            if pt == ti and pi + 1 == i and tracks[ti]['descs'][pi] == tracks[ti]['descs'][i]:
                continue
        starts.append(k)
    return [{'track': order[s][1], 'first': order[s][2], 'count': (starts[j + 1] if j + 1 < len(starts) else len(order)) - s}
            for j, s in enumerate(starts)]


def media_ranges(tracks, chunks):
    ranges = []
    for c in chunks:
        t = tracks[c['track']]
        for i in range(c['first'], c['first'] + c['count']):
            s, e = t['offsets'][i], t['offsets'][i] + t['sizes'][i]
            if ranges and ranges[-1][1] == s:
                ranges[-1][1] = e
            else:
                ranges.append([s, e])
    return ranges


def chunk_tables(tracks, chunks):
    rel, acc = [], 0
    for c in chunks:
        rel.append(acc); acc += sum(tracks[c['track']]['sizes'][c['first']:c['first'] + c['count']])
    out = []
    for ti, t in enumerate(tracks):
        own = [dict(c, offset=rel[k]) for k, c in enumerate(chunks) if c['track'] == ti]
        runs = []
        for k, c in enumerate(own):
            p = own[k - 1] if k else None
            if p and p['count'] == c['count'] and t['descs'][p['first']] == t['descs'][c['first']]:
                continue
            runs.append([k + 1, c['count'], t['descs'][c['first']]])
        out.append({'offsets': [c['offset'] for c in own], 'runs': runs})
    return out


def stsz_with_ghosts(p, n):
    if struct.unpack_from('>I', p, 4)[0] != 0:
        raise ValueError('Video samples must have individual sizes.')
    out = bytearray(p) + struct.pack(f'>{n}I', *([len(GHOST_SAMPLE)] * n))
    struct.pack_into('>I', out, 8, struct.unpack_from('>I', p, 8)[0] + n)
    return bytes(out)


def no_times(p):
    out = bytearray(p)
    end = 20 if p[0] == 1 else 12
    out[4:end] = bytes(end - 4)
    return bytes(out)


TIME_EDITS = {b'mvhd': no_times, b'tkhd': no_times, b'mdhd': no_times}


def retimed_video(mdhd, stts, ctts):
    v1 = mdhd[0] == 1
    ts = timescale_of(mdhd)
    factor = max(1, round(GHOST_TIMESCALE / ts))
    pr = words(stts, 8, 2 * count_of(stts))
    entries = [[c, d * factor] for c, d in zip(pr[0::2], pr[1::2]) if c]
    lc, ld = entries[-1]
    timed = entries[:-1] + ([[lc - 1, ld]] if lc > 1 else []) + [[1, 1]]
    dur = sum(c * d for c, d in timed)
    if ts * factor > MAX_U32 or (not v1 and dur > MAX_U32):
        raise ValueError('Video timing out of range.')
    m = bytearray(mdhd)
    struct.pack_into('>I', m, 20 if v1 else 12, ts * factor)
    if v1:
        struct.pack_into('>Q', m, 24, dur)
    else:
        struct.pack_into('>I', m, 16, dur)
    nc = None
    if ctts is not None:
        nc = bytearray(ctts)
        for i in range(count_of(nc)):
            at = 12 + 8 * i
            if nc[0] == 1:
                struct.pack_into('>i', nc, at, struct.unpack_from('>i', nc, at)[0] * factor)
            else:
                struct.pack_into('>I', nc, at, struct.unpack_from('>I', nc, at)[0] * factor)
        nc = bytes(nc)
    return factor, bytes(m), table(len(timed), [x for e in timed for x in e]), nc


def elst_retimed(p, factor):
    out = bytearray(p)
    v1 = out[0] == 1
    for i in range(count_of(out)):
        at = 8 + (20 if v1 else 12) * i + (8 if v1 else 4)
        fmt = '>q' if v1 else '>i'
        t = struct.unpack_from(fmt, out, at)[0]
        if t != -1:
            struct.pack_into(fmt, out, at, t * factor)
    return bytes(out)


def edit_tables(box, edits):
    if 'children' in box:
        return dict(box, children=[edit_tables(c, edits) for c in box['children']])
    if box['type'] in edits:
        return dict(box, payload=edits[box['type']](box['payload']))
    return box


def patch(src, dst):
    with open(src, 'rb') as f:
        f.seek(0, 2); size = f.tell()
        tops = [t for t in top_boxes(f, size) if t[0] not in (b'free', b'skip', b'wide')]
        if [t[0] for t in tops] != [b'ftyp', b'moov', b'mdat']:
            raise ValueError(f'Needs a fast-start MP4 (ftyp, moov, mdat), got {[t[0] for t in tops]}. Use -movflags +faststart.')
        _, mo, mh, ms = tops[1]
        f.seek(mo + mh); moov = parse(f.read(ms - mh))
        traks = [b for b in moov if b['type'] == b'trak']
        vi = next(i for i, t in enumerate(traks) if handler_of(t) == b'vide')
        tracks = [read_samples(t) for t in traks]
        chunks = interleaved_chunks(tracks)
        tables = chunk_tables(tracks, chunks)
        media_len = sum(sum(t['sizes']) for t in tracks)
        video = tracks[vi]
        ghosts = round(len(video['sizes']) * GHOSTS_PER_SAMPLE)
        vstbl = stbl_of(traks[vi])
        ctts = find(vstbl, b'ctts')
        factor, mdhd, stts, nctts = retimed_video(child(child(traks[vi], b'mdia'), b'mdhd')['payload'],
                                                  child(vstbl, b'stts')['payload'], ctts and ctts['payload'])
        entry = child(vstbl, b'stsd')['payload'][12:16]
        ftyp = ser({'type': b'ftyp', 'payload': b'isom' + struct.pack('>I', 512) + b'isomiso2' + entry + b'mp41'})

        def edits_for(ti, start):
            if ti < 0:
                return TIME_EDITS
            isv = ti == vi
            runs = tables[ti]['runs'] + ([[len(tables[ti]['offsets']) + 1, 1, video['descs'][-1]]] if isv else [])
            offs = [start + o for o in tables[ti]['offsets']] + ([start + media_len] * ghosts if isv else [])
            e = dict(TIME_EDITS)
            e[b'stsc'] = lambda p: table(len(runs), [x for r in runs for x in r])
            e[b'stco'] = lambda p: table(len(offs), offs)
            if isv:
                e[b'mdhd'] = lambda p: no_times(mdhd)
                e[b'stts'] = lambda p: stts
                e[b'ctts'] = lambda p: nctts
                e[b'elst'] = lambda p: elst_retimed(p, factor)
                e[b'stsz'] = lambda p: stsz_with_ghosts(p, ghosts)
            return e

        def moov_for(start):
            kids = [edit_tables(b, edits_for(traks.index(b) if b['type'] == b'trak' else -1, start)) for b in moov]
            return ser({'type': b'moov', 'children': kids})

        start = len(ftyp) + len(FREE_BOX) + len(moov_for(0)) + 8
        if start + media_len + len(GHOST_SAMPLE) > MAX_U32:
            raise ValueError('File too large for 32-bit chunk offsets (keep it under 4 GB).')
        with open(dst, 'wb') as o:
            o.write(ftyp + FREE_BOX + moov_for(start))
            o.write(struct.pack('>I4s', 8 + media_len + len(GHOST_SAMPLE), b'mdat'))
            for s, e in media_ranges(tracks, chunks):
                f.seek(s)
                left = e - s
                while left:
                    buf = f.read(min(left, 8 << 20)); o.write(buf); left -= len(buf)
            o.write(GHOST_SAMPLE)
    print(f'patched: {len(video["sizes"])} frames + {ghosts} ghosts, video clock x{factor}, {len(chunks)} chunks -> {dst}')


if __name__ == '__main__':
    patch(sys.argv[1], sys.argv[2])
