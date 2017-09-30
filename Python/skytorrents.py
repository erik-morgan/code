from lxml import html
import requests
from helpers import testseeds, testsites, testlang, testname, testquery

header = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/38.0'}

def search(q):
    names = sizes = seeds = peers = mags = [];
    for pg in range(1, 4):
        url = 'https://www.skytorrents.in/search/all/ed/{0}/{1}/'.format(
            pg, q.replace(' ', '+'))
        data = requests.get(url, headers=header)
        tree = html.fromstring(data.content)
        names.extend(tree.xpath('//tbody//a[@title]/text()'))
        sizes.extend(tree.xpath('//tbody//td[2]/text()'))
        seeds.extend(tree.xpath('//tbody//td[last()-1]/text()'))
        peers.extend(tree.xpath('//tbody//td[last()]/text()'))
        mags.extend(tree.xpath('//tbody//a[1]/@href'))
    torrents = []
    results = zip(names, sizes, seeds, peers, mags)
    for name, size, seed, peer, mag in results:
        if 'NEW' not in name and ('MB' in size or 'GB' in size):
            if (testsites(name) and testname(name) and testlang(name)
                and testquery(name, q) and testseeds(seed)):
                torrents.append({
                    'name': name,
                    'size': size,
                    'seeds': seed,
                    'peers': peer,
                    'magnet': mag,
                    'hash': mag[20:60]
                })
    return torrents
