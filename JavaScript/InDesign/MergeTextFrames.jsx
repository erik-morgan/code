#target indesign
if (app.selection.length > 0){
	mergeTextFrames();
}
function mergeTextFrames(){
	var doc = app.activeDocument;
	var textFrames = app.selection;
	var newBounds = []; 
	for (i = 0; i < textFrames.length; i++){
		if (textFrames[i] instanceof TextFrame){
			var tFrame = textFrames[i];
			if (newBounds[0] == undefined || tFrame.geometricBounds[0] < newBounds[0]){
				newBounds[0] = tFrame.geometricBounds[0];
			}
			if (newBounds[1] == undefined || tFrame.geometricBounds[1] < newBounds[1]){
				newBounds[1] = tFrame.geometricBounds[1];
			}
			if (newBounds[2] == undefined || tFrame.geometricBounds[2] > newBounds[2]){
				newBounds[2] = tFrame.geometricBounds[2];
			}
			if (newBounds[3] == undefined || tFrame.geometricBounds[3] > newBounds[3]){
				newBounds[3] = tFrame.geometricBounds[3];
			}
		}
		else {
			textFrames.splice(i, 1);
			i -= 1;
		}
	}
	var newFrame = textFrames[0].parentPage.textFrames.add(textFrames[0].itemLayer, {geometricBounds:newBounds});
	textFrames.sort(function (a, b){return a.geometricBounds[0] - b.geometricBounds[0];});
	for (var i = 0; i < textFrames.length; i++){
		for (var j = 0; j < textFrames[i].parentStory.paragraphs.length; j++){
			newFrame.parentStory.insertionPoints[-1].contents = textFrames[i].parentStory.paragraphs[j].contents;
			newFrame.parentStory.paragraphs[-1].properties = textFrames[i].parentStory.paragraphs[j].properties;
		}
		if (newFrame.parentStory.characters[-1].contents !== String.fromCharCode(13)){
			newFrame.parentStory.insertionPoints[-1].contents = '\r';
		}
		textFrames[i].remove();
	}
}
