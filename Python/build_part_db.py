# 2018-08-19 15:21:34 #
from pathlib import Path
from datetime import datetime
import re
import sqlite3
from pymongo import MongoClient

root = Path('/Users/HD6904/Erik/Procedure Status/outlines')
db_file = Path('/Users/HD6904/Erik/Procedure Status/proc_parts.db')
rpdw_re = re.compile(r'^([A-Z]{2,6}\d{4}\S*).*\n?(?:\n\S*\d{6})+', re.I|re.M)
draw_re = re.compile(r'^(?:\d-)?\d{6}\S*', re.M)
date_re = re.compile(r'DUE.+?(\d\d)[-/ ]?(\w+)[-/ ]?(\d\d)')

def main():
    # REMOVE SUDS FROM OUTLINES
    # REFORMAT PROCS WHEN ADDING TO DB
    # CREATE 2 TABLES, ONE FOR RAW, AND THE OTHER FOR FORMATTED DATA
    procs = {}
    for i, ftxt in enumerate(root.glob('*.txt')):
        print(f'Processing File {i + 1}: {ftxt.name}')
        txt = ftxt.read_text().upper()
        sm_num = re.search(r'\d{4}', ftxt.name)[0]
        sm_date = formatDate(date_re.search(txt).expand(r'\1\2\3'))
        for proc, draws in scrape_doc(txt):
            if proc not in procs:
                procs[proc] = []
            procs[proc].append((sm_num, sm_date, draws))
    dump_data(procs)

def scrape_doc(contents):
    for match in re.finditer(rpdw_re, contents):
        proc = ''.join(c for c in match[1] if c.isalnum())
        draws = ', '.join(sorted(draw_re.findall(match[0])))
        yield proc, draws

def dump_data(procs):
    # raw_app('\t'.join(doc_num, proc, str(doc_date), draws))
    # rpdw = (proc, draws)
    # if not rpdw in procs or procs[rpdw][0] < doc_date:
    #     procs[rpdw] = (doc_date, doc_num)
    dbcxn = sqlite3.connect(db_file)
    dbc = dbcxn.cursor()
    dbc.execute('CREATE TABLE proc_map ')

def dump_mongo(data):
    client = MongoClient()
    db = client['twdb']
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute('''CREATE TABLE stocks
              (date text, trans text, symbol text, qty real, price real)''')
    c.execute("INSERT INTO stocks VALUES ('2006-01-05','BUY','RHAT',100,35.14)")
    conn.commit()
    conn.close()

def dump_sqlite(data):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute('''CREATE TABLE stocks
              (date text, trans text, symbol text, qty real, price real)''')
    c.execute("INSERT INTO stocks VALUES ('2006-01-05','BUY','RHAT',100,35.14)")
    conn.commit()
    conn.close()

def format_date(date_str):
    if date_str.isnumeric():
        d = datetime.strptime(date_str, '%m%d%y')
    else:
        d = datetime.strptime(date_str, '%d%b%y')
    return d.date()

if __name__ == '__main__':
    main()
