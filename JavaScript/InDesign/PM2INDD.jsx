#target indesign
var pmFiles = [];
var root = Folder('/Users/HD6904/Erik/PageMaker Scripting Project/PM_Problems/Swatch Cannot Be Deleted/');
getChildren(root);
var styleSheet = File(decodeURI(app.scriptPreferences.scriptsFolder) + '/TWD Stylesheet.indd');
var logo = File('/share/SERVICE/TWD/DQ Logo.ai');
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
app.preflightOptions.preflightOff = true;
var doc, masterDoc, docUnits, mainStory, mainFrames;

function getChildren(parent){
    var children = parent.getFiles();
    for (var i = 0; i < children.length; i++){
        if (children[i] instanceof Folder){
            getChildren(children[i]);
        }
        else if (children[i].name.substr(-3) == 'p65'){
            pmFiles.push(children[i]);
        }
    }
}

for (var i = 0, pmLength = pmFiles.length; i < pmLength; i++){
    logToFile(pmFiles[i]);
    try {
        app.open(pmFiles[i]);
        doc = app.documents[0];
    }
    catch (e){
        try {
            app.open(pmFiles[i]);
            doc = app.documents[0];
        }
        catch (er){
            logToFile('Skipped due to file can\'t be opened');
        }
    }
    if (app.documents.length == 1 && doc.isValid && doc.documentPreferences.pageSize == 'Letter'){
        try {
            PM2INDD(doc);
            var savePath = '/Users/HD6904/Erik/PageMaker Scripting Project/INDD/' + pmFiles[i].name.replace(/p65/i, 'indd');
            doc.close(SaveOptions.YES, File(savePath));
            while (app.documents.length > 0){
                $.sleep(750);
            }
            logToFile('Successfully saved to: ' + savePath);
        }
        catch (err){
            try {
                doc.close(SaveOptions.NO);
                logToFile('Skipped with error: "' + err.message + '" on line ' + err.line);
            }
            catch (erro){
                logToFile('Skipped with error: "' + err.message + '" on line ' + err.line);
            }
        }
    }
    else {
        try {
            doc.close(SaveOptions.NO);
            logToFile('Skipped due to incorrect page size');
        }
        catch (e1){
            logToFile('Skipped due to incorrect page size');
        }
    }
}

app.scriptPreferences.enableRedraw = true;
app.preflightOptions.preflightOff = false;

function PM2INDD(doc){
    masterDoc = doc.masterSpreads[0];        
    docUnits = doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
    doc.viewPreferences.properties = {rulerOrigin:RulerOrigin.spreadOrigin, showFrameEdges:true, showRulers:true, horizontalMeasurementUnits:MeasurementUnits.POINTS, verticalMeasurementUnits:MeasurementUnits.POINTS};
    app.textWrapPreferences.textWrapMode = doc.textWrapPreferences.textWrapMode = TextWrapModes.none;
    doc.textPreferences.showInvisibles = true;
    doc.guidePreferences.properties = {guidesInBack:true, guidesShown:true, guidesSnapto:true};
    doc.marginPreferences.properties = {top:54, left:72, bottom:54, right:54};
    try {
        mainStory = findChangeGrep({'findWhat':'', 'appliedParagraphStyle':doc.paragraphStyles.item('RUNNING THE')}, undefined, {'includeLockedStoriesForFind':true, 'includeLockedLayersForFind':true})[0].parentStory;
    }
    catch (e){
        mainStory = findChangeGrep({'findWhat':'DRIL-QUIP'}, undefined, {'includeLockedStoriesForFind':true, 'includeLockedLayersForFind':true})[0].parentStory;
    }
    if (mainStory.textContainers.length == 1){
        throw Error('Skipped due to main story\'s paragraphs each having its own text frame');
    }
    mainFrames = mainStory.textContainers;
    layersAndText();
    docSetup();
    fixGroups();
    fixFrames();
    noteBoxes();
}

