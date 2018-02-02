#target indesign
var checkBackup, tfBackup, check0, check1, check2, check3, check4, check5, check6, check7, check8, date = new Date();
var timeStamp = ('0' + (date.getMonth() + 1).toString()).substr(-2) + ('0' + (date.getDate().toString())).substr(-2) + date.getFullYear().toString() + ' ' + ('0' + date.getHours().toString()).substr(-2) + ('0' + date.getMinutes().toString()).substr(-2) + ('0' + date.getSeconds().toString()).substr(-2);
var defaultLocation = Folder.myDocuments.fsName.replace(/\\/g, '\/');
//var defaultLocation = (doc.fullName.parent.fsName).toString().replace(/\\/g, '/');
//var defaultLocation = Folder(Folder.myDocuments).fsName;
var docName = app.activeDocument.name;
var descs = ['• Removes ALL guides from the document\r• Inserts correct guides only on the master spread', '• Removes ALL graphics from the master spread\r• Correctly places/scales \'DQ Logo\' from the network onto the master spread\r• Uses Sam\'s Club Art\'s logo if footer contains \'BA\', or TWD\'s logo if not', '• Saves the contents of each footer, and removes ALL master spread text frames\r• Recreates each footer with correct alignment and dimensions\r✪ Does not alter the footer\'s contents', '• Straightens and properly positions incorrect text frames\r✪ Only affects text frames threaded with the main story\r✪ Applies to locked text frames', '• If a DQ swatch exists, then its color model, space, and value will be corrected\r• If a DQ swatch doesn\'t exist, then it will be added\r• If any non-DQ swatches (besides the 4 defaults) exist, they will be removed', '• Removes EVERY rectangle whose fill color is \'Black\', regardless of tint\r✪ Excludes items on the master spread, and applies to locked page items', '• If a DQ paragraph style exists, then it's properties are set to the correct value\r• If a DQ paragraph style doesn\'t exist, then it will be added\r• If any non-DQ paragraph styles (besides the 2 defaults) exist, they will be removed', '• Finds all paragraphs with \'Note\' or \'Note Bullets\' paragraph style applied\r• Correctly formats each note, and creates a gray box underneath the note\'s text\r✪ Runs ClearBoxes and ResetColors by default, and applies to locked text frames', '• Corrects page order of grouped items and fixes their text wrap settings\r✪ Excludes items on the master spread, and applies to locked page items'];
var names = ['FixGuides', 'FixLogos', 'AlignFooters', 'FixFrames', 'ResetColors', 'ClearBoxes', 'ResetStyles', 'NoteBoxes', 'FixGroups'];
var checkString = 'checkbox {preferredSize:[18, 18], alignment:["left", "center"]}';

var w = new Window('dialog', 'Writer\'s Toolbox', undefined);
    w.margins = w.spacing = 0;
    var fillHeader = w.graphics.newBrush(w.graphics.BrushType.SOLID_COLOR, [(56/255), (56/255), (56/255)]);
    var penHeader = w.graphics.newPen(w.graphics.PenType.SOLID_COLOR, [(56/255), (56/255), (56/255)], 1);
    var penWhite = w.graphics.newPen(w.graphics.PenType.SOLID_COLOR, [(255/255), (255/255), (255/255)], 1);
    var gHeaders = w.add('group {alignment:"fill", alignChildren:["left", "center"], margins:[6, 6, 0, 6], spacing:15, preferredSize:[640, 48]}');
        gHeaders.graphics.backgroundColor = fillHeader;
        var checkAll = gHeaders.add(checkString);
            checkAll.onClick = function (){
                check();
            };
        var headerName = gHeaders.add('staticText', undefined, 'Name');
            headerName.characters = 20;
            headerName.graphics.foregroundColor = penWhite;
        var headerDesc = gHeaders.add('staticText', undefined, 'Description');
            headerDesc.characters = 60;
            headerDesc.graphics.foregroundColor = penWhite;
    for (i = 0; i < names.length; i++){
        if (i > 0){
            var rule = w.add('panel', undefined, undefined, {borderStyle:'black'});
                rule.alignment = 'fill';
                rule.preferredSize = [-1, 1];
                rule.margins = rule.spacing = 0;
        }
        row = w.add('group');
            row.alignment = ['fill', 'fill'];
            row.alignChildren = ['left', 'center'];
            row.margins = [6, 6, 0, 6];
            row.spacing = 15;
        switch (i) {
            case 0: check0 = row.add(checkString), check0.onClick = function (){check(i);}; break;
            case 1: check1 = row.add(checkString), check1.onClick = function (){check(i);}; break;
            case 2: check2 = row.add(checkString), check2.onClick = function (){check(i);}; break;
            case 3: check3 = row.add(checkString), check3.onClick = function (){check(i);}; break;
            case 4: check4 = row.add(checkString), check4.onClick = function (){check(i);}; break;
            case 5: check5 = row.add(checkString), check5.onClick = function (){check(i);}; break;
            case 6: check6 = row.add(checkString), check6.onClick = function (){check(i);}; break;
            case 7: check7 = row.add(checkString), check7.onClick = function (){check(i);}; break;
            case 8: check8 = row.add(checkString), check8.onClick = function (){check(i);}; break;
        }
        row.name = row.add('staticText', undefined, names[i]);
            row.name.characters = 20;
            row.name.graphics.foregroundColor = penHeader;
        row.gDesc = row.add('group');
            row.gDesc.preferredSize = [-1, 48];
            row.gDesc.alignChildren = ['left', 'center'];
            row.gDesc.margins = row.gDesc.spacing = 0;
            row.gDesc.desc = row.gDesc.add('staticText', undefined, descs[i], {multiline:true});
                row.gDesc.desc.characters = 60;
                row.gDesc.desc.graphics.foregroundColor = penHeader;
    }
    var gBottom = w.add('group');
        gBottom.preferredSize = [640, 60];
        gBottom.alignment = gBottom.alignChildren = ['fill', 'fill'];
        gBottom.margins = gBottom.spacing = 0;
        gBottom.graphics.backgroundColor = fillHeader;
        var gCheckBackup = gBottom.add('group');
            gCheckBackup.alignChildren = ['left', 'center'];
            gCheckBackup.margins = [6, 0, 0, 0];
            gCheckBackup.spacing = 6;
            checkBackup = gCheckBackup.add('checkbox', undefined, undefined);
                checkBackup.preferredSize = [18, 18];
                checkBackup.onClick = function (){
                    tfBackup = checkBackup.value;
                    (checkBackup.value) ? addBackupPanel() : removeBackupPanel();
                };
            var labelBackup = gCheckBackup.add('staticText', undefined, 'Backup the active document');
                labelBackup.graphics.foregroundColor = penWhite;
        var gButtons = gBottom.add('group');
            gButtons.alignChildren = ['right', 'fill'];
            gButtons.margins = [0, 6, 6, 6];
            gButtons.spacing = 0;
            var bRun = gButtons.add('button {text:"Run", enabled:false, helpTip:"Runs the selected functions", preferredSize:[150, -1]}');
                bRun.onClick = function (){
                    runList = new Array();
                    checkBoxes = [check0, check1, check2, check3, check4, check5, check6, check7, check8];
                    for (b = 0; b < checkBoxes.length; b++){
                        if (checkBoxes[b].value){
                            runList.push(checkBoxes[b]);
                        }
                    }
                }
            var bCancel = gButtons.add('button {text:"Cancel", helpTip:"Cancels the entire script", preferredSize:[150, -1]}');
