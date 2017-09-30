from lxml import html
import requests
from helpers import testseeds, testquery

header = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/38.0'}

def search(q):
    url = 'https://eztv.ag/search/'.format(q.replace(' ', '+'))
    data = requests.get(url, headers=header)
    tree = html.fromstring(data.content)
    results = zip(
        tree.xpath('//tr[@name="hover"]//a[@class="epinfo"]/@title'),
        tree.xpath('//tr[@name="hover"]/td[4]/text()'),
        tree.xpath('//tr[@name="hover"]/td[6]//text()'),
        tree.xpath('//tr[@name="hover"]/td[3]/a[1]/@href'),
        tree.xpath('//tr[@name="hover"]/td[1]/a/@title')
    )
    torrents = []
    for name, size, seed, mag, cat in results:
        if mag.startswith('magnet') and 'Other' not in cat:
            name = name.replace(' ({})'.format(size), '')
            seed = seed.replace(',', '')
            if testseeds(seed) and testquery(name, q):
                torrents.append({
                    'name': name,
                    'size': size,
                    'seeds': seed,
                    'peers': '-',
                    'magnet': mag,
                    'hash': mag[20:60]
                })
    return torrents
