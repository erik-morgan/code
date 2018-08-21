# 2018-08-20 10:21:09 #
from pathlib import Path
from datetime import datetime
from json import dump
import re
import sqlite3 as sqlite

root = Path('/Users/HD6904/Erik/Procedure Status/outlines')
db_file = Path('/Users/HD6904/Erik/Procedure Status/twdb.sqlite3')
raw_file = Path('/Users/HD6904/Erik/Procedure Status/twdb.json')
rpdw_re = re.compile(r'^([A-Z]{2,6}\d{4}\S*).*\n?(?:\n\S*\d{6})+', re.I|re.M)
draw_re = re.compile(r'^(?:\d-)?\d{6}\S*', re.M)
date_re = re.compile(r'DUE.+?(\d\d)[-/ ]?(\w+)[-/ ]?(\d\d)', re.I)

def main():
    # REMOVE SUDS FROM OUTLINES
    # REFORMAT PROCS WHEN ADDING TO DB
    # CREATE 2 TABLES, ONE FOR RAW, AND THE OTHER FOR FORMATTED DATA
    # force formatting (add system: and id: to all)
    docs = []
    for i, ftxt in enumerate(root.glob('*.txt')):
        print(f'Processing File {i + 1}: {ftxt.name}')
        txt = ftxt.read_text().upper()
        meta_data = txt.split('\n\n')[0].splitlines()
        docs.append({
            'contents': [proc for proc in scrape_doc(txt)]
        }.extend(dict(tuple(ln.split(':', 1)) for ln in meta_data)))
    dump_data(docs)
    with open(raw_file, 'w') as f:
        dump(docs, f, indent=2)

def scrape_doc(contents):
    for match in re.finditer(rpdw_re, contents):
        proc = ''.join(c for c in match[1] if c.isalnum())
        draws = ', '.join(sorted(draw_re.findall(match[0])))
        yield [proc] + draws

def dump_data(data):
    # raw_app('\t'.join(doc_num, proc, str(doc_date), draws))
    # rpdw = (proc, draws)
    # if not rpdw in procs or procs[rpdw][0] < doc_date:
    #     procs[rpdw] = (doc_date, doc_num)
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
                                                                                
    c.execute('CREATE TABLE manuals'
                 '(num int, vol int, rev int, sys text, date text, cust text, proj text, rig text)'
    '')
    for doc in data:
        procs = doc.pop('contents')
        c.execute('''CREATE TABLE manuals
                     num int, vol int, rev int, sys text, date text, cust text, proj text, rig text)
        
        ''')
    c.execute('''CREATE TABLE stocks
              (date text, trans text, symbol text, qty real, price real)''')
    c.execute("INSERT INTO stocks VALUES ('2006-01-05','BUY','RHAT',100,35.14)")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
