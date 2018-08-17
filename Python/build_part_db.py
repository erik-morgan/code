from pathlib import Path
from datetime import datetime
import re
import sqlite3

root = Path('/Users/HD6904/Erik/Procedure Status/outlines')
db_file = Path('/Users/HD6904/Erik/Procedure Status/proc_parts.db')
raw_file = Path('/Users/HD6904/Erik/Procedure Status/proc_parts_raw.txt')
# rp_dwg_re = (r'^(?:C[FW]S|[CD]R[CJM]?|CSRP|DV|ER|FD[CM]?|GVS|[GH]PU|'
#              '(?:DT)?(?:AP|[CMS]{2,4}|DR|UW)|LS|PMP|POS|RT|S[CS]J|SING|SSH|SW|'
#              r'UWHTSM?|WOC) ?\d{4}\S*|^(?:\d-)?\d{6}\S*')
# rp_re = re.compile(r'^[A-Z]{2,6}\d{4}.*', re.I)
# rpdw_re = re.compile(r'[A-Z]{2,6}\d{4}.*|(?:\d-)?\d{6}.*')
rpdw_re = re.compile(r'^([A-Z]{2,6}\d{4}\S*).*\n?(?:\n\S*\d{6})+', re.I|re.M)
draw_re = re.compile(r'^(?:\d-)?\d{6}\S*', re.M)
date_re = re.compile(r'DUE.+?(\d\d)[-/ ]?(\w+)[-/ ]?(\d\d)')

def main():
    # REMOVE SUDS FROM OUTLINES
    # REFORMAT PROCS WHEN ADDING TO DB
    procs = {}
    raw_data = []
    raw_app = raw_data.append
    docs = [txt.name for txt in root.glob('*.txt')]
    prog_temp = 'Processing File {0}/' + len(docs) + ' ({1})'
    for i, name in enumerate(docs):
        print(progress.format(i + 1, name))
        doc = root / name
        doc_num = re.search(r'\d{4}', name)[0]
        doc_txt = doc.read_text().upper()
        doc_date = formatDate(date_re.search(doc_txt).expand(r'\1\2\3'))
        for match in re.finditer(rpdw_re, doc_txt):
            match = match[0]
            draws = draw_re.findall(match)
            if draws:
                proc = re.sub(r'\W', '-', match[1])
                draws = ', '.join(sorted(draws))
                raw_app('\t'.join(doc_num, proc, str(doc_date), draws))
                rpdw = (proc, draws)
                if not rpdw in procs or procs[rpdw][0] < doc_date:
                    procs[rpdw] = (doc_date, doc_num)
    raw_file.write_text('\n'.join(raw_data))
    dump_data(procs)

def dump_data(procs):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    # Create table
    c.execute('''CREATE TABLE stocks
              (date text, trans text, symbol text, qty real, price real)''')
    # Insert a row of data
    c.execute("INSERT INTO stocks VALUES ('2006-01-05','BUY','RHAT',100,35.14)")
    # Save (commit) the changes
    conn.commit()
    # We can also close the connection if we are done with it.
    # Just be sure any changes have been committed or they will be lost.
    conn.close()

def format_date(date_str):
    if date_str.isnumeric():
        d = datetime.strptime(date_str, '%m%d%y')
    else:
        d = datetime.strptime(date_str, '%d%b%y')
    return d.date()

if __name__ == '__main__':
    log = Path('/Users/HD6904/Erik/Procedure Status/part_data.txt')
    data = main()
    log.write_text(parse_data(data))