function layersAndText(){
    for (var c = doc.layers.length - 1; c >= 0; c--){
        var thisLayer = doc.layers[c];
        if (thisLayer.locked) thisLayer.locked = false;
        if (/callout/i.test(thisLayer.name)){
            thisLayer.remove();
        }
    }
    if (!doc.layers.item('Default').isValid) doc.layers.add({'name':'Default'});
    doc.layers.item('Default').properties = {'layerColor':UIColors.red, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true};
    if (!doc.layers.item('Master Default').isValid) doc.layers.add({'name':'Master Default'});
    doc.layers.item('Master Default').properties = {'layerColor':UIColors.blue, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true};
    if (doc.layers.item('Old Table').isValid){
        doc.layers.item('Old Table').properties = {'ignoreWrap':true, 'layerColor':UIColors.green, 'locked':false, 'printable':true, 'showGuides':true, 'visible':false};
    }
    var items = doc.pageItems.everyItem().getElements();
    for (var i = items.length - 1; i >= 0; i--){
        var item = items[i];
        if (item.hasOwnProperty('locked')) item.locked = false;
        if (item.parentPage == null) {
            item.remove();
        }
        else {
            if (item.itemLayer.name !== 'Old Table'){
                item.itemLayer = doc.layers.item('Default');
            }
            if (item.allPageItems.length == 0 && (item.fillColor.name == '' || item.strokeColor.name == '')){
                if (item.fillColor.name == '' && item.fillColor.colorValue.slice(0, 3) == '0,0,0' && item.fillColor.colorValue[3] > 0){
                    item.properties = {fillColor:'Black', fillTint:item.fillColor.colorValue[3]};
                }
                if (item.strokeColor.name == '' && item.strokeColor.colorValue.slice(0, 3) == '0,0,0' && item.strokeColor.colorValue[3] > 0){
                    item.properties = {strokeColor:'Black', strokeTint:item.strokeColor.colorValue[3]};
                }
            }
        }
    }
    masterDoc.pageItems.everyItem().itemLayer = doc.layers.item('Master Default');
    trimExtras(doc.layers.everyItem().getElements(), /^(Old Table|Default|Master Default)$/);
    findChangeGrep({'findWhat':'~b~b+'}, {'changeTo':'\r'});
    findChangeGrep({'findWhat':'[~m~>~f~|~S~s~<~/~.~3~4~% ]{2,}'}, {'changeTo':' '}, {'includeMasterPages':true});
    findChangeGrep({'findWhat':'\\s+\$'}, {'changeTo':''}, {'includeMasterPages':true});
    findChangeGrep({'findWhat':'(?i)(?<= )figure (\\d+)'}, {'changeTo':'Figure $1', 'fontStyle':'Bold'});
}

