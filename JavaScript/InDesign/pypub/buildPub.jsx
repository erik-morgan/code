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

prefs = {
    alerts: app.scriptPreferences.userInteractionLevel,
    preflight: app.preflightOptions.preflightOff,
    links: app.linkingPreferences.checkLinksAtOpen
}
// DO PREFS IN AS/VBS
app.scriptPreferences.enableRedraw = false;
app.scriptPreferences.measurementUnit = MeasurementUnits.INCHES;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.preflightOptions.preflightOff = true;
app.linkingPreferences.checkLinksAtOpen = false;

main();

/*
 * @param {String} docPath 
 * IF DOCPATH IS SOURCE
 * @param {Boolean} [exportDoc] 
 * @param {Boolean} [createTOC] 
 * @param {String} [drawList] 
 * 
 * IF DOCPATH IS TOC
 * @param {String} [drawList] 
 */

function main () {
    docPath = arguments[0];
    openDoc(docPath);
    if (docPath.indexOf('.TOC') > -1)
        
    if (exportDoc)
        doc.exportFile(ExportFormat.PDF_TYPE, File(docPath.slice(0, -4) + 'pdf'), false);
    if (drawList && drawList.length)
    if (!/\bTOC\b/.test(docPath))
        makeTOC
    app.scriptPreferences.enableRedraw = true;
    app.scriptPreferences.userInteractionLevel = prefs.alerts;
    app.preflightOptions.preflightOff = prefs.preflight;
    app.linkingPreferences.checkLinksAtOpen = prefs.links;
    
}

function openDoc () {
    doc = app.open(File(docPath), false);
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    if (!doc.saved) {
        for (var l = 0; l < doc.links.length; l++) {
            // try status == 'lood' for link out of date
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
        doc.exportFile(ExportFormat.PDF_TYPE, File(docPath.slice(0, -4) + 'pdf'), false);
    }
    mainStory = doc.stories.everyItem().getElements().sort(function (a, b) {
        return b.length - a.length;
    })[0];
}

function makeTOC () {
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

function enterDrawings (drawingText) {
    grep({findWhat: '(?i)^(Illustr|Assembly)[\\S\\s]+'}, {changeTo: drawingText});
    var tocParas = grep({findWhat: '(?<=Contents\\r)[\\S\\s]+'})[0].paragraphs.everyItem().getElements();
    for (var p = 0; p < tocParas.length; p++) {
        var tocPara = tocParas[p],
            paraParts = tocPara.contents.replace(/ {2,}|\n/g, ' ').split('\t');
        /*
         * Handle toc, drawing, and drawing title paras
         * apply keep lines together ...
         * 
         */
        if (paraParts.length == 1)
            tocPara.appliedParagraphStyle = 'TOC Level 2';
        else if (paraParts[1].length < 3)
            // then its a toc paragraph
        else if (/\d{5}/.test(paraParts[0]))
            // then its a drawing
        tocPara.keepAllLinesTogether = true;
        if (tocPara.words[-1].horizontalOffset - tocPara.words[-2].insertionPoints[-1].horizontalOffset < 0.25)
            tocPara.words[-2].insertionPoints[0].contents = '\n';
    }
    
}

function insertDrawings (drawings) {
    styleTOC();
}

function styleTOC () {

    doc.paragraphStyles.itemByRange('TOC Level 2', 'TOC Level 5').everyItem().properties = {keepWithNext: 0, hyphenation: false, rightIndent: 0.5, lastLineIndent: -0.375};
    doc.paragraphStyles.item('TOC Parts List').properties = {hyphenation: false, firstLineIndent: -1.75, tabList: [{position: 3.5, alignment: TabStopAlignment.LEFT_ALIGN}]};
    grep({findWhat: ' {2,}|\\n'}, {changeTo: ' '});
    grep({findWhat: '[ \\t]+'}, {changeTo: '\\t'});
    grep({findWhat: '^\\s+|\\s+$'}, {changeTo: ''}, {includeMasterPages: true});
    grep({findWhat: '^(Illustrat|Assembly Draw).+\\r'}, {appliedParagraphStyle: 'TOC Level 2', keepWithNext: 1});
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
