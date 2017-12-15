#!/usr/bin/python

from lxml import html
from requests import get as req

F_IN = '/home/erik/scripts/docks/docks.txt'
F_OUT = '/home/erik/scripts/docks/dock-props.txt'
toweb = html.fromstring

ax = (
    '//div[@id="merchant-info"]',
    '//div[@id="fast-track-message"]',
    '//div[@id="price"]//i[contains(@class, "a-icon-prime-with-text")]',
    '//table[@class="a-lineitem"]//span[@id="priceblock_ourprice"]'
)
nx = (
    '//div[@class="grpLayout"]//p[@class="grpNote-sold-by"]',
    '//span[@id="landingpage-stock"]',
    '//div[@class="grpLayout"]//span[@class="grpNote-ship"]',
    '//div[@id="landingpage-price"]//li[@class="price-current"]'
)
products = []

with open(F_IN, 'r') as f:
    links = f.read().splitlines()

for link in links:
    tree = toweb(req(link).content)
    if 'newegg' in link:
        x1, x2, x3, x4 = nx
    else:
        x1, x2, x3, x4 = ax
    xvals = [
        tree.xpath(x1),
        tree.xpath(x2),
        tree.xpath(x3),
        tree.xpath(x4)
    ]
    results = [link]
    for xval in xvals:
        if len(xval) == 0:
            results.append('N/A')
        else:
            x = xval[0].text_content()
            results.append(x.strip())
    products.append(results)

with open(F_OUT, 'a') as fout:
    print(products, file=fout)
