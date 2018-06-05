import os

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
        scriptExt = 'vbs' if os.name == 'nt' else 'applescript'
        self.cmd = os.path.join(self.root, f'doscript.{scriptExt}')
    
    def doScript(self, args=None):
        cmd = f'{self.cmd} {args}'
    
    def buildPubWin(self, pathJSX, args):
        pathJSX = '\'' + pathJSX + '\''
        args = ['\'' + arg + '\'' for arg in args]
        cmd = ('powershell -c "(New-Object -ComObject InDesign.Application)'
               '.DoScript((New-Object -ComObject Scripting.FileSystemObject)'
               f'.GetFile(\'{pathJSX}\'), 1246973031, @({', '.join(args)}))"')
    
    def buildPubMac(self, pathJSX, args):
        cmd = ('osascript -e \'tell application id "com.adobe.indesign" to '
               f'do script "{pathJSX}" language javascript\'')
    
    def setPrefs(self, restore=False):
        prefs = ('app.scriptPreferences.enableRedraw = {0}; '
                 'app.scriptPreferences.userInteractionLevel = {1}; '
                 'app.preflightOptions.preflightOff = {2}; '
                 'app.linkingPreferences.checkLinksAtOpen = {3};')
        if restore:
            vals = ('true', '1699311169', 'false', 'true')
        else:
            vals = ('false', '1699640946', 'true', 'false')
        self.doscript(self.prefs.format(*vals))
    
    def bluesheet(self, bstype, bspath, pdf, title=None):
        # CREATE BLUESHEET FILE WITH DIFFERENT LAYERS FOR DIFFERENT SCENARIOS!
        # HANDLE BLUESHEET CODE IN DOSCRIPT.APPLESCRIPT/DOSCRIPT.VBS
        jsx = ('doc = app.documents.add(false); '
               'blue = doc.colors.add({space: ColorSpace.RGB, '
               'colorValue: [182,225,245]}); '
               'doc.rectangles.add(\'Default\', {geometricBounds: '
               'doc.pages[0].bounds, fillColor: blue}); '
               'doc.textFrames.add(\'Default\', {geometricBounds: '
               '[0.75, 1, 10.25, 7.75], contents: \'{0}\'}); '
               'doc.textFrames[0].parentStory.properties = {appliedFont: '
               '\'Minion Pro\tSemibold\', pointSize: 45, hyphenation: false}; '
               'app.panels.item(\'Bookmarks\').visible = false; '
               'doc.bookmarks.add(doc.pages[0], {name: \'{1}\'}); '
               'doc.exportFile(ExportFormat.PDF_TYPE, File({2}), false); '
               'doc.close(1852776480);')
        self.exec(jsx.format(msg.replace('"', '\"'), title, fileName))
    