w.show();



function check(i){
    if (i == 7){
        check4.value = check5.value = check7.value;
    }
    if (i == undefined){
        check0.value = check1.value = check2.value = check3.value = check4.value = check5.value = check6.value = check7.value = check8.value = checkAll.value;
    }
    bRun.enabled = canRun();
    //                                                        just put entire canRun function above this
}
function canRun(){
    checkBoxes = [check0, check1, check2, check3, check4, check5, check6, check7, check8];
    for (r = 0; r < checkBoxes.length; r++){
        if (checkBoxes[r].value){
            return true;
        }
    }
    return false;
}
function addBackupPanel(){
    var g = w.add('group');
        g.alignment = ['fill', 'fill'];
        g.alignChildren = ['fill', 'fill'];
        g.margins = 6;
        g.spacing = 0;
        g.graphics.backgroundColor = fillHeader;
        var p = g.add('panel', undefined, undefined, {borderStyle:'etched'});
            p.alignChildren = ['fill', 'fill'];
            var gFile = p.add('group');
                gFile.margins = gFile.spacing = 0;
                gFile.alignChildren = ['left', 'center'];
                var labelFile = gFile.add('staticText', undefined, 'Filename:');
                    labelFile.characters = 10;
                    labelFile.graphics.foregroundColor = penWhite;
                var editFile = gFile.add('editText', undefined, docName.replace(/ .+/, '') + ' ' + timeStamp + '.indd', {borderless:true});
                    editFile.characters = 64;
            var gPath = p.add('group');
                gPath.margins = gPath.spacing = 0;
                gPath.alignChildren = ['left', 'center'];
                var labelPath = gPath.add('staticText', undefined, 'Location:');
                    labelPath.characters = 10;
                    labelPath.graphics.foregroundColor = penWhite;
                var editPath = gPath.add('editText', undefined, defaultLocation + '/Backups', {borderless:true});
                    editPath.characters = 64;
                var bBrowse = gPath.add('button', undefined, 'Browse');
                    bBrowse.alignment = ['fill', 'fill'];
                    bBrowse.helpTip = 'Browse to the backup directory';
                    bBrowse.onClick = function (){
                        var pickFolder = Folder.selectDialog('Choose the backup location');
                        backupFolder = Folder(pickFolder);
                        editPath.text = Folder.decode(backupFolder);
                    };
    w.layout.layout(true);
}
function removeBackupPanel(){
    w.remove(w.children.length - 1);
    w.center();
    w.layout.layout(true);
}

