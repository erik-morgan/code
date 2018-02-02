#target indesign

doc = app.activeDocument;

var mainStory;
doc.viewPreferences.properties = {horizontalMeasurementUnits:MeasurementUnits.points, verticalMeasurementUnits:MeasurementUnits.points, rulerOrigin:RulerOrigin.spreadOrigin};
app.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
doc.textWrapPreferences.textWrapMode = TextWrapModes.NONE;

try {
    colorFix();
    main();
    fixTextFrames();
    doc.viewPreferences.properties = {horizontalMeasurementUnits:MeasurementUnits.inches, verticalMeasurementUnits:MeasurementUnits.inches};
    app.findTextPreferences.properties = {findWhat:NothingEnum.nothing, appliedParagraphStyle:NothingEnum.nothing};
}
catch (myError){
    doc.viewPreferences.properties = {horizontalMeasurementUnits:MeasurementUnits.inches, verticalMeasurementUnits:MeasurementUnits.inches};
    app.findTextPreferences.properties = {findWhat:NothingEnum.nothing, appliedParagraphStyle:NothingEnum.nothing};
}

function main(){
    clearBoxes();
    app.findTextPreferences.findWhat = "^p";
    app.findTextPreferences.appliedParagraphStyle = "Note";
    findNotes = doc.findText();
    app.findTextPreferences.findWhat = NothingEnum.nothing;
    app.findTextPreferences.appliedParagraphStyle = "Note Bullets";
    with (doc){
        mainStory = findNotes[0].parentTextFrames[0].parentStory;
        var noteList = [];
        for(x = 0; x < findNotes.length; x++){
            var tempNote = findNotes[x];
            var pNum = tempNote.parentStory.characters.itemByRange(tempNote.parentStory.characters[0], tempNote.characters[0]).paragraphs.length;
            noteList[x] = tempNote.parentStory.paragraphs.item(pNum-1);
        }
        bulletList = findText();
        for(y = 0; y < noteList.length; y++){
            var thisNote = noteList[y];
            checkFormat(thisNote.words.firstItem());
            var pageNum = thisNote.parentTextFrames[0].parentPage.name;
            if (pageNum == "1"){
                var x1 = 227.8;
                var x2 = 561.88;
            }
            else if (pageNum % 2 == 0){
                var x1 = 209.55;
                var x2 = 543.63;
            }
            else {
                var x1 = 209.55 + 630.25;
                var x2 = 543.63 + 630.25;
            }
            var y1 = thisNote.words.firstItem().baseline - thisNote.ascent - 6.2;
            if (bulletList.length > 0){
                for (z = 0; z < bulletList.length; z++){
                    var thisBullet = bulletList[z];
                    var noteIndex = thisNote.characters.lastItem().index;
                    var bulletIndex = thisBullet.characters.firstItem().index;
                    if (bulletIndex - noteIndex == 1){
                        var y2 = thisBullet.characters.lastItem().baseline + thisBullet.descent + 6.2;
                    }
                    else {
                        var y2 = thisNote.characters.lastItem().baseline + thisNote.descent + 6.2;
                    }
                }
            }
            else {
                var y2 = thisNote.characters.lastItem().baseline + thisNote.descent + 6.2;
            }
            var myLayer = thisNote.parentTextFrames[0].itemLayer.name;
            var noteBox = pages.itemByName(pageNum).rectangles.add({geometricBounds:[y1, x1, y2, x2], itemLayer:myLayer, fillColor:"Black", fillTint:7, strokeColor:"None", appliedObjectStyle:"None", textWrapPreferences:TextWrapModes.NONE});
            noteBox.sendToBack();
        }
    }
    app.findTextPreferences.properties = {findWhat:NothingEnum.nothing, appliedParagraphStyle:NothingEnum.nothing};
}

function colorFix(){
    doc = app.activeDocument;
    var allSwatches = doc.swatches.everyItem().getElements();
    for (s = 0; s < allSwatches.length; s++){
        var thisSwatch = allSwatches[s];
        var swatchName = thisSwatch.name;
        if ((swatchName=="None" || swatchName=="Registration" || swatchName=="Paper" || swatchName=="Black") == false){
            thisSwatch.remove();
        }
    }
    doc.colors.add({space:ColorSpace.CMYK, colorValue:[0, 0, 0, 15], name:"Draft Text"});
    doc.colors.add({space:ColorSpace.RGB, colorValue:[0, 94, 0], name:"Forest Green"});
    doc.colors.add({space:ColorSpace.RGB, colorValue:[0, 0, 255], name:"Navy"});
    doc.colors.add({space:ColorSpace.RGB, colorValue:[128, 12, 125], name:"Purple"});
    doc.colors.add({space:ColorSpace.RGB, colorValue:[224, 0, 0], name:"Red"});
    doc.colors.add({space:ColorSpace.RGB, colorValue:[255, 166, 0], name:"Yellow Orange"});
}

function clearBoxes(){
    with (app.activeDocument){
        var blackID = colors.item("Black").id
        pgs = pages.everyItem().getElements();
        for (p = 0; p < pgs.length; p++){
            var thisPage = pgs[p];
            pgItems = thisPage.allPageItems;
            for (i = 0; i < pgItems.length; i++){
                var thisItem = pgItems[i];
                if (thisItem.constructor.name == "Rectangle"){
                    if (thisItem.fillColor == colors.itemByID(blackID)){
                        thisItem.remove();
                    }
                }
            }
        }
    }
}

function checkFormat(w1){
    with (app.activeDocument){
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
}

function fixTextFrames(){
    var framesP1 = doc.pages[0].textFrames.everyItem().getElements();
    for (t = 0; t < framesP1.length; t++){
        if (framesP1[t].nextTextFrame != null){
            var theStory = framesP1[t].parentStory;
            break;
        }
    }
    frameList = theStory.textContainers;
    for (f = 0; f < frameList.length; f++){
        var thisFrame = frameList[f];
        thisFrame.convertShape(ConvertShapeOptions.convertToRectangle);
        var pgNo = thisFrame.parentPage.name;
        thisFrame.geometricBounds[1] = doc.pages.itemByName(pgNo).marginPreferences.left;
        thisFrame.geometricBounds[3] = doc.pages.itemByName(pgNo).marginPreferences.right;
    }
    doc.viewPreferences.properties = {horizontalMeasurementUnits:MeasurementUnits.inches, verticalMeasurementUnits:MeasurementUnits.inches};
}
