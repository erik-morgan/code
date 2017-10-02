from lxml import html
import requests
from helpers import filtor

def search(q):
    xpaths = {
        'names': '//tbody//a[@title]/text()',
        'sizes': '//tbody//td[2]/text()',
        'seeds': '//tbody//td[last()-1]/text()',
        'peers': '//tbody//td[last()]/text()',
        'mags': '//tbody//a[1]/@href'
    }
    urls = [f'https://www.skytorrents.in/search/all/ed/{pg}/{q}'
        for pg in range(1, 4)]
    pages = [html.fromstring(requests.get(url).content) for url in urls]
    names = [name for page in pages for name in page.xpath(xpaths['names'])]
    sizes = [size for page in pages for size in page.xpath(xpaths['sizes'])]
    seeds = [seed for page in pages for seed in page.xpath(xpaths['seeds'])]
    peers = [peer for page in pages for peer in page.xpath(xpaths['peers'])]
    mags = [mag for page in pages for mag in page.xpath(xpaths['mags'])]
    torrents = []
    results = zip(names, sizes, seeds, peers, mags)
    for name, size, seed, peer, mag in results:
        if 'NEW' not in name and (size[-2] in 'GM') and filtor(name, seed, q):
            torrents.append({
                'name': name,
                'size': size,
                'seeds': seed,
                'peers': peer,
                'magnet': mag,
                'hash': mag[20:60]
            })
    return torrents

print(search('the+librarians'))