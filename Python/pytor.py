from lxml import html, etree
from math import floor, pow, log
from multiprocessing import Pool
import requests, time, json

# create a main function and use low(q)/low(cat)
q = 'the+librarians'
cat = 'tv'
low = str.lower

def search ():
    
    search_results = []
    ext = search_results.extend
    htmlstr = html.fromstring
    req = requests.get
    jtkn = req('https://torrentapi.org/pubapi_v2.php?get_token=get_token')
    token = json.loads(jtkn.text)['token']
    
    def eztv ():
        results = []
        url = f'https://eztv.ag/search/{q}'
        tree = htmlstr(req(url).content)
        x = tree.xpath
        add = results.append
        rstop = str.rindex
        items = list(zip(
            x('//tr[@name="hover"]//a[@class="epinfo"]/@title'),
            x('//tr[@name="hover"]/td[4]/text()'),
            x('//tr[@name="hover"]/td[6]//text()'),
            x('//tr[@name="hover"]/td[3]/a[1]/@href'),
        ))
        shows = x('//tr[@name="hover"]/td[1]/a/@title')
        for i, item in enumerate(items):
            link, seed = item[3], item[2]
            show = shows[i]
            if 'Other' not in show and seed != '-' and int(seed) > 0 and link[0:6] == 'magnet':
                add([
                    item[0][:rstop(item[0], ' (')],
                    item[1],
                    seed,
                    '-',
                    link,
                    link[20:60]
                ])
        return results
    
    def lime ():
        results = []
        url = f'https://www.limetorrents.cc/search/{cat}/{q}/seeds/1/'
        tree = htmlstr(req(url).content)
        x = tree.xpath
        add = results.append
        items = list(zip(
            x('//div[@class="tt-name"]//a[2]/text()'),
            x('//td[@class="tdnormal"][2]/text()'),
            x('//table[2]//td[@class="tdseed"]/text()'),
            x('//table[2]//td[@class="tdleech"]/text()'),
            x('//a[@class="csprite_dl14"]/@href')
        ))
        [add(list(item) + [item[4][29:69]]) for item in items if int(item[2]) > 0]
        return results
    
    def rarbg ():
        results = []
        url = 'https://torrentapi.org/pubapi_v2.php'
        add = results.append
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
        data = json.loads(req(url, params=payload).text)
        for item in data['torrent_results']:
            add([
                item['title'],
                item['size'],
                item['seeders'],
                item['leechers'],
                item['download'],
                item['download'][20:60]
            ])
        return results
    
    def tpb ():
        results = []
        url = f'https://thepiratebay.org/search/{q}/0/7/200/'
        tree = htmlstr(req(url).content)
        x = tree.xpath
        add = results.append
        sep = str.split
        items = list(zip(
            x('//a[@class="detLink"]/text()'),
            x('//font[@class="detDesc"]/text()'),
            x('//td[@align="right"][1]/text()'),
            x('//td[@align="right"][2]/text()'),
            x('//a[contains(@href, "magnet")]/@href'),
        ))
        tcats = x('//td[@class="vertTh"]//a[2]/text()')
        for i, item in enumerate(items):
            tcat = tcats[i]
            if cat in low(tcat) and int(item[2]) > 0:
                add([
                    item[0],
                    sep(item[1], ', ')[1][5:-2] + 'B',
                    item[2],
                    item[3],
                    item[4],
                    item[4][20:60]
                ])
    
    def zoo ():
        xmlstr = etree.fromstring
        url = f'https://zooqle.com/search?q={q}+category%3A{cat}&sd=d&fmt=rss&pg='
        pages = [req(url + str(p)).content for p in [1, 2, 3]]
        trees = [xmlstr(page)[0] for page in pages]
        items = list(zip(
            [item[0].text for tree in trees for item in tree[8:]],
            [int(item[6].text) for tree in trees for item in tree[8:]],
            [item[9].text for tree in trees for item in tree[8:]],
            [item[10].text for tree in trees for item in tree[8:]],
            [item[8].text for tree in trees for item in tree[8:]],
            [item[7].text for tree in trees for item in tree[8:]]
        ))
        return [list(item) for item in items]
    
    funcs = [eztv, lime, rarbg, tpb, zoo]
    for func in funcs:
        try:
            ext(func())
        except Exception as e:
            # log error to logfile with traceback
            ename = type(e).__name__
            print(ename)
            continue
    
    return search_results

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

torrents = filtor(search())

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