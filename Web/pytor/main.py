from flask import Flask, request as httpreq

app = Flask(__name__)

@app.route('/')
def index ():
    # return index page static http file
    pass

@app.route('/<query>')
def search (query):
    # return http template with search results
    # call search with query after splitting it into query and cat
    pass

if __name__ == '__main__':
    app.run(debug=True)
    