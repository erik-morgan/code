#target indesign

/*
 * TRY USING ALL CAPS FOR BOOKMARKS...EVERY OTHER TITLE IS CAPS (RP, MAINTOC, TABS, ETC.)
 * REFACTORING THIS FILE: CONSIDER LINE LENGTH, REDUCE DOM CALLS, & BENCHMARK
                                                                                |
 */

var quotes = app.textPreferences.typographersQuotes,
    arg = eval('(' + arguments[0] + ')');

try {
    config(false);
    main();
} catch (e) {
    log(e);
} finally {
    config(true);
}

function main () {
    openDoc();
    if (arg.pdf)
        exportPDF();
    if (!/\bTOC\b/.test(doc.name))
        makeTOC();
    addDrawings(arg.drawings);
    addBookmark();
    doc.exportPDF();
    doc.close(SaveOptions.YES);
}

function openDoc () {
    doc = app.open(File(arg.doc), false);
    doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.INCHES;
    doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    if (!doc.saved) {
        relink();
        doc.save(File(arg.doc.slice(0, -4) + 'indd'));
        File(arg.doc).remove();
    }
    mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
        return b.length - a.length;
    })[0];
}

function makeTOC () {
    // see about adding tocstyleentries using parastyles.itemByRange(Level 2, Level 5)
    var start = grep({findWhat: '^[^\\r]+\\r', capitalization: Capitalization.ALL_CAPS}).length,
        paras = mainStory.paragraphs.everyItem().contents,
        styles = mainStory.paragraphs.everyItem().appliedParagraphStyle;
    mainStory.insertionPoints[-1].properties = 
        {contents: '\rTable of Contents\r', appliedParagraphStyle: 'TOC'};
    for (var p = start; p < paras.length; p++) {
        if (styles[p].name.substr(0, 5) == 'Level')
            mainStory.insertionPoints[-1].properties = {
                contents: paras[p].replace(/(?=\r)/, '\t' + 
                    mainStory.paragraphs[p].parentTextFrames[0].parentPage.name),
                appliedParagraphStyle: 'TOC ' + styles[p].name
            };
    }
    mainStory.paragraphs.itemByRange(start, p - 1).remove();
    doc.spreads.itemByRange(1, -1).remove();
    doc.spreads[0].splineItems.everyItem().remove();
    for (var g = doc.spreads[0].allGraphics.length - 1; g > -1; g--) {
        doc.spreads[0].allGraphics[g].parent.parent.remove();
    }
    grep({findWhat: '\\A ?Page '}, {changeTo: ''}, {includeMasterPages: true});
    mainStory.insertionPoints[-1].properties = {
        contents: 'Assembly Drawings and Parts Lists\r',
        appliedParagraphStyle: 'TOC Level 2'
    };
    mainStory.insertionPoints[-1].properties = 
        {contents: 'Place Holder', appliedParagraphStyle: 'TOC Parts List'};
    mainStory.paragraphs[-1].appliedParagraphStyle = ;
    doc.sections.add(doc.pages[0], {pageNumberStyle:PageNumberStyle.lowerRoman});
    doc.save(File(doc.fullName.absoluteURI.replace(/\.(?=indd$)/i, '.TOC.')));
}

function addDrawings (drawingText) {
    grep({findWhat: '(?i)^(Illustr|Assembly)[\\S\\s]*\\z'}, {changeTo: drawingText});
    var tocParas = grep({findWhat: '(?<=Contents\\r)[\\S\\s]+'})[0].paragraphs.everyItem().getElements();
    for (var p = 0; p < tocParas.length; p++) {
        var tocPara = tocParas[p];
        tocPara.contents = tocPara.contents.replace(/ *(\n|\t) */g, ('$1' == '\n' ? ' ' : '$1'));
        if (tocPara.contents.indexOf('\t') < 0)
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
        if (/^(i{2,3}|PSI|BOP|HPHT|HTHL|HCLD|MPT|CADA|DWHC|ROV|SS|BR|DW|[^AEIOU]+)$/i.test(match))
            return match.toUpperCase();
        return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
    });
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
}

function grep (findPrefs, changePrefs, opts) {
    /*
     * LIST ALL GREPS USED IN SCRIPT & MAYBE SIMPLIFY THE CALLS
    grep({findWhat: '^[^\\r]+\\r', capitalization: Capitalization.ALL_CAPS}).length
    grep({findWhat: '\\A ?Page '}, {changeTo: ''}, {includeMasterPages: true})
    grep({findWhat: '(?i)^(Illustr|Assembly)[\\S\\s]*\\z'}, {changeTo: drawingText})
    grep({findWhat: '(?<=Contents\\r)[\\S\\s]+'})[0].paragraphs.everyItem().getElements()
    
     */
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.properties = opts ? opts : {};
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? doc.changeGrep() : doc.findGrep();
}

function relink () {
    Folder.current = File.fs == 'Macintosh' ? '/Volumes' : '/n';
    var links = doc.links.everyItem().getElements();
    for (var l = 0; l < links.length; l++) {
        if (links[l].status == LinkStatus.LINK_MISSING) {
            path = links[l].filePath;
            path = path.replace(/.+?\/(share.+)/i, function (match, g1) {
                if (File.fs == 'Macintosh')
                    return g1.replace(/\uF021/g, '*').replace(/\uF022/g, ':');
                else
                    return g1.replace(/\*/g, String.fromCharCode(61473))
                             .replace(/:/g, String.fromCharCode(61474));
            });
            if (File(path).exists)
                links[l].relink(File(path));
        }
        else if (links[l].status == LinkStatus.LINK_OUT_OF_DATE)
            links[l].update();
    }
}

function exportPDF () {
    var path = doc.fullName.absoluteURI.slice(0, -4) + 'pdf';
    doc.exportFile(ExportFormat.PDF_TYPE, File(path), false);
}

function config (restore) {
    app.scriptPreferences.enableRedraw = restore;
    app.scriptPreferences.measurementUnit = MeasurementUnits.INCHES;
    app.scriptPreferences.userInteractionLevel = 
        restore ? UserInteractionLevels.INTERACT_WITH_ALL :
                  UserInteractionLevels.NEVER_INTERACT;
    app.preflightOptions.preflightOff = !restore;
    app.linkingPreferences.checkLinksAtOpen = restore;
    app.textPreferences.typographersQuotes = restore ? quotes : false;
}

function log (err) {
    var logText = 'Error: ' + err.toString() + '\n' +
                  'Message: ' + err.description + '\n' +
                  'Line: ' + (err.hasOwnProperty('line') ? err.line : '?') + '\n' +
                  'Stack: ' + $.stack);
    var logFile = File(File($.fileName).path + '/buildPub.log');
    logFile.open('w');
    logFile.write(logText);
    logFile.close();
}
