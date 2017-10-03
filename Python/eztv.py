from lxml import html
import requests
from helpers import filtor

def search(q):
    url = f'https://eztv.ag/search/{q}'
    data = requests.get(url)
    tree = html.fromstring(data.content)
    results = zip(
        tree.xpath('//tr[@name="hover"]//a[@class="epinfo"]/@title'),
        tree.xpath('//tr[@name="hover"]/td[4]/text()'),
        tree.xpath('//tr[@name="hover"]/td[6]//text()'),
        tree.xpath('//tr[@name="hover"]/td[3]/a[1]/@href'),
        tree.xpath('//tr[@name="hover"]/td[1]/a/@title')
    )
    torrents = []
    for name, size, seed, mag, show in results:
        if mag.startswith('magnet') and 'Other' not in show:
            name = name.replace(f' ({size})', '')
            seed = seed.replace(',', '')
            if filtor(name, seed, q):
                torrents.append({
                    'name': name,
                    'size': size,
                    'seeds': seed,
                    'peers': '-',
                    'magnet': mag,
                    'hash': mag[20:60]
                })
    return torrents

print(search("the+librarians"))
