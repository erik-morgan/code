#target indesign
var isMac, allFrames, mainStory, lockedID, lockBoxes, tempFunc, wrapTF, wrapMode;
isMac = (File.fs == "Macintosh") ? true : false;
var checkboxList = ["checkGuides", "checkLogos", "checkFooters", "checkFrames", "checkColors", "checkBoxes", "checkStyles", "checkNotes", "checkClean", "checkRev"];
var runArray = new Array(checkboxList.length);
var doc = app.activeDocument, masterDoc = doc.masterSpreads.firstItem();
allFrames = doc.textFrames.everyItem().getElements();
app.textWrapPreferences.textWrapMode = doc.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
app.findGrepPreferences = app.changeGrepPreferences = app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
//app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
//app.findGrepPreferences.properties = app.findTextPreferences.properties = {findWhat:NothingEnum.nothing, appliedParagraphStyle:NothingEnum.nothing};
doc.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
doc.marginPreferences.properties = {top:"54pt", left:"54pt", bottom:"54pt", right:"72pt"};
for (s = 0; s < doc.stories.length; s++){
    if (doc.stories[s].textContainers.length > 1){
        mainStory = doc.stories[s];
        break;
    }
}

var w = new Window("dialog", "Writer's Toolbox", undefined);
    var p = w.add("panel", undefined, undefined, {borderStyle:"etched"});
        p.alignChildren = "left";
        var gAll = p.add("group");
            var checkAll = gAll.add("checkbox", undefined, "Select All");
                checkAll.alignment = ["fill", ""];
                    checkAll.onClick = function () {
                        checkGuides.value = checkLogos.value = checkFooters.value = checkFrames.value = checkColors.value = checkBoxes.value = checkStyles.value = checkNotes.value = checkClean.value = checkRev.value = checkAll.value;
                        bRun.enabled = canRun();
                    }
        var gGuides = p.add("group");
            var checkGuides = gGuides.add("checkbox", undefined, "FixGuides:");
                checkGuides.preferredSize = [100, 18];
                checkGuides.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelGuides = gGuides.add("staticText {text:'Removes all guides from the document, & inserts the correct guides on the master spread only.'}");
        var gLogos = p.add("group");
            var checkLogos = gLogos.add("checkbox", undefined, "FixLogos:");
                checkLogos.preferredSize = [100, 18];
                checkLogos.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelLogos = gLogos.add("staticText {text:'Removes all master spread graphics, & places the logo files at the correct location at the proper scale.'}");
        var gFooters = p.add("group");
            var checkFooters = gFooters.add("checkbox", undefined, "AlignFooters:");
                checkFooters.preferredSize = [100, 18];
                checkFooters.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelFooters = gFooters.add("staticText {text:'Recreates the master spread footers with consistent sizing & alignment. (will NOT affect footer contents)'}");
        var gFrames = p.add("group");
            var checkFrames = gFrames.add("checkbox", undefined, "FixFrames:");
                checkFrames.preferredSize = [100, 18];
                checkFrames.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelFrames = gFrames.add("staticText {text:'Straightens all crooked text frames, checks all main story frames for proper placement, & corrects their positioning if necessary. (bypasses locked frames)'}");
        var gColors = p.add("group");
            var checkColors = gColors.add("checkbox", undefined, "ResetColors:");
                checkColors.preferredSize = [100, 18];
                checkColors.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelColors = gColors.add("staticText {text:'Sets the swatches to their correct values, removes all extraneous swatches, & creates any missing ones.'}");
        var gBoxes = p.add("group");
            var checkBoxes = gBoxes.add("checkbox", undefined, "ClearBoxes:");
                checkBoxes.preferredSize = [100, 18];
                checkBoxes.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelBoxes = gBoxes.add("staticText {text:'Clears the gray note boxes from the entire document. (bypasses locked boxes)'}");
        var gStyles = p.add("group");
            var checkStyles = gStyles.add("checkbox", undefined, "ResetStyles:");
                checkStyles.preferredSize = [100, 18];
                checkStyles.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelStyles = gStyles.add("staticText {text:'Sets the paragraph styles to their correct settings, removes all extraneous styles, & creates any missing ones.'}");
        var gNotes = p.add("group");
            var checkNotes = gNotes.add("checkbox", undefined, "NoteBoxes:");
                checkNotes.preferredSize = [100, 18];
                checkNotes.onClick = function () {
                    if (checkNotes.value == true)
                        checkBoxes.value = checkColors.value = checkNotes.value;
                    bRun.enabled = canRun();
                }
            var labelNotes = gNotes.add("staticText {text:'Finds all notes, checks their formatting/color, & creates a box behind each one. (bypasses locked frames, works with Note Bullets, & runs ClearBoxes/ResetColors by default)'}");
        var gClean = p.add("group");
            var checkClean = gClean.add("checkbox", undefined, "Cle&oc:");
                checkClean.preferredSize = [100, 18];
                checkClean.onClick = function () {
                        bRun.enabled = canRun();
                }
            var labelClean = gClean.add("staticText {text:'Removes multiple returns/spaces & trailing whitespace, corrects curly quotes, capitalizes/bolds figures, & fixes group text wrap (bypasses locked frames, & does not apply to master pages)'}");
        var gRev = p.add("group");
            var checkRev = gRev.add("checkbox", undefined, "NoteBoxes:");
                checkRev.preferredSize = [100, 18];
                checkRev.onClick = function () {
                    bRun.enabled = canRun();
                }
            var labelRev = gRev.add("staticText {text:'Increments the revision number & ammends the date in the footers, & saves the file in the same location with an incremented revision number in the file name.'}");
