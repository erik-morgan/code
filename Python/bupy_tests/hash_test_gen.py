from pathlib import Path
import hashlib
import time

fp = Path('/home/erik/torrents/Office 2016/MS Office PRO Plus 2016 v16.0.4266.1003.rar')

def hash_md5():
    t = time.time()
    h = hashlib.md5()
    for fp_bytes in fbytes():
        h.update(fp_bytes)
    print(h.hexdigest())
    print('MD5:\t' + str(time.time() - t))

def hash_sha():
    t = time.time()
    h = hashlib.sha1()
    for fp_bytes in fbytes():
        h.update(fp_bytes)
    print(h.hexdigest())
    print('SHA:\t' + str(time.time() - t))

def hash_256():
    t = time.time()
    h = hashlib.sha256()
    for fp_bytes in fbytes():
        h.update(fp_bytes)
    print(h.hexdigest())
    print('256:\t' + str(time.time() - t))

def fbytes():
    with fp.open('rb') as f:
        for block in iter(lambda: f.read(65536), b''):
            yield block

hash_md5()
hash_sha()
hash_256()
