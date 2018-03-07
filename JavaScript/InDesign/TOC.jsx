#target indesign
var doc = app.activeDocument, mainStory;

clearBoxes();
app.scriptPreferences.enableRedraw = false;
main();
app.scriptPreferences.enableRedraw = true;

function main () {
    mainStory = findChangeGrep({'findWhat': '(?i)suggested procedure\\r'})[0].parent;
    var paras = mainStory.paragraphs.everyItem().getElements(),
         mainFrame = mainStory.textContainers[0];
    for (var p = numParas.length - 1; p > -1; p--) {
        if (paras[p].appliedParagraphStyle.name[0] == 'L') {
            var par = paras[p],
                 pstyle = par.appliedParagraphStyle.name,
                 pnum = par.parentTextFrames[0].parentPage.name;
            par.contents = par.contents.replace(/ *\n */i, ' ');
            par.insertionPoints[-2].contents = '\t' + pnum;
            par.appliedParagraphStyle = pstyle.replace(/(Level \d).*/, 'TOC $1');
        }
        else if (paras[p].appliedParagraphStyle.name == 'SUGGESTED PROCEDURE') {
            paras[p].insertionPoints[-1].contents = 'Table of Contents\r';
            mainStory.paragraphs[paras.length - p - 1].applyParagraphStyle(doc.paragraphStyles.item('TOC'), true);
            break;
        }
        else paras[p].remove();
    }
    mainStory.paragraphs.everyItem().clearOverrides();
    findChangeGrep({'capitalization': Capitalization.NORMAL}, {'hyphenation': false, 'rightIndent': '0.375i', 'lastLineIndent': '0.125i'}, undefined);
    doc.pages.itemByRange(1, doc.pages.length-1).remove();
    var grps = doc.spreads[0].groups.everyItem().getElements();
    for (var g = grps.length - 1; g > -1; g--) {
        if (grps[g].allGraphics.length) grps[g].remove();
    }
    doc.sections.add(doc.pages.firstItem(), {pageNumberStyle:PageNumberStyle.lowerRoman});
    findChangeGrep({'findWhat': 'Page ', 'appliedParagraphStyle': 'Page No.'}, {'changeTo': ''}, {'includeMasterPages': true});
    mainStory.insertionPoints[-1].contents = 'Assembly Drawings and Parts Lists\r';
    mainStory.paragraphs.lastItem().applyParagraphStyle('TOC Level 2', true);
    mainStory.insertionPoints[-1].applyParagraphStyle(doc.paragraphStyles.item('TOC Parts List'), true);
    app.menuActions.itemByName('Sort by Name').invoke();
    mainFrame.properties = {geometricBounds: ['67.5pt', '72pt', '648pt', '558pt'], itemLayer: 'Default'};
    if (mainFrame.overflows) handleOverflow();
    else mainFrame.geometricBounds = ['67.5pt', '72pt', '720pt', '558pt'];
}

function handleOverflow () {
    var plusFrame = doc.pages[0].textFrames.add('Default', {geometricBounds: ['684pt', '72pt', '720pt', '558pt'], contents: '+'});
    plusFrame.parentStory.properties = ({appliedFont: 'ITC Bookman Std', fontStyle: 'Bold', pointSize: '24pt', justification: Justification.rightAlign, alignToBaseline: true});
    var newPage = doc.pages.add(LocationOptions.AFTER, doc.pages.firstItem());
    var newFrame = newPage.textFrames.add('Default', {geometricBounds: ['76.8pt', '54pt', '738pt', '540pt']});
    tocFrame.nextTextFrame = newFrame;
    if (mainStory.textContainers.length < 2) newFrame.previousTextFrame = mainStory.textContainers[0];
}

function clearBoxes(){
    app.findChangeObjectOptions = app.findObjectPreferences = NothingEnum.nothing;
    app.findObjectPreferences.properties = {fillColor: 'Black', strokeColor: 'None'};
    app.findChangeObjectOptions.objectType = ObjectTypes.ALL_FRAMES_TYPE;
    var boxes = doc.findObject();
    for (b = 0; b < boxes.length; b++){
        boxes[b].remove();
    }
}

function findChangeGrep(findPrefs, changePrefs, findChangeOptions) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    if (findChangeOptions !== undefined) {
        app.findChangeGrepOptions.properties = findChangeOptions;
    }
    app.findGrepPreferences.properties = findPrefs;
    if (changePrefs == undefined) {
        return doc.findGrep();
    }
    else {
        app.changeGrepPreferences.properties = changePrefs;
        doc.changeGrep();
    }
}
