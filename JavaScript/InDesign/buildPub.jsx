#target indesign

/*
 * TRY USING ALL CAPS FOR BOOKMARKS...EVERY OTHER TITLE IS CAPS (RP, MAINTOC, TABS, ETC.)
 * BLUESHEET = File('../bs.indd'),
 */

var quotes = app.textPreferences.typographersQuotes,
    arg = eval('(' + arguments[0] + ')'),
    TOC_PROPS = {
        keepAllLinesTogether: true,
        keepWithNext: 0,
        lastLineIndent: -0.375,
        rightIndent: 0.5
    },
    TOC_PL_PROPS = {
        firstLineIndent: -1.75,
        keepAllLinesTogether: true,
        tabList: [{position: 3.5, alignment: TabStopAlignment.LEFT_ALIGN}]
    },
    PLUS_PROPS = {
        alignToBaseline: true,
        appliedFont: 'ITC Bookman Std\tBold',
        justification: Justification.rightAlign,
        pointSize: '24pt'
    };

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
    var start = grep({findWhat: '^[^\\r]+\\r', ruleBelow: false}).length,
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
    grep({findWhat: '(?i)^((Illustration|Assembly)[\\S\\s]+)?\\z'},
         {changeTo: drawingText, appliedParagraphStyle: 'TOC Level 2'});
    grep({findWhat: ' *\\n *'}, {changeTo: ' '});
    var tabs = grep({findWhat: '\\t(?=\\d+\\r)'});
    for (var t = 0; t < tabs.length; t++) {
        var tab = tabs[t];
        tab.paragraphs[0].properties = TOC_PROPS;
        if (tab.insertionPoints[-1].horizontalOffset - tab.horizontalOffset > 0.25)
            tab.paragraphs[0].words[-2].insertionPoints[0].contents = '\n';
    }
    grep({findWhat: '\d{5}'}, {appliedParagraphStyle: 'TOC Parts List'});
    doc.paragraphStyles.item('TOC Parts List').properties = TOC_PL_PROPS;
    doc.paragraphs.everyItem().hyphenation = false;
    mainStory.textContainers[0].properties = {itemLayer: 'Default',
        geometricBounds: [0.9375, 1, 10.25, 7.75]};
    while (mainStory.overflows) {
        var lastFrame = mainStory.textContainers[-1],
            lastRect = lastFrame.geometricBounds,
            plusFrame = lastFrame.parentPage.textFrames.add('Default', {
                contents: '+',
                geometricBounds: [9.75, lastRect[1], 10.25, lastRect[3]]
            }),
            nextPage = doc.pages.add(LocationOptions.AT_END),
            nextx = nextPage.documentOffset % 2 ? 0.75 : 9.5,
            nextFrame = nextPage.textFrames.add('Default', {
                geometricBounds: [32/30, nextx, 10.25, nextx + 6.75],
                previousTextFrame: lastFrame
            });
        lastFrame.geometricBounds = lastRect.splice(2, 1, lastRect[2] - 0.5);
        plusFrame.parentStory.properties = PLUS_PROPS;
    }
}

function addBookmark () {
    doc.bookmarks.everyItem().remove();
    var title = grep({ruleBelow: false})[0].paragraphs.everyItem().contents;
    if (/Bookman/.test(mainStory.paragraphs[0].appliedFont.fullName))
        title[0] = changeTense(title[0]);
    title = toTitleCase(title.join().replace(/\s*\r\s*/g, ' '));
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
}

function toTitleCase (title) {
    var lower = 'as at an about above across after along and around ' + 
                'before behind below between but by for from in into like ' +
                'near next of on or onto out over past so the then than to ' +
                'under until via with within without x yet';
    return title.replace(/\b[a-z]+\b/ig, function (match, i) {
        if (/bigbore/i.test(match))
            return 'BigBore';
        if (RegExp('\\b' + match + '\\b', 'i').test(lower) && title[i - 1] !== '-')
            return match.toLowerCase();
        if (/^(III?|PSI|BOP|CADA|ROV|[^AEIOUY]+)$/i.test(match))
            return match.toUpperCase();
        return match[0].toUpperCase() + match.substr(1).toLowerCase();
    });
}

function changeTense (str) {
    var everbs = 'activating changing driving making mating operating ' +
                 'releasing replacing retrieving servicing terminating using';
    return str.replace(/\b[a-z]+ing\b/ig, function (match) {
        return match.slice(0, /run|set|ship/i.test(match) -4 : -3) +
            everbs.search(match.toLowerCase()) > -1 ? 'e' : '';
    });
}

function grep (findPrefs, changePrefs, opts) {
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
                  'Stack: ' + $.stack;
    var logFile = File(File($.fileName).path + '/buildPub.log');
    logFile.open('w');
    logFile.write(logText);
    logFile.close();
}
