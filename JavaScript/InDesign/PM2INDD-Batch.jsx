#target indesign
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
app.preflightOptions.preflightOff = true;
var doc, masterDoc, docUnits, mainStory, mainFrames, func;
var styleSheet = File(decodeURI(app.scriptPreferences.scriptsFolder) + '/TWD Stylesheet.indd');
var logo = File('/share/SERVICE/TWD/DQ Logo.ai');
var fileList = Folder('~/Erik/PM2INDD/QUEUE/P65/').getFiles('*.p65');
for (var f = 0; f < fileList.length; f++){
	var docName = fileList[f].name.replace(/\.p65/i, '');
	if (File(fileList[f].toString().replace(/\/P65\/([^\.]+)\.p65/i, '/INDD/$1.indd')).exists){
		fileList[f] = File(fileList[f].toString().replace(/\/P65\/([^\.]+)\.p65/i, '/INDD/$1.indd'));
	}
	try {
		app.open(fileList[f]);
		doc = app.documents[0];
	}
	catch (e){
		try {
			app.open(fileList[f]);
			doc = app.documents[0];
		}
		catch (err){
			$.writeln(docName + '\tFAILED TO OPEN');
			app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/P65/' + docName + '.p65\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/PROBLEMS/NO_OPEN/\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
		}
	}
	if (app.documents.length == 1 && doc.isValid){
		doc.save(File('~/Erik/PM2INDD/QUEUE/INDD/' + docName + '.indd'));
		try {
			mainStory = findChangeGrep({'findWhat':'', 'appliedParagraphStyle':doc.paragraphStyles.item('RUNNING THE')}, undefined, {'includeLockedStoriesForFind':true, 'includeLockedLayersForFind':true})[0].parentStory;
		}
		catch (e){
			try {
				mainStory = findChangeGrep({'findWhat':'DRIL-QUIP'}, undefined, {'includeLockedStoriesForFind':true, 'includeLockedLayersForFind':true})[0].parentStory;
			}
			catch (err){
				doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
				doc.close(SaveOptions.YES);
				while (app.documents.length > 0) $.sleep(750);
				app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/P65/' + docName + '.p65\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/ScriptErrors/\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
				app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/INDD/' + docName + '.indd\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/ScriptErrors/\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
				$.writeln(docName + '\tSCRIPT ERROR');
				continue;
			}
		}
		var test = problemTest();
		if (test == 'OK'){
			try {
				PM2INDD();
				doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
				doc.close(SaveOptions.YES);
				while (app.documents.length > 0) $.sleep(750);
				app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/P65/' + docName + '.p65\' \'/Users/HD6904/Erik/PM2INDD/PROCESSED/P65\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
				app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/INDD/' + docName + '.indd\' \'/Users/HD6904/Erik/PM2INDD/PROCESSED/INDD\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
				$.writeln(docName + '\tSUCCESSFUL');
			}
			catch (e){
				doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
				doc.close(SaveOptions.YES);
				while (app.documents.length > 0) $.sleep(750);
				app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/P65/' + docName + '.p65\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/ScriptErrors/\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
				app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/INDD/' + docName + '.indd\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/ScriptErrors/\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
				$.writeln(docName + '\tFAILURE:\n\tLine: ' + e.line + '\n\tMessage: ' + e.msg);
			}
		}
		else if (test == 'SPLIT'){
			doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
			doc.close(SaveOptions.YES);
			while (app.documents.length > 0) $.sleep(750);
			app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/P65/' + docName + '.p65\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/PROBLEMS/SPLIT\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
			app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/INDD/' + docName + '.indd\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/PROBLEMS/SPLIT\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
			$.writeln(docName + '\tFAILURE (SPLIT)');
		}
		else if (test == 'SWATCHES'){
			doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
			doc.close(SaveOptions.YES);
			while (app.documents.length > 0) $.sleep(750);
			app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/P65/' + docName + '.p65\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/PROBLEMS/SWATCHES\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
			app.doScript('do shell script "mv \'/Users/HD6904/Erik/PM2INDD/QUEUE/INDD/' + docName + '.indd\' \'/Users/HD6904/Erik/PM2INDD/QUEUE/PROBLEMS/SWATCHES\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
			$.writeln(docName + '\tFAILURE (SPLIT)');
		}
	}
}
app.scriptPreferences.enableRedraw = true;
app.preflightOptions.preflightOff = false;

function PM2INDD(){
	masterDoc = doc.masterSpreads[0];
	doc.viewPreferences.properties = {rulerOrigin:RulerOrigin.spreadOrigin, showFrameEdges:true, showRulers:true, horizontalMeasurementUnits:MeasurementUnits.POINTS, verticalMeasurementUnits:MeasurementUnits.POINTS};
	doc.textPreferences.showInvisibles = true;
	doc.guidePreferences.properties = {guidesInBack:true, guidesShown:true, guidesSnapto:true};
	doc.marginPreferences.properties = {top:54, left:72, bottom:54, right:54};
	mainFrames = mainStory.textContainers;
	docSetup();
	layersAndText();
	fixGroups();
	fixFrames();
}

function docSetup(){
	var masterFrames = masterDoc.textFrames.everyItem().getElements();
	masterFrames.sort(function (a,b){
		return (a.geometricBounds[1]+a.geometricBounds[3])/2 - (b.geometricBounds[1]+b.geometricBounds[3])/2;
	});
	var sysText = masterFrames[1].contents;
	var docText = masterFrames[2].contents;
	doc.importStyles(ImportFormat.TEXT_STYLES_FORMAT, styleSheet);
	trimExtras(doc.characterStyles.everyItem().getElements(), /^(\[None\]|Bold|Caution|Note|Warning)$/);
	trimExtras(doc.paragraphStyles.everyItem().getElements(), /^(\[No Paragraph Style\]|\[Basic Paragraph\]|call out|caption|Draft Text|footer|full body|Gutter Text|Level 1 \(18 pt\)|Level 1 \(24 pt\)|Level 2|Level 2 \(Tools\)|Level 3|Level 4|Level 5|New Body|Normal|Note|Note Bullets|Page No\.|Procedure Designator|RUNNING THE|sub body|SUGGESTED PROCEDURE|TOC|TOC Level 2|TOC Level 2 \(Tools\)|TOC Level 3|TOC Level 4|TOC Level 5|TOC Parts List|Tool List|Tool List 2)$/);
	doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, styleSheet);
	app.menus.item('Paragraph Style Panel Menu').menuItems.item('Sort by Name').associatedMenuAction.invoke();
	doc.guides.everyItem().remove();
	doc.guidePreferences.guidesLocked = true;
	masterDoc.namePrefix = 'A';
	doc.loadMasters(styleSheet, GlobalClashResolutionStrategyForMasterPage.LOAD_ALL_WITH_OVERWRITE);
	if (doc.masterSpreads.length > 1)  masterDoc.remove();
	masterDoc = doc.masterSpreads[0];
	doc.pages.everyItem().appliedMaster = masterDoc;
	for (var i = 0, tfLength = masterDoc.textFrames.length; i < tfLength; i++){
		frame = masterDoc.textFrames[i];
		if (frame.contents == 'DOCUMENTATION'){
			frame.contents = (docText == undefined) ? 'DOCUMENTATION' : docText;
			frame.parentStory.properties = {appliedParagraphStyle:doc.paragraphStyles.item('footer'), appliedCharacterStyle:doc.characterStyles[0]};
			frame.parentStory.justification = Justification.TO_BINDING_SIDE;
		}
		else if (frame.contents == 'SYSTEM'){
			frame.contents = (sysText == undefined) ? 'SYSTEM' : sysText;
			frame.geometricBounds = [769.5 - (7.2 * frame.paragraphs.length), frame.parentPage.bounds[1] + 243, 769.5, frame.parentPage.bounds[1] + 369];
			frame.parentStory.properties = {appliedParagraphStyle:doc.paragraphStyles.item('footer'), appliedCharacterStyle:doc.characterStyles[0]};
		}
	}
	masterDoc.place(logo, [54, 54]);
	masterDoc.place(logo, [684, 54]);
}

