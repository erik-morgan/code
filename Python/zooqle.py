from lxml import html
import requests
from helpers import testseeds, testsites, testlang, testname, testquery

header = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/38.0'}

def search(q, cat):
    # not using &fmt=rss because it ignores categories and sorting params
    names = sizes = seeds = peers = mags = [];
    for pg in range(1, 4):
        url = 'https://zooqle.com/search?pg={0}&q={1}&v=t&s=ns&sd=d'.format(
            pg, q.replace(' ', '+'))
        data = requests.get(url, headers=header)
        tree = html.fromstring(data.content)
        names.extend(tree.xpath('//a[@class=" small"]'))
        sizes.extend(tree.xpath('//td[@class="smaller"]//text()'))
        seeds.extend(tree.xpath('//div[@title]/div[1]/text()'))
        peers.extend(tree.xpath('//div[@title]/div[2]/text()'))
        mags.extend(tree.xpath('//a[@title="Magnet link"]/@href'))
    torrents = []
    results = zip(names, sizes, seeds, peers, mags)
    for ename, size, seed, peer, mag in results:
        name = ename.text_content()
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
