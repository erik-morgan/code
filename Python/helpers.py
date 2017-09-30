import re
import math

# http://itorrents.org/torrent/INFO_HASH_IN_HEX.torrent to download any
# cached torrent file...

# check that none of the sites use commas in their seeds/peers (1,000)

def testseeds(seeds):
    return seeds.isdigit() and int(seeds) > 0

def testsites(name):
    name = name.lower()
    return 'eztv' not in name and 'rarbg' not in name and 'rartv' not in name

def testlang(s):
    try:
        s.encode('ascii')
        return True
    except UnicodeEncodeError:
        return False

def testname(name):
    isbad = re.compile(r'(?i)\b(rus|fuck|anal|tits|xxx|porn)\b').search
    return isbad(name.lower())

def testquery(name, q):
    name = name.lower()
    terms = q.lower().split()
    for term in terms:
        if term not in name:
            return False
    return True

def bytesize(n):
    b = int(n)
    unit = ('B', 'KB', 'MB', 'GB')
    i = math.floor(math.log(b, 1024))
    return math.round(b/math.pow(1024, i), 2) + ' ' + unit[i]
