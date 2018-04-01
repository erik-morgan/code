from pathlib import Path
import hashlib
import time

fp = Path('/home/erik/torrents/Office 2016/MS Office PRO Plus 2016 v16.0.4266.1003.rar')
t = time.time()
with fp.open('rb') as f:
    b1 = f.read(1024)
    f.seek(-1024, 2)
    b2 = f.read(1024)
    t_b = time.time() - t
    print('(b1,b2):'.ljust(15) + str(t_b))

def hash_md5():
    t = time.time()
    h = hashlib.md5
    fp_hash = (h(b1), h(b2))
    print('MD5:'.ljust(15) + str(t_b + (time.time() - t)))
    t = time.time()
    h = hashlib.md5()
    h.update(b1)
    h.update(b2)
    fp_hash = h.hexdigest()
    print('MD5():'.ljust(15) + str(t_b + (time.time() - t)))

def hash_sha():
    t = time.time()
    h = hashlib.sha1
    fp_hash = (h(b1), h(b2))
    print('SHA:'.ljust(15) + str(t_b + (time.time() - t)))
    t = time.time()
    h = hashlib.sha1()
    h.update(b1)
    h.update(b2)
    fp_hash = h.hexdigest()
    print('SHA():'.ljust(15) + str(t_b + (time.time() - t)))

def hash_256():
    t = time.time()
    h = hashlib.sha256
    fp_hash = (h(b1), h(b2))
    print('256:'.ljust(15) + str(t_b + (time.time() - t)))
    t = time.time()
    h = hashlib.sha256()
    h.update(b1)
    h.update(b2)
    fp_hash = h.hexdigest()
    print('256():'.ljust(15) + str(t_b + (time.time() - t)))

t1 = time.time()
fp_hash = (hash(b1), hash(b2))
print('REG:'.ljust(15) + str(t_b + (time.time() - t1)))
hash_md5()
hash_sha()
hash_256()

# def hash_it(alg):
#     t = time.time()
#     with fp.open('rb') as f:
#         b1 = f.read(1024)
#         f.seek(-1024, 2)
#         b2 = f.read(1024)
#         t2 = time.time()
#         if alg == 'MD5':
#             h1 = hashlib.md5
#             h2 = hashlib.md5()
#         elif alg == 'SHA':
#             h1 = hashlib.sha1
#             h2 = hashlib.sha1()
#         elif alg == '256':
#             h1 = hashlib.sha256
#             h2 = hashlib.sha256()
#         else:
#             fp_hash = (hash(b1), hash(b2))
#             print('(b1,b2):'.ljust(15) + str(t2 - t))
#             print('REG:'.ljust(15) + str(time.time() - t))
#             return
#     td_0 = time.time() - t
#     t_1 = time.time()
#     fp_hash1 = (h1(b1), h1(b2))
#     td_1 = time.time() - t_1
#     print((alg + ':').ljust(15) + str(td_0 + td_1))
#     t_2 = time.time()
#     h2.update(b1)
#     h2.update(b2)
#     fp_hash2 = h2.hexdigest()
#     td_2 = time.time() - t_2
#     print((alg + '():').ljust(15) + str(td_0 + td_2))
