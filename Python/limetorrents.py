from lxml import html
import requests
from helpers import testseeds, testsites, testlang, testname, testquery

header = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/38.0'}

def search(q, cat):
    names = sizes = seeds = peers = links = [];
    for pg in range(1, 6):
        url = 'https://www.limetorrents.cc/search/{0}/{1}/seeds/{2}/'.format(
            cat, q.replace(' ', '+'), pg)
        data = requests.get(url, headers=header)
        tree = html.fromstring(data.content)
        names.extend(tree.xpath('//table[2]//a[2]/text()'))
        sizes.extend(tree.xpath('//td[@class="tdnormal"][2]/text()'))
        seeds.extend(tree.xpath('//table[2]//td[@class="tdseed"]/text()'))
        peers.extend(tree.xpath('//table[2]//td[@class="tdleech"]/text()'))
        links.extend(tree.xpath('//a[@class="csprite_dl14"]/@href'))
    torrents = []
    results = zip(names, sizes, seeds, peers, links)
    for name, size, seed, peer, link in results:
        seed = seed.replace(',', '')
        if (testsites(name) and testname(name) and testlang(name)
            and testquery(name, q) and testseeds(seed)):
            torrents.append({
                'name': name,
                'size': size,
                'seeds': seed,
                'peers': peer,
                'download': link,
                'hash': link[29:69]
            })
    return torrents
