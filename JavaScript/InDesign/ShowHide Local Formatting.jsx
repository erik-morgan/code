#target indesign
var doc = app.activeDocument;
/*
app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = app.findTextPreferences = app.changeTextPreferences = app.findChangeTextOptions = NothingEnum.nothing;
app.findGrepPreferences.findWhat = '(?i)suggested procedure';
var mainStory = doc.findGrep()[0].parentStory;

var mainChars = mainStory.characters.everyItem().getElements();

if (doc.label !== 'ENABLED'){
	doc.label = 'ENABLED';
	enableHighlights();
}
else {
	disableHighlights();
}

function enableHighlights(){
	for (i = 0; i < mainChars.length; i++){
		mainChars[i].
*/

if (doc.textPreferences.enableStylePreviewMode == true){
	doc.textPreferences.enableStylePreviewMode = false;
}
else {
	doc.textPreferences.enableStylePreviewMode = true;
}
