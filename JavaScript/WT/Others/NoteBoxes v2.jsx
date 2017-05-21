#target indesign
var doc = app.activeDocument;
app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = app.findTextPreferences = app.changeTextPreferences = app.findChangeTextOptions = NothingEnum.nothing;
var docUnits = doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
app.findGrepPreferences.findWhat = '(?i)suggested procedure';
var mainStory = doc.findGrep()[0].parentStory;
var mainFrames = mainStory.textContainers;

noteBoxes();

function noteBoxes(){
	clearBoxes();
	app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = app.findTextPreferences = app.changeTextPreferences = app.findChangeTextOptions = NothingEnum.nothing;
	app.findGrepPreferences.properties = {findWhat:'^.+(\n)?.*(\r|$)', appliedParagraphStyle:'Note'};
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
		else if (notePage.label == 'EVEN' || notePage.name % 2 == 0){
			var x1 = uVal(209.55, 'pt');
			var x2 = uVal(543.63, 'pt');
		}
		else if (notePage.label == 'ODD' || notePage.name % 2 !== 0){
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
		var noteBox = notePage.rectangles.add({geometricBounds:[y1, x1, y2, x2], itemLayer:doc.layers.item('Default'), fillColor:doc.swatches.item('Black'), fillTint:7, strokeColor:doc.swatches.item('None'), textWrapPreferences:TextWrapModes.none, appliedObjectStyle:'None'});
		noteBox.sendToBack();
	}
}

function uVal(num, unit){
	return UnitValue(num, unit).as(docUnits);
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
