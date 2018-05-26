#!/usr/bin/python

from pathlib import Path
from requests import get as req
from lxml import html
import re
import json

head = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'}
root = Path(__file__).parent
scale_dump = root / 'scale_data.json'
pages_dump = root / 'scale_pages.json'
result_file = root / 'scale_data.txt'
scales_list = (root / 'scales.txt').read_text().splitlines()
scale_page_template = {
    'title': '//span[@id="productTitle"]',
    'feats': '//div[@id="feature-bullets"]',
    'desc': '//div[normalize-space(translate(h2/text(), "PD", "pd"))="product description"]',
    'dets': '//div[contains(@id, "etail") and starts-with(normalize-space(.//h2/text()), "Product")]',
    'price': '//span[starts-with(@id, "priceblock_")]'
}
regexs = {
    'model': re.compile('model.+', re.I | re.M),
    'size': re.compile('[.\d]+[ x\W]{0,9}[.\d]+', re.A),
    'lcd': re.compile('[.\d]+.+lcd', re.I | re.M),
    'glass_thickness': re.compile('[.\d]+.+glass', re.I | re.M),
    'bmi': re.compile('\bbmi\b', re.I),
    'tracking': re.compile('memory', re.I),
    'tape': re.compile('\btape\b', re.I),
    'precision': re.compile('(increment.+)?(\d?\.\d+ ?lb)(.+increment)?', re.I | re.M),
    'handle': re.compile('handle', re.I),
    'price': re.compile('\$\d+\.\d+')
}
page_parts = {
    'model': ['dets'],
    'size': ['dets', 'desc', 'feats'],
    'lcd': ['feats', 'desc'],
    'glass_thickness': ['feats', 'desc'],
    'bmi': ['title', 'feats', 'desc'],
    'tracking': ['title', 'feats', 'desc'],
    'tape': ['title', 'feats', 'desc'],
    'precision': ['feats', 'desc'],
    'handle': ['title', 'feats', 'desc'],
    'price': ['price']
}
bool_keys = ['bmi', 'tracking', 'tape', 'handle']
scales = []
pages = {}

def scrapez(url, xdict):
    doc = html.fromstring(req(url, headers=head).content)
    for key, xpath in xdict.items():
        try:
            xdict[key] = doc.xpath(xpath)[0].text_content().strip()
        except:
            if key == 'feats':
                xdict[key] = ''
                continue
            print('url = ' + url)
            print('key = ' + key)
            raise SystemExit
    return xdict

def parse_page(link, page_dict):
    props = {}
    props['link'] = link
    for key, rx in regexs.items():
        for part in page_parts[key]:
            match = rx.search(page_dict[part])
            if match:
                props[key] = 'Yes' if key in bool_keys else match[0]
                break
        else:
            props[key] = 'No' if key in bool_keys else ''
    scales.append(props)

for i, link in enumerate(scales_list):
    print(f'Processing Scale {i+1}/{len(scales_list)}...')
    scale_page = scrapez(link, scale_page_template.copy())
    parse_page(link, scale_page)
    pages[link] = scale_page

scale_dump.write_text(json.dumps(scales, indent=2))
pages_dump.write_text(json.dumps(pages, indent=2))
key_list = list(scales[0])
results = ['\t'.join(scale[k] for k in key_list) for scale in scales]
results.insert(0, '\t'.join(key_list))
result_file.write_text('\n'.join(results))