function layersAndText(){
	doc.layers.everyItem().locked = false;
	var tempLayer = doc.layers.add({'name':'tempLayer'});
	tempLayer.merge(doc.layers.itemByRange(1, doc.layers.length - 1));
	tempLayer.properties = {'layerColor':UIColors.red, 'locked':false, 'name':'Default', 'printable':true, 'showGuides':true, 'visible':true};
	doc.layers.add({'layerColor':UIColors.blue, 'locked':false, 'name':'Master Default', 'printable':true, 'showGuides':true, 'visible':true});
	var items = doc.pageItems.everyItem().getElements();
	for (var i = items.length - 1; i >= 0; i--){
		var item = items[i];
		if (item.hasOwnProperty('locked')) item.locked = false;
		if (item.parentPage == null) item.remove();
		else {
			if (item instanceof TextFrame && item.geometricBounds[2] == item.geometricBounds[0]) item.remove();
			if (item.allPageItems.length == 0 && (item.fillColor.name == '' || item.strokeColor.name == '')){
				if (item.fillColor.name == '' && item.fillColor.colorValue.slice(0, 3) == '0,0,0' && item.fillColor.colorValue[3] > 0){
					item.properties = {fillColor:'Black', fillTint:item.fillColor.colorValue[3]};
				}
				if (item.strokeColor.name == '' && item.strokeColor.colorValue.slice(0, 3) == '0,0,0' && item.strokeColor.colorValue[3] > 0){
					item.properties = {strokeColor:'Black', strokeTint:item.strokeColor.colorValue[3]};
				}
			}
		}
	}
	masterDoc.pageItems.everyItem().itemLayer = doc.layers.item('Master Default');
	clearBoxes();
	findChangeGrep({'findWhat':'~b~b+'}, {'changeTo':'\\r'});
	findChangeGrep({'findWhat':'[~m~>~f~|~S~s~<~/~.~3~4~% ]{2,}'}, {'changeTo':' '}, {'includeMasterPages':true});
	findChangeGrep({'findWhat':'^\\s+|\\s+\$'}, {'changeTo':''}, {'includeMasterPages':true});
	findChangeGrep({'findWhat':'(?i)^(note|caution|warning)(\\s+)?:'}, {'changeTo':'$1:'});
	findChangeGrep({'findWhat':'\\r|\\n', 'appliedParagraphStyle':'caption'}, {'changeTo':' '});
	findChangeGrep({'findWhat':'\\r|\\n', 'appliedParagraphStyle':'call out'}, {'changeTo':' '});
	findChangeGrep({'findWhat':'(?i)^(?<=(note|caution|warning).+)\\r(?<!note|caution|warning)(.+)', 'appliedParagraphStyle':'Note'}, {'changeTo':' $1'}, {'includeMasterPages':true});
	findChangeGrep({'findWhat':'(?i)^(' + /^[^\d]+/.exec(doc.name)[0] + ') ?(\\d{3})[^\\d]', 'appliedParagraphStyle':'footer'}, {'changeTo':'$1 0$2'}, {'includeMasterPages':true});
	findChangeGrep({'findWhat':'(?i)^(tools needed for this operation)(\\s|\\r)+'}, {'changeTo':'$1\\r', 'appliedParagraphStyle':'Level 2 (Tools)'});
	findChangeGrep({'findWhat':'(?i)^(?<=tools needed for this operation\\r)((~8.+\\r)+)'}, {'changeTo':'$1', 'appliedParagraphStyle':'Tool List'});
	findChangeGrep({'findWhat':'^(~8|\\d+\\.?|[a-z]\\.?|~_)\\s+'}, {'changeTo':''});
	findChangeGrep({'findWhat':'(?i)^(pre-operational procedures|running procedures|retrieving procedures|post-operational procedures)(\\s|\\r)+'}, {'changeTo':'$1\\r', 'appliedParagraphStyle':'Level 2'});
	findChangeGrep({'findWhat':'(?i)(?<= )figure (\\d+)'}, {'changeTo':'Figure $1', 'fontStyle':'Bold'});
}

