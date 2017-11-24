from lxml import html, etree
from math import floor, pow, log
import requests, time, json

q = 'the+librarians'
# create a main function and use low(q)/low(cat)
cat = 'tv'
torrents = []
low = str.lower
htmlstr = html.fromstring
xmlstr = etree.fromstring
add = torrents.append
req = requests.get
jtkn = req('https://torrentapi.org/pubapi_v2.php?get_token=get_token')
token = json.loads(jtkn.text)['token']

def eztv ():
    url = f'https://eztv.ag/search/{q}'
    tree = htmlstr(req(url).content)
    x = tree.xpath
    rstop = str.rindex
    results = zip(
        x('//tr[@name="hover"]//a[@class="epinfo"]/@title'),
        x('//tr[@name="hover"]/td[4]/text()'),
        x('//tr[@name="hover"]/td[6]//text()'),
        x('//tr[@name="hover"]/td[3]/a[1]/@href'),
        x('//tr[@name="hover"]/td[1]/a/@title')
    )
    for name, size, seed, link, show in results:
        if link[0:6] == 'magnet' and 'Other' not in show and seed != '-' and int(seed) > 0:
            add([
                name[:rstop(name, ' (')],
                size,
                seed,
                '-',
                link,
                link[20:60]
            ])

def lime ():
    # has rss, but no sorting, categories, or paging
    url = f'https://www.limetorrents.cc/search/{cat}/{q}/seeds/1/'
    tree = htmlstr(req(url).content)
    x = tree.xpath
    results = zip(
        x('//div[@class="tt-name"]//a[2]/text()'),
        x('//td[@class="tdnormal"][2]/text()'),
        x('//table[2]//td[@class="tdseed"]/text()'),
        x('//table[2]//td[@class="tdleech"]/text()'),
        x('//a[@class="csprite_dl14"]/@href')
    )
    for name, size, seed, peer, link in results:
        if int(seed) > 0:
            add([
                name,
                size,
                seed,
                peer,
                link,
                link[29:69]
            ])

def rarbg ():
    url = 'https://torrentapi.org/pubapi_v2.php'
    payload = {
        'mode': 'search',
        'search_string': q,
        'category': cat,
        'limit': '100',
        'sort': 'seeders',
        'min_seeders': '1',
        'format': 'json_extended',
        'token': token
    }
    data = req(url, params=payload)
    j = json.loads(data.text)
    for tor in j['torrent_results']:
        add([
            tor['title'],
            int(tor['size']),
            tor['seeders'],
            tor['leechers'],
            tor['download'],
            tor['download'][20:60]
        ])

def tpb ():
    url = f'https://thepiratebay.org/search/{q}/0/7/200/'
    tree = htmlstr(req(url).content)
    x = tree.xpath
    sep = str.split
    results = zip(
        x('//a[@class="detLink"]/text()'),
        x('//font[@class="detDesc"]/text()'),
        x('//td[@align="right"][1]/text()'),
        x('//td[@align="right"][2]/text()'),
        x('//a[contains(@href, "magnet")]/@href'),
        x('//td[@class="vertTh"]//a[2]/text()')
    )
    for name, size, seed, peer, link, tcat in results:
        if cat in low(tcat) and int(seed) > 0:
            add([
                name,
                sep(size, ', ')[1][5:-2] + 'B',
                seed,
                peer,
                link,
                link[20:60]
            ])

def zoo ():
    url = f'https://zooqle.com/search?q={q}+category%3A{cat}&sd=d&fmt=rss&pg='
    pages = [req(url + str(p)).content for p in [1, 2, 3]]
    trees = [xmlstr(page)[0] for page in pages]
    results = zip(
        [item[0].text for tree in trees for item in tree[8:]],
        [int(item[6].text) for tree in trees for item in tree[8:]],
        [item[9].text for tree in trees for item in tree[8:]],
        [item[10].text for tree in trees for item in tree[8:]],
        [item[8].text for tree in trees for item in tree[8:]],
        [item[7].text for tree in trees for item in tree[8:]]
    )
    torrents.extend(list(results))

def filtor(tors):
    # test whether its faster to do nametest during hash filtering, even if tor gets replaced
    # if ascii(s) !== s: proceed
    # all(ord(char) < 128 for char in tname)
    flags = ['rus', 'fuck', 'anal', 'xxx']
    sep = str.split
    qs = sep(q, '+')
    seen = {}
    for tor in tors:
        tname, tseed, thash = low(tor[0]), tor[2], tor[5]
        try:
            tname.encode('ascii')
            words = sep(tname.replace('.', ' '), ' ')
            if thash not in seen or int(tseed) > int(seen[thash][2]):
                if all(flag not in words for flag in flags) and all(term in tname for term in qs):
                    seen[thash] = tor
        except UnicodeEncodeError:
            continue
    return seen.values()

t0 = time.time()
eztv()
t1 = time.time()
lime()
t2 = time.time()
rarbg()
t3 = time.time()
tpb()
t4 = time.time()
zoo()
t5 = time.time()
torrents = filtor(torrents)
t6 = time.time()
with open('/home/erik/Downloads/pytor_results.txt', 'a') as f:
    print('eztv : ' + str(t1 - t0), file=f)
    print('lime : ' + str(t2 - t1), file=f)
    print('rarbg: ' + str(t3 - t2), file=f)
    print('tpb  : ' + str(t4 - t3), file=f)
    print('zoo  : ' + str(t5 - t4), file=f)
    print('clean: ' + str(t6 - t5), file=f)

# Torrent = [name, size, seed, peer, link, hash]
#
# Implement multiprocessing/multithreading
# Wrap each function in try/except so if one fails, the script will succeed
#
# sort by seeders
# do byte conversions when putting in html
# if type(tor[1]) is int:
#     i = int(floor(log(int(b), 1024)))
#     str(round(int(b) / pow(1024, i), 2)) + ' ' + ('KB', 'MB', 'GB')[i]
# use if __name__ == '__main__': main()