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
# jtkn = req('https://torrentapi.org/pubapi_v2.php?get_token=get_token')
# token = json.loads(jtkn.text)['token']

# def eztv ():
#     url = f'https://eztv.ag/search/{q}'
#     tree = html.fromstring(req(url).content)
#     results = zip(
#         tree.xpath('//tr[@name="hover"]//a[@class="epinfo"]/@title'),
#         tree.xpath('//tr[@name="hover"]/td[4]/text()'),
#         tree.xpath('//tr[@name="hover"]/td[6]//text()'),
#         tree.xpath('//tr[@name="hover"]/td[3]/a[1]/@href'),
#         tree.xpath('//tr[@name="hover"]/td[1]/a/@title')
#     )
#     for name, size, seed, link, show in results:
#         if link.startswith('magnet') and 'Other' not in show and stest(seed):
#             add([
#                 name[:name.rindex(' (')],
#                 size,
#                 seed.replace(',', ''),
#                 '-',
#                 link,
#                 link[20:60]
#             ])

# def limetorrents ():
#     url = f'https://www.limetorrents.cc/search/{cat}/{q}/seeds/1/'
#     tree = html.fromstring(req(url).content)
#     results = zip(
#         tree.xpath('//table[2]//a[2]/@href'),
#         tree.xpath('//td[@class="tdnormal"][2]/text()'),
#         tree.xpath('//table[2]//td[@class="tdseed"]/text()'),
#         tree.xpath('//table[2]//td[@class="tdleech"]/text()'),
#         tree.xpath('//a[@class="csprite_dl14"]/@href')
#     )
#     for name, size, seed, peer, link in results:
#         name = name[1:-21].replace('-', ' ')
#         if stest(seed) and ntest(name, q):
#             add([
#                 name,
#                 size,
#                 seed.replace(',', ''),
#                 peer,
#                 link,
#                 link[29:69]
#             ])

# def rarbg ():
#     url = 'https://torrentapi.org/pubapi_v2.php'
#     payload = {
#         'mode': 'search',
#         'search_string': q.replace(' ', '+'),
#         'category': cat,
#         'limit': '100',
#         'sort': 'seeders',
#         'min_seeders': '1',
#         'format': 'json_extended',
#         'token': token
#     }
#     data = req(url, params=payload)
#     j = json.loads(data.text)
#     for tor in j['torrent_results']:
#         add([
#             tor['title'],
#             bytesize(tor['size']),
#             tor['seeders'],
#             tor['leechers'],
#             tor['download'],
#             tor['download'][20:60]
#         ])

# def skytorrents ():
#     url = f'https://www.skytorrents.in/search/all/ed/1/{q}'
#     tree = html.fromstring(req(url).content)
#     results = zip(
#         tree.xpath('//tbody//a[@title]/text()'),
#         tree.xpath('//tbody//td[2]/text()'),
#         tree.xpath('//tbody//td[last()-1]/text()'),
#         tree.xpath('//tbody//td[last()]/text()'),
#         tree.xpath('//tbody//a[1]/@href')
#     )
#     for name, size, seed, peer, link in results:
#         if ('NEW' not in name and stest(seed) and ntest(name, q)
#             and (float(size[0:-3]) > 50 or size[-2] is 'G')):
#             add([
#                 name,
#                 size,
#                 seed,
#                 peer,
#                 link,
#                 link[20:60]
#             ])

# def tpb ():
#     url = f'https://thepiratebay.org/search/{q}/0/7/200/'
#     tree = html.fromstring(req(url).content)
#     results = zip(
#         tree.xpath('//a[@class="detLink"]/text()'),
#         tree.xpath('//font[@class="detDesc"]/text()'),
#         tree.xpath('//td[@align="right"][1]/text()'),
#         tree.xpath('//td[@align="right"][2]/text()'),
#         tree.xpath('//a[contains(@href, "magnet")]/@href'),
#         tree.xpath('//td[@class="vertTh"]//a[2]/text()')
#     )
#     for name, size, seed, peer, link, tcat in results:
#         if cat in tcat.lower() and stest(seed) and ntest(name, q):
#             add([
#                 name,
#                 size.split(',')[1][6:],
#                 seed,
#                 peer,
#                 link,
#                 link[20:60]
#             ])

def zooqle ():
    # do 3 pages of results
    ns = {'t': 'https://zooqle.com/xmlns/0.1/index.xmlns'}
    url = 'https://zooqle.com/search?pg=1&q='
    qry = f'{q}+category%3A{cat}&s=ns&sd=d&fmt=rss'
    tree = etree.fromstring(req(url+qry).content)
    results = zip(
        tree.xpath('//item/title/text()'),
        tree.xpath('//t:contentLength/text()', namespaces=ns),
        tree.xpath('//t:seeds/text()', namespaces=ns),
        tree.xpath('//t:peers/text()', namespaces=ns),
        tree.xpath('//t:magnetURI/text()', namespaces=ns),
        tree.xpath('//t:infoHash/text()', namespaces=ns)
    )
    for name, size, seed, peer, link, ihash in results:
        if stest(seed) and ntest(name, q):
            add([
                name,
                bytesize(size),
                seed,
                peer,
                link,
                ihash
            ])

t1 = time.time()
zooqle()
t = time.time() - t1
print(f'Zooqle: {str(t)}')
print(json.dumps(torrents))
with open('/home/erik/Downloads/pytor_zooqle.txt', 'w') as f:
    print(f'Zooqle: {str(t)}\n{json.dumps(torrents)}', file=f)

# TEST DIFFERENCE IF I FETCH EVERYTHING, AND FILTER LATER
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
