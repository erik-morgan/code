from pathlib import Path
import hashlib
import time

fp = Path('/home/erik/torrents/Office 2016/MS Office PRO Plus 2016 v16.0.4266.1003.rar')

def hash_it(alg, blk):
    with fp.open('rb') as f:
        if alg == 'MD5':
            h = hashlib.md5()
        elif alg == 'SHA':
            h = hashlib.sha1()
        elif alg == '256':
            h = hashlib.sha256()
        t = time.time()
        fb = f.read(blk)
        while fb:
            h.update(fb)
            fb = f.read(blk)
    fp_hash = h.hexdigest()
    t_end = time.time()
    print(alg + f' ({blk}):\t' + str(t_end - t))

hash_it('MD5', 8192)
hash_it('MD5', 65536)
hash_it('SHA', 8192)
hash_it('SHA', 65536)
hash_it('256', 8192)
hash_it('256', 65536)
