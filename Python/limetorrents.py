from lxml import html
import requests
from helpers import filtor

def search(q, cat):
    xpaths = {
        'names': '//table[2]//a[2]/@href',
        'sizes': '//td[@class="tdnormal"][2]/text()',
        'seeds': '//table[2]//td[@class="tdseed"]/text()',
        'peers': '//table[2]//td[@class="tdleech"]/text()',
        'links': '//a[@class="csprite_dl14"]/@href'
    }
    urls = [f'https://www.limetorrents.cc/search/{cat}/{q}/seeds/{pg}/'
        for pg in range(1, 6)]
    pages = [html.fromstring(requests.get(url).content) for url in urls]
    names = [name[1:-21].replace('-', ' ') for page in pages for name in
             page.xpath(xpaths['names'])]
    sizes = [size for page in pages for size in page.xpath(xpaths['sizes'])]
    seeds = [seed.replace(',', '') for page in pages for seed in
             page.xpath(xpaths['seeds'])]
    peers = [peer for page in pages for peer in page.xpath(xpaths['peers'])]
    links = [link for page in pages for link in page.xpath(xpaths['links'])]
    torrents = []
    results = zip(names, sizes, seeds, peers, links)
    for name, size, seed, peer, link in results:
        if filtor(name, seed, q, True, True, True):
            torrents.append({
                'name': name,
                'size': size,
                'seeds': seed,
                'peers': peer,
                'download': link,
                'hash': link[29:69]
            })
    return torrents

print(search('the+librarians', 'tv'))