/*    var g = w.add("group");
        g.alignment = ["fill", "fill"];
        var pScript = g.add("panel", undefined, undefined, {borderStyle:'etched'});
            var gScript = pScript.add("group");
                gScript.alignment = ["fill", "fill"];
                var labelScript = gScript.add("staticText", undefined, "Create a new script from the selected functions. This creates a separate file, allowing it to be run without this interface. Scripts can even be assigned to shortcut keys!", {multiline:true});
                    labelScript.alignment = ["left", "center"];
                    labelScript.characters = 75;
                var buttonScript = gScript.add("button {text:'Create', enabled:false, helpTip:'Create a new script from the selected functions.'}");
                    buttonScript.alignment = ["right", "center"];
*/
    var gExecute = w.add("group");
        gExecute.alignment = ["fill", "fill"];
        var pBackup = gExecute.add("panel", undefined, undefined, {borderStyle:'etched'});
            pBackup.alignment = ["fill", "fill"];
            pBackup.alignChildren = ["left", "center"];
            pBackup.spacing = 0;
            var checkBackup = pBackup.add("checkbox", undefined, "Backup Active Document");
            var gFile = pBackup.add("group");
                gFile.alignment = ["fill", "fill"];
                var labelFile = gFile.add("staticText", undefined, "Filename:");
                    labelFile.preferredSize = [58, -1];
                var editFile = gFile.add("editText", undefined, "FILE NAME.INDD", {borderless:true});
                    editFile.characters = 90;
            var gPath = pBackup.add("group");
                gPath.alignment = ["fill", "fill"];
                var labelPath = gPath.add("staticText", undefined, "Location:");
                    labelPath.preferredSize = [58, -1];
                var editPath = gPath.add("editText", undefined, "FILE PATH TO MY DOCUMENTS", {borderless:true});
                    editPath.characters = 90;
                var bPath = gPath.add("button {text:'Browse', enabled:true, helpTip:'Browse to a different folder'}");
                    bPath.preferredSize = [-1, 18];
        var gButtons = gExecute.add("group");
            gButtons.orientation = "column";
            gButtons.alignment = ["fill", "fill"];
            gButtons.margins = gButtons.spacing = 0;
            var bRun = gButtons.add("button {text:'Run', enabled:false, helpTip:'Runs the selected functions.'}");
                bRun.alignment = ["fill", "fill"];
                bRun.onClick = function () {
                    for (var f = 0; f < checkboxList.length; f++){
                        if (eval(checkboxList[f]).value == true)
                            runArray[f] = true;
                        else
                            runArray[f] = false;
                    }
                    w.close();
                }
            var bCancel = gButtons.add("button {text:'Cancel', name:'cancel', enabled:true, helpTip:'Cancel the script.'}");
                bCancel.alignment = ["fill", "fill"];
w.show();

for (r = 0; r < runArray.length; r++){
    if (runArray[r] == true)
        switch (r){
            case 0:
                fixGuides();
                break;
            case 1:
                fixLogos();
                break;
            case 2:
                alignFooters();
                break;
            case 3:
                fixFrames();
                break;
            case 4:
                resetColors();
                break;
            case 5:
                clearBoxes();
                break;
            case 6:
                resetStyles();
                break;
            case 7:
                noteBoxes();
                break;
            case 8:
                cleanDoc();
                break;
            case 9:
                addRev();
                break;
        }
}

function fixGuides(){
    doc.guidePreferences.guidesLocked = false;
    doc.guides.everyItem().remove();
    var verticalGuides = ["54pt", "162pt", "180pt", "209.55pt", "306pt", "360pt", "540pt", "684pt", "792pt", "810pt", "839.8pt", "918pt", "990pt", "1170pt"];
    var horizontalGuides = ["67.5pt", "76.8pt", "130.5pt", "144pt", "180pt", "216pt", "252pt", "288pt", "324pt", "360pt", "396pt", "432pt", "468pt", "504pt", "540pt", "576pt", "612pt", "648pt", "684pt", "720pt", "769.5pt"];
    for (g = 0; g < (verticalGuides.length + horizontalGuides.length); g++){
        if (g < verticalGuides.length){
            masterDoc.guides.add({layer:"Master Default", orientation:HorizontalOrVertical.vertical, location:verticalGuides[g]});
        }
        else {
            masterDoc.guides.add({layer:"Master Default", orientation:HorizontalOrVertical.horizontal, location:horizontalGuides[g - verticalGuides.length]});
        }
    }
    doc.guidePreferences.guidesLocked = true;
}

