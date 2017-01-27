//	ClearBoxes Options

function clearBoxesA(){
	var rects = doc.rectangles.everyItem().getElements();
	for (i = 0; i < rects.length; i++){
		if (rects[i].graphics.length == 0){
			var rect = rects[i];
			var fillVal = rect.fillColor.colorValue;
			if (fillVal[0] == fillVal[1] == fillVal[2] == 0 && fillVal[3] > 0){
				rect.remove();
			}
		}
	}
}

function clearBoxes(){
	var rects = doc.rectangles.everyItem().getElements();
	for (i = 0; i < rects.length; i++){
		var rect = rects[i];
		if (rect.fillColor.name !== 'None' && rect.parentPage.label !== 'MASTER'){
			var fillVal = rect.fillColor.colorValue;
			if (fillVal[0] == 0 && fillVal[1] == 0 && fillVal[2] == 0 & fillVal[3] > 0){
				rect.remove();
			}
		}
	}
}

function clearBoxesB(){
	var boxes = doc.layers.itemByName('Default').splineItems.everyItem().getElements();
	for (i = 0; i < boxes.length; i++){
		if (boxes[i].hasOwnProperty('fillColor') && boxes[i].fillColor.name == 'Black'){
			boxes[i].remove();
		}
	}
}
