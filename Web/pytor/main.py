from flask import Flask, request as httpreq
from pytor import search
from subprocess import DEVNULL, run as subrun
import requests

app = Flask(__name__)
url = 'http://localhost:8080/'
session = requests.Session()
QBTLOGIN = None

def init ():
    global session, QBTLOGIN
    if subrun(['pidof', 'qbittorrent']).returncode:
        subrun('nohup qbittorrent &', shell=True)
    creds = {
        'username': 'admin',
        'password': 'adminadmin'
    }
    login = session.post(url + 'login', data=creds)
    if login.ok:
        session.headers = {'Cookie': login.headers['set-cookie'][0:36]}
        QBTLOGIN = True
    else:
        QBTLOGIN = False

@app.route('/')
def index ():
    # return index http template
    pass

@app.route('/search')
def search ():
    # return http template with search results
    query = httpreq.args.get('query')
    category = httpreq.args.get('category')
    search_results = search(query, category)
    return search_results

@app.route('/qbt')
def qadd (mag):
    if QBTLOGIN:
        opts = {
            'urls': mag,
            'sequentialDownload': True
        }
        r = session.post(url + 'command/download', data=opts)
        if r.ok:
            return True
    try:
        subrun(
            f'qbittorrent "{mag}" --sequential --skip-dialog=true',
            shell=True,
            stdout=DEVNULL,
            stderr=DEVNULL
        )
        return True
    except Exception as ex:
        #log exception(ex)
        print(repr(ex))

if __name__ == '__main__':
    init()
    app.run(debug=True)

# configure a domain and port forwarding on router (py.tor)
# maybe make a /tv and /movies route to handle categories
    # make it interactive, like a little tabbed search?
    # use radio buttons? this would prevent form submission if required attribute is used
    # use two giant buttons that behave like radio buttons; they would only change the submission path!
# figure out how to get link from html/js/form
# add better error handling
# add logging
# figure out how to send a js alert from python
# consider adding a "do not show this again" to success alert
