#target indesign
var styleSheet = File(decodeURI(app.scriptPreferences.scriptsFolder) + '/TWD Stylesheet.indd');
var logo = File('/share/SERVICE/TWD/DQ Logo.ai');
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
var masterDoc, docUnits, mainStory, mainFrames, doc = app.activeDocument;
PM2INDD();
doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
app.scriptPreferences.enableRedraw = true;

function PM2INDD(){
    try {
        mainStory = findChangeGrep({'findWhat':'', 'appliedParagraphStyle':doc.paragraphStyles.item('RUNNING THE')}, undefined, {'includeLockedStoriesForFind':true, 'includeLockedLayersForFind':true})[0].parentStory;
    }
    catch (e){
        mainStory = findChangeGrep({'findWhat':'DRIL-QUIP'}, undefined, {'includeLockedStoriesForFind':true, 'includeLockedLayersForFind':true})[0].parentStory;
    }
    masterDoc = doc.masterSpreads[0];
    doc.viewPreferences.properties = {rulerOrigin:RulerOrigin.spreadOrigin, showFrameEdges:true, showRulers:true, horizontalMeasurementUnits:MeasurementUnits.POINTS, verticalMeasurementUnits:MeasurementUnits.POINTS};
    doc.textPreferences.showInvisibles = true;
    doc.guidePreferences.properties = {guidesInBack:true, guidesShown:true, guidesSnapto:true};
    doc.marginPreferences.properties = {top:54, left:72, bottom:54, right:54};
    mainFrames = mainStory.textContainers;
    fixGroups();
    docSetup();
    layersAndText();
    fixFrames();
    for (var i = 0; i < doc.groups.length; i++){
        if (doc.groups[i].allGraphics.length > 0){
            for (var j = 0; j < doc.groups[i].textFrames.length; j++){
                var tf = doc.groups[i].textFrames[j];
                if (tf.overflows && tf.parentStory.appliedParagraphStyle.name == 'call out'){
                    var numChars = tf.parentStory.characters.length - tf.characters.length;
                    tf.geometricBounds = [tf.geometricBounds[0], tf.geometricBounds[1], tf.geometricBounds[2], tf.insertionPoints[-2].horizontalOffset + 6.2 * numChars];
                }
            }
        }
    }
}

