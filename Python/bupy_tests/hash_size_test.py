from pathlib import Path
import hashlib
import time

d = Path('/home/erik/scripts/backup/bupy_size_test_files')

for p in d.iterdir():
    t0 = time.time()
    b = p.read_bytes()
    t1 = time.time()
    with p.open('rb') as f:
        b1 = f.read(1024)
        f.seek(-1024, 2)
        b2 = f.read(1024)
    t2 = time.time()
    print(p.name + '\t' + str(t1 - t0) + '\t' + str(t2 - t1))

for p in d.iterdir():
    t0 = time.time()
    b = hash(p.read_bytes())
    t1 = time.time()
    with p.open('rb') as f:
        b1 = hash(f.read(1024))
        f.seek(-1024, 2)
        b2 = hash(f.read(1024))
    t2 = time.time()
    print(p.name + '\t' + str(t1 - t0) + '\t' + str(t2 - t1))
