#target indesign

/*
 * 
 * TRY USING ALL CAPS FOR BOOKMARKS...EVERY OTHER TITLE IS CAPS (RP, MAINTOC, TABS, ETC.)
 * 
 */

String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

prefs = {
    script: app.scriptPreferences.properties,
    preflight: app.preflightOptions.properties,
    links: app.linkingPreferences.properties,
    text: app.textPreferences.properties
};

app.scriptPreferences.properties = {enableRedraw: false, userInteractionLevel: 1699640946, measurementUnit: 2053729891};
app.preflightOptions.properties = {preflightOff: true};
app.linkingPreferences.properties = {checkLinksAtOpen: false};
app.textPreferences.properties = {typographersQuotes: false};

try {
    main(arguments);
}
catch (e) {
    // log errors
}
finally {
    app.scriptPreferences.properties = prefs.script
    app.preflightOptions.properties = prefs.preflight
    app.linkingPreferences.properties = prefs.links
    app.textPreferences.properties = prefs.text
}

function main (arguments) {
    docPath = arguments[0];
    openDoc(docPath);
    if (!/\bTOC\b/.test(docPath)) {
        if (!File(docPath.slice(0, -4) + 'pdf').exists)
            doc.exportFile(ExportFormat.PDF_TYPE, File(docPath.slice(0, -4) + 'pdf'), false);
        makeTOC();
    }
    if (arguments.length > 1) {
        enterDrawings(arguments[1]);
        addBookmark();
        doc.save();
        doc.exportFile(ExportFormat.PDF_TYPE, File(doc.fullName.absoluteURI.replace(/indd$/i, 'pdf')), false);
    }
    doc.close();
}

function openDoc () {
    doc = app.open(File(docPath)); //, false
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    if (!doc.saved) {
        for (var l = 0; l < doc.links.length; l++) {
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
        File(docPath).remove();
    }
    mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
        return b.length - a.length;
    })[0];
}

function makeTOC () {
    var start = grep({findWhat: '\\A[\\S\\s]+', capitalization: Capitalization.ALL_CAPS})[0].paragraphs.length,
        plen = mainStory.paragraphs.length;
    if (mainStory.characters[-1].contents !== '\r')
        mainStory.insertionPoints[-1].contents = '\r';
    mainStory.insertionPoints[-1].properties = {contents: 'Table of Contents\r', appliedParagraphStyle: 'TOC'};
    for (var p = start; p < plen; p++) {
        var para = mainStory.paragraphs[p],
            style = para.appliedParagraphStyle;
        if (/Level [2-5]/.test(style.name) && para.appliedFont == style.appliedFont)
            mainStory.insertionPoints[-1].properties = {
                contents: para.contents.replace(/(?=\r)/, '\t' + para.parentTextFrames[0].parentPage.name),
                appliedParagraphStyle: 'TOC ' + style.name
            }
    }
    mainStory.paragraphs.itemByRange(start, plen - 1).remove();
    doc.pages.itemByRange(1, doc.pages.length - 1).remove();
    doc.spreads[0].splineItems.everyItem().remove();
    for (var g = doc.spreads[0].allGraphics.length - 1; g > -1; g--)
        doc.spreads[0].allGraphics[g].parent.parent.remove();
    grep({findWhat: '\\A ?Page '}, {changeTo: ''}, {includeMasterPages: true});
    mainStory.insertionPoints[-1].contents = 'Assembly Drawings and Parts Lists\rPlace Holder';
    mainStory.paragraphs[-2].applyParagraphStyle(doc.paragraphStyles.item('TOC Level 2'), true);
    mainStory.paragraphs[-1].applyParagraphStyle(doc.paragraphStyles.item('TOC Parts List'), true);
    doc.sections.add(doc.pages[0], {pageNumberStyle:PageNumberStyle.lowerRoman});
    doc.save(File(docPath.replace(/\.(?=indd$)/i, '.TOC.')));
}

function enterDrawings (drawingText) {
    grep({findWhat: '(?i)^(Illustr|Assembly)[\\S\\s]+'}, {changeTo: drawingText});
    var tocParas = grep({findWhat: '(?<=Contents\\r)[\\S\\s]+'})[0].paragraphs.everyItem().getElements();
    for (var p = 0; p < tocParas.length; p++) {
        var tocPara = tocParas[p];
        tocPara.contents = tocPara.contents.trim().replace(/ *(\n|\t) */g, ('$1' == '\n' ? ' ' : '$1'));
        if (tocPara.contents.indexOf('\t') == -1)
            tocPara.properties.appliedParagraphStyle = 'TOC Level 2';
        else if (/\d{5}/.test(tocPara.contents))
            tocPara.properties = {hyphenation: false, firstLineIndent: -1.75, tabList: [{position: 3.5, alignment: TabStopAlignment.LEFT_ALIGN}]};
        else {
            if (tocPara.words[-1].horizontalOffset - tocPara.words[-2].insertionPoints[-1].horizontalOffset < 0.25)
                tocPara.words[-2].insertionPoints[0].contents = '\n';
            tocPara.properties = {keepAllLinesTogether: true, keepWithNext: 0, hyphenation: false, rightIndent: 0.5, lastLineIndent: -0.375};
        }
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
}

function addBookmark () {
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
    title =  title.replace(/\b[a-z]+\b/ig, function (match) {
        if (/^(a|about|above|across|after|along|and?|around|a[st]|before|behind|below|between|but|by|for|from|in|into|like|mid|near|next|nor|o[fnr]|onto|out|over|past|per|plus|save|so|than|then?|till?|to|under|until|unto|upon|via|with|within|without|x|yet)$/i.test(match))
            return match.toLowerCase();
        if (/^(i{2,3}|PSI|BOP|HPHT|HTHL|HCLD|MPT|CADA|DWHC|ROV|SS|BR|DW)$|^[^aeiou]+)$/i.test(match))
            return match.toUpperCase();
        return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
    });
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
}

function grep (findPrefs, changePrefs, opts) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.properties = opts ? opts : {};
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? doc.changeGrep() : doc.findGrep();
}
