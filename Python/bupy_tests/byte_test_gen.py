from pathlib import Path
import hashlib
import time

fp = Path('/home/erik/torrents/Office 2016/MS Office PRO Plus 2016 v16.0.4266.1003.rar')

def get_bytes():
    t = time.time()
    for fp_bytes in fbytes():
        fb = fp_bytes
    print('byte_test_gen:\t' + str(time.time() - t))

def fbytes():
    with fp.open('rb') as f:
        for block in iter(lambda: f.read(65536), b''):
            yield block

get_bytes()
