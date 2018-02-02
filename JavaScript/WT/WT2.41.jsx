#target indesign
var run, funcs, backup, backupPath, date = new Date();
var dateStamp = ('0' + (date.getMonth() + 1).toString()).substr(-2) + '-' + ('0' + (date.getDate().toString())).substr(-2) + '-' + date.getFullYear().toString().substr(-2) + ' ' + ('0' + date.getHours().toString()).substr(-2) + '.' + ('0' + date.getMinutes().toString()).substr(-2) + '.' + ('0' + date.getSeconds().toString()).substr(-2);
var defaultLocation = Folder.myDocuments.fsName.replace(/\\/g, '\/') + '/WT Backups/';
if (!Folder(defaultLocation).exists){
    Folder(defaultLocation).create();
}
var doc = app.activeDocument, masterDoc = doc.masterSpreads.firstItem();
var docName = doc.name.replace(/\.indd/i, '');
var description = '* Bypasses all locked content except for items on the \'Old Table\' layer.\r\r* Searches for \'suggested procedure\', and assumes its parent story as the main story.\r\rPosition the pointer over a function to see a detailed description.\r\r';

var w = new Window('dialog', 'Writer\'s Toolbox', undefined);
    w.alignChildren = ['left', 'center'];
            var checkDC = w.add('checkbox', undefined, '\u00A0DQ Config: Resets layers, colors, styles, guides, logos, and footers');
                checkDC.onClick = function (){
                    bRun.enabled = (checkDC.value || checkFF.value || checkCT.value || checkNB.value) ? true : false;
                }
            var checkFF = w.add('checkbox', undefined, '\u00A0FixFrames: Straighten\'s and corrects text frame sizing and layout');
                checkFF.onClick = function (){
                    bRun.enabled = (checkDC.value || checkFF.value || checkCT.value || checkNB.value) ? true : false;
                }
            var checkCT = w.add('checkbox', undefined, '\u00A0CleanText: Cleans document of incorrect whitespaces and returns');
                checkCT.onClick = function (){
                    bRun.enabled = (checkDC.value || checkFF.value || checkCT.value || checkNB.value) ? true : false;
                }
            var checkNB = w.add('checkbox', undefined, '\u00A0NoteBoxes: Replaces the note box of every note/caution/warning');
                checkNB.onClick = function (){
                    bRun.enabled = (checkDC.value || checkFF.value || checkCT.value || checkNB.value) ? true : false;
                }
        var p = w.add('panel', undefined, 'Description', {borderStyle:'etched'});
            p.margins = [12, 18, 12, 12];
            var d = p.add('staticText', undefined, description, {multiline:true});
                d.alignment = ['fill', 'fill'];
                d.characters = 60;
        var pBackup = w.add('panel', undefined, 'Backup', {borderStyle:'etched'});
            pBackup.alignment = ['fill', 'fill'];
            pBackup.alignChildren = ['left', 'center'];
            pBackup.margins = [12, 18, 12, 12];
            pBackup.spacing = 6;
            var checkBackup = pBackup.add('checkbox', undefined, 'Backup the active document');
                checkBackup.value = true;
                checkBackup.onClick = function (){
                    editPath.enabled = bBrowse.enabled = checkBackup.value;
                }
            var gPath = pBackup.add('group');
                gPath.margins = gPath.spacing = 0;
                gPath.alignChildren = ['left', 'center'];
                var labelPath = gPath.add('staticText', undefined, 'Location:');
                    labelPath.characters = 7;
                var editPath = gPath.add('editText', undefined, defaultLocation, {borderless:true});
                    editPath.characters = 42;
                var bBrowse = gPath.add('button', undefined, 'Browse');
                    bBrowse.alignment = ['fill', 'fill'];
                    bBrowse.helpTip = 'Browse to the backup directory';
                    bBrowse.onClick = function (){
                        backupPath = Folder.selectDialog('Choose the backup location');
                        editPath.text = Folder.decode(backupPath + '/');
                    };
        var gButtons = w.add('group');
            gButtons.alignment = ['fill', 'fill'];
            gButtons.alignChildren = ['right', 'center'];
            var bRun = gButtons.add('button', undefined, 'Run');
                bRun.enabled = false;
                bRun.onClick = function (){
                    funcs = [checkDC.value, checkFF.value, checkCT.value, checkNB.value];
                    backup = checkBackup.value;
                    run = true;
                    w.close();
                }
            var bCancel = gButtons.add('button', undefined, 'Cancel');
                bCancel.alignment = ['right', 'center'];
                bCancel.onClick = function (){
                    run = false;
                    w.close();
                };
ScriptUI.events.createEvent('MouseEvent');
w.addEventListener('mouseover', myMouseHandler);
w.addEventListener('mouseout', myMouseHandler);
w.show();