function docSetup(){
    doc.loadSwatches(styleSheet);
    for (var i = doc.swatches.length - 1; i >= 0; i--){
        if (doc.swatches.item(doc.swatches[i].name + ' 2').isValid){
            doc.swatches[i].properties = doc.swatches.item(doc.swatches[i].name + ' 2').properties;
        }
    }
    trimExtras(doc.swatches.everyItem().getElements(), /^(\[?None\]?|\[?Registration\]?|\[?Paper\]?|\[?Black\]?|Draft Text|Forest Green|Navy|Purple|Red|Yellow Orange)$/);
    for (var i = 0, tfLength = masterDoc.textFrames.length; i < tfLength; i++){
        var frame = masterDoc.textFrames[i];
        if (frame.parentStory.pointSize == 6 || /system/i.test(frame.contents)){
            if (frame.parentStory.justification == Justification.LEFT_ALIGN || frame.parentStory.justification == Justification.RIGHT_ALIGN || frame.parentStory.justification == Justification.TO_BINDING_SIDE){
                var docText = frame.contents;
            }
            else if (frame.parentStory.justification == Justification.CENTER_ALIGN){
                var sysText = frame.contents;
            }
        }
    }
    doc.importStyles(ImportFormat.CHARACTER_STYLES_FORMAT, styleSheet);
    trimExtras(doc.characterStyles.everyItem().getElements(), /^(\[None\]|Bold|Caution|Note|Warning)$/);
    doc.importStyles(ImportFormat.PARAGRAPH_STYLES_FORMAT, styleSheet);
    trimExtras(doc.paragraphStyles.everyItem().getElements(), /^(\[No Paragraph Style\]|\[Basic Paragraph\]|call out|caption|Draft Text|footer|full body|Gutter Text|Level 1 \(18 pt\)|Level 1 \(24 pt\)|Level 2|Level 2 \(Tools\)|Level 3|Level 4|Level 5|New Body|Normal|Note|Note Bullets|Page No\.|Procedure Designator|RUNNING THE|sub body|SUGGESTED PROCEDURE|TOC|TOC Level 2|TOC Level 2 \(Tools\)|TOC Level 3|TOC Level 4|TOC Level 5|TOC Parts List|Tool List|Tool List 2)$/);
    doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, styleSheet);
    app.menus.item('Paragraph Style Panel Menu').menuItems.item('Sort by Name').associatedMenuAction.invoke();
    findChangeGrep({'findWhat':'^(~8|\\d+\\.|[a-z]\\.|~_)\\s+'}, {'changeTo':''});
    doc.guides.everyItem().remove();
    doc.guidePreferences.guidesLocked = true;
    masterDoc.namePrefix = 'A';
    doc.loadMasters(styleSheet, GlobalClashResolutionStrategyForMasterPage.LOAD_ALL_WITH_OVERWRITE);
    if (doc.masterSpreads.length > 1) {
        masterDoc.remove();
    }
    masterDoc = doc.masterSpreads[0];
    doc.pages.everyItem().appliedMaster = masterDoc;
    for (var i = 0, tfLength = masterDoc.textFrames.length; i < tfLength; i++){
        frame = masterDoc.textFrames[i];
        if (frame.contents == 'DOCUMENTATION'){
            frame.contents = (docText == undefined) ? 'DOCUMENTATION' : docText;
            frame.parentStory.properties = {appliedParagraphStyle:doc.paragraphStyles.item('footer'), appliedCharacterStyle:doc.characterStyles[0]};
            frame.parentStory.justification = Justification.TO_BINDING_SIDE;
        }
        else if (frame.contents == 'SYSTEM'){
            frame.contents = (sysText == undefined) ? 'SYSTEM' : sysText;
            frame.geometricBounds = [769.5 - (7.2 * frame.paragraphs.length), frame.parentPage.bounds[1] + 243, 769.5, frame.parentPage.bounds[1] + 369];
            frame.parentStory.properties = {appliedParagraphStyle:doc.paragraphStyles.item('footer'), appliedCharacterStyle:doc.characterStyles[0]};
        }
    }
    var logoFrame = masterDoc.rectangles.add({fillColor:'None', strokeColor:'None', itemLayer:doc.layers.item('Master Default'), geometricBounds:[54,54,108.832000732422,115.02099609375]});
    logoFrame.place(logo);
    logoFrame.fit(FitOptions.contentToFrame);
    logoFrame.duplicate(undefined, [630, 0]);
}

function fixGroups(){
    for (var g = 0; g < doc.groups.length; g++){
        if (doc.groups[g].allGraphics.length > 0){
            var item = doc.groups[g];
            for (var i = 0; i < item.allPageItems.length; i++){
                var gItem = item.allPageItems[i];
                if (gItem.allGraphics.length == 1){
                    gItem.sendToBack();
                }
                gItem.textWrapPreferences.textWrapMode = TextWrapModes.none;
            }
            item.bringToFront();
            if (item.parentPage.documentOffset % 2 == 0 && item.parentPage.documentOffset !== 0){
                var xGutter = 810;
            }
            else {
                var xGutter = 180;
            }
            if (item.geometricBounds[3] < xGutter){
                item.textWrapPreferences.textWrapMode = TextWrapModes.none;
            }
            else if (item.geometricBounds[1] < (306 + item.parentPage.bounds[1])){
                item.textWrapPreferences.textWrapMode = TextWrapModes.jumpObjectTextWrap;
                item.textWrapPreferences.textWrapOffset = [9,9,9,9];
            }
            else {
                item.textWrapPreferences.textWrapMode = TextWrapModes.boundingBoxTextWrap;
                item.textWrapPreferences.textWrapOffset = [9,9,9,9];
            }
        }
    }
}

