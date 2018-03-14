import os
import glob
import re
from zipfile import ZipFile
import json
from lxml import etree

# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
# TODO: 
dirs = {}
xns = {
    'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

def init_pub():
    # TODO: add ability to change vars
    # TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
    global dirs
    dirsFile = os.path.dirname(os.path.realpath(__file__)) + '/.pypub_vars.json'
    if os.path.exists(dirsFile):
        with open(dirsFile, 'r') as f:
            dirs = json.load(f)
    else:
        dirs.pdf = input('Enter path to PDFs folder: ')
        dirs.draw = input('Enter path to Drawings folder: ')
        with open(dirsFile, 'w') as f:
            json.dump(dirs, f, sort_keys=True, indent=4)
    dirs.project = input('Enter path to project folder: ')
    getOutline()

def getOutline():
    global dirs
    dirs.oproj = dirs.project + '/.oproj.json'
    docs = glob.glob(dirs.project + '/Outlines/*docx')
    if len(docs) == 1:
        dirs.outline = docs[0]
    else:
        dirs.outline = docs[0] if re.search('(?i)a-z|pull', docs[1]) else docs[1]
        # parseOutline(zipfile.ZipFile(doc).open('word/document.xml').read())
        with ZipFile(dirs.outline) as zip:
            xdoc = zip.open('word/document.xml').read()
            if 'docProps/custom.xml' not in zip.namelist():
                print('The outline file, must have the following custom Word properties:'
                      'System, Manual Number, Customer, Project, Rig, and Rev/Volume if applicable')
                return
            xprops = zip.open('docProps/custom.xml').read()
        parseOutline(xdoc, xprops)

# Use FunctionNamespace as decorator
@ns
def xpathExtension(context, param):
    # eval_context and context_node
    # The context node is the Element where the current function is called
    print("%s: %s" % (context.context_node.tag, [ n.tag for n in nodes ]))
    # The eval_context is a dictionary that is local to the evaluation. It allows functions to keep state
    context.eval_context[context.context_node.tag] = "done"
    print(sorted(context.eval_context.items()))

    
def usingXpathExtension():
    ns = etree.FunctionNamespace(None)
    # registers function hello with name hello in default ns (None)
    root.xpath('hello(local-name(*))')
    # you would want to separate the two in different namespaces
    ns = etree.FunctionNamespace('http://mydomain.org/myfunctions')
    ns['hello'] = hello
    prefixmap = {'f' : 'http://mydomain.org/myfunctions'}
    print(root.xpath('f:hello(local-name(*))', namespaces=prefixmap))

def parseOutline(xdoc, xprops):
    # Remove .outline.json after finished
    # First check for existence of all drawings (minus stack-ups)
    # use outline metadata for proj details
    # urldecode special characters. see if lxml does it, or do global f/r
    # if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
    if os.path.exists(dirs.oproj):
        with open(dirs.oproj, 'r') as f:
            oproj = json.load(f)
    else:
        oproj = objectify(xdoc)
        propDoc = etree.fromString(xprops)
        # get props
        oproj.system = doc.xpath('//property[contains(@name, "")]', namespaces=xns)
        oproj.number = 
        oproj.customer = 
        oproj.project = 
        oproj.rig = 
        oproj.revision = 
        oproj.volume = 
        with open(dirs.oproj, 'w') as f:
            json.dump(oproj, f, sort_keys=True, indent=4)

def objectify(doc_str):
	doc_str = doc_str.replace('<w:br/>', '<w:t>\t</w:t>')
    doc = etree.fromstring(doc_str.replace('<w:tab/>', '<w:t>\t</w:t>'))
    nstag = lambda tag: '{' + xns.w + '}' + tag
    sects = doc.xpath('//w:p[not(.//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile('\d{5}', re.I)
    drawFormat = re.compile('^(\S+)\t+([^\t\r]+) ?[\s\S]*')
    project = {'data': []}
    app = project.data.append
    for sect in sects:
        sectInfo = {'phase': '', 'title': '', 'docs': []}
        if sect.getnext().lastChild.lastChild.name !== nstag('t')
            sectTitle = ''.join(t[-1].text for t in sect.iter('{*}t'))
            sectTitle = re.sub('(?i)^([^\t\r]+) ?[\s\S]*', '$1', sectTitle).strip()
            if sectTitle.beginswith('STACK-UP') or 'TEST OPTION' in sectTitle:
                sectInfo.title = sectTitle if 'BOP' in sectTitle else 'STACK-UP DRAWINGS'
                sect = sect.getnext()
            else:
                activePhase = sectTitle
                continue
        sectInfo.phase = activePhase
        for p in sect.itersiblings('{*}p'):
            paraText = ''.join(t[-1].text for t in p.iter('{*}t'))
            if not paraText:
                break
            if drawTest.search(paraText):
                draw = re.sub(drawFormat, '$1\t$2', paraText).split('\t')
                sectInfo.docs.append({'type': 'DRAW', 'id': draw[0], 'description': draw[1]})
            elif re.match('[A-Z]{2,6}\d{4}', paraText):
                sectInfo.docs.append({'type': 'RP', 'id': paraText.split()[0].replace('/', '-')})
            elif paraText.beginswith('Rev'):
                sectInfo.docs[0].rev = int(paraText.split()[1])
            elif 'ADVISORY' in paraText:
                sectInfo.docs[0].advisory = True
            elif 'BTC' in paraText:
                btcText = re.sub('(BTC) (\d+) Rev (\d+).*', '$1$2 $3', paraText)
                sectInfo.docs.append({'type': 'BTC', 'id': btcText.split()[0], 'rev': int(btcText.split[1])})
        app(sectInfo)
    return project



