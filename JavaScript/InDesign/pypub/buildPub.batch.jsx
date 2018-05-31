#target indesign

/*
 * in python, copy all indd/pdfs to a project folder so this can check for pdf
 * also check for pdf, and copy source file into dir with TOC if no pdf is found
 * 
 * Might have to replace literals with non-literals (eg find \\t replace with \t)
 * 
 * See if revs in file names messes up any of the naming logic
 * Check if doing SS0203-11.A.indd/SS0203-11.B.indd works for duplicate procedures
 * Add python code to determine whether multiple procs are duplicates
 *     (eg SS0284-02 always the same; SS0240 usually different)
 * 
 * REVISIT IDEA OF USING ONLY SOURCE FILES, AND ADDING TOCS TO BEGINNING:
 *     ALWAYS ADD 2 PAGES TO BEGINNING. IF 2ND PAGE NOT NEEDED, SET MASTER TO NONE
 *     SUPPRESS MASTER TEXT FRAMES ON TOC PAGES, AND DUPLICATE PAGE # TEXT FRAME FROM MASTER
 * 
 * DUE TO PYTHONS SUPERIOR LIST HANDLING, ORGANIZE DRAWINGS IN PYTHON, BEFORE SAVING PUBDATA
 * 
 * IN PYTHON, IF A BLUESHEET ITEM DOES NOT HAVE AN ID, GENERATE A RANDOM NUMBER
 * REQUIRE BLUESHEETS TO BE FORMATTED ACCORDINGLY (NO BS ILLUSTRATIONS; UNLESS I USE BOLD FORMATTING)
 * OR, USE MARKER ON ILLUSTRATIONS COMBINED WITH FORMATTING!!!
 * STILL, MAKE LIFE EASIER AND LIST ILLUSTRATIONS SEPARATELY IN JSON
 * 
 * CLEAN DRAWING DESCRIPTIONS IN PYTHON & SAVE IN JSON FORMAT
 */
// ALSO HANDLE THIS REGEX: [/(\d+)k/ig, '$1k']
 // regexs = [[/\bmin.?\b/ig, 'Min.'],[/\bmax.?\b/ig, 'Max.'],[/\u2018|\u2019/ig, '\''],[/\u201C|\u201D/ig, '"'],[/\s*(\t|\r)+\s*/ig, '$1'],[/^(420(056|295)-02).*/ig, '$1\t18-3/4" Jet Sub'],[/(bb|bigbore).?(ii|2)/ig, 'BB II'],[/\bchsart\b/ig, 'Casing Hanger and Seal Assembly Running Tool'],[/\bsart\b/ig, 'Seal Assembly Running Tool'],[/-in\b/ig, '-In'],[/-out\b/ig, '-Out'],[/ & /ig, ' and '],[/mill and flush|m.?(&|and).?f/ig, 'Mill & Flush'],[/\bmpt\b/ig, 'Multi-Purpose Tool'],[/(three|3).?in.?(one|1)/ig, '3-in-1'],[/1st/ig, 'First'],[/2nd/ig, 'Second'],[/3rd/ig, 'Third'],[/\bpos\b/ig, 'Position'],[/\bolr\b/ig, 'Outer Lock Ring'],[/\bbr.style/ig, 'BR-Style'],[/f\/ ?/ig, 'for'],[/\b(.)x(.)/ig, '$1 x $2'],[/ {2,}/g, ' '],[/^\s|\s$/g, '']]

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
main();

function main () {
    var pubFile = File(File($.fileName).path + '/pubdata.json'),
        pub = $.evalFile(pubFile);
    root = pub.root;
    convertIDML();
    tocify();
    for (var name in pub.drawings) {
        var indd = root.getFiles(name + '.TOC.indd')[0],
            pdf = decodeURI(indd).replace(/indd$/i, 'pdf');
        doc = app.open(indd);
        addDrawings(pub.drawings[name]);
        styleTOC();
        addBookmark();
        doc.exportFile(ExportFormat.PDF_TYPE, pdf, false);
    }
    // may not be necessary if i use subprocess (or os.execute?)
    makeBluesheets(pub.bluesheets);
    pubFile.remove();
}

function convertIDML () {
    app.open(root.getFiles('*idml'), false);
    while (app.documents.length) {
        var doc = app.documents[0],
            links = doc.links.everyItem().getElements(),
            idml = decodeURI(doc.fullName),
            newDoc = idml.replace(/idml$/i, 'indd');
        for (var i = 0; i < links.length; i++) {
            if (links[i].status == LinkStatus.LINK_MISSING) {
                path = links[i].filePath.replace(/.+?\/(?=share)/i, '');
                path = path.replace(/\uF021/g, '*');
                path = path.replace(/\uF022/g, ':');
                if (File(path).exists)
                    links[i].relink(File(path));
            }
            links[i].update();
        }
        doc.close(SaveOptions.YES, File(newDoc));
        File(idml).remove();
    }
}