function fixGroups(){
	for (var l = 0; l < doc.links.length; l++){
		var art = doc.links[l].parent.parent;
		art.sendToBack();
		if (/\d+/.test(art.parentPage.name) && art.parent.constructor.name !== 'Group' && art.textWrapPreferences.textWrapMode !== TextWrapModes.NONE){
			var xPoints = [];
			var yPoints = [];
			var points = art.textWrapPreferences.paths[0].entirePath;
			for (var p = 0; p < points.length; p++){
				xPoints.push(points[p][0]);
				yPoints.push(points[p][1]);
			}
			xPoints.sort();
			yPoints.sort();
			var bounds = [yPoints[0], xPoints[0], yPoints[yPoints.length - 1], xPoints[xPoints.length - 1]];
			var grp = [art];
			var pg = art.parentPage;
			for (var i = 0; i < pg.pageItems.length; i++){
				var iBounds = pg.pageItems[i].geometricBounds;
				if (iBounds[0] >= bounds[0] && iBounds[1] >= bounds[1] && iBounds[2] <= bounds[2] && iBounds[3] <= bounds[3]) grp.push(pg.pageItems[i]);
			}
			if (grp.length > 1) grp = pg.groups.add(grp);
		}
		if (/\d+/.exec(art.parentPage.name) && art.parent instanceof Group){
			var group = art.parent;
			for (var i = 0; i < group.allPageItems.length; i++){
				group.allPageItems[i].textWrapPreferences.textWrapMode = TextWrapModes.NONE;
			}
			var xGutter = (group.parentPage.documentOffset % 2 == 0) ? (group.parentPage.bounds[1] + doc.marginPreferences.left + 126) : (group.parentPage.bounds[1] + doc.marginPreferences.right + 126);
			if (group.geometricBounds[3] < xGutter){
				group.textWrapPreferences.textWrapMode = TextWrapModes.none;
			}
			else if (group.geometricBounds[1] < (group.parentPage.bounds[1]+group.parentPage.bounds[3])/2){
				group.textWrapPreferences.textWrapMode = TextWrapModes.jumpObjectTextWrap;
				group.textWrapPreferences.textWrapOffset = [9,9,9,9];
			}
			else {
				group.textWrapPreferences.textWrapMode = TextWrapModes.boundingBoxTextWrap;
				group.textWrapPreferences.textWrapOffset = [9,9,9,9];
			}
		}
	}
}

