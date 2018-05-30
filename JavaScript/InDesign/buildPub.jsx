#target indesign

/*
 * in python, copy all indd/pdfs to a project folder, & copy source file into dir with TOC if no pdf is found
 * 
 * Might have to replace literals with non-literals (eg find \\t replace with \t)
 * 
 * See if revs in file names messes up any of the naming logic
 * Check if doing SS0203-11.A.indd/SS0203-11.B.indd works for duplicate procedures
 * Add python code to determine whether multiple procs are duplicates
 *     (eg SS0284-02 always the same; SS0240 usually different)
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
    var pubFile = File(File($.fileName).path + '/pubdata.json');
    pubFile.open();
    var cmds = pubFile.read().split('\n');
    pubFile.close();
    // see what happens when you use activeDocument property with no open documents
    if (app.documents.length)
        doc = app.activeDocument;
    mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
        return a.length - b.length;
    }).pop()
    for (var i = 0; i < cmds.length; i++) {
        eval(cmds[i]);
    }
}

function makeINDD (inddPath) {
    doc.links.everyItem().update();
    for (var l = 0; l < doc.links.length; l++) {
        if (doc.links[l].status == LinkStatus.LINK_MISSING) {
            path = doc.links[l].filePath.replace(/.+?\/(?=share)/i, '');
            path = path.replace(/\uF021/g, '*');
            path = path.replace(/\uF022/g, ':');
            if (File(path).exists)
                doc.links[l].relink(File(path));
        }
    }
    doc.save(File(inddPath));
}

function makePDF () {
    var pdf = doc.fullName.absoluteURI.replace(/indd$/i, 'pdf');
    doc.exportFile(ExportFormat.PDF_TYPE, File(pdf), false);
}

function makeTOC () {
    var start = findChangeGrep({findWhat: '[\\S\\s]+', capitalization: Capitalization.ALL_CAPS})[0].paragraphs.length,
        docName = decodeURI(doc.fullName).slice(0, -5),
        tocParas = [];
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
    doc.save(File(doc.fullName.absoluteURI.replace(/indd$/i, 'TOC.indd')));
}

function insertDrawings (draws, ills) {
    var drawParas = ['Assembly Drawings and Parts Lists'].concat(draws);
    if (ills)
        drawParas = ['Illustrations'].concat(ills).concat(drawParas);
    findChangeGrep({findWhat: '(?i)^(Illustrat|Assembly Draw)[\\S\\s]+'}, {changeTo: ''});
    doc.paragraphStyles.item('TOC Parts List').properties = {hyphenation: false, firstLineIndent: -1.75};
    doc.paragraphStyles.item('TOC Parts List').tabStops[0].position = 3.5;
    mainStory.insertionPoints[-1].properties = {appliedParagraphStyle: 'TOC Parts List', contents: drawParas.join('\r')};
    findChangeGrep({findWhat: '^(Illustrations|Assembly Drawings and Parts Lists)\\r'}, {appliedParagraphStyle: 'TOC Level 2'});
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
    doc.save();
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

function makeBluesheet (name, msg, title) {
    for (var b = 0; b < bslist.length; b++) {
        msg = 'This document is not currently available:\r' + msg;
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