var isMac = (File.fs == 'Macintosh') ? true : false;
var doc = app.activeDocument;
var masterDoc = doc.masterSpreads.firstItem();
app.textWrapPreferences.textWrapMode = doc.textWrapPreferences.textWrapMode = TextWrapModes.none;
app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = app.findTextPreferences = app.changeTextPreferences = app.findChangeTextOptions = NothingEnum.nothing;
doc.textPreferences.showInvisibles = doc.viewPreferences.showFrameEdges = true;
doc.guidePreferences.properties = {guidesInBack:true, guidesLocked:true, guidesShown:true, guidesSnapto:true};
doc.documentPreferences.columnGuideLocked = true;
app.smartGuidePreferences.enabled = true;
doc.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
doc.marginPreferences.properties = {top:uVal(54, 'pt'), left:uVal(72, 'pt'), bottom:uVal(54, 'pt'), right:uVal(54, 'pt')};
app.findGrepPreferences.findWhat = '(?i)suggested procedure';
var mainStory = doc.findGrep()[0].parentStory;
var mainFrames = mainStory.textContainers;
var verticalGuides = [54, 162, 180, 209.55, 306, 360, 540, 684, 792, 810, 839.8, 918, 990, 1170];
var horizontalGuides = [67.5, 76.8, 130.5, 144, 180, 216, 252, 288, 324, 360, 396, 432, 468, 504, 540, 576, 612, 648, 684, 720, 769.5];

fixDoc();


function fixGuides(){
    doc.guidePreferences.guidesLocked = false;
    doc.guides.everyItem().remove();
    for (v = 0; v < verticalGuides.length; v++){
        masterDoc.guides.add({layer:'Master Default', orientation:HorizontalOrVertical.vertical, location:uVal(verticalGuides[v], 'pt')});
    }
    for (h = 0; h < horizontalGuides.length; h++){
        masterDoc.guides.add({layer:'Master Default', orientation:HorizontalOrVertical.horizontal, location:uVal(horizontalGuides[h], 'pt')});
    }
    doc.guidePreferences.guidesLocked = true;
}

function fixLogos(){
    app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = NothingEnum.nothing;
    app.findChangeGrepOptions.includeMasterPages = true;
    app.findGrepPreferences.findWhat = '\\d{6}([A-Z]+\\/)+';
    var artPath = (doc.findGrep()[0].parentStory.contents.indexOf('BA') > -1) ? 'SERVICE/Writing Department Art Work/*Sam\'s Club Art/DQ Logo' : 'SERVICE/TWD/DQ Logo.ai';
    if (isMac){
        var logo = (File('/share/' + artPath).exists) ? File('/share/' + artPath) : File('/macvol/' + artPath);
    }
    else {
        var logo = (Folder('//n/').exists) ? File(('//n/share/' + artPath).replace(/\*/, String.fromCharCode(61473))) : File(('/n/share/' + artPath).replace(/\*/, String.fromCharCode(61473)));
    }
    for (g = masterDoc.allGraphics.length - 1; g >= 0; g--){
        masterDoc.allGraphics[g].parent.remove();
    }
    var logoLeft = masterDoc.place(logo, [uVal(54, 'pt'), doc.marginPreferences.top], 'Master Default', false, false, {horizontalScale:50, verticalScale:50});
    logoLeft[0].parent.fit(FitOptions.frameToContent);
    logoLeft[0].parent.duplicate(undefined, [uVal(630, 'pt'), '0']);
}

function alignFooters(){
    for (m = 0; m < masterDoc.textFrames.length; m++){
        var frame = masterDoc.textFrames[m];
        if (frame.contents.replace(/system/i, '').length < frame.contents.length){
            var sysText = frame.contents;
            var sysHeight = (frame.paragraphs.length > 1) ? uVal(755.1, 'pt') : uVal(762.3, 'pt');
        }
        else if (frame.paragraphs.length > 1 && frame.paragraphs[1].contents.replace(/\d{6}/, '').length < frame.paragraphs[1].contents.length){
            var revText = frame.contents;
        }
    }
    masterDoc.textFrames.everyItem().remove();
    var pageL = masterDoc.textFrames.add('Master Default', {geometricBounds:[uVal(756.5, 'pt'), uVal(54, 'pt'), uVal(769.5, 'pt'), uVal(130.5, 'pt')], strokeColor:'None', contents:'Page '});
        pageL.parentStory.insertionPoints[-1].contents = SpecialCharacters.autoPageNumber;
        pageL.parentStory.appliedParagraphStyle = doc.paragraphStyles.item('Page No.')
        pageL.parentStory.justification = Justification.awayFromBindingSide;
    var sysL = masterDoc.textFrames.add('Master Default', {geometricBounds:[sysHeight, uVal(243, 'pt'), uVal(769.5, 'pt'), uVal(369, 'pt')], strokeColor:'None', contents:sysText});
        sysL.parentStory.appliedParagraphStyle = doc.paragraphStyles.item('footer')
    var revL = masterDoc.textFrames.add('Master Default', {geometricBounds:[uVal(755.1, 'pt'), uVal(432, 'pt'), uVal(769.5, 'pt'), uVal(540, 'pt')], fillColor:'None', strokeColor:'None', contents:revText});
        revL.parentStory.appliedParagraphStyle = doc.paragraphStyles.item('footer')
        revL.parentStory.justification = Justification.toBindingSide;
        pageL.parentStory.appliedCharacterStyle = sysL.parentStory.appliedCharacterStyle = revL.parentStory.appliedCharacterStyle = doc.characterStyles.item('[None]')
        pageL.duplicate(undefined, [uVal(1039.5, 'pt'), 0]);
        sysL.duplicate(undefined, [uVal(612, 'pt'), 0]);
        revL.duplicate(undefined, [uVal(252, 'pt'), 0]);
}

