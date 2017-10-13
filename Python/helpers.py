import re
import math

def okname(nm, q):
    rx = re.compile(r'\b(rus|french|fuck|anal|tits|xxx|porn|split.scene.?)\b')
    isbad = rx.search
    nm = nm.lower()
    if nm[0] is '[' or isbad(nm):
        return False
    if any(site in nm for site in ['eztv', 'rarbg', 'rartv']):
        return False
    if any(term not in nm for term in q.lower().split('+')):
        return False
    try:
        nm.encode('ascii')
        return True
    except UnicodeEncodeError:
        return False

def okseed(sd):
    sd = sd.replace(',', '')
    if sd.isdigit() and int(sd) > 0:
        return True
    return False

def bytesize(n):
    b = int(n)
    unit = ('B', 'KB', 'MB', 'GB')
    i = int(math.floor(math.log(b, 1024)))
    return str(round(b/math.pow(1024, i), 2)) + ' ' + unit[i]
