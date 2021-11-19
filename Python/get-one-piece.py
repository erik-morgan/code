import requests
from lxml import html
import sys
import os
import json
import re
from pathlib import Path

def main():
    if len(sys.argv) != 3:
        print('You must pass the start and end episode numbers as arguments to the script')
        exit()
    epbeg, epend = sys.argv[1:3]
    while not epbeg in eplist:
        epbeg = input('Enter a valid start episode number for downloading: ')
    while not epend in eplist and int(epend) < int(epbeg):
        epend = input('Enter a valid end episode number for downloading. Must be greater than or equal to ' + epbeg + ': ')
    for n in range(int(epbeg), int(epend) + 1):
        if n == 590:
            print('Episode 590 is not in the list and will be skipped')
        else:
            download(str(n))

def download(ep):
    url = eplist[ep]
    page = html.fromstring(requests.get(url, headers=headers).content)
    try:
        stream(ep, page.xpath('//a[contains(text(), "480")]/@href')[0])
    except:
        try:
            stream(ep, page.xpath('//a[contains(text(), "360")]/@href')[0])
        except:
            stream(ep, page.xpath('//a[contains(text(), "720")]/@href')[0])

def stream(ep, url):
    r = requests.get(url, allow_redirects=False, headers=headers)
    url = r.headers['Location']
    title = 'One Piece - ' + f'{int(ep):03}'
    file = os.path.join(downloads, title + re.search('.+(\\.\\w+)\\?token', url)[1])
    r = requests.get(url, stream=True, headers=headers)
    size = int(r.headers['content-length'])
    outfile = open(file, 'wb')
    count = 0
    for chunk in r.iter_content(chunk_size=512):
        if chunk:
            outfile.write(chunk)
            count += 1
            print(f'\r{title} || {count / size * 51200:.1f}%', end='\r')
    print('\nDownload complete!')

def progress(title, count=0, total=1, fillchar='|'):
    pct = f'{count / total * 100:.1f}'
    fill = count * 50 // total
    bar = (fillchar * fill) + ' ' * (50 - fill)
    print(f'\r{title} |{bar}| {pct}%', end='\r')
    if count == total:
        print()

try:
    print('You can press Control + C to exit the script at any time')
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
               'Referer': 'https://gogoplay1.com/'}
    downloads = os.path.join(Path.home(), 'Downloads')
    json_file = os.path.join(downloads, 'one-piece-urls.json')
    eplist = json.load(open(json_file))
    downlist = {}
except:
    print('one-piece-urls.json does not exist in Downloads folder, or is not formatted correctly')
else:
    main()
