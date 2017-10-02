import eztv
import limetorrents
import rarbg
import skytorrents
import tpb
import zooqle
import json

# get parameters from php
# run search function for each imported file
# add each functions results to an array
# remove duplicates (by hash)
# sort by seeders
# pass list back to php, if possible
# otherwise:
#    1. output to file and read from php (inefficient)
#    2. build the results page in python

def torsearch(query, cat):
    torlist = []
    if cat == 'tv':
        torlist.extend(eztv.search(query))
    torlist.extend(limetorrents.search(query, cat))
    torlist.extend(rarbg.search(query, cat))
    torlist.extend(skytorrents.search(query, cat))
    torlist.extend(tpb.search(query, cat))
    torlist.extend(zooqle.search(query, cat))
    # if tors doesn't work, try tors[:]
    tors = torfilter(torlist)
    print(json.dumps(tors))
    print('Content-Type: application/json')
    # conver torlist to json from dictionary
    print(torlist)

def torfilter(tors):
    seen = {}
    for tor in torlist:
        thash, tseed = tor['hash'], int(tor['seeds'])
        if thash not in seen:
            seen[thash] = tor
        elif tseed > int(seen[thash]['seeds']):
            seen[thash] = tor
    return seen.values()
