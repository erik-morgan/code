from flask import Flask, request as httpreq
from pytor import search

app = Flask(__name__)

@app.route('/')
def index ():
    # return index http template
    pass

@app.route('/search')
def search ():
    # return http template with search results
    # maybe make a /tv and /movies route to handle categories
    query = httpreq.args.get('query')
    category = httpreq.args.get('category')
    search_results = search(query, category)
    return search_results

if __name__ == '__main__':
    app.run(debug=True)
    