if (run){
    app.textWrapPreferences.textWrapMode = doc.textWrapPreferences.textWrapMode = TextWrapModes.none;
    app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = app.findTextPreferences = app.changeTextPreferences = app.findChangeTextOptions = NothingEnum.nothing;
    doc.viewPreferences.properties = {rulerOrigin:RulerOrigin.spreadOrigin, showFrameEdges:true, showRulers:true};
    doc.textPreferences.showInvisibles = true;
    var docUnits = doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
    doc.marginPreferences.properties = {top:uVal(54, 'pt'), left:uVal(72, 'pt'), bottom:uVal(54, 'pt'), right:uVal(54, 'pt')};
    app.findGrepPreferences.findWhat = '(?i)suggested procedure';
    app.findChangeGrepOptions.properties = {includeLockedStoriesForFind:true, includeLockedLayersForFind:true};
    var mainStory = doc.findGrep()[0].parentStory;
    var mainFrames = mainStory.textContainers;
    var verticalGuides = [54, 162, 180, 209.55, 306, 360, 540, 684, 792, 810, 839.8, 918, 990, 1170];
    var horizontalGuides = [67.5, 76.8, 130.5, 144, 180, 216, 252, 288, 324, 360, 396, 432, 468, 504, 540, 576, 612, 648, 684, 720, 769.5];
    if (backup){
        doc.saveACopy(File(editPath.text + docName + ' ' + dateStamp + '.indd'));
    }
    labelsAndLayers();
    for (e = 0; e < funcs.length; e++){
        if (funcs[e]){
            switch (e){
                case 0:
                    dqConfig();
                    break;
                case 1:
                    fixFrames();
                    break;
                case 2:
                    cleanText();
                    break;
                case 3:
                    noteBoxes();
                    break;
            }
        }
    }
}

function myMouseHandler(ev){
    if (ev.type == 'mouseover'){
        if (ev.target == checkDC){
            d.text = 'DQ Config puts master items on the \'Master Default\' layer, and all others on \'Default\', skipping items on \'Old Table\'. Sets the correct properties for swatches/styles, adds absent ones, and removes any extras. Removes all guides in the document, and inserts new ones on the master spread. Removes all master spread graphics, and places a new \'DQ Logo\' on each master page. Uses the Sam\'s Club logo only if the TWD logo isn\'t found. Properly sizes and aligns the master spread footers.';
        }
        else if (ev.target == checkFF){
            d.text = 'FixFrames adjusts every threaded text frame of the main story, straightening any Crooked frames. The sides of each frame are set on the margins. The first page\'s frame starts on the first guide, frames starting with a \'Level 2\' paragraph on the third guide, and the rest on the second guide. All frames end on the guide closest to its last line of text, but never changes the number of lines in a frame.';
        }
        else if (ev.target == checkCT){
            d.text = 'CleanText is a simple function that combines several of InDesign\'s built-in find/replace operations, plus some custom ones. Replaces multiple returns with single returns (don\'t use returns to format text), replaces multiple spaces with single spaces, removes trailing spaces at the ends of paragraphs, replaces spaces following a bullet with a single tab, and properly formats figure references.';
        }
        else if (ev.target == checkNB){
            d.text = 'NoteBoxes clears all existing note boxes, and checks for correct color values before running. It finds all paragraphs with the \'Note\' or \'Note Bullets\' style, and sets the format and color according to the paragraph\'s first word (note/caution/warning). The script then generates a gray note box underneath every note in the document.';
        }
        else {
            d.text = '* Bypasses all locked content except for items on the \'Old Table\' layer.\r\r* Searches for \'suggested procedure\', and assumes its parent story as the main story.\r\rPosition the pointer over a function to see a detailed description.\r\r';
        }
    }
    else if (ev.type == 'mouseout'){
        d.text = description;
    }
}

function labelsAndLayers(){
    tryCatch({'type':'layers', 'name':'Default', 'layerColor':UIColors.red, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true});
    tryCatch({'type':'layers', 'name':'Master Default', 'layerColor':UIColors.blue, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true});
    if (doc.layers.item('Old Table').isValid){
        doc.layers.item('Old Table').properties = {'ignoreWrap':true, 'layerColor':UIColors.green, 'locked':false, 'printable':true, 'showGuides':true, 'visible':false};
    }
    var items = doc.pageItems.everyItem().getElements();
    for (i = items.length - 1; i >= 0; i--){
        var item = items[i];
        if (item.hasOwnProperty('locked')){
            item.locked = false;
        }
        if (item.parentPage == null){
            item.remove();
        }
        else {
            if (item.allPageItems.length == 0 && (item.fillColor.name == '' || item.strokeColor.name == '')){
                if (item.fillColor.name == '' && item.fillColor.colorValue.slice(0, 3) == '0,0,0' && item.fillColor.colorValue[3] > 0){
                    item.properties = {fillColor:'Black', fillTint:item.fillColor.colorValue[3]};
                }
                if (item.strokeColor.name == '' && item.strokeColor.colorValue.slice(0, 3) == '0,0,0' && item.strokeColor.colorValue[3] > 0){
                    item.properties = {strokeColor:'Black', strokeTint:item.strokeColor.colorValue[3]};
                }
            }
            if (item.itemLayer.name == 'Old Table'){
                item.locked = true;
            }
        }
    }
    trimExtras(doc.layers.everyItem().getElements(), ['Old Table', 'Default', 'Master Default']);
    masterDoc.pages.everyItem().label = 'MASTER';
    var pgs = doc.pages.everyItem().getElements();
    for (p = 0; p < pgs.length; p++){
        if ((p + 1) & 1){
            pgs[p].label = 'ODD';
        }
        else {
            pgs[p].label = 'EVEN';
        }
        var pItems = pgs[p].pageItems.everyItem().getElements();
        for (t = 0; t < pItems.length; t++){
            if (!pItems[t].locked){
                pItems[t].itemLayer = doc.layers.item('Default');
            }
        }
    }
}