function fixFrames(){
    for (var i = 0, mfLength = mainFrames.length; i < mfLength; i++){
        var mainFrame = mainFrames[i];
        var mainPage = mainFrame.parentPage;
        mainFrame.convertShape(ConvertShapeOptions.convertToRectangle);
        var x1 = (mainPage.documentOffset % 2 == 0) ? mainPage.bounds[1] + 72 : 54;
        var x2 = x1 + 486;
        var y1 = (mainPage.documentOffset == 0) ? 67.5 : ((mainFrame.paragraphs[0].appliedParagraphStyle.name == 'Level 2') ? 130.5 : 76.8);
        var y2 = (i == mfLength - 1 && mainFrame.overflows) ? 738 : mainFrame.geometricBounds[2];
        mainFrame.geometricBounds = [y1, x1, y2, x2];
    }
}

function noteBoxes(){
    clearBoxes();
    var findNotes = findChangeGrep({'findWhat':'^[^\\r]+(\\r|$)', 'appliedParagraphStyle':'Note'});
    for(var y = 0, findLength = findNotes.length; y < findLength; y++){
        var note = findNotes[y];
        var notePage = note.parentTextFrames[0].parentPage;
        var notePara = mainStory.characters.itemByRange(0, note.characters[0].index).paragraphs.length - 1;
        var x1 = (notePage.documentOffset % 2 == 0) ? notePage.bounds[1] + 227.8 : 209.8;
        var x2 = x1 + 334.08;
        var y1 = note.words[0].baseline - note.ascent - 6.2;
        if (notePara !== mainStory.paragraphs.length - 1){
            var bulletCount = 1;
            while (mainStory.paragraphs[notePara + bulletCount].appliedParagraphStyle.name == 'Note Bullets'){
                bulletCount += 1;
            }
        }
        if (bulletCount > 1){
            var y2 = mainStory.paragraphs[notePara + bulletCount - 1].characters[-1].baseline + mainStory.paragraphs[notePara + bulletCount - 1].descent + 6.2;
        }
        else {
            var y2 = note.characters[-1].baseline + note.descent + 6.2;
        }
        var noteBox = notePage.rectangles.add({geometricBounds:[y1, x1, y2, x2], itemLayer:doc.layers.item('Default'), fillColor:'Black', fillTint:7, strokeColor:'None', textWrapPreferences:TextWrapModes.none, appliedObjectStyle:'None'});
        noteBox.sendToBack();
    }
}

function findChangeGrep(findPrefs, changePrefs, findChangeOptions){
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    if (findChangeOptions !== undefined){
        app.findChangeGrepOptions.properties = findChangeOptions;
    }
    app.findGrepPreferences.properties = findPrefs;
    if (changePrefs == undefined){
        return doc.findGrep();
    }
    else {
        app.changeGrepPreferences.properties = changePrefs;
        doc.changeGrep();
    }
}

function trimExtras(theObjects, regx){
    for (var x = theObjects.length - 1; x >= 0; x--){
        var objName = theObjects[x].name;
        if (!regx.test(objName)){
            theObjects[x].remove();
        }
    }
}

function clearBoxes(){
    var boxes = doc.layers.item('Default').splineItems.everyItem().getElements();
    for (var i = 0; i < boxes.length; i++){
        if (boxes[i].hasOwnProperty('fillColor') && boxes[i].fillColor.name == 'Black'){
            boxes[i].remove();
        }
    }
}

function logToFile(logText){
    try {
        var PM2INDD_LOG = File('/Users/HD6904/Erik/PageMaker Scripting Project/PM2INDD_LOG.txt');
        PM2INDD_LOG.open('a');
        PM2INDD_LOG.writeln(logText);
        PM2INDD_LOG.close();
    }
    catch (logError){
        $.writeln(logText);
    }
}
