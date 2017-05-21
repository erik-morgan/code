#target indesign

doc = app.activeDocument;

var allFrames = doc.textFrames.everyItem().getElements();

app.textWrapPreferences.textWrapMode = doc.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
app.findGrepPreferences = app.changeGrepPreferences = app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
/*
doc.viewPreferences.properties = {horizontalMeasurementUnits:MeasurementUnits.points, verticalMeasurementUnits:MeasurementUnits.points, rulerOrigin:RulerOrigin.spreadOrigin};
app.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
doc.textWrapPreferences.textWrapMode = TextWrapModes.NONE;

try {
	resetColors();
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
		if (allBoxes[b].fillColor.name == "Black" && allBoxes[b].parentPage.name.match("\d+")){
			if (allBoxes[b].locked)
				allBoxes[b].locked = false;
			allBoxes[b].remove();
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
*/



noteBoxes();

function noteBoxes(){
	unlockFrames();
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
	relockFrames();
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
