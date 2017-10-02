from lxml import html
import requests
from helpers import testseeds, testsites, testlang, testname, testquery

def search(q, cat):
    names = sizes = seeds = peers = mags = cats = []
    for pg in range(5):
        url = 'https://thepiratebay.org/search/{0}/{1}/7/200/'.format(
            q.replace(' ', '+'), pg)
        data = requests.get(url)
        tree = html.fromstring(data.content)
        names.extend(tree.xpath('//a[@class="detLink"]/text()'))
        sizes.extend(tree.xpath('//font[@class="detDesc"]/text()'))
        seeds.extend(tree.xpath('//td[@align="right"][1]/text()'))
        peers.extend(tree.xpath('//td[@align="right"][2]/text()'))
        mags.extend(tree.xpath('//a[contains(@href, "magnet")]/@href'))
        cats.extend(tree.xpath('//td[@class="vertTh"]//a[2]/text()'))
    torrents = []
    results = zip(names, sizes, seeds, peers, mags, cats)
    for name, size, seed, peer, mag, tcat in results:
        if (testsites(name) and testseeds(seed) and testlang(name)
            and testname(name) and testquery(name, q) and cat in tcat.lower()):
            torrents.append({
                'name': name,
                'size': size[size.index('Size') + 5:size.index('iB,')] + 'B',
                'seeds': seed,
                'peers': peer,
                'magnet': mag,
                'hash': mag[20:60]
            })
    return torrents

print(search('the+librarians', 'tv'))