function fixLogos(){
    var staticPath = "/SERVICE/TWD/DQ Logo.ai", staticAlt = "/SERVICE/Writing Department Art Work/*Sam's Club Art/DQ Logo";
    for (mg = masterDoc.allGraphics.length - 1; mg >= 0; mg--){
        masterDoc.allGraphics[mg].parent.remove();
    }
    if (isMac)
        var logoPath = new File(netShare_OSX());
    else
        var logoPath = new File(netShare_WIN());
    var dqLeft = masterDoc.place(logoPath, ["54pt", doc.marginPreferences.top], "Master Default", false);
    dqLeft[0].resize(CoordinateSpaces.innerCoordinates, AnchorPoint.topLeftAnchor, ResizeMethods.multiplyingCurrentDimensionsBy, [0.5, 0.5]);
    dqLeft[0].parent.fit(FitOptions.frameToContent);
    var dqRight = masterDoc.place(logoPath, ["684pt", doc.marginPreferences.top], "Master Default", false);
    dqRight[0].resize(CoordinateSpaces.innerCoordinates, AnchorPoint.topLeftAnchor, ResizeMethods.multiplyingCurrentDimensionsBy, [0.5, 0.5]);
    dqRight[0].parent.fit(FitOptions.frameToContent);
    function netShare_WIN(){
        var winAlt = File("//n/share" + staticAlt);
        if (File("//n/share" + staticPath).exists)
            return File("//n/share" + staticPath);
        else if (winAlt.replace("*", String.fromCharCode(61473)).exists){
            return winAlt.replace("*", String.fromCharCode(61473));
        }
    }            
    function netShare_OSX(){
        var volumes = Folder("/Volumes/").getFiles();
        for (o = 0; o < volumes.length; o++){
            if (volumes[o].name.toLowerCase() == "share"){
                if (File("/Volumes/" + volumes[o].name + staticPath).exists)
                    return File("/Volumes/" + volumes[o].name + staticPath);
                else if (File("/Volumes/" + volumes[o].name + staticAlt).exists)
                    return File("/Volumes/" + volumes[o].name + staticAlt);
            }
            else if (volumes[o].name.toLowerCase() == "macvol"){
                if (File("/Volumes/" + volumes[o].name + "/share" + staticPath).exists)
                    return File("/Volumes/" + volumes[o].name + "/share" + staticPath)
                else if (File("/Volumes/" + volumes[o].name + "/share" + staticAlt).exists)
                    return File("/Volumes/" + volumes[o].name + "/share" + staticAlt).exists;
            }
        }
    }
}

function alignFooters(){
    var mFrames = masterDoc.textFrames.everyItem().getElements();
    for (m = 0; m < mFrames.length; m++){
        if (mFrames[m].contents.indexOf("SYSTEM") >= 0){
            var sysText = mFrames[m].contents;
            if (mFrames[m].paragraphs.length > 1)
                var sysHeight = "755.1pt";
            else
                var sysHeight = "762.3pt";
            mFrames[m].remove();
        }
        else if (mFrames[m].contents.indexOf("Page") == -1 && mFrames[m].parentStory.fillColor.name == "Black"){
            var revText = mFrames[m].contents;
            mFrames[m].remove();
        }
        else if (mFrames[m].contents.indexOf("Page") >= 0){
            mFrames[m].remove();
        }
    }
    var pageL = masterDoc.textFrames.add("Master Default", {geometricBounds:["756.5pt", "54pt", "769.5pt", "130.5pt"], strokeColor:"None", contents:"Page "});
        pageL.parentStory.insertionPoints[-1].contents = SpecialCharacters.autoPageNumber;
        pageL.parentStory.appliedCharacterStyle = doc.characterStyles[0];
        pageL.parentStory.appliedParagraphStyle = doc.paragraphStyles.item("Page No.");
    var pageR = pageL.duplicate(undefined, ["1039.5pt", "0pt"]);
    var sysL = masterDoc.textFrames.add("Master Default", {geometricBounds:[sysHeight, "243pt", "769.5pt", "369pt"], strokeColor:"None", contents:sysText});
        sysL.parentStory.appliedCharacterStyle = doc.characterStyles[0];
        sysL.parentStory.appliedParagraphStyle = doc.paragraphStyles.item("footer");
    var sysR = sysL.duplicate(undefined, ["612pt", "0pt"]);
    var revL = masterDoc.textFrames.add("Master Default", {geometricBounds:["755.1pt", "432pt", "769.5pt", "540pt"], fillColor:"None", strokeColor:"None", contents:revText});
        revL.parentStory.appliedCharacterStyle = doc.characterStyles[0];
        revL.parentStory.appliedParagraphStyle = doc.paragraphStyles.item("footer");
        revL.parentStory.justification = Justification.toBindingSide;
    var revR = revL.duplicate(undefined, ["252pt", "0pt"]);
}

function fixFrames(){
//    unlockFrames();
    for (tf = 0; tf < allFrames.length; tf++){
        allFrames[tf].convertShape(ConvertShapeOptions.convertToRectangle);
    }
    var tFrames = mainStory.textContainers;
    for (t = 0; t < tFrames.length; t++){
        var tFrame = tFrames[t];
        if (tFrame.parentPage.name == "1")
            var y1 = "67.5pt";
        else if (tFrame.paragraphs[0].appliedParagraphStyle.name == "Level 2")
            var y1 = "130.5pt";
        else
            var y1 = "76.8pt";
        if (doc.documentPreferences.facingPages){
            if (tFrame.parentPage.name%2 == 0){
                tFrame.geometricBounds = [y1, (tFrame.parentPage.bounds[1] + tFrame.parentPage.marginPreferences.right), tFrame.geometricBounds[2], (tFrame.parentPage.bounds[3] - tFrame.parentPage.marginPreferences.left)];
            }
            else {
                tFrame.geometricBounds = [y1, (tFrame.parentPage.bounds[1] + tFrame.parentPage.marginPreferences.left), tFrame.geometricBounds[2], (tFrame.parentPage.bounds[3] - tFrame.parentPage.marginPreferences.right)];
            }
        }
        else {
            tFrame.geometricBounds = [y1, (tFrame.parentPage.bounds[1] + tFrame.parentPage.marginPreferences.left), tFrame.geometricBounds[2], (tFrame.parentPage.bounds[3] - tFrame.parentPage.marginPreferences.right)];
        }
    }
//    relockFrames();
}