function tocify () {
    var indds = root.getFiles('*indd');
    for (var i = indds.length - 1; i > -1; i--) {
        if (!/\bTOC\b/i.test(indds[i].name))
            makeTOC(indds[i]);
    }
}

function makeTOC (docFile) {
    var doc = app.open(docFile, false),
        mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
            return a.length - b.length;
        }).pop(),
        start = findChangeGrep({findWhat: '[\\S\\s]+', capitalization: Capitalization.ALL_CAPS})[0].paragraphs.length,
        docName = decodeURI(doc.fullName).slice(0, -5),
        tocParas = [];
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    if (!File(docName + '.pdf').exists)
        doc.exportFile(ExportFormat.PDF_TYPE, File(docName + '.pdf'), false);
    for (var p = start; p < mainStory.paragraphs.length; p++) {
        var para = mainStory.paragraphs[p],
            style = para.appliedParagraphStyle;
        if (/^Level \d/i.test(style.name) && para.appliedFont.fullName == style.appliedFont.fullName)
            tocParas.push({
                text: para.contents.replace(/\s*$/, ''),
                pageNumber: para.parentTextFrames[0].parentPage.name,
                style: style.name
            });
    }
    doc.pages.itemByRange(1, doc.pages.length - 1).remove();
    doc.spreads[0].splineItems.everyItem().remove();
    for (var g = doc.groups.length - 1; g > -1; g--) {
        if (doc.groups[g].allGraphics.length) doc.groups[g].remove();
    }
    mainStory.paragraphs.itemByRange(start, mainStory.paragraphs.length - 1).remove();
    mainStory.insertionPoints[-1].properties = {appliedParagraphStyle: 'TOC', contents: 'Table of Contents\r'};
    for (var p = 0; p < tocParas.length; p++) {
        var para = tocParas[p],
            content = para.text + '\t' + para.pageNumber + '\r',
            style = 'TOC ' + para.style;
        mainStory.insertionPoints[-1].properties = {appliedParagraphStyle: style, contents: content};
        if (/Level [345]/i.test(style))
            mainStory.paragraphs[-1].properties = {hyphenation: false, rightIndent: '0.5i', lastLineIndent: '-0.375i'};
    }
    findChangeGrep({findWhat: ' *\\n *', appliedFont: 'ITC Bookman Std'}, {changeTo: ' '});
    findChangeGrep({findWhat: 'Page ', appliedParagraphStyle: 'Page No.'}, {changeTo: ''}, {includeMasterPages: true});
    mainStory.insertionPoints[-1].contents = 'Assembly Drawings and Parts Lists\rPlace Holder';
    mainStory.paragraphs[-2].applyParagraphStyle(doc.paragraphStyles.item('TOC Level 2'), true);
    mainStory.paragraphs[-1].applyParagraphStyle(doc.paragraphStyles.item('TOC Parts List'), true);
    doc.sections.add(doc.pages[0], {pageNumberStyle:PageNumberStyle.lowerRoman});
    doc.close(SaveOptions.YES, File(docName + '.TOC.indd'));
}

function addDrawings (drawList) {
    mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
        return a.length - b.length;
    }).pop();
    findChangeGrep({findWhat: '(?i)^(Illustrat|Assembly Draw)[\\S\\s]+'}, {changeTo: 'Illustrations\\r'});
    var drawText = 'Assembly Drawings and Parts Lists\r' + drawList.join('\r');
    drawText = drawText.replace(/(^.+\r)((^\[ILL\].+\r)+)/m, 'Illustrations\r$2$1');
    doc.paragraphStyles.item('TOC Parts List').properties = {hyphenation: false, firstLineIndent: -1.75};
    doc.paragraphStyles.item('TOC Parts List').tabStops[0].position = 3.5;
    mainStory.insertionPoints[-1].properties = {appliedParagraphStyle: 'TOC Parts List', contents: drawText};
    findChangeGrep({findWhat: '^((Illustrations|Assembly Drawings and Parts Lists)\\r)'}, {changeTo: '$1', appliedParagraphStyle: 'TOC Level 2'});
}

