#targetengine "pypub"
#target indesign

prefs = {
    alerts: app.scriptPreferences.userInteractionLevel,
    preflight: app.preflightOptions.preflightOff,
    links: app.linkingPreferences.checkLinksAtOpen
}

app.scriptPreferences.properties = {
    enableRedraw: false,
    measurementUnit: MeasurementUnits.INCHES,
    userInteractionLevel: UserInteractionLevels.NEVER_INTERACT
};
app.preflightOptions.preflightOff = true;
app.linkingPreferences.checkLinksAtOpen = false;

cleanUp = function () {
    app.scriptPreferences.properties = {
        enableRedraw: true,
        userInteractionLevel: prefs.alerts
    };
    app.preflightOptions.preflightOff = prefs.preflight;
    app.linkingPreferences.checkLinksAtOpen = prefs.links;
    openDoc = grep = makeTOC = insertDrawings = styleTOC = null;
}

openDoc = function (docPath) {
    doc = app.open(File(docPath), false);
    if (!doc.saved) {
        for (var l = 0; l < doc.links.length; l++) {
            // try status == 'lood'
            if (doc.links[l].status == LinkStatus.LINK_MISSING) {
                path = doc.links[l].filePath.replace(/.+?\/(?=share)/i, '');
                path = path.replace(/\uF021/g, '*');
                path = path.replace(/\uF022/g, ':');
                if (File(path).exists)
                    doc.links[l].relink(File(path));
            }
            else if (doc.links[l].status == LinkStatus.LINK_OUT_OF_DATE)
                doc.links[l].update();
        }
        doc.save(File(docPath.slice(0, -4) + 'indd'));
        doc.exportFile(ExportFormat.PDF_TYPE, File(docPath.slice(0, -4) + 'pdf'), false);
    }
    mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
        return b.length - a.length;
    })[0];
}

grep = function (findPrefs, changePrefs, opts) {
    app.findChangeGrepOptions.properties = opts == undefined ? NothingEnum.nothing : opts;
    app.findGrepPreferences.properties = findPrefs;
    if (changePrefs == undefined)
        return doc.findGrep();
    app.changeGrepPreferences.properties = changePrefs;
    doc.changeGrep();
}

makeTOC = function () {
    for (var p = mainStory.paragraphs.length - 1; p > -1; p--) {
        var para = mainStory.paragraphs[p],
            style = para.appliedParagraphStyle;
        if (para.capitalization == style.capitalization && para.capitalization == Capitalization.ALL_CAPS)
            break;
        if (/Level/.test(style.name) && para.appliedFont.fullName == style.appliedFont.fullName) {
            para.insertionPoints[-2].contents = '\t' + para.parentTextFrames[0].parentPage.name;
            para.applyParagraphStyle(doc.paragraphStyles.item('TOC ' + style.name), true);
        }
        else
            para.remove();
    }
    mainStory.insertionPoints[-1].properties = {appliedParagraphStyle: 'TOC', contents: 'Table of Contents\r'};
    mainStory.paragraphs[-1].move(LocationOptions.AFTER, mainStory.paragraphs[p]);
    doc.pages.itemByRange(1, doc.pages.length - 1).remove();
    doc.spreads[0].splineItems.everyItem().remove();
    for (var g = doc.groups.length - 1; g > -1; g--) {
        if (doc.groups[g].allGraphics.length)
            doc.groups[g].remove();
    }
    grep({findWhat: '\\A ?Page '}, {changeTo: ''}, {includeMasterPages: true});
    mainStory.insertionPoints[-1].contents = 'Assembly Drawings and Parts Lists\rPlace Holder';
    mainStory.paragraphs[-2].applyParagraphStyle(doc.paragraphStyles.item('TOC Level 2'), true);
    mainStory.paragraphs[-1].applyParagraphStyle(doc.paragraphStyles.item('TOC Parts List'), true);
    doc.sections.add(doc.pages[0], {pageNumberStyle:PageNumberStyle.lowerRoman});
    doc.save(File(doc.fullName.absoluteURI.replace(/\.(?=indd$)/i, '.TOC.')));
}

insertDrawings = function (drawText) {
    grep({findWhat: '(?i)^(Illustrat|Assembly Draw)[\\S\\s]+'}, {changeTo: drawText, appliedParagraphStyle: 'TOC Parts List'});
}

styleTOC = function () {
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    doc.paragraphStyles.itemByRange('TOC Level 2', 'TOC Level 5').everyItem().properties = {keepAllLinesTogether: true, keepWithNext: 0, hyphenation: false, rightIndent: 0.5, lastLineIndent: -0.375};
    doc.paragraphStyles.item('TOC Parts List').properties = {hyphenation: false, firstLineIndent: -1.75};
    doc.paragraphStyles.item('TOC Parts List').tabStops[0].position = 3.5;
    grep({findWhat: '([ \\n]+)'}, {changeTo: ' '});
    grep({findWhat: '([ \\t]+)'}, {changeTo: '\\t'});
    grep({findWhat: '^(Illustrat|Assembly Draw).+\\r'}, {appliedParagraphStyle: 'TOC Level 2', keepWithNext: 0});
    var tocParas = grep({findWhat: '(.+\\t\\d+\\r)+'})[0].paragraphs.everyItem().getElements();
    for (var p = 0; p < tocParas.length; p++) {
        var tocPara = tocParas[p];
        if (tocPara.words[-1].horizontalOffset - tocPara.words[-2].insertionPoints[-1].horizontalOffset < 0.25)
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

addBookmark = function () {
    doc.bookmarks.everyItem().remove();
    var titleParas = grep({findWhat: '(?i)\\A[\\S\\s]+\\r(?=suggest|table)'})[0].paragraphs,
        title = '';
    if (/bookman/i.test(titleParas[0].appliedFont.fullName))
        title = titleParas[0].contents.replace(/\b[a-z]+ing\b/ig, function (match) {
            if (/^(run|set|ship)/i.test(match))
                return match.slice(0, -4);
            return match.slice(0, -3) + (/(activat|chang|driv|ma[kt]|operat|releas|replac|retriev|servic|terminat|us)ing/i.test(match) ? 'e' : '');
        });
    title = titleParas.itemByRange(title ? 1 : 0, -1).contents.replace(/\s*(\r|\n)\s*/g, ' ');
    title =  title.replace(/\b[A-Za-z]+\b/g, function (match) {
        if (/^(a|about|above|across|after|along|and?|around|a[st]|before|behind|below|between|but|by|for|from|in|into|like|mid|near|next|nor|o[fnr]|onto|out|over|past|per|plus|save|so|than|then?|till?|to|under|until|unto|upon|via|with|within|without|x|yet)$/i.test(match))
            return match.toLowerCase();
        if (/^(i{2,3}|PSI|BOP|HPHT|HTHL|HCLD|MPT|CADA|DWHC|ROV|SS|BR|DW)$|^[^aeiou]+)$/i.test(match))
            return match.toUpperCase();
        return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
    });
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
}