function dqConfig(){
    //    COLORS
    var swatches = [{'type':'colors', 'name':'Draft Text', 'model':ColorModel.spot, 'space':ColorSpace.CMYK, 'colorValue':[0, 0, 0, 15]}, {'type':'colors', 'name':'Forest Green', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[0, 94, 0]}, {'type':'colors', 'name':'Navy', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[0, 0, 255]}, {'type':'colors', 'name':'Purple', 'model':ColorModel.spot, 'space':ColorSpace.RGB, 'colorValue':[128,12,125]}, {'type':'colors', 'name':'Red', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[224, 0, 0]}, {'type':'colors', 'name':'Yellow Orange', 'model':ColorModel.process, 'space':ColorSpace.RGB, 'colorValue':[255, 166, 0]}];
    for (i = 0; i < swatches.length; i++){
        tryCatch(swatches[i]);
    }
    trimExtras(doc.swatches.everyItem().getElements(), ['None', 'Registration', 'Paper', 'Black', 'Draft Text', 'Forest Green', 'Navy', 'Purple', 'Red', 'Yellow Orange']);
    //    STYLES
    var  noStyle = doc.paragraphStyles.item('[No Paragraph Style]'), basic = doc.paragraphStyles.item('[Basic Paragraph]');
    var styles = ['Bold10', 'Bold12', 'call out', 'caption', 'Draft Text', 'footer', 'full body', 'Gutter Text', 'Level 1 (18 pt)', 'Level 1 (24 pt)', 'Level 2', 'Level 2 (Tools)', 'Level 3', 'Level 4', 'Level 5', 'New Body', 'Normal', 'Note', 'Note Bullets', 'Page No.', 'Procedure Designator', 'RUNNING THE', 'sub body', 'SUGGESTED PROCEDURE', 'TOC', 'TOC Level 2', 'TOC Level 2 (Tools)', 'TOC Level 3', 'TOC Level 4', 'TOC Level 5', 'TOC Parts List', 'TOC title', 'Tool List', 'Tool List 2'];
    basic.properties = {alignToBaseline:false, allowArbitraryHyphenation:false, appliedFont:'Minion Pro\tRegular', autoLeading:120, basedOn:'noStyle', baselineShift:0, bulletsAlignment:ListAlignment.leftAlign, bulletsAndNumberingListType:ListType.noList, capitalization:Capitalization.normal, digitsType:DigitsTypeOptions.defaultDigits, dropCapCharacters:0, dropcapDetail:1, dropCapLines:0, dropCapStyle:'[None]', endJoin:OutlineJoin.miterEndJoin, fillColor:'Black', fillTint:-1, firstLineIndent:0, glyphForm:AlternateGlyphForms.none, gradientFillAngle:0, gradientFillLength:-1, gradientFillStart:[0,0], gradientStrokeAngle:0, gradientStrokeLength:-1, gradientStrokeStart:[0,0], gridAlignFirstLineOnly:false, gridAlignment:GridAlignment.none, horizontalScale:100, hyphenateAcrossColumns:true, hyphenateAfterFirst:2, hyphenateBeforeLast:2, hyphenateCapitalizedWords:true, hyphenateLadderLimit:0, hyphenateLastWord:true, hyphenateWordsLongerThan:5, hyphenation:true, hyphenationZone:0.5, hyphenWeight:5, ignoreEdgeAlignment:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepRuleAboveInFrame:false, keepWithNext:0, keepWithPrevious:false, keyboardDirection:CharacterDirectionOptions.defaultDirection, lastLineIndent:0, leading:Leading.auto, leadingModel:LeadingModel.leadingModelAkiBelow, leftIndent:0, ligatures:true, maximumGlyphScaling:100, maximumLetterSpacing:25, maximumWordSpacing:200, minimumGlyphScaling:100, minimumLetterSpacing:-5, minimumWordSpacing:50, miterLimit:4, nextStyle:basic, noBreak:false, numberingAlignment:ListAlignment.leftAlign, numberingApplyRestartPolicy:true, numberingCharacterStyle:'[None]', numberingContinue:true, numberingExpression:'^#.^t', numberingFormat:'1, 2, 3, 4...', numberingLevel:1, numberingStartAt:1, overprintFill:false, overprintStroke:false, paragraphDirection:ParagraphDirectionOptions.leftToRightDirection, paragraphJustification:ParagraphJustificationOptions.defaultJustification, pointSize:12, position:Position.normal, positionalForm:PositionalForms.none, rightIndent:0, ruleAbove:false, ruleAboveColor:'Black', ruleAboveGapColor:'None', ruleAboveGapOverprint:false, ruleAboveGapTint:100, ruleAboveLeftIndent:0, ruleAboveLineWeight:1, ruleAboveOffset:0, ruleAboveOverprint:false, ruleAboveRightIndent:0, ruleAboveTint:-1, ruleAboveType:'Solid', ruleAboveWidth:RuleWidth.columnWidth, ruleBelow:false, ruleBelowColor:'Black', ruleBelowGapColor:'None', ruleBelowGapOverprint:false, ruleBelowGapTint:100, ruleBelowLeftIndent:0, ruleBelowLineWeight:1, ruleBelowOffset:0, ruleBelowOverprint:false, ruleBelowRightIndent:0, ruleBelowTint:-1, ruleBelowType:'Solid', ruleBelowWidth:RuleWidth.columnWidth, scaleAffectsLineHeight:false, singleWordJustification:SingleWordJustification.fullyJustified, skew:0, spaceAfter:0, spaceBefore:0, spanColumnType:SpanColumnTypeOptions.singleColumn, spanSplitColumnCount:SpanColumnCountOptions.all, splitColumnInsideGutter:'6pt', splitColumnOutsideGutter:0, strikeThroughColor:'Text Color', strikeThroughGapColor:'None', strikeThroughGapOverprint:false, strikeThroughGapTint:-1, strikeThroughOffset:-9999, strikeThroughOverprint:false, strikeThroughTint:-1, strikeThroughType:'Solid', strikeThroughWeight:-9999, strikeThru:false, strokeAlignment:TextStrokeAlign.outsideAlignment, strokeColor:'None', strokeTint:-1, strokeWeight:1, tabList:[], tracking:0, underline:false, underlineColor:'Text Color', underlineGapColor:'None', underlineGapOverprint:false, underlineGapTint:-1, underlineOffset:-9999, underlineOverprint:false, underlineTint:'-1', underlineType:'Solid', underlineWeight:-9999, verticalScale:100};
    trimExtras(doc.characterStyles.everyItem().getElements(), styles.join(',').replace(/call out.+/, '[None]').split(','));
    trimExtras(doc.paragraphStyles.everyItem().getElements(), styles.join(',').replace(/Bold10,Bold12,/, '[No Paragraph Style],[Basic Paragraph],').split(','));
    for (i = 0; i < styles.length; i++){
        if (i < 2){
            if (!doc.characterStyles.item(styles[i]).isValid){
                doc.characterStyles.add({name:styles[i]});
            }
        }
        else {
            if (doc.paragraphStyles.item(styles[i]).isValid){
                doc.paragraphStyles.item(styles[i]).name = i.toString();
                var tempStyle = doc.paragraphStyles.add({name:styles[i]});
                doc.paragraphStyles.item(i.toString()).remove(tempStyle);
            }
            else {
                doc.paragraphStyles.add({name:styles[i], basedOn:basic});
            }
        }
    }
    doc.characterStyles.item('Bold10').properties = {appliedFont:'ITC Bookman Std\tBold', pointSize:10, leading:Leading.auto};
    doc.characterStyles.item('Bold12').properties = {appliedFont:'ITC Bookman Std\tBold', pointSize:12, leading:Leading.auto};
    doc.paragraphStyles.item('call out').properties = {appliedFont:'Tekton Pro\tRegular', capitalization:Capitalization.allCaps, nextStyle:'[Same Style]', pointSize:8};
    doc.paragraphStyles.item('caption').properties = {appliedFont:'ITC Bookman Std\tLight Italic', keepWithNext:0, leading:'13pt', nextStyle:'[Same Style]', pointSize:10, tabList:[{position:'36pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'72pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'108pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'144pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'216pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'252pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'288pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'324pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'360pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'396pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'432pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'468pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'504pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'540pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'576pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'612pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'648pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'684pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'720pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('Draft Text').properties = {appliedFont:'ITC Bookman Std\tLight', capitalization:Capitalization.allCaps, fillColor:'Paper', justification:Justification.centerAlign, nextStyle:'[Same Style]', pointSize:72, strokeColor:'Draft Text', strokeWeight:0.25};
    doc.paragraphStyles.item('footer').properties = {appliedFont:'Helvetica LT Std\tLight Condensed', capitalization:Capitalization.allCaps, justification:Justification.centerAlign, keepAllLinesTogether:true, keepLinesTogether:true, nextStyle:'[Same Style]', pointSize:6};
    doc.paragraphStyles.item('full body').properties = {appliedFont:'ITC Bookman Std\tLight', keepAllLinesTogether:true, keepLinesTogether:true, leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('New Body'), spaceBefore:'13.55pt'};
    doc.paragraphStyles.item('Gutter Text').properties = {appliedFont:'Tekton Pro\tBold', capitalization:Capitalization.allCaps, fillColor:'Navy', nextStyle:'[Same Style]'};
    doc.paragraphStyles.item('Level 1 (18 pt)').properties = {appliedFont:'Helvetica LT Std\tBold Condensed', capitalization:Capitalization.allCaps, leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('SUGGESTED PROCEDURE'), pointSize:18};
    doc.paragraphStyles.item('Level 1 (24 pt)').properties = {appliedFont:'Helvetica LT Std\tBold Condensed', capitalization:Capitalization.allCaps, leading:'27pt', leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('SUGGESTED PROCEDURE'), pointSize:24};
    doc.paragraphStyles.item('Level 2').properties = {appliedFont:'Times LT Std\tBold', keepWithNext:1, nextStyle:doc.paragraphStyles.item('New Body'), pointSize:18, ruleBelow:true, ruleBelowLineWeight:0.25, ruleBelowOffset:'8.75pt', ruleBelowRightIndent:'180pt', spaceAfter:'9pt', spaceBefore:'27pt', tabList:[{position:'360pt', alignment:TabStopAlignment.rightAlign, leader:''}]};
    doc.paragraphStyles.item('Level 2 (Tools)').properties = {appliedFont:'Times LT Std\tBold', keepWithNext:1, nextStyle:doc.paragraphStyles.item('New Body'), pointSize:18, ruleBelow:true, ruleBelowLineWeight:0.25, ruleBelowOffset:'8.75pt', ruleBelowRightIndent:'180pt', spaceAfter:'22.5pt', spaceBefore:'22.5pt', tabList:[{position:'360pt', alignment:TabStopAlignment.rightAlign, leader:''}]};
    doc.paragraphStyles.item('Level 3').properties = {appliedFont:'ITC Bookman Std\tBold', keepAllLinesTogether:true, keepLinesTogether:true, keepWithNext:1, leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('New Body'), spaceBefore:'31.55pt'};
    doc.paragraphStyles.item('Level 4').properties = {appliedFont:'ITC Bookman Std\tBold Italic', keepAllLinesTogether:true, keepLinesTogether:true, keepWithNext:1, leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('New Body'), spaceBefore:'31.55pt'};
    doc.paragraphStyles.item('Level 5').properties = {appliedFont:'Tekton Pro\tBold Oblique', keepAllLinesTogether:true, keepLinesTogether:true, keepWithNext:1, leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('New Body'), pointSize:14, spaceBefore:'31.55pt'};
    doc.paragraphStyles.item('New Body').properties = {appliedFont:'ITC Bookman Std\tLight', firstLineIndent:'-29.25pt', keepAllLinesTogether:true, keepLinesTogether:true, leftIndent:'155.25pt', nextStyle:'[Same Style]', spaceBefore:'13.55pt', tabList:[{position:'155.25pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'479.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('Normal').properties = {appliedFont:'ITC Bookman Std\tLight', leftIndent:'126pt', nextStyle:'[Same Style]'};
    doc.paragraphStyles.item('Note').properties = {appliedFont:'ITC Bookman Std\tLight', keepAllLinesTogether:true, keepLinesTogether:true, leftIndent:'162pt', nextStyle:doc.paragraphStyles.item('New Body'), spaceBefore:'13.55pt'};
    doc.paragraphStyles.item('Note Bullets').properties = {appliedFont:'ITC Bookman Std\tLight', firstLineIndent:'-18pt', keepAllLinesTogether:true, keepLinesTogether:true, leftIndent:'180pt', nextStyle:'[Same Style]', spaceBefore:'13.55pt', tabList:[{position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('Page No.').properties = {appliedFont:'ITC Bookman Std\tLight', justification:Justification.awayFromBindingSide, leading:'13pt', nextStyle:'[Same Style]', tabList:[{position:'36pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'72pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'108pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'144pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'216pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'252pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'288pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'324pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'360pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'396pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'432pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'468pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'504pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'540pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'576pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'612pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'648pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'684pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'720pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('Procedure Designator').properties = {appliedFont:'ITC Bookman Std\tLight', capitalization:Capitalization.allCaps, justification:Justification.centerAlign, leading:'13pt', nextStyle:noStyle, pointSize:10, tabList:[{position:'36pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'72pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'108pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'144pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'180pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'216pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'252pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'288pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'324pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'360pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'396pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'432pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'468pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'504pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'540pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'576pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'612pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'648pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'684pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'720pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('RUNNING THE').properties = {appliedFont:'ITC Bookman Std\tLight', capitalization:Capitalization.allCaps, leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('Level 1 (18 pt)'), spaceBefore:18};
    doc.paragraphStyles.item('sub body').properties = {appliedFont:'ITC Bookman Std\tLight', firstLineIndent:'-18pt', keepAllLinesTogether:true, keepLinesTogether:true, leftIndent:'173.5pt', nextStyle:'[Same Style]', spaceBefore:'13.55pt', tabList:[{position:'173.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('SUGGESTED PROCEDURE').properties = {appliedFont:'Helvetica LT Std\tLight Condensed', capitalization:Capitalization.allCaps, leftIndent:'126pt', nextStyle:doc.paragraphStyles.item('New Body'), pointSize:6, ruleBelow:true, ruleBelowLineWeight:0.25, ruleBelowOffset:'9pt', spaceAfter:'13.5pt', spaceBefore:'7.848pt'};
    doc.paragraphStyles.item('TOC').properties = {appliedFont:'Times LT Std\tBold', keepWithNext:1, nextStyle:noStyle, pointSize:18, ruleBelow:true, ruleBelowLineWeight:0.25, ruleBelowOffset:'8.75pt', ruleBelowRightIndent:'180pt', spaceAfter:'18pt', spaceBefore:'27pt', tabList:[{position:'360pt', alignment:TabStopAlignment.rightAlign, leader:''}]};
    doc.paragraphStyles.item('TOC Level 2').properties = {appliedFont:'ITC Bookman Std\tBold', keepWithNext:1, leading:'18pt', leftIndent:'126pt', maximumWordSpacing:150, minimumWordSpacing:75, nextStyle:noStyle, ruleBelowLineWeight:0.25, ruleBelowOffset:'8.75pt', ruleBelowRightIndent:'180pt', spaceAfter:'13.55pt', spaceBefore:'18pt', tabList:[{position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]};
    doc.paragraphStyles.item('TOC Level 2 (Tools)').properties = {appliedFont:'ITC Bookman Std\tBold', leading:'18pt', leftIndent:'126pt', maximumWordSpacing:150, minimumWordSpacing:75, nextStyle:doc.paragraphStyles.item('Level 2'), ruleBelowLineWeight:0.25, ruleBelowOffset:'8.75pt', ruleBelowRightIndent:'180pt', spaceBefore:'18pt', tabList:[{position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]};
    doc.paragraphStyles.item('TOC Level 3').properties = {appliedFont:'ITC Bookman Std\tLight', firstLineIndent:'-15.75pt', hyphenation:false, leftIndent:'141.75pt', maximumWordSpacing:150, minimumWordSpacing:75, nextStyle:noStyle, rightIndent:'18pt', spaceBefore:'4.45pt', tabList:[{position:'141.75pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]};
    doc.paragraphStyles.item('TOC Level 4').properties = {appliedFont:'ITC Bookman Std\tLight', firstLineIndent:'-15.75pt', hyphenation:false, leftIndent:'141.75pt', maximumWordSpacing:150, minimumWordSpacing:75, nextStyle:noStyle, rightIndent:'18pt', spaceBefore:'4.45pt', tabList:[{position:'141.75pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}]};
    doc.paragraphStyles.item('TOC Level 5').properties = {appliedFont:'ITC Bookman Std\tLight', firstLineIndent:'-15.75pt', hyphenation:false, leftIndent:'173.3pt', maximumWordSpacing:150, minimumWordSpacing:75, nextStyle:'[Same Style]', rightIndent:'18pt', spaceBefore:'4.45pt', tabList:[{position:'141.75pt', alignment:TabStopAlignment.leftAlign, leader:'.'}, {position:'468pt', alignment:TabStopAlignment.characterAlign, leader:'_'}, {position:'486pt', alignment:TabStopAlignment.rightAlign, leader:'.'}]};
    doc.paragraphStyles.item('TOC Parts List').properties = {appliedFont:'ITC Bookman Std\tLight', firstLineIndent:'-105.1pt', hyphenation:false, leftIndent:'231.75pt', maximumWordSpacing:150, minimumWordSpacing:75, nextStyle:'[Same Style]', tabList:[{position:'159.75pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'231.75pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('Tool List').properties = {appliedFont:'ITC Bookman Std\tLight', autoLeading:125, firstLineIndent:'-29.25pt', keepAllLinesTogether:true, keepLinesTogether:true, leftIndent:'155.25pt', nextStyle:'[Same Style]', tabList:[{position:'155.25pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'479.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('Tool List 2').properties = {appliedFont:'ITC Bookman Std\tLight', autoLeading:125, firstLineIndent:'-20.3pt', keepAllLinesTogether:true, keepLinesTogether:true, leftIndent:'175.55pt', nextStyle:'[Same Style]', tabList:[{position:'175.5pt', alignment:TabStopAlignment.leftAlign, leader:''}, {position:'479.25pt', alignment:TabStopAlignment.leftAlign, leader:''}]};
    doc.paragraphStyles.item('caption').nestedStyles.add({appliedCharacterStyle:doc.characterStyles.item('Bold10'), delimiter:'.', inclusive:true, repetition:1});
    doc.paragraphStyles.item('Note').nestedStyles.add({appliedCharacterStyle:doc.characterStyles.item('Bold12'), delimiter:':', inclusive:true, repetition:1});
    app.menus.item('Paragraph Style Panel Menu').menuItems.item('Sort by Name').associatedMenuAction.invoke();
    //    GUIDES
    doc.guidePreferences.guidesLocked = false;
    doc.guides.everyItem().remove();
    for (i = 0; i < verticalGuides.length; i++){
        masterDoc.guides.add(doc.layers.item('Master Default'), {orientation:HorizontalOrVertical.vertical, location:uVal(verticalGuides[i], 'pt')});
    }
    for (i = 0; i < horizontalGuides.length; i++){
        masterDoc.guides.add(doc.layers.item('Master Default'), {orientation:HorizontalOrVertical.horizontal, location:uVal(horizontalGuides[i], 'pt')});
    }
    doc.guidePreferences.guidesLocked = true;
    //    LOGOS
    if (File.fs == 'Macintosh' && File('/Volumes/share/SERVICE/TWD/DQ Logo.ai').exists){
        var logo = File('/share/SERVICE/TWD/DQ Logo.ai');
    }
    else if (File.fs == 'Macintosh' && File('/Volumes/share/SERVICE/Writing Department Art Work/*Sam\'s Club Art/DQ Logo')){
        var logo = File('/share/SERVICE/Writing Department Art Work/*Sam\'s Club Art/DQ Logo');
    }
    else if (File.fs == 'Windows' && File('/n/share/SERVICE/TWD/DQ Logo.ai').exists){
        var logo = File('/n/share/SERVICE/TWD/DQ Logo.ai');
    }
    else if (File.fs == 'Windows' && File('/n/share/SERVICE/Writing Department Art Work/' + String.fromCharCode(61473) + 'Sam\'s Club Art/DQ Logo').exists){
        var logo = File('/n/share/SERVICE/Writing Department Art Work/' + String.fromCharCode(61473) + 'Sam\'s Club Art/DQ Logo');
    }
    if (logo == undefined){
        logo = File.openDialog('Select the desired logo graphic file');
        if (logo = null){
            return;
        }
    }
    for (i = masterDoc.allGraphics.length - 1; i >= 0; i--){
        masterDoc.allGraphics[i].parent.remove();
    }
    app.activeWindow.transformReferencePoint = AnchorPoint.topLeftAnchor;
    var logoLeft = masterDoc.place(logo, [uVal(54, 'pt'), doc.marginPreferences.top], doc.layers.item('Master Default'), {horizontalScale:50, verticalScale:50});
    logoLeft[0].parent.fit(FitOptions.frameToContent);
    logoLeft[0].parent.duplicate(undefined, [uVal(630, 'pt'), 0]);
    //    FOOTERS
    for (i = 0; i < masterDoc.textFrames.length; i++){
        var frame = masterDoc.textFrames[i];
        if ((/system/i).test(frame.contents)){
            var sysText = frame.paragraphs.everyItem().contents;
        }
        else if (frame.paragraphs.length > 1 && (/\d{6}/).test(frame.paragraphs[1].contents)){
            var revText = frame.contents;
        }
    }
    masterDoc.textFrames.everyItem().remove();
    var pageL = masterDoc.textFrames.add({itemLayer:'Master Default', geometricBounds:[uVal(756.5, 'pt'), uVal(54, 'pt'), uVal(769.5, 'pt'), uVal(130.5, 'pt')], strokeColor:'None', contents:'Page '});
        pageL.parentStory.insertionPoints[-1].contents = SpecialCharacters.autoPageNumber;
        pageL.parentStory.appliedParagraphStyle = 'Page No.';
        pageL.parentStory.justification = Justification.awayFromBindingSide;
    var sysL = masterDoc.textFrames.add({itemLayer:'Master Default', geometricBounds:[uVal((769.5 - (7.2 * sysText.length)), 'pt'), uVal(243, 'pt'), uVal(769.5, 'pt'), uVal(369, 'pt')], strokeColor:'None', contents:sysText.join('')});
        sysL.parentStory.appliedParagraphStyle = 'footer';
    var revL = masterDoc.textFrames.add({itemLayer:'Master Default', geometricBounds:[uVal(755.1, 'pt'), uVal(432, 'pt'), uVal(769.5, 'pt'), uVal(540, 'pt')], fillColor:'None', strokeColor:'None', contents:revText});
        revL.parentStory.appliedParagraphStyle = 'footer';
        revL.parentStory.justification = Justification.toBindingSide;
        pageL.parentStory.appliedCharacterStyle = sysL.parentStory.appliedCharacterStyle = revL.parentStory.appliedCharacterStyle = doc.characterStyles.item('[None]');
        pageL.duplicate(undefined, [uVal(1039.5, 'pt'), 0]);
        sysL.duplicate(undefined, [uVal(612, 'pt'), 0]);
        revL.duplicate(undefined, [uVal(252, 'pt'), 0]);
    //    MasterLines
    for (i = 0; i < masterDoc.graphicLines.length; i++){
        var line = masterDoc.graphicLines[i];
        if (line.geometricBounds[0] == line.geometricBounds[2] && line.geometricBounds[3] - line.geometricBounds[1] == uVal(486, 'pt')){
            line.geometricBounds[0] = line.geometricBounds[2] = uVal(738, 'pt');
        }
    }
}

function fixFrames(){
    for (f = 0; f < mainFrames.length; f++){
        var mainFrame = mainFrames[f];
        var mainPage = mainFrame.parentPage;
        mainFrame.convertShape(ConvertShapeOptions.convertToRectangle);
        if (mainPage.name == '1'){
            var y1 = uVal(67.5, 'pt');
            var x1 = mainPage.marginPreferences.left;
        }
        else if (mainFrame.paragraphs[0].appliedParagraphStyle.name == 'Level 2'){
            var y1 = uVal(130.5, 'pt');
        }
        else {
            var y1 = uVal(76.8, 'pt');
        }
        var numLines = mainFrame.lines.length;
        var n = mainFrame.characters[-1].baseline;
        var limits = horizontalGuides.slice(0, horizontalGuides.length-1);
        limits.push(738);
        for (i = 0; i < limits.length; i++){
            var lowGuide = uVal(limits[i], 'pt');
            var hiGuide = uVal(limits[i+1], 'pt');
            if (lowGuide <= n && n <= hiGuide){
                mainFrame.geometricBounds[2] = hiGuide;
                if (mainFrame.lines.length !== numLines){
                    var y2 = n;
                    break;
                }
                else {
                    var y2 = hiGuide;
                    break;
                }
            }
        }
        if (mainPage.label == 'EVEN'){
            var x1 = mainPage.marginPreferences.right;
        }
        else if (mainPage.name !== '1' && mainPage.label == 'ODD'){
            var x1 = mainPage.bounds[1] + mainPage.marginPreferences.left;
        }
        var x2 = x1 + uVal(486, 'pt');
        mainFrame.geometricBounds = [y1, x1, y2, x2];
    }
}

function cleanText(){
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    app.findChangeGrepOptions.includeLockedStoriesForFind = true;
    app.findGrepPreferences.findWhat = '~b~b+';
    app.changeGrepPreferences.changeTo = '\r';
    doc.changeGrep();
    app.findGrepPreferences.findWhat = '[~m~>~f~|~S~s~<~/~.~3~4~% ]{2,}';
    app.changeGrepPreferences.changeTo = ' ';
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
}

function noteBoxes(){
    clearBoxes();
    app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = app.findTextPreferences = app.changeTextPreferences = app.findChangeTextOptions = NothingEnum.nothing;
    app.findGrepPreferences.properties = {findWhat:'^[^\r]+(\r|$)', appliedParagraphStyle:'Note'};
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
                var notePara = mainStory.characters.itemByRange(0, note.characters.firstItem().index).paragraphs.length;
                var bulletPara = mainStory.characters.itemByRange(0, bulletList[z].characters.firstItem().index).paragraphs.length;
                if (bulletPara - notePara == 1){
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

function uVal(num, unit){
    return UnitValue(num, unit).as(docUnits);
}
function trimExtras(theObjects, theArray){
    var flag;
    for (x = theObjects.length - 1; x >= 0; x--){
        for (y = 0; y < theArray.length; y++){
            if (theObjects[x].name == theArray[y]){
                flag = true;
                break;
            }
            flag = false;
        }
        if (flag == false){
            theObjects[x].remove();
        }
    }
}
function tryCatch(obj){
    if (doc[obj.type].item(obj.name).isValid){
        for (prop in obj){
            if (!(/type|name|constructor|prototype|reflect/).test(prop)){
                doc[obj.type].item(obj.name)[prop] = obj[prop];
            }
        }
    }
    else {
        doc[obj.type].add({name:obj.name});
        for (prop in obj){
            if (!(/type|name|constructor|prototype|reflect/).test(prop)){
                doc[obj.type].item(obj.name)[prop] = obj[prop];
            }
        }
    }
}
function clearBoxes(){
    var boxes = doc.layers.item('Default').splineItems.everyItem().getElements();
    for (i = 0; i < boxes.length; i++){
        if (boxes[i].hasOwnProperty('fillColor') && boxes[i].fillColor.name == 'Black'){
            boxes[i].remove();
        }
    }
}
function checkFormat(word){
    if ((/^n/i).test(word.contents)){
        word.properties = {appliedFont:'ITC Bookman Std', contents:'Note:', fillColor:doc.swatches.item('Forest Green'), fontStyle:'Bold'};
    }
    else if ((/^c/i).test(word.contents)){
        word.properties = {appliedFont:'ITC Bookman Std', capitalization:Capitalization.allCaps, contents:'CAUTION:', fillColor:doc.swatches.item('Yellow Orange'), fontStyle:'Bold'};
    }
    else if ((/^w/i).test(word.contents)){
        word.properties = {appliedFont:'ITC Bookman Std', capitalization:Capitalization.allCaps, contents:'WARNING:', fillColor:doc.swatches.item('Red'), fontStyle:'Bold'};
    }
}
function contains(theItem, theArray){
    for (z = 0; z < theArray.length; z++){
        var arrayItem = theArray[z];
        if (theItem == arrayItem){
            return true;
        } 
    }
    return false;
}
