#!/usr/bin/python
# TODO: Backup system once a week, and home folder daily
from pathlib import Path
from datetime import datetime
import hashlib

BUPY_INCL = Path(__file__).parent / 'bupy_include'
BUPY_EXCL = Path(__file__).parent / 'bupy_exclude'
SRC_DIRS = [Path(d) for d in BUPY_INCL.read_text().splitlines()]
EXCLUDE_PATTERNS = [Path(d) for d in BUPY_EXCL.read_text().splitlines()]

def backup_init():
    if not Path('/run/media/erik/wd_backup').exists():
        print('Could not locate wd_backup drive in /run/media/erik')
        return 1
    dest_drive = Path('/run/media/erik/wd_backup')
    dest_root = dest_drive / 'bupy'
    if not dest_root.exists():
        dest_root.mkdir()
    bupy_time = datetime.now().isoformat(timespec='seconds')
    dest = dest_root / bupy_time
    dest.mkdir()
    last_dir = max(root.glob('./[0-9][0-9][0-9][0-9]*'))
    main(dest, dest / last_dir)

def main(dest_dir, ref_dir):
    for f in SRC_DIRS:
        backup(f)

def backup(disk_item):
    if exclusion_test(disk_item):
        return
    if disk_item.is_dir():
        # test if disk_item already exists in dest
        map(lambda item: backup(item), disk_item.iterdir())
    else:
        

def exclusion_test(f):
    # test if given Path, f, is excluded
    return any(f.match(excl_pattern) for excl_pattern in EXCLUDE_PATTERNS)

def is_diff(f1, f2):
    s1, s2 = f1.stat(), f2.stat()
    # if s1.st_size == s2.st_size and s1.st_mtime == s2.st_mtime and hash_comp(f1, f2):
    if s1.st_size == s2.st_size and s1.st_mtime == s2.st_mtime and byte_comp(f1, f2):
        return True

def byte_comp(a, b):
    # return all(a_b == b_b for a_b, b_b in zip(get_bytes(a), get_bytes(b)))
    for a_bytes, b_bytes in zip(get_bytes(a), get_bytes(b)):
        if a_bytes != b_bytes:
            return False
    return True

def get_bytes(byte_file):
    with byte_file.open('rb') as f:
        for block in iter(lambda: f.read(65536), b''):
            yield block

def hash_comp(a, b):
    return get_hash(a) == get_hash(b)

def get_hash(file_path):
    file_hash = hashlib.md5()
    # for file_block in get_bytes(file_path):
    #     file_hash.update(file_block)
    with file_path.open('rb') as fp:
        blk = fp.read(65536)
        while blk:
            file_hash.update(blk)
            blk = fp.read(65536)
        # for blk in iter(lambda: f.read(65536), b''):
        # file_hash.update(blk)
    return file_hash.hexdigest()

# test exclusions for /
# if it has a slash, it's a path; otherwise, it's a name
# either way, if it has a glob, use Path.match(glob-pattern)!