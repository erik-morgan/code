from lxml import html, etree
from multiprocessing.dummy import Pool as ThreadPool
from requests import get as req
import json, logging

logging.basicConfig(
    # this logging stuff MIGHT go into a different file
    filename='docs/pytor.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def search (q, cat):

    logger.info('beginning search')
    torlist = []
    ext = torlist.extend
    jtkn = req('https://torrentapi.org/pubapi_v2.php?get_token=get_token')
    token = json.loads(jtkn.text)['token']

    def eztv ():
        results = []
        htmlstr = html.fromstring
        url = f'https://eztv.ag/search/{q}'
        tree = htmlstr(req(url, timeout=3).content)
        x = tree.xpath
        add = results.append
        items = list(zip(
            x('//tr[@name="hover"]//a[@class="epinfo"]/@title'),
            x('//tr[@name="hover"]/td[4]/text()'),
            x('//tr[@name="hover"]/td[6]//text()'),
            x('//tr[@name="hover"]/td[3]/a[1]/@href'),
            x('//tr[@name="hover"]/td[1]/a/@title')
        ))
        for item in items:
            seed, link, show = item[2:]
            if 'Other' not in show and seed != '-' and int(seed) > 0 and link[0:6] == 'magnet':
                add([
                    item[0][:-(len(item[1]) + 3)],
                    item[1],
                    seed,
                    '-',
                    link,
                    link[20:60]
                ])
        print('eztv processed successfully...')
        return results

    def lime ():
        htmlstr = html.fromstring
        url = f'https://www.limetorrents.cc/search/{cat}/{q}/seeds/1/'
        tree = htmlstr(req(url, timeout=3).content)
        x = tree.xpath
        items = list(zip(
            x('//div[@class="tt-name"]//a[2]/text()'),
            x('//td[@class="tdnormal"][2]/text()'),
            x('//table[2]//td[@class="tdseed"]/text()'),
            x('//table[2]//td[@class="tdleech"]/text()'),
            x('//a[@class="csprite_dl14"]/@href')
        ))
        print('lime processed successfully...')
        return [list(item) + [item[4][29:69]] for item in items if int(item[2]) > 0]

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
        items = json.loads(req(url, timeout=3, params=payload).text)['torrent_results']
        print('rarbg processed successfully...')
        keys = ['title', 'size', 'seeders', 'leechers', 'download']
        return [[item[key] for key in keys] + [item['download'][20:60]] for item in items]

    def tpb ():
        results = []
        htmlstr = html.fromstring
        url = f'https://thepiratebay.org/search/{q}/0/7/200/'
        tree = htmlstr(req(url, timeout=3).content)
        x = tree.xpath
        add = results.append
        sep = str.split
        items = list(zip(
            x('//a[@class="detLink"]/text()'),
            x('//font[@class="detDesc"]/text()'),
            x('//td[@align="right"][1]/text()'),
            x('//td[@align="right"][2]/text()'),
            x('//a[contains(@href, "magnet")]/@href'),
            x('//td[@class="vertTh"]//a[2]/text()')
        ))
        low = str.lower
        for item in items:
            if cat in low(item[5]) and int(item[2]) > 0:
                add([
                    item[0],
                    sep(item[1], ', ')[1][5:-2] + 'B',
                    item[2],
                    item[3],
                    item[4],
                    item[4][20:60]
                ])
        print('tpb processed successfully...')
        return results

    def zoo ():
        xmlstr = etree.fromstring
        url = f'https://zooqle.com/search?q={q}+category%3A{cat}&sd=d&fmt=rss&pg='
        pages = [req(url + str(p), timeout=3).content for p in [1, 2, 3]]
        trees = [xmlstr(page)[0] for page in pages]
        items = list(zip(
            [item[0].text for tree in trees for item in tree[8:]],
            [int(item[6].text) for tree in trees for item in tree[8:]],
            [item[9].text for tree in trees for item in tree[8:]],
            [item[10].text for tree in trees for item in tree[8:]],
            [item[8].text for tree in trees for item in tree[8:]],
            [item[7].text for tree in trees for item in tree[8:]]
        ))
        print('zoo processed successfully...')
        return [list(item) for item in items]

    def filtor (tors):
        # if ascii(s) !== s: proceed || all(ord(char) < 128 for char in tname)
        flags = ['rus', 'fuck', 'anal', 'xxx']
        sep = str.split
        qs = sep(q, '+')
        low = str.lower
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
        print('filtor processed successfully...')
        return seen.values()

    def run_func (f):
        try:
            ext(f())
        except Exception as err:
            logging.debug(err, exc_info=True)

    funcs = [eztv, lime, rarbg, tpb, zoo]
    if cat != 'tv':
        funcs.pop(0)
    pool = ThreadPool(5)
    pool.map_async(run_func, funcs)
    pool.close()
    pool.join()
    logger.info('search complete, attempting to run filtor...')
    try:
        torlist = filtor(torlist)
        print('execution complete!\n# of results = ' + str(len(torlist)))
        return torlist
    except Exception as e:
        print('problem during filtor...')
        logging.exception(e)

# Torrent = [name, size, seed, peer, link, hash]
#
# sort by seeders
# do byte conversions when putting in html
# from math import floor, pow, log
# if type(tor[1]) is int:
#     i = int(floor(log(int(b), 1024)))
#     str(round(int(b) / pow(1024, i), 2)) + ' ' + ('KB', 'MB', 'GB')[i]
# torlock has a good selection, cats, sorting, and 75 per page all 0 seeds
# leetx no magnets
# magnetdl has sorting, cats, magnets, 40 per page, but results are iffy correct seeds
# http://www.magnetdl.com/t/the-librarians/se/desc/
# retest concurrent.futures solution multiple times
# test brooklyn nine-nine to see how dashes get urlencoded