function fixFrames(){
    for (f = 0; f < mainFrames.length; f++){
        var mainFrame = mainFrames[f];
        var mainPage = mainFrame.parentPage;
        mainFrame.convertShape(ConvertShapeOptions.convertToRectangle);
        mainFrame.fit(FitOptions.frameToContent);
        var y1 = (mainPage.name == '1') ? uVal(67.5, 'pt') : ((mainFrame.paragraphs[0].appliedParagraphStyle.name == 'Level 2') ? uVal(130.5, 'pt') : uVal(76.8, 'pt'));
        var numLines = mainFrame.lines.length;
        var n = mainFrame.geometricBounds[2];
        for (i = 0; i < horizontalGuides.length; i++){
            var lowGuide = uVal(horizontalGuides[i], 'pt');
            var hiGuide = uVal(horizontalGuides[i+1], 'pt');
            if (lowGuide <= n && n <= hiGuide){
                mainFrame.geometricBounds[2] = hiGuide;
                var y2 = (mainFrame.lines.length > numLines) ? n : hiGuide;
                break;
            }
        }
        var x1 = (mainPage.label == 'EVEN') ? mainPage.marginPreferences.right : mainPage.bounds[1] + mainPage.marginPreferences.left;
        var x2 = x1 + uVal(486, 'pt');
        mainFrame.geometricBounds = [y1, x1, y2, x2];
    }
}

function resetColors(){
    var names = ['None', 'Registration', 'Paper', 'Black', 'Draft Text', 'Forest Green', 'Navy', 'Purple', 'Red', 'Yellow Orange'];
    tryCatch({'type':'colors', 'name':'Draft Text', 'model':ColorModel.spot, 'space':ColorSpace.CMYK, 'colorValue':[0, 0, 0, 15]});
    tryCatch({'type':'colors', 'name':'Forest Green', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[0, 94, 0]});
    tryCatch({'type':'colors', 'name':'Navy', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[0, 0, 255]});
    tryCatch({'type':'colors', 'name':'Purple', 'model':ColorModel.spot, 'space':ColorSpace.RGB, 'colorValue':[128,12,125]});
    tryCatch({'type':'colors', 'name':'Red', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[224, 0, 0]});
    tryCatch({'type':'colors', 'name':'Yellow Orange', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[255, 166, 0]});
    trimExtras(doc.swatches.everyItem().getElements(), names);
}

function clearBoxes(){
    var boxes = doc.layers.item('Default').splineItems.everyItem().getElements();
    for (i = 0; i < boxes.length; i++){
        if (boxes[i].hasOwnProperty('fillColor') && boxes[i].fillColor.name == 'Black'){
            boxes[i].remove();
        }
    }
}