function styleTOC () {
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    var tocParas = findChangeGrep({findWhat: '(?i)^TOC[\\S\\s]+\\r(Illustrat|Assembly).+\\r'})[0].paragraphs.everyItem().getElements();
    for (var p = 0; p < tocParas.length; p++) {
        var tocPara = tocParas[p],
            tocStyle = tocPara.appliedParagraphStyle.name;
        tocPara.properties = {keepAllLinesTogether: true, keepWithNext: 0, hyphenation: false, rightIndent: 0.5, lastLineIndent: -0.375};
        if (tocPara.words[-2].insertionPoints[-1].horizontalOffset - tocPara.horizontalOffset > 4.375)
            tocPara.words[-2].insertionPoints[0].contents = '\n';
    }
    var mainFrame = mainStory.textContainers[0];
    mainFrame.properties = {geometricBounds: [0.9375, 1, 10.25, 7.75], itemLayer: 'Default'};
    while (mainStory.overflows) {
        var lastFrame = mainStory.textContainers[-1],
            lastRect = lastFrame.geometricBounds,
            plusFrame = lastFrame.parentPage.textFrames.add('Default', {geometricBounds: [9.75, lastRect[1], 10.25, lastRect[3]], contents: '+'}),
            nextPage = doc.pages.add(LocationOptions.AT_END),
            nextx = nextPage.documentOffset % 2 ? 0.75 : 9.5,
            nextFrame = nextPage.textFrames.add('Default', {geometricBounds: [32/30, nextx, 10.25, nextx + 6.75]});
        lastFrame.geometricBounds = [lastRect[0], lastRect[1], lastRect[2] - 0.5, lastRect[3]];
        plusFrame.parentStory.properties = ({appliedFont: 'ITC Bookman Std\tBold', pointSize: '24pt', justification: Justification.rightAlign, alignToBaseline: true});
        lastFrame.nextTextFrame = nextFrame;
    }
}

function addBookmark (title) {
    doc.bookmarks.everyItem().remove();
    var changeTense = function (str) {
            return str.replace(/\b[a-z]+ing\b/ig, function (match) {
                if (/^(run|set|ship)/i.test(match))
                    return match.substr(0, match.length - 4);
                return match.substr(0, match.length - 3) + (/(activat|chang|driv|ma[kt]|operat|releas|replac|retriev|servic|terminat|us)ing/i.test(match) ? 'e' : '');
            });
        },
        changeCase = function (str) {
            return title.replace(/\b[A-Za-z]+\b/g, function (match) {
                if (/^(a|about|above|across|after|along|and?|around|a[st]|before|behind|below|between|but|by|for|from|in|into|like|mid|near|next|nor|o[fnr]|onto|out|over|past|per|plus|save|so|than|then?|till?|to|under|until|unto|upon|via|with|within|without|x|yet)$/i.test(match))
                    return match.toLowerCase();
                if (/^(i{2,3}|PSI|BOP|HPHT|HTHL|HCLD|MPT|CADA|DWHC|ROV|SS|BR|DW)$|^[^aeiou]+)$/i.test(match))
                    return match.toUpperCase();
                return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
        });
    if (title) {
        var parts = /(.+?)\b(the|for|of|\d+)\b(.+)/.exec(title);
        title = changeTense(parts[1]) + parts[2] + parts[3];
    else {
        var titleParas = findChangeGrep({findWhat: '(?i)\\A[\\S\\s]+\\r(?=suggest|table)'})[0].paragraphs,
            title = titleParas.itemByRange(0, -1).contents;
        if (/bookman/i.test(titleParas[0].appliedFont.fullName))
            title = changeTense(titleParas[0].contents) + titleParas.itemByRange(1, -1).contents;
        title = title.replace(/\s*(\r|\n)\s*/g, ' ');
    }
    title = changeCase(title);
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
}

function makeBluesheets (bslist) {
    for (var b = 0; b < bslist.length; b++) {
        var name = bslist[b].name,
            msg = 'This document is not currently available:\r' + bslist[b].text;
        doc = app.documents.add(false, app.documentPresets.add({facingPages: false}));
        doc.pages[0].rectangles.add('Default', {geometricBounds: doc.pages[0].bounds, fillColor: doc.colors.add({space: ColorSpace.RGB, colorValue: [182,225,245]})});
        doc.pages[0].textFrames.add('Default', {geometricBounds: [0.75, 1, 10.25, 7.75], contents: msg});
        doc.textFrames[0].parentStory.properties = {appliedFont: 'Minion Pro\tSemibold', pointSize: 45, hyphenation: false};
        if (bslist[b].hasOwnProperty('bookmark'))
            addBookmark(bslist[b].bookmark)
        doc.exportFile(ExportFormat.PDF_TYPE, File(root.absoluteURI + '/' + name + '.pdf'), false);
    }
}

function findChangeGrep (findPrefs, changePrefs, findChangeOptions) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    if (findChangeOptions)
        app.findChangeGrepOptions.properties = findChangeOptions;
    app.findGrepPreferences.properties = findPrefs;
    if (!changePrefs)
        return doc.findGrep();
    else {
        app.changeGrepPreferences.properties = changePrefs;
        doc.changeGrep();
    }
}
