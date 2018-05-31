#targetengine "pypub"
#target indesign

openDoc = function (docPath) {
    doc = app.open(File(docPath), false);
    docStem = docPath.slice(0, -5);
    mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
        return a.length - b.length;
    }).pop();
}

closeDoc = function (save) {
    doc.close(save ? SaveOptions.YES : SaveOptions.NO);
}

findChangeGrep = function (findPrefs, changePrefs, findChangeOptions) {
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

makeINDD = function (inddPath) {
    for (var l = 0; l < doc.links.length; l++) {
        if (doc.links[l].status == LinkStatus.LINK_MISSING) {
            path = doc.links[l].filePath.replace(/.+?\/(?=share)/i, '');
            path = path.replace(/\uF021/g, '*');
            path = path.replace(/\uF022/g, ':');
            if (File(path).exists)
                doc.links[l].relink(File(path));
        }
    }
    doc.links.everyItem().update();
    doc.save(File(inddPath));
}

exportDoc = function () {
    doc.exportFile(ExportFormat.PDF_TYPE, File(docStem + '.pdf'), false);
}

makeTOC = function () {
    var bodyPara = findChangeGrep({findWhat: '[\\S\\s]+', capitalization: Capitalization.ALL_CAPS})[0].paragraphs.length;
    for (var p = mainStory.paragraphs.length - 1; p > bodyPara; p--) {
        var para = mainStory.paragraphs[p],
            style = para.appliedParagraphStyle;
        if (/Level/.test(style.name) && para.appliedFont.fullName == style.appliedFont.fullName) {
            var pg = para.parentTextFrames[0].parentPage.name;
            para.contents = para.contents.replace(/ *$/, '\t' + pg);
            para.applyParagraphStyle('TOC ' + style.name, true);
        }
        else
            para.remove();
    }
    mainStory.paragraphs[bodyPara].properties = {appliedParagraphStyle: 'TOC', contents: 'Table of Contents\r'};
    doc.pages.itemByRange(1, doc.pages.length - 1).remove();
    doc.spreads[0].splineItems.everyItem().remove();
    for (var g = doc.groups.length - 1; g > -1; g--) {
        if (doc.groups[g].allGraphics.length) doc.groups[g].remove();
    }
    findChangeGrep({findWhat: 'Page ', appliedParagraphStyle: 'Page No.'}, {changeTo: ''}, {includeMasterPages: true});
    mainStory.insertionPoints[-1].contents = 'Assembly Drawings and Parts Lists\rPlace Holder';
    mainStory.paragraphs[-2].applyParagraphStyle(doc.paragraphStyles.item('TOC Level 2'), true);
    mainStory.paragraphs[-1].applyParagraphStyle(doc.paragraphStyles.item('TOC Parts List'), true);
    doc.sections.add(doc.pages[0], {pageNumberStyle:PageNumberStyle.lowerRoman});
    doc.save(File(docStem + 'TOC.indd'));
}

insertDrawings = function (draws, ills) {
    var drawParas = ['Assembly Drawings and Parts Lists'].concat(draws);
    if (ills)
        drawParas = ['Illustrations'].concat(ills).concat(drawParas);
    findChangeGrep({findWhat: '(?i)^(Illustrat|Assembly Draw)[\\S\\s]+'}, {changeTo: ''});
    mainStory.insertionPoints[-1].properties = {appliedParagraphStyle: 'TOC Parts List', contents: drawParas.join('\r')};
    findChangeGrep({findWhat: '^(Illustrations|Assembly Drawings and Parts Lists)\\r'}, {appliedParagraphStyle: 'TOC Level 2'});
}

styleTOC = function () {
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    doc.paragraphStyles.itemByRange('TOC Level 2', 'TOC Level 5').everyItem().properties = {keepAllLinesTogether: true, keepWithNext: 0, hyphenation: false, rightIndent: 0.5, lastLineIndent: -0.375};
    doc.paragraphStyles.item('TOC Parts List').properties = {hyphenation: false, firstLineIndent: -1.75};
    doc.paragraphStyles.item('TOC Parts List').tabStops[0].position = 3.5;
    findChangeGrep({findWhat: ' *\\n *'}, {changeTo: ' '});
    findChangeGrep({findWhat: '^(Illustrations|Assembly Drawings and Parts Lists)\\r'}, {appliedParagraphStyle: 'TOC Level 2', keepWithNext: 0});
    var tocParas = findChangeGrep({findWhat: '(.+\\t\\d+\\r)+'})[0].paragraphs.everyItem().getElements();
    for (var p = 0; p < tocParas.length; p++) {
        var tocPara = tocParas[p];
        // get tab char; insertionPoints[1] - 0 < 0.25 then split
        if (tocPara.words[-2].insertionPoints[-1].horizontalOffset - tocPara.horizontalOffset > 4.375)
            tocPara.words[-2].insertionPoints[0].contents = '\n';
    }
    mainStory.textContainers[0].properties = {geometricBounds: [0.9375, 1, 10.25, 7.75], itemLayer: 'Default'};
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

addBookmark = function (title) {
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
        };
    if (title) {
        var parts = /(.+?)\b((the|for|of|\d+)\b.+)/.exec(title);
        title = changeTense(parts[1]) + parts[2];
    }
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

makeBluesheet = function (name, msg, title) {
    msg = 'This document is not currently available:\r' + msg;
    doc = app.documents.add(false, app.documentPresets.add({facingPages: false}));
    doc.rectangles.add('Default', {geometricBounds: doc.pages[0].bounds, fillColor: doc.colors.add({space: ColorSpace.RGB, colorValue: [182,225,245]})});
    doc.textFrames.add('Default', {geometricBounds: [0.75, 1, 10.25, 7.75], contents: msg});
    doc.textFrames[0].parentStory.properties = {appliedFont: 'Minion Pro\tSemibold', pointSize: 45, hyphenation: false};
    if (title)
        addBookmark(bslist[b].bookmark)
    doc.exportFile(ExportFormat.PDF_TYPE, File(root.absoluteURI + '/' + name + '.pdf'), false);
}

