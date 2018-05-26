import json
import requests
from time import sleep
from helpers import filtor, bytesize

# API LIMIT OF 1 REQUEST/2 SECONDS

def search(q, cat):
    url = 'https://torrentapi.org/pubapi_v2.php'
    token = gettoken()
    sleep(2)
    payload = {
        'mode': 'search',
        'search_string': q.replace(' ', '+'),
        'category': cat,
        'limit': '100',
        'sort': 'seeders',
        'min_seeders': '1',
        'format': 'json_extended',
        'token': token
    }
    data = requests.get(url, params=payload)
    j = json.loads(data.text)
    torrents = []
    for tor in j['torrent_results']:
        name = tor['title']
        if filtor(name, None, q):
            torrents.append({
                'name': name,
                'size': bytesize(tor['size']),
                'seeds': tor['seeders'],
                'peers': tor['leechers'],
                'magnet': tor['download'],
                'hash': tor['download'][20:60]
            })
    return torrents

def gettoken():
    tokenurl = 'https://torrentapi.org/pubapi_v2.php?get_token=get_token'
    j = json.loads(requests.get(tokenurl).text)
    return j['token']

print(search('the+librarians', 'tv'))