function resetColors(){
    var allSwatches = doc.swatches.everyItem().getElements();
    var swatchList = ["None", "Paper", "Black", "Registration", "Draft Text", "Forest Green", "Navy", "Purple", "Red", "Yellow Orange"];
    if (doc.colors.itemByName("Draft Text").isValid)
        doc.colors.itemByName("Draft Text").properties = {space:ColorSpace.CMYK, colorValue:[0, 0, 0, 15], name:"Draft Text"};
    else
        doc.colors.add({space:ColorSpace.CMYK, colorValue:[0, 0, 0, 15], name:"Draft Text"});
    if (doc.colors.itemByName("Forest Green").isValid)
        doc.colors.itemByName("Forest Green").properties = {space:ColorSpace.RGB, colorValue:[0, 94, 0], name:"Forest Green"};
    else
        doc.colors.add({space:ColorSpace.RGB, colorValue:[0, 94, 0], name:"Forest Green"});
    if (doc.colors.itemByName("Navy").isValid)
        doc.colors.itemByName("Navy").properties = {space:ColorSpace.RGB, colorValue:[0, 0, 255], name:"Navy"};
    else
        doc.colors.add({space:ColorSpace.RGB, colorValue:[0, 0, 255], name:"Navy"});
    if (doc.colors.itemByName("Purple").isValid)
        doc.colors.itemByName("Purple").properties = {space:ColorSpace.RGB, colorValue:[128, 12, 125], name:"Purple"};
    else
        doc.colors.add({space:ColorSpace.RGB, colorValue:[128, 12, 125], name:"Purple"});
    if (doc.colors.itemByName("Red").isValid)
        doc.colors.itemByName("Red").properties = {space:ColorSpace.RGB, colorValue:[224, 0, 0], name:"Red"};
    else
        doc.colors.add({space:ColorSpace.RGB, colorValue:[224, 0, 0], name:"Red"});
    if (doc.colors.itemByName("Yellow Orange").isValid)
        doc.colors.itemByName("Yellow Orange").properties = {space:ColorSpace.RGB, colorValue:[255, 166, 0], name:"Yellow Orange"};
    else
        doc.colors.add({space:ColorSpace.RGB, colorValue:[255, 166, 0], name:"Yellow Orange"});
    for (c = 0; c < allSwatches.length; c++){
        if (contains(allSwatches[c].name, swatchList) == false){
            allSwatches[c].remove();
        }
    }
}

function clearBoxes(){
    var allBoxes = doc.rectangles.everyItem().getElements();
    for (b = 0; b < allBoxes.length; b++){
        if (allBoxes[b].fillColor == doc.colors.item("Black") && allBoxes[b].parentPage.name.match("\\d+")){
            if (allBoxes[b].locked)
                allBoxes[b].locked = false;
            allBoxes[b].remove();
        }
    }
}

