from lxml import html
import requests
from helpers import filtor

def search(q, cat):
    # not using &fmt=rss because it ignores categories and sorting params
    xpaths = {
        'names': '//a[@class=" small"]',
        'sizes': '//td[@class="smaller"]//text()',
        'seeds': '//div[@title]/div[1]/text()',
        'peers': '//div[@title]/div[2]/text()',
        'mags': '//a[@title="Magnet link"]/@href',
    }
    urls = [f'https://zooqle.com/search?pg={pg}&q={q}+category%3A{cat}'
        '&v=t&s=ns&sd=d' for pg in range(1, 4)]
    pages = [html.fromstring(requests.get(url).content) for url in urls]
    names = [name.text_content() for page in pages for name in page.xpath(
        xpaths['names'])]
    sizes = [size for page in pages for size in page.xpath(xpaths['sizes'])]
    seeds = [seed for page in pages for seed in page.xpath(xpaths['seeds'])]
    peers = [peer for page in pages for peer in page.xpath(xpaths['peers'])]
    mags = [mag for page in pages for mag in page.xpath(xpaths['mags'])]
    torrents = []
    results = zip(names, sizes, seeds, peers, mags)
    for name, size, seed, peer, mag in results:
        if filtor(name, seed, q, True, True, True):
            torrents.append({
                'name': name,
                'size': size,
                'seeds': seed,
                'peers': peer,
                'magnet': mag,
                'hash': mag[20:60]
            })
    return torrents

print(search('the librarians', 'tv'))