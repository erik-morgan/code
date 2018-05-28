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
*/

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
main();

function main () {
    var pub = $.evalFile(File(File($.fileName).path + '/pubdata'));
    root = pub.root;
    convertIDML();
    tocify();
    for (var name in pub.drawings) {
        var indd = root.getFiles(name + '.TOC.indd')[0],
            pdf = decodeURI(indd).replace(/indd$/i, 'pdf');
        doc = app.open(indd);
        addDrawings(pub.drawings[name]);
        addBookmark();
        doc.exportFile(ExportFormat.PDF_TYPE, pdf, false);
    }
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

function addBookmark () {
    doc.bookmarks.everyItem().remove()
    var lower = RegExp('^(a|about|above|across|after|along|and?|around|a[st]|before|behind|below|between|but|by|for|from|in|into|like|mid|near|next|nor|o[fnr]|onto|out|over|past|per|plus|save|so|than|then?|till?|to|under|until|unto|upon|via|with|within|without|x|yet)$', 'i'),
        upper = RegExp('\b(i{2,3}|PSI|BOP|HPHT|HTHL|HCLD|MPT|CADA|DWHC|ROV|SS|BR|DW)\b', 'i');
    try {
        var titleParts = findChangeGrep({findWhat: '(?i)\\A[\\S\\s]+(?=suggest)'})[0].contents.split('\r');
    }
    catch (err) {
        var titleParts = findChangeGrep({findWhat: '(?i)\\A[\\S\\s]+(?=table of contents)'})[0].contents.split('\r');
    }
    titleParts[0] = titleParts[0].replace(/(activat|chang|driv|ma[kt]|operat|releas|replac|retriev|servic|terminat|us)ing/ig, '$1e');
    titleParts[0] = titleParts[0].replace(/(commission|inspect|install|interpret|maintain|orient|perform|repair|test|wash|work|run(?=n)|set(?=t)|ship(?=p))ing/ig, '$1');
    var title = titleParts.join(' ').replace(/\b[A-Za-z]+\b/g, function (match) {
        if (match.search(lower))
            return match.toLowerCase();
        if (match.search(upper))
            return match.toUpperCase();
        return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
    });
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
}

function addDrawings (drawList) {
    var findList = ['\\r$', '\\bm(in|ax)\\b', String.fromCharCode(8221), '\\t{2,}', '\\b(BB|BigBore).?(II|2)', '\\bCHSART\\b', '\\bSART\\b', '-in\\b', '-out\\b', ' & ', 'Mill and Flush', '1st', '2nd', '\\bPos\\b', '\\bLIT\\b', '\\bLDS\\b', '\\bOLR\\b', '\\bTSJ\\b', '\\bOAL\\b', '\\bWT\\b', '\\bTBC\\b', '\\bbr.style', '^(420056-02|420295-02)\\t.*$', 'f\\/ ?', '\\r\\z', '\\bx\\b'],
        replaceList = ['', 'M$1.', '"', '\\t', 'BB II', 'Casing Hanger and Seal Assembly Running Tool', 'Seal Assembly Running Tool', '-In', '-Out', ' and ', 'Mill & Flush', 'First', 'Second', 'Position', 'Lead Impression Tool', 'Lockdown Sleeve', 'Outer Lock Ring', 'Tapered Stress Joint', 'Overall Length', 'Wall Thickness', 'Tie-Back Connector', 'BR-Style', '$1\\t18-3/4" Jet Sub', 'for ', '', 'x'],
        drawParas = [];
    while (/[a-z]/i.test(drawList[0].split('\t')[0])) {
        drawParas.push(drawList.shift());
    }
    if (drawParas.length)
        drawParas.unshift('Illustrations');
    drawParas.push('Assembly Drawings and Parts Lists');
    drawParas = drawParas.concat(drawList);
    drawText = drawParas.join('\r');
    for (var f = 0; f < findList.length; f++) {
        // modify findList and replaceList for js regex, instead of indesign grep
    }
    // INCORPORATE LINES 10-20 OF TOC F&R + LINES 40-50 OF TOC
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
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