function layersAndText(){
    doc.layers.everyItem().locked = false;
    if (!doc.layers.item('Default').isValid) doc.layers.add({'name':'Default'});
    doc.layers.item('Default').properties = {'layerColor':UIColors.red, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true};
    if (!doc.layers.item('Master Default').isValid) doc.layers.add({'name':'Master Default'});
    doc.layers.item('Master Default').properties = {'layerColor':UIColors.blue, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true};
    var items = doc.pageItems.everyItem().getElements();
    for (var i = items.length - 1; i >= 0; i--){
        var item = items[i];
        if (item.hasOwnProperty('locked')) item.locked = false;
        if (item.parentPage == null) item.remove();
        else {
            if (item instanceof TextFrame && item.geometricBounds[2] == item.geometricBounds[0]) item.remove();
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
    clearBoxes();
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences.findWhat = '\\A[^A-Za-z0-9]*\\z';
    var emptyStories = findChangeGrep({'findWhat':'\\A[^A-Za-z0-9]*\\z'});
    for (var i = emptyStories.length - 1; i > -1; i--){
        if (emptyStories[i].tables.length == 0){
            var frames = (emptyStories[i] instanceof Story) ? emptyStories[i].textContainers : emptyStories[i].parentStory.textContainers;
            for (var j = frames.length - 1; j > -1; j--){
                frames[j].remove();
            }
        }
    }
    findChangeGrep({'findWhat':' ?\\n ?'}, {'changeTo':' '});
    findChangeGrep({'findWhat':'(?i)^\\s*important note'}, {'changeTo':'Note'});
    findChangeGrep({'findWhat':'~b~b+'}, {'changeTo':'\\r'});
    findChangeGrep({'findWhat':'[~m~>~f~|~S~s~<~/~.~3~4~% ]{2,}'}, {'changeTo':' '}, {'includeMasterPages':true});
    findChangeGrep({'findWhat':'^\\s+|\\s+\$'}, {'changeTo':''}, {'includeMasterPages':true});
    findChangeGrep({'findWhat':'(?i)^(note|caution|warning)(\\s+)?:'}, {'changeTo':'$1:'});
    findChangeGrep({'findWhat':'\\r', 'appliedParagraphStyle':'caption'}, {'changeTo':' '});
    findChangeGrep({'findWhat':'\\r', 'appliedParagraphStyle':'call out'}, {'changeTo':' '});
    findChangeGrep({'findWhat':'(?i)^(?<=(note|caution|warning).+)\\r(?<!note|caution|warning)(.+)', 'appliedParagraphStyle':'Note'}, {'changeTo':' $1'}, {'includeMasterPages':true});
    findChangeGrep({'findWhat':'(?i)^(' + /^[^\d]+/.exec(doc.name)[0] + ') ?(\\d{3})[^\\d]', 'appliedParagraphStyle':'footer'}, {'changeTo':'$1 0$2'}, {'includeMasterPages':true});
    findChangeGrep({'findWhat':'(?i)^(tools needed for this operation)(\\s|\\r)+'}, {'changeTo':'$1\\r', 'appliedParagraphStyle':'Level 2 (Tools)'});
    findChangeGrep({'findWhat':'(?i)^(?<=tools needed for this operation\\r)((~8.+\\r)+)'}, {'changeTo':'$1', 'appliedParagraphStyle':'Tool List'});
    findChangeGrep({'findWhat':'^(~8|\\d+\\.?|[a-z]\\.?|~_)\\s+'}, {'changeTo':''});
    findChangeGrep({'findWhat':'(?i)^(pre-operational procedures|running procedures|retrieving procedures|post-operational procedures)(\\s|\\r)+'}, {'changeTo':'$1\\r', 'appliedParagraphStyle':'Level 2'});
    findChangeGrep({'findWhat':'(?i)figure (\\d+)'}, {'changeTo':'Figure $1', 'fontStyle':'Bold'});
}

function docSetup(){
    doc.loadSwatches(styleSheet);
    for (var i = doc.swatches.length - 1; i >= 0; i--){
        if (doc.swatches.item(doc.swatches[i].name + ' 2').isValid){
            doc.swatches[i].properties = doc.swatches.item(doc.swatches[i].name + ' 2').properties;
        }
    }
    try {
        trimExtras(doc.swatches.everyItem().getElements(), /^(\[?None\]?|\[?Registration\]?|\[?Paper\]?|\[?Black\]?|Draft Text|Forest Green|Navy|Purple|Red|Yellow Orange)$/);
    }
    catch (e){
        clearSpots(doc);
        trimExtras(doc.swatches.everyItem().getElements(), /^(\[?None\]?|\[?Registration\]?|\[?Paper\]?|\[?Black\]?|Draft Text|Forest Green|Navy|Purple|Red|Yellow Orange)$/);
    }
    var masterFrames = masterDoc.textFrames.everyItem().getElements();
    masterFrames.sort(function (a,b){
        return (a.geometricBounds[1]+a.geometricBounds[3])/2 - (b.geometricBounds[1]+b.geometricBounds[3])/2;
    });
    var sysText = masterFrames[1].contents;
    var docText = masterFrames[2].contents;
    doc.importStyles(ImportFormat.TEXT_STYLES_FORMAT, styleSheet);
    trimExtras(doc.characterStyles.everyItem().getElements(), /^(\[None\]|Bold|Caution|Note|Warning)$/);
    trimExtras(doc.paragraphStyles.everyItem().getElements(), /^(\[No Paragraph Style\]|\[Basic Paragraph\]|call out|caption|Draft Text|footer|full body|Gutter Text|Level 1 \(18 pt\)|Level 1 \(24 pt\)|Level 2|Level 2 \(Tools\)|Level 3|Level 4|Level 5|New Body|Normal|Note|Note Bullets|Page No\.|Procedure Designator|RUNNING THE|sub body|SUGGESTED PROCEDURE|TOC|TOC Level 2|TOC Level 2 \(Tools\)|TOC Level 3|TOC Level 4|TOC Level 5|TOC Parts List|Tool List|Tool List 2)$/);
    doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, styleSheet);
    app.menus.item('Paragraph Style Panel Menu').menuItems.item('Sort by Name').associatedMenuAction.invoke();
    doc.guides.everyItem().remove();
    doc.guidePreferences.guidesLocked = true;
    masterDoc.namePrefix = 'A';
    doc.loadMasters(styleSheet, GlobalClashResolutionStrategyForMasterPage.LOAD_ALL_WITH_OVERWRITE);
    if (doc.masterSpreads.length > 1)  masterDoc.remove();
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
    masterDoc.place(logo, [54, 54]);
    masterDoc.place(logo, [684, 54]);
}

function fixGroups(){
    for (var l = doc.links.length - 1; l > -1; l--){
        var art = doc.links[l].parent.parent;
        if (art.parentPage == null){
            if (art.parent instanceof Group) art.parent.remove();
            else art.remove();
        }
        else {
            var pg = art.parentPage;
            art.sendToBack();
            var xGutter = (pg.documentOffset % 2 == 0) ? (pg.bounds[1] + doc.marginPreferences.left + 126) : (pg.bounds[1] + doc.marginPreferences.right + 126);
            if (/^\d+$/.test(pg.name) && art.parent.constructor.name !== 'Group' && art.parent.parent.constructor.name !== 'Group'){
                if (art.textWrapPreferences.textWrapMode !== TextWrapModes.NONE){
                    var xPoints = [];
                    var yPoints = [];
                    var points = art.textWrapPreferences.paths[0].entirePath;
                    for (var p = 0; p < points.length; p++){
                        xPoints.push(points[p][0]);
                        yPoints.push(points[p][1]);
                    }
                    xPoints.sort(function (a,b){ return a - b; });
                    yPoints.sort(function (a,b){ return a - b; });
                    var bounds = [yPoints[0], xPoints[0], yPoints[yPoints.length - 1], xPoints[xPoints.length - 1]];
                }
                else if (art.geometricBounds[3] < xGutter){
                    var centerY = (art.geometricBounds[0] + art.geometricBounds[2])/2;
                    var top = ((centerY - 3.5 * (centerY - art.geometricBounds[0])) <= 76.8) ? 76.8 : (centerY - 3.5 * (centerY - art.geometricBounds[0]));
                    var left = pg.bounds[1];
                    var bottom = ((centerY + 3.5 * (art.geometricBounds[2] - centerY)) >= 738) ? 738 : (centerY + 3.5 * (art.geometricBounds[2] - centerY));
                    var right = xGutter;
                    var bounds = [top, left, bottom, right];
                }
                if (bounds !== undefined){
                    var grp = [art];
                    for (var i = 0; i < pg.pageItems.length; i++){
                        var iBounds = pg.pageItems[i].geometricBounds;
                        if (iBounds[0] >= bounds[0] && iBounds[1] >= bounds[1] && iBounds[2] <= bounds[2] && iBounds[3] <= bounds[3]) grp.push(pg.pageItems[i]);
                    }
                    if (grp.length > 1) grp = pg.groups.add(grp);
                }
            }
        }
        if (/\d+/.test(pg.name) && art.parent instanceof Group){
            var group = art.parent;
            for (var i = 0; i < group.allPageItems.length; i++){
                var pi = group.allPageItems[i];
                pi.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
                if (pi instanceof TextFrame) pi.parentStory.appliedParagraphStyle = (/^(table|chart|figure) \d+/i.test(pi.parentStory.contents)) ? doc.paragraphStyles.item('caption') : doc.paragraphStyles.item('call out');
            }
            if (group.geometricBounds[3] < xGutter){
                group.textWrapPreferences.textWrapMode = TextWrapModes.none;
            }
            else if (group.geometricBounds[1] < (pg.bounds[1]+pg.bounds[3])/2){
                group.textWrapPreferences.textWrapMode = TextWrapModes.jumpObjectTextWrap;
                group.textWrapPreferences.textWrapOffset = [9,9,9,9];
            }
            else {
                group.textWrapPreferences.textWrapMode = TextWrapModes.boundingBoxTextWrap;
                group.textWrapPreferences.textWrapOffset = [9,9,9,9];
            }
        }
    }
}

function fixFrames(){
    for (var i = 0, iLim = mainFrames.length; i < iLim; i++){
        var mainFrame = mainFrames[i];
        var mainPage = mainFrame.parentPage;
        mainFrame.convertShape(ConvertShapeOptions.convertToRectangle);
        var x1 = (mainPage.documentOffset % 2 == 0) ? mainPage.bounds[1] + 72 : 54;
        var x2 = x1 + 486;
        var y1 = (mainPage.documentOffset == 0) ? 67.5 : ((mainFrame.paragraphs[0].isValid && mainFrame.paragraphs[0].appliedParagraphStyle.name == 'Level 2') ? 130.5 : 76.8);
        var y2 = 738;
        mainFrame.geometricBounds = [y1, x1, y2, x2];
        mainFrame.sendToBack();
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