from flask import Flask, request, jsonify
from pytor import search
from subprocess import DEVNULL, run as subrun
import requests

app = Flask(__name__)
url = 'http://py.tor:8080/'
session = requests.Session()
QBTLOGIN = None

def init ():
    global session, QBTLOGIN
    # exit status 0 = found & 1 = not found (aka not running)
    if subrun(['pgrep', 'qbittorrent']).returncode:
        # shell=True is security hazard
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
    query = request.values.get('query')
    search_results = search(query, category)
    return jsonify(search_results)

@app.route('/qbt', methods=['POST'])
def addTorrent ():
    if request.is_json and request.values.has_key('mag') and QBTLOGIN:
        opts = {
            'urls': request.values.get('mag'),
            'sequentialDownload': True
        }
        r = session.post(url + 'command/download', data=opts)
        if r.ok:
            return '', 201
    else:
        Flask.abort(400)

@app.errorhandler(404)
def uh_oh (error):
    return Flask.make_response(jsonify({'error': 'Page not found'}), 404)

if __name__ == '__main__':
    init()
    app.run(debug=True)

# this adds magnet through qbt cli, which shouldn't be needed
#    try:
#        subrun(
#            f'qbittorrent "{mag}" --sequential --skip-dialog=true',
#            shell=True,
#            stdout=DEVNULL,
#            stderr=DEVNULL
#        )
#        return True
#    except Exception as ex:
#        #log exception(ex)
#        print(repr(ex))
