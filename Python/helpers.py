import re
import math

regx = re.compile(r'\b(rus|french|fuck|anal|tits|xxx|porn|split.scene.?)\b')
isbad = regx.search

def filtor(nm, sd=None, q=None, lang=False, bad=False, site=False):
    nm = nm.lower()
    if sd and not(sd.isdigit() or int(sd) > 0):
        return False
    if q and any(term not in nm for term in q.lower().split('+')):
        return False
    if lang:
        try:
            nm.encode('ascii')
        except UnicodeEncodeError:
            return False
    if bad and isbad(nm):
        return False
    if site and any(site in nm for site in ['eztv', 'rarbg', 'rartv']):
        return False
    return True

def bytesize(n):
    b = int(n)
    unit = ('B', 'KB', 'MB', 'GB')
    i = int(math.floor(math.log(b, 1024)))
    return str(round(b/math.pow(1024, i), 2)) + ' ' + unit[i]
