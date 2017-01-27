function trimExtras1(theObjects, theArray){
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

function clearBoxes2(){
	var rects = doc.rectangles.everyItem().getElements();
	for (i = 0; i < rects.length; i++){
		if (rects[i].graphics.length == 0){
			var rect = rects[i];
			var fillVal = rect.fillColor.colorValue;
			if (fillVal[0] == 0 && fillVal[1] == 0 && fillVal[2] == 0 & fillVal[3] > 0){
				rect.remove();
			}
		}
	}
}

function clearBoxes1(){
	var boxes = doc.layers.item('Default').splineItems.everyItem().getElements();
	for (i = 0; i < boxes.length; i++){
		if (boxes[i].hasOwnProperty('fillColor') && boxes[i].fillColor.name == 'Black'){
			boxes[i].remove();
		}
	}
}

function checkFormat(word){
	if ((/^n/i).test(word.contents)){
		word.properties = {appliedFont:'ITC Bookman Std', contents:'Note:', fillColor:doc.swatches.itemByName('Forest Green'), fontStyle:'Bold'};
	}
	else if ((/^c/i).test(word.contents)){
		word.properties = {appliedFont:'ITC Bookman Std', capitalization:Capitalization.allCaps, contents:'CAUTION:', fillColor:doc.swatches.itemByName('Yellow Orange'), fontStyle:'Bold'};
	}
	else if ((/^w/i).test(word.contents)){
		word.properties = {appliedFont:'ITC Bookman Std', capitalization:Capitalization.allCaps, contents:'WARNING:', fillColor:doc.swatches.itemByName('Red'), fontStyle:'Bold'};
	}
}

function uVal(num, unit){
	var docUnits = doc.viewPreferences.verticalMeasurementUnits;
	return UnitValue(num, unit).as(docUnits);
}

function unlock(){
	var allPageItems = doc.pageItems.everyItem().getElements();
	for (i = 0; i < allPageItems.length; i++){
		if (allPageItems[i].hasOwnProperty('locked')){
			allPageItems[i].locked = false;
		}
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

function removeValues(values, theArray){
	for (i = 0; i < theArray.length; i++){
		if (contains(theArray[i], values)){
			theArray.splice(i, 1);
		}
	}
	return theArray;
}

function altRemoveVals(values, theArray){
	var joinedArray = theArray.join('|');
	for (v = 0; v < values.length; v++){
		joinedArray = joinedArray.replace(RegExp(values[v], 'g'), '');
	}
	joinedArray = joinedArray.replace(/\|*/g, '|');
	return joinedArray.split('|');
}

function labelPages(){
	var pages = doc.pages.everyItem();
	for (p = 0; p < pages.length; p++){
		if (pages[p].name % 2 == 0){
			pages[p].label = 'EVEN';
		}
		else {
			pages[p].label = 'ODD';
		}
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

function trimExtras2(theObjects, regx){
	for (x = theObjects.length - 1; x >= 0; x--){
		var objName = theObjects[x].name;
		if (!regx.test(objName)){
			theObjects[x].remove();
		}
	}
}