function resetStyles(){
    var cStyles = ['[None]', 'Bold10', 'Bold12'];
    var pStyles = ['[No Paragraph Style]', '[Basic Paragraph]', 'call out', 'caption', 'Draft Text', 'footer', 'full body', 'Gutter Text', 'Level 1 (18 pt)', 'Level 1 (24 pt)', 'Level 2', 'Level 2 (Tools)', 'Level 3', 'Level 4', 'Level 5', 'New Body', 'Normal', 'Note', 'Note Bullets', 'Page No.', 'Procedure Designator', 'RUNNING THE', 'sub body', 'SUGGESTED PROCEDURE', 'TOC', 'TOC Level 2', 'TOC Level 2 (Tools)', 'TOC Level 3', 'TOC Level 4', 'TOC Level 5', 'TOC Parts List', 'TOC title', 'Tool List', 'Tool List 2'];
    trimExtras(doc.characterStyles.everyItem().getElements(), cStyles);
    tryCatch({'type':'characterStyles', 'name':'Bold10', 'appliedFont':'ITC Bookman Std', 'fontStyle':'Bold', 'pointSize':'10pt', 'leading':Leading.auto});
    tryCatch({'type':'characterStyles', 'name':'Bold12', 'appliedFont':'ITC Bookman Std', 'fontStyle':'Bold', 'pointSize':'12pt', 'leading':Leading.auto});
    app.menus.item('Paragraph Style Panel Menu').menuItems.item('Sort by Name').associatedMenuAction.invoke();
    trimExtras(doc.paragraphStyles.everyItem().getElements(), pStyles);
    tryCatch({'type':'paragraphStyles', 'alignToBaseline':false, 'appliedFont':'Minion Pro', 'appliedLanguage':'English: USA', 'autoLeading':120, 'balanceRaggedLines':BalanceLinesStyle.noBalancing, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'baselineShift':'0pt', 'bulletsAlignment':ListAlignment.leftAlign, 'bulletsAndNumberingListType':ListType.noList, 'bulletsCharacterStyle':'[None]', 'bulletsTextAfter':'^t', 'capitalization':Capitalization.normal, 'characterAlignment':CharacterAlignment.alignEmCenter, 'composer':'Adobe Paragraph Composer', 'desiredGlyphScaling':100, 'desiredLetterSpacing':0, 'desiredWordSpacing':100, 'endJoin':OutlineJoin.miterEndJoin, 'fillColor':'Black', 'fillTint':-1, 'firstLineIndent':'0pt', 'fontStyle':'Regular', 'gridAlignFirstLineOnly':false, 'gridAlignment':GridAlignment.none, 'hyphenateAcrossColumns':true, 'hyphenateAfterFirst':2, 'hyphenateBeforeLast':2, 'hyphenateCapitalizedWords':true, 'hyphenateLadderLimit':3, 'hyphenateLastWord':true, 'hyphenateWordsLongerThan':5, 'hyphenation':true, 'hyphenationZone':'36pt', 'hyphenWeight':5, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':2, 'keepLastLines':2, 'keepLinesTogether':false, 'keepRuleAboveInFrame':false, 'keepWithNext':0, 'keepWithPrevious':false, 'lastLineIndent':'0pt', 'leading':Leading.auto, 'leadingModel':LeadingModel.leadingModelAkiBelow, 'leftIndent':'0pt', 'ligatures':true, 'maximumLetterSpacing':0, 'maximumWordSpacing':133, 'minimumLetterSpacing':0, 'minimumWordSpacing':80, 'name':'[Basic Paragraph]', 'nextStyle':doc.paragraphStyles.item('[Basic Paragraph]'), 'noBreak':false, 'numberingAlignment':ListAlignment.leftAlign, 'numberingCharacterStyle':'[None]', 'numberingContinue':true, 'numberingExpression':'^#.^t', 'numberingFormat':NumberingStyle.arabic, 'numberingLevel':1, 'numberingStartAt':1, 'overprintFill':false, 'overprintStroke':false, 'paragraphJustification':ParagraphJustificationOptions.defaultJustification, 'pointSize':'12pt', 'rightIndent':'0pt', 'ruleAbove':false, 'ruleAboveColor':'Text Color', 'ruleAboveGapColor':'None', 'ruleAboveGapOverprint':false, 'ruleAboveGapTint':-1, 'ruleAboveLeftIndent':'0pt', 'ruleAboveLineWeight':'1pt', 'ruleAboveOffset':'0pt', 'ruleAboveOverprint':false, 'ruleAboveRightIndent':'0pt', 'ruleAboveTint':-1, 'ruleAboveType':'Solid', 'ruleAboveWidth':RuleWidth.columnWidth, 'ruleBelow':false, 'ruleBelowColor':'Text Color', 'ruleBelowGapColor':'None', 'ruleBelowGapOverprint':false, 'ruleBelowGapTint':-1, 'ruleBelowLeftIndent':'0pt', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowOverprint':false, 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':-1, 'ruleBelowType':'Solid', 'ruleBelowWidth':RuleWidth.columnWidth, 'scaleAffectsLineHeight':false, 'singleWordJustification':SingleWordJustification.fullyJustified, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'spanColumnMinSpaceAfter':'0pt', 'spanColumnMinSpaceBefore':'0pt', 'spanColumnType':SpanColumnTypeOptions.singleColumn, 'spanSplitColumnCount':SpanColumnCountOptions.all, 'splitColumnInsideGutter':'6pt', 'splitColumnOutsideGutter':'0pt', 'startParagraph':StartParagraph.anywhere, 'strikeThroughColor':'Text Color', 'strikeThroughGapColor':'None', 'strikeThroughGapOverprint':false, 'strikeThroughGapTint':-1, 'strikeThroughOffset':-9999, 'strikeThroughOverprint':false, 'strikeThroughTint':-1, 'strikeThroughType':'Solid', 'strikeThroughWeight':-9999, 'strikeThru':false, 'strokeAlignment':TextStrokeAlign.outsideAlignment, 'strokeColor':'None', 'strokeTint':-1, 'strokeWeight':'1pt', 'tabList':[], 'tracking':0, 'underline':false, 'underlineColor':'Text Color', 'underlineGapColor':'None', 'underlineGapOverprint':false, 'underlineGapTint':-1, 'underlineOffset':-9999, 'underlineOverprint':false, 'underlineTint':-1, 'underlineType':'Solid'});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Tekton Pro', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.allCaps, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Regular', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'call out', 'nextStyle':doc.paragraphStyles.item('call out'), 'pointSize':8, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light Italic', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':'13pt', 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'caption', 'nextStyle':doc.paragraphStyles.item('caption'), 'pointSize':10, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'36pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'72pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'108pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'144pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'216pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'252pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'288pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'324pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'360pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'396pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'432pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'468pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'504pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'540pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'576pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'612pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'648pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'684pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'720pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('call out'), 'capitalization':Capitalization.allCaps, 'fillColor':'Paper', 'firstLineIndent':'0pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.centerAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Draft Text', 'nextStyle':doc.paragraphStyles.item('Draft Text'), 'pointSize':72, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'Draft Text', 'strokeWeight':'0.25pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Helvetica LT Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('New Body'), 'capitalization':Capitalization.allCaps, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light Condensed', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.centerAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'footer', 'nextStyle':doc.paragraphStyles.item('footer'), 'pointSize':6, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'155.25pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'479.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'full body', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'13.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Tekton Pro', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('call out'), 'capitalization':Capitalization.allCaps, 'fillColor':'Navy', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Gutter Text', 'nextStyle':doc.paragraphStyles.item('Gutter Text'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Helvetica LT Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.allCaps, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold Condensed', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Level 1 (18 pt)', 'nextStyle':doc.paragraphStyles.item('SUGGESTED PROCEDURE'), 'pointSize':18, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Helvetica LT Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.allCaps, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold Condensed', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':'27pt', 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Level 1 (24 pt)', 'nextStyle':doc.paragraphStyles.item('SUGGESTED PROCEDURE'), 'pointSize':24, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Times LT Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':1, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Level 2', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':18, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':true, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'0.25pt', 'ruleBelowOffset':'8.75pt', 'ruleBelowRightIndent':'180pt', 'ruleBelowTint':100, 'spaceAfter':'9pt', 'spaceBefore':'27pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'360pt', alignment:TabStopAlignment.rightAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Times LT Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':1, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Level 2 (Tools)', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':18, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':true, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'0.25pt', 'ruleBelowOffset':'8.75pt', 'ruleBelowRightIndent':'180pt', 'ruleBelowTint':100, 'spaceAfter':'22.5pt', 'spaceBefore':'22.5pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'360pt', alignment:TabStopAlignment.rightAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':1, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Level 3', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'31.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold Italic', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':1, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Level 4', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'31.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Tekton Pro', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('Level 3'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold Oblique', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':1, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Level 5', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':14, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'31.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-29.25pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'155.25pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'New Body', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'13.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'155.25pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'479.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Normal', 'nextStyle':doc.paragraphStyles.item('Normal'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'162pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Note', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'13.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-18pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'180pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Note Bullets', 'nextStyle':doc.paragraphStyles.item('Note Bullets'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'13.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.awayFromBindingSide, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':'13pt', 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Page No.', 'nextStyle':doc.paragraphStyles.item('Page No.'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'36pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'72pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'108pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'144pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'216pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'252pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'288pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'324pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'360pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'396pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'432pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'468pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'504pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'540pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'576pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'612pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'648pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'684pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'720pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.allCaps, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.centerAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':'13pt', 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Procedure Designator', 'nextStyle':doc.paragraphStyles.item('[No Paragraph Style]'), 'pointSize':10, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'36pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'72pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'108pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'144pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'216pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'252pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'288pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'324pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'360pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'396pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'432pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'468pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'504pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'540pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'576pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'612pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'648pt', alignment:TabStopAlignment.leftAlign, leader:''},{position:'684pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'720pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.allCaps, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'RUNNING THE', 'nextStyle':doc.paragraphStyles.item('Level 1 (18 pt)'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'18pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-18pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'173.5pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'sub body', 'nextStyle':doc.paragraphStyles.item('sub body'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'13.55pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'173.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Helvetica LT Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.allCaps, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Light Condensed', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'SUGGESTED PROCEDURE', 'nextStyle':doc.paragraphStyles.item('New Body'), 'pointSize':6, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':true, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'0.25pt', 'ruleBelowOffset':'9pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'13.5pt', 'spaceBefore':'7.848pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'Times LT Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':1, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'TOC', 'nextStyle':doc.paragraphStyles.item('[No Paragraph Style]'), 'pointSize':18, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':true, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'0.25pt', 'ruleBelowOffset':'8.75pt', 'ruleBelowRightIndent':'180pt', 'ruleBelowTint':100, 'spaceAfter':'18pt', 'spaceBefore':'27pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'360pt', alignment:TabStopAlignment.rightAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':1, 'leading':'18pt', 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':150, 'minimumLetterSpacing':-5, 'minimumWordSpacing':75, 'name':'TOC Level 2', 'nextStyle':doc.paragraphStyles.item('[No Paragraph Style]'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'0.25pt', 'ruleBelowOffset':'8.75pt', 'ruleBelowRightIndent':'180pt', 'ruleBelowTint':100, 'spaceAfter':'13.55pt', 'spaceBefore':'18pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':'18pt', 'leftIndent':'126pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':150, 'minimumLetterSpacing':-5, 'minimumWordSpacing':75, 'name':'TOC Level 2 (Tools)', 'nextStyle':doc.paragraphStyles.item('Level 2'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'0.25pt', 'ruleBelowOffset':'8.75pt', 'ruleBelowRightIndent':'180pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'18pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-15.75pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':false, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'141.75pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':150, 'minimumLetterSpacing':-5, 'minimumWordSpacing':75, 'name':'TOC Level 3', 'nextStyle':doc.paragraphStyles.item('[No Paragraph Style]'), 'pointSize':12, 'rightIndent':'18pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'4.45pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'141.75pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-15.75pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':false, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'141.75pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':150, 'minimumLetterSpacing':-5, 'minimumWordSpacing':75, 'name':'TOC Level 4', 'nextStyle':doc.paragraphStyles.item('[No Paragraph Style]'), 'pointSize':12, 'rightIndent':'18pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'4.45pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'141.75pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-15.75pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':false, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'173.3pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':150, 'minimumLetterSpacing':-5, 'minimumWordSpacing':75, 'name':'TOC Level 5', 'nextStyle':doc.paragraphStyles.item('TOC Level 5'), 'pointSize':12, 'rightIndent':'18pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'4.45pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'141.75pt', alignment:TabStopAlignment.leftAlign, leader:'.'},{position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}, {position:'486pt', alignment:TabStopAlignment.rightAlign, leader:'.'}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-105.1pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':false, 'justification':Justification.leftAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'231.75pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':150, 'minimumLetterSpacing':-5, 'minimumWordSpacing':75, 'name':'TOC Parts List', 'nextStyle':doc.paragraphStyles.item('TOC Parts List'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'159.75pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'231.75pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':120, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'0pt', 'fontStyle':'Bold', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.centerAlign, 'keepAllLinesTogether':false, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':false, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'0pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':150, 'minimumLetterSpacing':-5, 'minimumWordSpacing':75, 'name':'TOC title', 'nextStyle':doc.paragraphStyles.item('TOC title'), 'pointSize':30, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'18pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':125, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-29.25pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'155.25pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Tool List', 'nextStyle':doc.paragraphStyles.item('Tool List'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'155.25pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'479.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    tryCatch({'type':'paragraphStyles', 'appliedFont':'ITC Bookman Std', 'autoLeading':125, 'basedOn':doc.paragraphStyles.item('[No Paragraph Style]'), 'capitalization':Capitalization.normal, 'fillColor':'Black', 'firstLineIndent':'-20.3pt', 'fontStyle':'Light', 'hyphenateLadderLimit':0, 'hyphenation':true, 'justification':Justification.leftAlign, 'keepAllLinesTogether':true, 'keepFirstLines':1, 'keepLastLines':1, 'keepLinesTogether':true, 'keepWithNext':0, 'leading':Leading.auto, 'leftIndent':'175.55pt', 'maximumLetterSpacing':25, 'maximumWordSpacing':200, 'minimumLetterSpacing':-5, 'minimumWordSpacing':50, 'name':'Tool List 2', 'nextStyle':doc.paragraphStyles.item('Tool List 2'), 'pointSize':12, 'rightIndent':'0pt', 'ruleAboveColor':'Black', 'ruleAboveTint':100, 'ruleBelow':false, 'ruleBelowColor':'Black', 'ruleBelowLineWeight':'1pt', 'ruleBelowOffset':'0pt', 'ruleBelowRightIndent':'0pt', 'ruleBelowTint':100, 'spaceAfter':'0pt', 'spaceBefore':'0pt', 'strokeColor':'None', 'strokeWeight':'1pt', 'tabList':[{position:'175.5pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'479.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]});
    doc.paragraphStyles.item('caption').nestedStyles.everyItem().remove();
    doc.paragraphStyles.item('Note').nestedStyles.everyItem().remove();
    doc.paragraphStyles.item('caption').nestedStyles.add({appliedCharacterStyle:doc.characterStyles.item('Bold10'), delimiter:'.', inclusive:true, repetition:1});
    doc.paragraphStyles.item('Note').nestedStyles.add({appliedCharacterStyle:doc.characterStyles.item('Bold12'), delimiter:':', inclusive:true, repetition:1});
    app.menus.item('Paragraph Style Panel Menu').menuItems.item('Sort by Name').associatedMenuAction.invoke();
}

function noteBoxes(){
    clearBoxes();
    app.findGrepPreferences.properties = {findWhat:'^.+(\r|$)', appliedParagraphStyle:'Note'};
    var findNotes = doc.findGrep();
    app.findTextPreferences.properties = {appliedParagraphStyle:'Note Bullets'};
    var bulletList = doc.findText();
    for(y = 0; y < findNotes.length; y++){
        var note = findNotes[y];
        checkFormat(note.words[0]);
        var notePage = note.parentTextFrames[0].parentPage;
        if (notePage.name == '1'){
            var x1 = uVal(227.8, 'pt');
            var x2 = uVal(561.88, 'pt');
        }
        else if (notePage.label == 'EVEN'){
            var x1 = uVal(209.55, 'pt');
            var x2 = uVal(543.63, 'pt');
        }
        else if (notePage.label == 'ODD'){
            var x1 = uVal(839.8, 'pt');
            var x2 = uVal(1173.88, 'pt');
        }
        var y1 = note.words[0].baseline - note.ascent - uVal(6.2, 'pt');
        if (bulletList.length > 0){
            for (z = 0; z < bulletList.length; z++){
                var notePara = mainStory.characters.itemByRange(0, note.characters[0]).paragraphs.length;
                var bulletPara = mainStory.characters.itemByRange(0, bulletList.characters[0]).paragraphs.length;
                if (bulletPara.index - notePara.index == 1){
                    var y2 = bulletList[z].characters[-1].baseline + bulletList[z].descent + uVal(6.2, 'pt');
                }
                else {
                    var y2 = note.characters[-1].baseline + note.descent + uVal(6.2, 'pt');
                }
            }
        }
        else {
            var y2 = note.characters[-1].baseline + note.descent + uVal(6.2, 'pt');
        }
        var noteBox = notePage.rectangles.add({geometricBounds:[y1, x1, y2, x2], itemLayer:note.parentTextFrames[0].itemLayer.name, fillColor:'Black', fillTint:7, strokeColor:'None', textWrapPreferences:TextWrapModes.none, appliedObjectStyle:'None'});
        noteBox.sendToBack();
    }
}

function fixGroups(){
    for (p = 0; p < doc.pages.length; p++){
        var page = doc.pages[p];
        for (i = 0; i < page.pageItems.length; i++){
            var item = page.pageItems[i];
            if (item.allPageItems.length > 1){
                for (g = 0; g < item.allPageItems.length; g++){
                    var gItem = item.allPageItems[g];
                    if (gItem.allGraphics.length == 1){
                        gItem.sendToBack();
                    }
                    gItem.textWrapPreferences.textWrapMode = TextWrapModes.none;
                }
                item.bringToFront();
                if (item.geometricBounds[1] < uVal(306, 'pt') && item.geometricBounds[1] > uVal(162, 'pt') && (page.name == '1' || page.label == 'EVEN')){
                    item.textWrapPreferences.textWrapMode = TextWrapModes.jumpObjectTextWrap;
                    item.textWrapPreferences.textWrapOffset[0] = item.textWrapPreferences.textWrapOffset[1] = uVal(9, 'pt');
                }
                else if (item.geometricBounds[1] < uVal(918, 'pt') && item.geometricBounds[1] > uVal(792, 'pt') && page.label == 'ODD'){
                    item.textWrapPreferences.textWrapMode = TextWrapModes.jumpObjectTextWrap;
                    item.textWrapPreferences.textWrapOffset[0] = item.textWrapPreferences.textWrapOffset[1] = item.textWrapPreferences.textWrapOffset[2] = item.textWrapPreferences.textWrapOffset[3] = uVal(9, 'pt');
                }
                else {
                    item.textWrapPreferences.textWrapMode = TextWrapModes.boundingBoxTextWrap;
                }
                if (item.geometricBounds[0] < uVal(76.8, 'pt')){
                    item.move(undefined, [0, uVal(76.8, 'pt') - item.geometricBounds[0]]);
                }
                else if (item.geometricBounds[0] - uVal(76.8, 'pt') < uVal(15, 'pt')){
                    item.move(undefined, [0, uVal(76.8, 'pt') - item.geometricBounds[0]]);
                }
                if (uVal(540, 'pt') - item.geometricBounds[3] < uVal(20, 'pt') && (page.name == '1' || page.label == 'EVEN')){
                    item.move(undefined, [uVal(540, 'pt') - item.geometricBounds[3], 0]);
                }
                else if (uVal(1170, 'pt') - item.geometricBounds[3] < uVal(20, 'pt') && page.label == 'ODD'){
                    item.move(undefined, [uVal(1170, 'pt') - item.geometricBounds[3], 0]);
                }
            }
        }
    }
}

function fixDoc(){
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    app.findChangeGrepOptions.includeLockedStoriesForFind = true;
    app.findGrepPreferences.findWhat = '~b~b+';
    app.changeGrepPreferences.changeTo = '\r';
    doc.changeGrep();
    app.findGrepPreferences.findWhat = '[~m~>~f~|~S~s~<~/~.~3~4~% ]{2,}';
    app.changeGrepPreferences.changeTo = ' ';
    doc.changeGrep();
    app.findGrepPreferences.findWhat = '(\\d)”';
    app.changeGrepPreferences.changeTo = '$1\"';
    doc.changeGrep();
    app.findGrepPreferences.findWhat = '\\s+\$';
    app.changeGrepPreferences.changeTo = '';
    doc.changeGrep();
    app.findGrepPreferences.findWhat = '•\\s';
    app.changeGrepPreferences.changeTo = '•\t';
    doc.changeGrep();
    app.findGrepPreferences.findWhat = '(?i)figure (\\d+)';
    app.changeGrepPreferences.changeTo = 'Figure $1';
    app.changeGrepPreferences.fontStyle = 'Bold';
    doc.changeGrep();
    tryCatch({'type':'layers', 'name':'Default', 'layerColor':UIColors.red, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true});
    tryCatch({'type':'layers', 'name':'Master Default', 'layerColor':UIColors.blue, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true});
    tryCatch({'type':'layers', 'name':'Old Table', 'ignoreWrap':true, 'layerColor':UIColors.green, 'locked':false, 'printable':true, 'showGuides':true, 'visible':false});
    if (doc.layers.item('Old Table').pageItems.length == 0){
        doc.layers.item('Old Table').remove();
    }
    masterDoc.pageItems.everyItem().itemLayer = doc.layers.item('Master Default');
    for (i = 0; i < doc.pageItems.length; i++){
        var item = doc.pageItems[i];
        if (item.hasOwnProperty('locked')){
            item.locked = false;
        }
        if (item.hasOwnProperty('itemLayer') && !(/master default|old table/i).test(item.itemLayer.name)){
            item.itemLayer = doc.layers.item('Default');
        }
        if (item.allPageItems.length == 0 && item.fillColor.name == ''){
            var fill = item.fillColor.colorValue;
            if (fill[0] == fill[1] == fill[2] == 0 && fill[3] > 0){
                item.fillColor = doc.swatches.item('Black');
                item.fillTint = fill[3];
            }
        }
        if (item.allPageItems.length == 0 && item.strokeColor.name == ''){
            var stroke = item.strokeColor.colorValue;
            if (stroke[0] == stroke[1] == stroke[2] == 0 && stroke[3] > 0){
                item.strokeColor = doc.swatches.item('Black');
                item.strokeTint = stroke[3];
            }
        }
    }
    trimExtras(doc.layers.everyItem().getElements(), ['Old Table', 'Default', 'Master Default']);
    masterDoc.pages.everyItem().label = 'MASTER';
    for (p = 0; p < doc.pages.length; p++){
        var page = doc.pages[p];
        if (page.name % 2 == 0){
            page.label = 'EVEN';
        }
        else {
            page.label = 'ODD';
        }
    }
}