from helpers import okname, okseed, bytesize
from lxml import html, etree
import requests
import time
import json

q = 'the+librarians'
cat = 'tv'
torrents = []
add = torrents.append
ntest = okname
stest = okseed
req = requests.get
jtkn = req('https://torrentapi.org/pubapi_v2.php?get_token=get_token')
token = json.loads(jtkn.text)['token']

def eztv ():
    url = f'https://eztv.ag/search/{q}'
    tree = html.fromstring(req(url).content)
    results = zip(
        tree.xpath('//tr[@name="hover"]//a[@class="epinfo"]/@title'),
        tree.xpath('//tr[@name="hover"]/td[4]/text()'),
        tree.xpath('//tr[@name="hover"]/td[6]//text()'),
        tree.xpath('//tr[@name="hover"]/td[3]/a[1]/@href'),
        tree.xpath('//tr[@name="hover"]/td[1]/a/@title')
    )
    for name, size, seed, link, show in results:
        if link.startswith('magnet') and 'Other' not in show:
            add([
                name[:name.rindex(' (')],
                size,
                seed.replace(',', ''),
                '-',
                link,
                link[20:60]
            ])

def lime ():
    # has rss, but no sorting, categories, or paging
    url = f'https://www.limetorrents.cc/search/{cat}/{q}/seeds/1/'
    tree = html.fromstring(req(url).content)
    results = zip(
        tree.xpath('//div[@class="tt-name"]//a[2]/text()'),
        tree.xpath('//td[@class="tdnormal"][2]/text()'),
        tree.xpath('//table[2]//td[@class="tdseed"]/text()'),
        tree.xpath('//table[2]//td[@class="tdleech"]/text()'),
        tree.xpath('//a[@class="csprite_dl14"]/@href')
    )
    for name, size, seed, peer, link in results:
        add([
            name,
            size,
            seed.replace(',', ''),
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
            bytesize(tor['size']),
            tor['seeders'],
            tor['leechers'],
            tor['download'],
            tor['download'][20:60]
        ])

def sky ():
    url = f'https://www.skytorrents.in/search/all/ed/1/q={q}'
    tree = html.fromstring(req(url).content)
    results = zip(
        tree.xpath('//tbody//a[@title]/text()'),
        tree.xpath('//tbody//td[2]/text()'),
        tree.xpath('//tbody//td[last()-1]/text()'),
        tree.xpath('//tbody//td[last()]/text()'),
        tree.xpath('//tbody//a[1]/@href')
    )
    for name, size, seed, peer, link in results:
        if 'NEW' not in name and (float(size[0:-3]) > 50 or size[-2] is 'G'):
            add([
                name,
                size,
                seed,
                peer,
                link,
                link[20:60]
            ])

def tpb ():
    url = f'https://thepiratebay.org/search/{q}/0/7/200/'
    tree = html.fromstring(req(url).content)
    results = zip(
        tree.xpath('//a[@class="detLink"]/text()'),
        tree.xpath('//font[@class="detDesc"]/text()'),
        tree.xpath('//td[@align="right"][1]/text()'),
        tree.xpath('//td[@align="right"][2]/text()'),
        tree.xpath('//a[contains(@href, "magnet")]/@href'),
        tree.xpath('//td[@class="vertTh"]//a[2]/text()')
    )
    for name, size, seed, peer, link, tcat in results:
        if cat in tcat.lower():
            add([
                name,
                size.split(',')[1][6:],
                seed,
                peer,
                link,
                link[20:60]
            ])

def zoo ():
    url = f'https://zooqle.com/search?q={q}+category%3A{cat}&sd=d&fmt=rss&pg='
    pages = [req(url + str(p)).content for p in [1, 2, 3]]
    trees = [etree.fromstring(page)[0] for page in pages]
    results = zip(
        [item[0].text for tree in trees for item in tree[8:]],
        [bytesize(item[6].text) for tree in trees for item in tree[8:]],
        [item[9].text for tree in trees for item in tree[8:]],
        [item[10].text for tree in trees for item in tree[8:]],
        [item[8].text for tree in trees for item in tree[8:]],
        [item[7].text for tree in trees for item in tree[8:]]
    )
    torrents.extend(list(results))

t0 = time.time()
eztv()
t1 = time.time()
lime()
t2 = time.time()
rarbg()
t3 = time.time()
sky()
t4 = time.time()
tpb()
t5 = time.time()
zoo()
t6 = time.time()
torrents = [tor for tor in torrents if ntest(tor[0], q) and stest(tor[2])]
t7 = time.time()
with open('/home/erik/Downloads/pytor_results.txt', 'a') as f:
    print('eztv : ' + str(t1 - t0), file=f)
    print('lime : ' + str(t2 - t1), file=f)
    print('rarbg: ' + str(t3 - t2), file=f)
    print('sky  : ' + str(t4 - t3), file=f)
    print('tpb  : ' + str(t5 - t4), file=f)
    print('zoo  : ' + str(t6 - t5), file=f)
    print('clean: ' + str(t7 - t6), file=f)

# Torrent = [name, size, seed, peer, link, hash]
# remove duplicates (by hash)
# sort by seeders
# use if __name__ == '__main__': main()

# def torsearch(query, cat):
# torlist = []
# if cat == 'tv':
#     torlist.extend(eztv.search(query))
# torlist.extend(limetorrents.search(query, cat))
# torlist.extend(rarbg.search(query, cat))
# torlist.extend(skytorrents.search(query))
# torlist.extend(tpb.search(query, cat))
# torlist.extend(zooqle.search(query, cat))
# if tors doesn't work, try tors[:]
# tors = torfilter(torlist)
# print(json.dumps(tors))
# print('Content-Type: application/json')
# conver torlist to json from dictionary
# print(torlist)

# def torfilter(tors):
# filter name/size dupes (eg if names & sizes =)
# seen = {}
# for tor in tors:
# thash, tseed = tor['hash'], int(tor['seeds'])
# if thash not in seen:
# seen[thash] = tor
# elif tseed > int(seen[thash]['seeds']):
# seen[thash] = tor
# eturn seen.values()
