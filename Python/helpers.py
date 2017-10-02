import re
import math

isbad = re.compile(r'(?i)\b(rus|fuck|anal|tits|xxx|porn)\b').search

def filtor(nm, sd=None, q=None, tests='lang name sites'):
    nm = nm.lower()
    if sd and not(sd.isdigit() or int(sd) > 0):
        return False
    if q and any(term not in nm for term in q.lower().split('+')):
        return False
    if 'lang' in tests:
        try:
            nm.encode('ascii')
        except UnicodeEncodeError:
            return False
    if 'name' in tests and isbad(nm):
        return False
    if 'sites' in tests and any(st in nm for st in ['eztv', 'rarbg', 'rartv']):
        return False
    return True

def bytesize(n):
    b = int(n)
    unit = ('B', 'KB', 'MB', 'GB')
    i = int(math.floor(math.log(b, 1024)))
    return str(round(b/math.pow(1024, i), 2)) + ' ' + unit[i]
