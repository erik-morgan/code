from lxml import html
import requests
from helpers import filtor

def search(q, cat):
    xpaths = {
        'names': '//a[@class="detLink"]/text()',
        'sizes': '//font[@class="detDesc"]/text()',
        'seeds': '//td[@align="right"][1]/text()',
        'peers': '//td[@align="right"][2]/text()',
        'mags': '//a[contains(@href, "magnet")]/@href',
        'cats': '//td[@class="vertTh"]//a[2]/text()',
    }
    urls = [f'https://thepiratebay.org/search/{q}/{pg}/7/200/'
        for pg in range(5)]
    pages = [html.fromstring(requests.get(url).content) for url in urls]
    names = [name for page in pages for name in page.xpath(xpaths['names'])]
    sizes = [size.split(',')[1][6:] for page in pages for size in page.xpath(
        xpaths['sizes'])]
    seeds = [seed for page in pages for seed in page.xpath(xpaths['seeds'])]
    peers = [peer for page in pages for peer in page.xpath(xpaths['peers'])]
    mags = [mag for page in pages for mag in page.xpath(xpaths['mags'])]
    cats = [cat for page in pages for cat in page.xpath(xpaths['cats'])]
    torrents = []
    results = zip(names, sizes, seeds, peers, mags, cats)
    for name, size, seed, peer, mag, tcat in results:
        if cat in tcat.lower() and filtor(name, seed, q):
            torrents.append({
                'name': name,
                'size': size,
                'seeds': seed,
                'peers': peer,
                'magnet': mag,
                'hash': mag[20:60]
            })
    return torrents

print(search('the+librarians', 'tv'))
