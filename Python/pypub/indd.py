import os
from subprocess import run

# PYTHON NOTES:
#     copy all indd/pdfs to a project folder, & copy source file into dir with TOC if no pdf is found
#     determine whether multiple procs are duplicates (eg SS0284-02 always the same; SS0240 usually different)
#     handle bluesheets in python, without jsx; if bluesheet item does not have an id, generate one
#     require bluesheet formatting (no bs illustrations; unless i use bold formatting)
#     clean drawing descriptions
#     also handle this regex: [/(\d+)k/ig, '$1k']
#     regexs = [[/\bmin.?\b/ig, 'Min.'],[/\bmax.?\b/ig, 'Max.'],[/\u2018|\u2019/ig, '\''],[/\u201C|\u201D/ig, '"'],[/\s*(\t|\r)+\s{0,}/ig, '$1'],[/^(420(056|295)-02).{0,}/ig, '$1\t18-3/4" Jet Sub'],[/(bb|bigbore).?(ii|2)/ig, 'BB II'],[/\bchsart\b/ig, 'Casing Hanger and Seal Assembly Running Tool'],[/\bsart\b/ig, 'Seal Assembly Running Tool'],[/-in\b/ig, '-In'],[/-out\b/ig, '-Out'],[/ & /ig, ' and '],[/mill and flush|m.?(&|and).?f/ig, 'Mill & Flush'],[/\bmpt\b/ig, 'Multi-Purpose Tool'],[/(three|3).?in.?(one|1)/ig, '3-in-1'],[/1st/ig, 'First'],[/2nd/ig, 'Second'],[/3rd/ig, 'Third'],[/\bpos\b/ig, 'Position'],[/\bolr\b/ig, 'Outer Lock Ring'],[/\bbr.style/ig, 'BR-Style'],[/f\/ ?/ig, 'for'],[/\b(.)x(.)/ig, '$1 x $2'],[/ {2,}/g, ' '],[/^\s|\s$/g, '']]

class INDD:
	
    def __init__(self):
        self.root = os.path.dirname(__file__)
        self.jsx = os.path.join(self.root, 'buildPub.jsx')
        scriptExt = 'vbs' if os.name == 'nt' else 'applescript'
        self.cmd = os.path.join(self.root, f'doscript.{scriptExt}')
    
    def doScript(self, args):
        cmd = f'{self.cmd} {args}'
        subprocess.run([self.cmd] + args)
    
    def bluesheet(self, message, pdf, title=None):
        # if bluesheet description is provided in outline (eg as drawing), use that
        # proc = 'The procedure ' + procNumber + ', ' + procTitle + ' is not currently available'
        # sud = 'Stack-Up Drawing, ' + sudNum + ', is not currently available'
        bs = os.path.join(self.root, 'bs.indd')
        jsx = f'doc = app.open("{bs}"), false); '
        jsx += f'doc.stories[0].contents = "{message.replace('"', '\\"')}"; '
        if title:
            jsx += ('app.panels.item(\'Bookmarks\').visible = false; '
                    'doc.bookmarks.add(doc.pages[0], {name: "{title.replace('"', '\\"')}"}); ')
        jsx += 'doc.exportFile(ExportFormat.PDF_TYPE, File("{pdf}"), false); '
        jsx += 'doc.close(1852776480);'
        self.doScript([jsx])
    