function resetStyles(){
    try {doc.characterStyles.add({basedOn:"[None]", appliedFont:"ITC Bookman Std", fontStyle:"Bold", pointSize:"10pt", leading:Leading.auto, name:"Bold10"});}
    catch (e){doc.characterStyles.itemByName("Bold10").properties = {basedOn:"[None]", appliedFont:"ITC Bookman Std", fontStyle:"Bold", pointSize:"10pt", leading:Leading.auto, name:"Bold10"};}
    try {doc.characterStyles.add({basedOn:"[None]", appliedFont:"ITC Bookman Std", fontStyle:"Bold", pointSize:"12pt", leading:Leading.auto, name:"Bold12"});}
    catch (e){doc.characterStyles.itemByName("Bold12").properties = {basedOn:"[None]", appliedFont:"ITC Bookman Std", fontStyle:"Bold", pointSize:"12pt", leading:Leading.auto, name:"Bold12"};}
    var styles = ["call out", "caption", "Draft Text", "footer", "full body", "Gutter Text", "Level 1 (18 pt)", "Level 1 (24 pt)", "Level 2", "Level 2 (Tools)", "Level 3", "Level 4", "Level 5", "New Body", "Normal", "Note", "Note Bullets", "Page No.", "Procedure Designator", "RUNNING THE", "sub body", "SUGGESTED PROCEDURE", "TOC", "TOC Level 2", "TOC Level 2 (Tools)", "TOC Level 3", "TOC Level 4", "TOC Level 5", "TOC Parts List", "TOC title", "Tool List", "Tool List 2"];
    app.menuActions.itemByName("Sort by Name").invoke();
    var docStyles = doc.paragraphStyles.itemByRange(2, doc.paragraphStyles.length-1).getElements();
    for (var s = docStyles.length - 1; s > 0; s--){
        if (contains(docStyles[s].name, styles) == false)
            docStyles[s].remove();
    }
    for (var s = 0; s < styles.length; s++){
        if (contains(styles[s], doc.paragraphStyles.everyItem().name) == false)
            doc.paragraphStyles.add({name:styles[s]});
    }
    doc.paragraphStyles.itemByName("[Basic Paragraph]").properties = {alignToBaseline:false, appliedFont:"Minion Pro", appliedLanguage:"English: USA", autoLeading:120, balanceRaggedLines:BalanceLinesStyle.noBalancing, basedOn:"[No Paragraph Style]", baselineShift:"0pt", bulletsAlignment:ListAlignment.leftAlign, bulletsAndNumberingListType:ListType.noList, bulletsCharacterStyle:"[None]", bulletsTextAfter:"^t", capitalization:Capitalization.normal, characterAlignment:CharacterAlignment.alignEmCenter, composer:"Adobe Paragraph Composer", desiredGlyphScaling:100, desiredLetterSpacing:0, desiredWordSpacing:100, endJoin:OutlineJoin.miterEndJoin, fillColor:"Black", fillTint:-1, firstLineIndent:"0pt", fontStyle:"Regular", gridAlignFirstLineOnly:false, gridAlignment:GridAlignment.none, hyphenateAcrossColumns:true, hyphenateAfterFirst:2, hyphenateBeforeLast:2, hyphenateCapitalizedWords:true, hyphenateLadderLimit:3, hyphenateLastWord:true, hyphenateWordsLongerThan:5, hyphenation:true, hyphenationZone:"36pt", hyphenWeight:5, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:2, keepLastLines:2, keepLinesTogether:false, keepRuleAboveInFrame:false, keepWithNext:0, keepWithPrevious:false, lastLineIndent:"0pt", leading:Leading.auto, leadingModel:LeadingModel.leadingModelAkiBelow, leftIndent:"0pt", ligatures:true, maximumLetterSpacing:0, maximumWordSpacing:133, minimumLetterSpacing:0, minimumWordSpacing:80, nextStyle:"[Basic Paragraph]", noBreak:false, numberingAlignment:ListAlignment.leftAlign, numberingCharacterStyle:"[None]", numberingContinue:true, numberingExpression:"^#.^t", numberingFormat:NumberingStyle.arabic, numberingLevel:1, numberingStartAt:1, overprintFill:false, overprintStroke:false, paragraphJustification:ParagraphJustificationOptions.defaultJustification, pointSize:"12pt", rightIndent:"0pt", ruleAbove:false, ruleAboveColor:"Text Color", ruleAboveGapColor:"None", ruleAboveGapOverprint:false, ruleAboveGapTint:-1, ruleAboveLeftIndent:"0pt", ruleAboveLineWeight:"1pt", ruleAboveOffset:"0pt", ruleAboveOverprint:false, ruleAboveRightIndent:"0pt", ruleAboveTint:-1, ruleAboveType:"Solid", ruleAboveWidth:RuleWidth.columnWidth, ruleBelow:false, ruleBelowColor:"Text Color", ruleBelowGapColor:"None", ruleBelowGapOverprint:false, ruleBelowGapTint:-1, ruleBelowLeftIndent:"0pt", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowOverprint:false, ruleBelowRightIndent:"0pt", ruleBelowTint:-1, ruleBelowType:"Solid", ruleBelowWidth:RuleWidth.columnWidth, scaleAffectsLineHeight:false, singleWordJustification:SingleWordJustification.fullyJustified, spaceAfter:"0pt", spaceBefore:"0pt", spanColumnMinSpaceAfter:"0pt", spanColumnMinSpaceBefore:"0pt", spanColumnType:SpanColumnTypeOptions.singleColumn, spanSplitColumnCount:SpanColumnCountOptions.all, splitColumnInsideGutter:"6pt", splitColumnOutsideGutter:"0pt", startParagraph:StartParagraph.anywhere, strikeThroughColor:"Text Color", strikeThroughGapColor:"None", strikeThroughGapOverprint:false, strikeThroughGapTint:-1, strikeThroughOffset:-9999, strikeThroughOverprint:false, strikeThroughTint:-1, strikeThroughType:"Solid", strikeThroughWeight:-9999, strikeThru:false, strokeAlignment:TextStrokeAlign.outsideAlignment, strokeColor:"None", strokeTint:-1, strokeWeight:"1pt", tabList:[], tracking:"0pt", underline:false, underlineColor:"Text Color", underlineGapColor:"None", underlineGapOverprint:false, underlineGapTint:-1, underlineOffset:-9999, underlineOverprint:false, underlineTint:-1, underlineType:"Solid"};
    doc.paragraphStyles.itemByName("call out").properties = {appliedFont:"Tekton Pro", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.allCaps, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Regular", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"call out", pointSize:"8pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("caption").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light Italic", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:"13pt", leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"caption", pointSize:"10pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"36pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"72pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"108pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"144pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"180pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"216pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"252pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"288pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"324pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"360pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"396pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"432pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"468pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"504pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"540pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"576pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"612pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"648pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"684pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"720pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Draft Text").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"call out", capitalization:Capitalization.allCaps, fillColor:"Paper", firstLineIndent:"0pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.centerAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Draft Text", pointSize:"72pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"Draft Text", strokeWeight:"0.25pt", tabList:[]};
    doc.paragraphStyles.itemByName("footer").properties = {appliedFont:"Helvetica LT Std", autoLeading:120, basedOn:"New Body", capitalization:Capitalization.allCaps, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light Condensed", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.centerAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"footer", pointSize:"6pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"155.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"479.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("full body").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"13.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Gutter Text").properties = {appliedFont:"Tekton Pro", autoLeading:120, basedOn:"call out", capitalization:Capitalization.allCaps, fillColor:"Navy", firstLineIndent:"0pt", fontStyle:"Bold", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Gutter Text", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Level 1 (18 pt)").properties = {appliedFont:"Helvetica LT Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.allCaps, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold Condensed", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"SUGGESTED PROCEDURE", pointSize:"18pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Level 1 (24 pt)").properties = {appliedFont:"Helvetica LT Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.allCaps, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold Condensed", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:"27pt", leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"SUGGESTED PROCEDURE", pointSize:"24pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Level 2").properties = {appliedFont:"Times LT Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:1, leading:Leading.auto, leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"18pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:true, ruleBelowColor:"Black", ruleBelowLineWeight:"0.25pt", ruleBelowOffset:"8.75pt", ruleBelowRightIndent:"180pt", ruleBelowTint:"100pt", spaceAfter:"9pt", spaceBefore:"27pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"360pt", alignment:TabStopAlignment.RIGHT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Level 2 (Tools)").properties = {appliedFont:"Times LT Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:1, leading:Leading.auto, leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"18pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:true, ruleBelowColor:"Black", ruleBelowLineWeight:"0.25pt", ruleBelowOffset:"8.75pt", ruleBelowRightIndent:"180pt", ruleBelowTint:"100pt", spaceAfter:"22.5pt", spaceBefore:"22.5pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"360pt", alignment:TabStopAlignment.RIGHT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Level 3").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:1, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"31.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Level 4").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold Italic", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:1, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"31.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Level 5").properties = {appliedFont:"Tekton Pro", autoLeading:120, basedOn:"Level 3", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold Oblique", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:1, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"14pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"31.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("New Body").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-29.25pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"155.25pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"13.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"155.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"479.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Normal").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Normal", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Note").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"162pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"13.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("Note Bullets").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-18pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"180pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Note Bullets", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"13.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"180pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Page No.").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.awayFromBindingSide, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:"13pt", leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Page No.", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"36pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"72pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"108pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"144pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"180pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"216pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"252pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"288pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"324pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"360pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"396pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"432pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"468pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"504pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"540pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"576pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"612pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"648pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"684pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"720pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Procedure Designator").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.allCaps, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.centerAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:"13pt", leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"[No Paragraph Style]", pointSize:"10pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"36pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"72pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"108pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"144pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"180pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"216pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"252pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"288pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"324pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"360pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"396pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"432pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"468pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"504pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"540pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"576pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"612pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"648pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"684pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"720pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("RUNNING THE").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.allCaps, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Level 1 (18 pt)", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"18pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("sub body").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-18pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"173.5pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"sub body", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"13.55pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"173.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("SUGGESTED PROCEDURE").properties = {appliedFont:"Helvetica LT Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.allCaps, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Light Condensed", hyphenateLadderLimit:0, hyphenation:true, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"New Body", pointSize:"6pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:true, ruleBelowColor:"Black", ruleBelowLineWeight:"0.25pt", ruleBelowOffset:"9pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"13.5pt", spaceBefore:"7.848pt", strokeColor:"None", strokeWeight:"1pt", tabList:[]};
    doc.paragraphStyles.itemByName("TOC").properties = {appliedFont:"Times LT Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"0pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"[No Paragraph Style]", pointSize:"18pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:true, ruleBelowColor:"Black", ruleBelowLineWeight:"0.25pt", ruleBelowOffset:"8.75pt", ruleBelowRightIndent:"180pt", ruleBelowTint:"100pt", spaceAfter:"18pt", spaceBefore:"27pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"360pt", alignment:TabStopAlignment.RIGHT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("TOC Level 2").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:"18pt", leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:150, minimumLetterSpacing:-5, minimumWordSpacing:75, nextStyle:"[No Paragraph Style]", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"0.25pt", ruleBelowOffset:"8.75pt", ruleBelowRightIndent:"180pt", ruleBelowTint:"100pt", spaceAfter:"13.55pt", spaceBefore:"18pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"468pt", alignment:TabStopAlignment.CHARACTER_ALIGN, leader:'_'}]};
    doc.paragraphStyles.itemByName("TOC Level 2 (Tools)").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"0pt", fontStyle:"Bold", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:"18pt", leftIndent:"126pt", maximumLetterSpacing:25, maximumWordSpacing:150, minimumLetterSpacing:-5, minimumWordSpacing:75, nextStyle:"Level 2", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"0.25pt", ruleBelowOffset:"8.75pt", ruleBelowRightIndent:"180pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"18pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"468pt", alignment:TabStopAlignment.CHARACTER_ALIGN, leader:'_'}]};
    doc.paragraphStyles.itemByName("TOC Level 3").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-15.75pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"141.75pt", maximumLetterSpacing:25, maximumWordSpacing:150, minimumLetterSpacing:-5, minimumWordSpacing:75, nextStyle:"[No Paragraph Style]", pointSize:"12pt", rightIndent:"18pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"4.45pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"141.75pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"468pt", alignment:TabStopAlignment.CHARACTER_ALIGN, leader:'_'}]};
    doc.paragraphStyles.itemByName("TOC Level 4").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-15.75pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"141.75pt", maximumLetterSpacing:25, maximumWordSpacing:150, minimumLetterSpacing:-5, minimumWordSpacing:75, nextStyle:"[No Paragraph Style]", pointSize:"12pt", rightIndent:"18pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"4.45pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"141.75pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"468pt", alignment:TabStopAlignment.CHARACTER_ALIGN, leader:'_'}]};
    doc.paragraphStyles.itemByName("TOC Level 5").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-15.75pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"173.3pt", maximumLetterSpacing:25, maximumWordSpacing:150, minimumLetterSpacing:-5, minimumWordSpacing:75, nextStyle:"TOC Level 5", pointSize:"12pt", rightIndent:"18pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"4.45pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"141.75pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:'.'},{position:"468pt", alignment:TabStopAlignment.CHARACTER_ALIGN, leader:'_'},{position:"486pt", alignment:TabStopAlignment.RIGHT_ALIGN, leader:'.'}]};
    doc.paragraphStyles.itemByName("TOC Parts List").properties = {appliedFont:"ITC Bookman Std", autoLeading:120, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-105.1pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:false, keepFirstLines:1, keepLastLines:1, keepLinesTogether:false, keepWithNext:0, leading:Leading.auto, leftIndent:"231.75pt", maximumLetterSpacing:25, maximumWordSpacing:150, minimumLetterSpacing:-5, minimumWordSpacing:75, nextStyle:"TOC Parts List", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"159.75pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"231.75pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Tool List").properties = {appliedFont:"ITC Bookman Std", autoLeading:125, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-29.25pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"155.25pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Tool List", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"155.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"479.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
    doc.paragraphStyles.itemByName("Tool List 2").properties = {appliedFont:"ITC Bookman Std", autoLeading:125, basedOn:"[No Paragraph Style]", capitalization:Capitalization.normal, fillColor:"Black", firstLineIndent:"-20.3pt", fontStyle:"Light", hyphenateLadderLimit:0, hyphenation:false, justification:Justification.leftAlign, keepAllLinesTogether:true, keepFirstLines:1, keepLastLines:1, keepLinesTogether:true, keepWithNext:0, leading:Leading.auto, leftIndent:"175.55pt", maximumLetterSpacing:25, maximumWordSpacing:200, minimumLetterSpacing:-5, minimumWordSpacing:50, nextStyle:"Tool List 2", pointSize:"12pt", rightIndent:"0pt", ruleAboveColor:"Black", ruleAboveTint:100, ruleBelow:false, ruleBelowColor:"Black", ruleBelowLineWeight:"1pt", ruleBelowOffset:"0pt", ruleBelowRightIndent:"0pt", ruleBelowTint:"100pt", spaceAfter:"0pt", spaceBefore:"0pt", strokeColor:"None", strokeWeight:"1pt", tabList:[{position:"175.5pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''},{position:"479.25pt", alignment:TabStopAlignment.LEFT_ALIGN, leader:''}]};
}

function noteBoxes(){
//    unlockFrames();
    resetColors();
    clearBoxes();
    app.findGrepPreferences.properties = {findWhat:"^.+\r", appliedParagraphStyle:"Note"};
    var findNotes = doc.findGrep();
    app.findTextPreferences.properties = {appliedParagraphStyle:"Note Bullets"};
    var bulletList = doc.findText();
    for(y = 0; y < findNotes.length; y++){
        checkFormat(findNotes[y].words[0]);
        var pageNum = findNotes[y].parentTextFrames[0].parentPage.name;
        if (pageNum=="1")
            var x1 = UnitValue(227.8, "pt").as(doc.viewPreferences.verticalMeasurementUnits), x2 = UnitValue(561.88, "pt").as(doc.viewPreferences.verticalMeasurementUnits);
        else if (pageNum%2==0)
            var x1 = UnitValue(209.55, "pt").as(doc.viewPreferences.verticalMeasurementUnits), x2 = UnitValue(543.63, "pt").as(doc.viewPreferences.verticalMeasurementUnits);
        else
            var x1 = UnitValue(839.8, "pt").as(doc.viewPreferences.verticalMeasurementUnits), x2 = UnitValue(1173.88, "pt").as(doc.viewPreferences.verticalMeasurementUnits);
        var y1 = findNotes[y].words[0].baseline - findNotes[y].ascent - UnitValue(6.2, "points").as(doc.viewPreferences.verticalMeasurementUnits);
        if (bulletList.length > 0){
            for (z = 0; z < bulletList.length; z++){
                if (findNotes[y].characters[-1].index - bulletList[z].characters[0].index == -1)
                    var y2 = bulletList[z].characters[-1].baseline + bulletList[z].descent + UnitValue(6.2, "points").as(doc.viewPreferences.verticalMeasurementUnits);
                else
                    var y2 = findNotes[y].characters[-1].baseline + findNotes[y].descent + UnitValue(6.2, "points").as(doc.viewPreferences.verticalMeasurementUnits);
            }
        }
        else {
            var y2 = findNotes[y].characters[-1].baseline + findNotes[y].descent + UnitValue(6.2, "points").as(doc.viewPreferences.verticalMeasurementUnits);
        }
        var noteBox = findNotes[y].parentTextFrames[0].parentPage.rectangles.add({geometricBounds:[y1, x1, y2, x2], itemLayer:findNotes[y].parentTextFrames[0].itemLayer.name, fillColor:"Black", fillTint:7, strokeColor:"None", textWrapPreferences:TextWrapModes.none, appliedObjectStyle:"None"});
        noteBox.sendToBack();
    }
//    relockFrames();
}

function cleanDoc(){
    var findGreps = ["~b~b+", "[~m~>~f~|~S~s~<~/~.~3~4~% ]{2,}", "(\\d)(“|”)", "\\s+\$", "[Ff]igure (\\d+)"];
    var changeGreps = ["\r", " ", "$1\"", "", "Figure $1"];
    for (var cg = 0; cg < findGreps.length; cg++){
        app.findChangeGrepOptions.includeMasterPages = false;
        app.findChangeGrepOptions.includeLockedStoriesForFind = true;
        app.findGrepPreferences.findWhat = findGreps[cg];
        app.changeGrepPreferences.changeTo = changeGreps[cg];
        if (findGreps[cg] == "[Ff]igure (\\d+)")
            app.changeGrepPreferences.fontStyle = "Bold";
        doc.changeGrep();
        app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    }
    var allGroups = doc.groups.everyItem().getElements();
    for (var g = 0; g < allGroups.length; g++){
        var groupItems = allGroups[g].pageItems;
        for (var gi = 0; gi < groupItems.length; gi++){
            if (groupItems[gi].allGraphics.length == 0)
                groupItems[gi].bringToFront();
            if (groupItems[gi].textWrapPreferences.textWrapMode !== TextWrapModes.none){
                wrapTF = true;
                wrapMode = groupItems[gi].textWrapPreferences.textWrapMode;
            }
            groupItems[gi].textWrapPreferences.textWrapMode = TextWrapModes.none;
        }
        allGroups[g].bringToFront();
        if (wrapTF = true){
            allGroups[g].textWrapPreferences.textWrapMode = wrapMode;
            allGroups[g].textWrapPreferences.textWrapOffset = "9pt";
        }
        wrapTF = false;
    }
}

function addRev(){
    var revFrames = new Array();
    app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences.findWhat = "[A-Za-z]+\\s{0,1}\\d{3,4}";
    app.findChangeGrepOptions.includeMasterPages = true;
    app.findChangeGrepOptions.includeLockedStoriesForFind = true;
    var grepFooters = doc.findGrep();
    for (gf = 0; gf < grepFooters.length; gf++){
        if (grepFooters[gf].parent.textContainers[0].parentPage.name == masterDoc.pages[0].name){
            revFrames.push(grepFooters[gf].parent.textContainers[0]);
            var revText = grepFooters[gf].parent.paragraphs[0].contents.toLowerCase();
        }
    }
    if (revText.indexOf("rev") >= 0){
        var revNum = revText.replace(/.*rev (\d+).*\r/, "$1");
        var rev = new Number(revNum);
        rev += 1;
        revFrames[0].contents = revFrames[0].contents.replace(/rev (\d+)/, "REV " + rev);
        revFrames[1].contents = revFrames[1].contents.replace(/rev (\d+)/, "REV " + rev);
    }
    else {
        revFrames[0].paragraphs[0].insertionPoints[-2].contents = "REV 1";
        revFrames[1].paragraphs[0].insertionPoints[-2].contents = "REV 1";
    }
    var date = new Date();
    var dateString = ("0" + (date.getMonth()+1).toString()).substr(-2) + ("0" + (date.getDate().toString())).substr(-2) + (date.getFullYear().toString()).substr(-2);
    revFrames[0].contents = revFrames[0].contents.replace(/\d{6}/, dateString);
    revFrames[1].contents = revFrames[1].contents.replace(/\d{6}/, dateString);
    var docName = doc.name;
    if (revNum !== 1)
        docName = docName.replace(/ r\d+ /, " r" + rev + " ");
    else
        docName = docName.replace(/ /, " r1 ");
    doc.save(File(doc.filePath + "/" + docName));
}

function checkFormat(w1){
    var c1 = w1.characters[0];
    w1.appliedFont = "ITC Bookman Std";
    w1.fontStyle = "Bold";
    if (c1.contents === "N" || c1.contents === "n"){
        w1.contents = "Note:";
        w1.fillColor = "Forest Green";
    }
    else if (c1.contents == "C" || c1.contents == "c"){
        w1.capitalization = Capitalization.allCaps;
        w1.fillColor = "Yellow Orange";
    }
    else if (c1.contents == "W" || c1.contents == "w"){
        w1.capitalization = Capitalization.allCaps;
        w1.fillColor = "Red";
    }
}

function unlockFrames(){
    lockedID = new Array();
    for (var v = 0; v < allFrames.length; v++){
        if (allFrames[v].locked){
            allFrames[v].locked = false;
            lockedID.push(allFrames[v].id);
        }
    }
}

function relockFrames(){
    for (var v = 0; v < lockedID.length; v++){
        doc.textFrames.itemById(lockedID[v]).locked = true;
    }
}

function contains(theItem, theArray){
    for (z = 0; z < theArray.length; z++){
        var arrayItem = theArray[z];
        if (theItem == arrayItem)
            return true;
    }
    return false;
}

function canRun(){
    for (var r = 0; r < checkboxList.length; r++){
//        var thisBox = eval(checkboxList[r].toString());
        if (eval(checkboxList[r]).value == true)
            return true;
    }
    return false;
}