function fixFrames(){
	for (var i = 0, iLim = mainFrames.length; i < iLim; i++){
		var mainFrame = mainFrames[i];
		var mainPage = mainFrame.parentPage;
		mainFrame.convertShape(ConvertShapeOptions.convertToRectangle);
		var x1 = (mainPage.documentOffset % 2 == 0) ? mainPage.bounds[1] + 72 : 54;
		var x2 = x1 + 486;
		var y1 = (mainPage.documentOffset == 0) ? 67.5 : ((mainFrame.paragraphs[0].appliedParagraphStyle.name == 'Level 2') ? 130.5 : 76.8);
		var y2 = 738;
		mainFrame.geometricBounds = [y1, x1, y2, x2];
	}
}

function problemTest(){
	if (doc.documentPreferences.pageSize !== 'Letter'){
		doc.layoutAdjustmentPreferences.properties = {allowGraphicsToResize:false, allowRulerGuidesToMove:false, enableLayoutAdjustment:true, ignoreObjectOrLayerLocks:true, ignoreRulerGuideAlignments:false, snapZone:'0.1pt'};
		doc.documentPreferences.pageSize = 'Letter';
		doc.layoutAdjustmentPreferences.enableLayoutAdjustment = false;
	}
	try {
		var level2 = findChangeGrep({'findWhat':'', 'appliedParagraphStyle':'Level 2'});
		if (level2.length == 0 || level2[0].parentStory !== mainStory) return 'SPLIT';
	}
	catch (e){
		return 'SPLIT';
	}
	doc.loadSwatches(styleSheet);
	for (var i = doc.swatches.length - 1; i >= 0; i--){
		if (doc.swatches.item(doc.swatches[i].name + ' 2').isValid){
			doc.swatches[i].properties = doc.swatches.item(doc.swatches[i].name + ' 2').properties;
		}
	}
	try {
		trimExtras(doc.swatches.everyItem().getElements(), /^(\[?None\]?|\[?Registration\]?|\[?Paper\]?|\[?Black\]?|Draft Text|Forest Green|Navy|Purple|Red|Yellow Orange)$/);
	}
	catch (e){
		return 'SWATCHES';
	}
	return 'OK';
}

function findChangeGrep(findPrefs, changePrefs, findChangeOptions){
	app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
	if (findChangeOptions !== undefined) app.findChangeGrepOptions.properties = findChangeOptions;
	app.findGrepPreferences.properties = findPrefs;
	if (changePrefs == undefined) return doc.findGrep();
	else {
		app.changeGrepPreferences.properties = changePrefs;
		doc.changeGrep();
	}
}

function between(num, lo, hi){
	return (num - lo) * (num - hi) <= 0;
}

function trimExtras(theObjects, regx){
	for (var x = theObjects.length - 1; x >= 0; x--){
		var objName = theObjects[x].name;
		if (!regx.test(objName)) theObjects[x].remove();
	}
}

function clearBoxes(){
	var boxes = doc.layers.item('Default').splineItems.everyItem().getElements();
	for (var i = 0; i < boxes.length; i++){
		if (boxes[i].hasOwnProperty('fillColor') && boxes[i].fillColor.name == 'Black') boxes[i].remove();
	}
}
