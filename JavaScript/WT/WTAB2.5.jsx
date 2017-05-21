#target indesign
var run, funcs, mainStory, mainFrames;
var description = '* Unlocks all contents except for items on the \'Old Table\' layer.\r\r* Searches for \'suggested procedure\', and makes its parent story the main story.\r\rPosition the pointer over a function to see a detailed description.\r\r';
try {
	var doc = app.activeDocument;
	var masterDoc = doc.masterSpreads[0];		
	var docUnits = doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
}
catch (e){
	throw Error('There must be an open document to run this!');
}
var w = new Window('dialog', 'Writer\'s Toolbox', undefined);
	w.alignChildren = ['left','center'];
	var checkDS = w.add('checkbox', undefined, '\u00A0DocSetup: Fixes layers, colors, styles, guides, logos, and footers');
		checkDS.onClick = function (){ bRun.enabled = (checkDS.value || checkFF.value || checkNB.value); };
	var checkFF = w.add('checkbox', undefined, '\u00A0FixFrames: Straighten\'s and corrects text frame sizing and layout');
		checkFF.onClick = function (){ bRun.enabled = (checkDS.value || checkFF.value || checkNB.value); };
	var checkNB = w.add('checkbox', undefined, '\u00A0NoteBoxes: Replaces the note box of every note/caution/warning');
		checkNB.onClick = function (){ bRun.enabled = (checkDS.value || checkFF.value || checkNB.value); };
	var p = w.add('panel', undefined, 'Description', {borderStyle:'etched'});
		p.margins = [12,18,12,12];
		var d = p.add('staticText', undefined, description, {multiline:true});
			d.alignment = ['fill','fill'];
			d.characters = 60;
	var pBackup = w.add('panel', undefined, 'Backup', {borderStyle:'etched'});
		pBackup.alignment = ['fill','fill'];
		pBackup.alignChildren = ['left','center'];
		pBackup.margins = [12,18,12,12];
		pBackup.spacing = 6;
		var checkBackup = pBackup.add('checkbox', undefined, 'Save and backup before running?');
			checkBackup.value = true;
	var gButtons = w.add('group');
		gButtons.alignment = ['fill', 'fill'];
		gButtons.alignChildren = ['right', 'center'];
		var bRun = gButtons.add('button', undefined, 'Run');
			bRun.enabled = false;
			bRun.onClick = function (){
				funcs = [checkDS.value, checkFF.value, checkNB.value, checkBackup.value];
				run = true;
				w.close();
			}
		var bCancel = gButtons.add('button', undefined, 'Cancel');
			bCancel.alignment = ['right', 'center'];
			bCancel.onClick = function (){
				run = false;
				w.close();
			}
ScriptUI.events.createEvent('MouseEvent');
w.addEventListener('mouseover', myMouseHandler);
w.addEventListener('mouseout', myMouseHandler);
w.show();
if (run){
	try {
		writersToolbox();
	}
	catch (e){
		doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = docUnits;
		alert(e.line + '\n' + e.message);
	}
}
function writersToolbox(){
	doc.viewPreferences.properties = {rulerOrigin:RulerOrigin.spreadOrigin, showFrameEdges:true, showRulers:true, horizontalMeasurementUnits:MeasurementUnits.MILLIMETERS, verticalMeasurementUnits:MeasurementUnits.MILLIMETERS};
	app.textWrapPreferences.textWrapMode = doc.textWrapPreferences.textWrapMode = TextWrapModes.none;
	doc.textPreferences.showInvisibles = true;
	doc.marginPreferences.properties = {top:18.5, left:24.7, bottom:18.5, right:18.5};
	try {
		mainStory = findChangeGrep({'findWhat':'(?i)suggested procedure'}, undefined, {'includeLockedStoriesForFind':true, 'includeLockedLayersForFind':true})[0].parentStory;
	}
	catch (e){
		throw Error('Couldn\'t find "SUGGESTED PROCEDURE"\nSince ALL procedures will have a single occurence of suggested procedure, the script uses it to identify the main story');
	}
	mainFrames = mainStory.textContainers;
	if (funcs[3]) backupHandler(new Date());
	layersAndText();
	if (funcs[0]) docSetup();
	if (funcs[1]) fixFrames();
	if (funcs[2]) noteBoxes();
}
function layersAndText(){
	if (!doc.layers.item('Default').isValid) doc.layers.add({'name':'Default'});
	doc.layers.item('Default').properties = {'layerColor':UIColors.red, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true};
	if (!doc.layers.item('Master Default').isValid) doc.layers.add({'name':'Master Default'});
	doc.layers.item('Master Default').properties = {'layerColor':UIColors.blue, 'locked':false, 'printable':true, 'showGuides':true, 'visible':true};
	if (doc.layers.item('Old Table').isValid){
		doc.layers.item('Old Table').properties = {'ignoreWrap':true, 'layerColor':UIColors.green, 'locked':false, 'printable':true, 'showGuides':true, 'visible':false};
	}
	var items = doc.pageItems.everyItem().getElements();
	for (i = items.length - 1; i >= 0; i--){
		var item = items[i];
		if (item.hasOwnProperty('locked')) item.locked = false;
		if (item.parentPage == null) {
			item.remove();
		}
		else {
			if (item.itemLayer.name !== 'Old Table'){
				item.itemLayer = doc.layers.item('Default');
			}
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
	trimExtras(doc.layers.everyItem().getElements(), /^(Old Table|Default|Master Default)$/);
	findChangeGrep({'findWhat':'~b~b+'}, {'changeTo':'\r'});
	findChangeGrep({'findWhat':'[~m~>~f~|~S~s~<~/~.~3~4~% ]{2,}'}, {'changeTo':' '}, {'includeMasterPages':true});
	findChangeGrep({'findWhat':'\\s+\$'}, {'changeTo':''}, {'includeMasterPages':true});
	findChangeGrep({'findWhat':'(?i)(?<= )figure (\\d+)'}, {'changeTo':'Figure $1', 'fontStyle':'Bold'});
}
function docSetup(){
	var styleSheet = File(File($.fileName).parent + '/TWD Stylesheet A4.indd');
	if (!styleSheet.exists){
		styleSheet = File.openDialog('Couldn\'t locate the stylesheet. Please choose a document to import from');
	}
	doc.loadSwatches(styleSheet);
	for (i = doc.swatches.length - 1; i >= 0; i--){
		if (doc.swatches.item(doc.swatches[i].name + ' 2').isValid){
			doc.swatches[i].properties = doc.swatches.item(doc.swatches[i].name + ' 2').properties;
		}
	}
	trimExtras(doc.swatches.everyItem().getElements(), /^(\[?None\]?|\[?Registration\]?|\[?Paper\]?|\[?Black\]?|Draft Text|Forest Green|Navy|Purple|Red|Yellow Orange)$/);
	doc.importStyles(ImportFormat.CHARACTER_STYLES_FORMAT, styleSheet);
	trimExtras(doc.characterStyles.everyItem().getElements(), /^(\[None\]|Bold|Caution|Note|Warning)$/);
	doc.importStyles(ImportFormat.PARAGRAPH_STYLES_FORMAT, styleSheet);
	trimExtras(doc.paragraphStyles.everyItem().getElements(), /^(\[No Paragraph Style\]|\[Basic Paragraph\]|call out|caption|Draft Text|footer|full body|Gutter Text|Level 1 \(18 pt\)|Level 1 \(24 pt\)|Level 2|Level 2 \(Tools\)|Level 3|Level 4|Level 5|New Body|Normal|Note|Note Bullets|Page No\.|Procedure Designator|RUNNING THE|sub body|SUGGESTED PROCEDURE|TOC|TOC Level 2|TOC Level 2 \(Tools\)|TOC Level 3|TOC Level 4|TOC Level 5|TOC Parts List|Tool List|Tool List 2)$/);
	doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, styleSheet);
	app.menus.item('Paragraph Style Panel Menu').menuItems.item('Sort by Name').associatedMenuAction.invoke();
	findChangeGrep({'findWhat':'^(~8|\\d+\\.|[a-z]\\.|~_)\\s+'}, {'changeTo':''});
	for (i = 0, tfLength = masterDoc.textFrames.length; i < tfLength; i++){
		var frame = masterDoc.textFrames[i];
		if ((/system/i).test(frame.contents)){
			var sysText = frame.contents;
		}
		else if (frame.paragraphs.length > 1 && (/\d{6}/).test(frame.paragraphs[1].contents)){
			var docText = frame.contents;
		}
	}
	doc.guides.everyItem().remove();
	doc.guidePreferences.guidesLocked = true;
	masterDoc.namePrefix = 'A';
	doc.loadMasters(styleSheet, GlobalClashResolutionStrategyForMasterPage.LOAD_ALL_WITH_OVERWRITE);
	if (doc.masterSpreads.length > 1) {
		masterDoc.remove();
	}
	masterDoc = doc.masterSpreads[0];
	doc.pages.everyItem().appliedMaster = masterDoc;
	for (i = 0, tfLength = masterDoc.textFrames.length; i < tfLength; i++){
		frame = masterDoc.textFrames[i];
		if (frame.contents == 'DOCUMENTATION'){
			frame.contents = docText;
			frame.parentStory.properties = {appliedParagraphStyle:doc.paragraphStyles.item('footer'), appliedCharacterStyle:doc.characterStyles[0]};
			frame.parentStory.justification = Justification.TO_BINDING_SIDE;
		}
		else if (frame.contents == 'SYSTEM'){
			frame.properties = {contents:sysText, geometricBounds:[289.3 - (2.3 * frame.paragraphs.length), frame.parentPage.bounds[1] + 82.5, 289.3, frame.parentPage.bounds[1] + 127.5]};
			frame.parentStory.properties = {appliedParagraphStyle:doc.paragraphStyles.item('footer'), appliedCharacterStyle:doc.characterStyles[0]};
		}
	}
	var logo = (File.fs == 'Macintosh') ? File('/share/SERVICE/TWD/DQ Logo.ai') : File('/n/share/SERVICE/TWD/DQ Logo.ai');
	if (!logo.exists){
		logo = File.openDialog('Select the desired logo graphic file');
		if (logo == null){
			return;
		}
	}
	var logoFrame = masterDoc.rectangles.add({fillColor:'None', strokeColor:'None', itemLayer:doc.layers.item('Master Default'), geometricBounds:[18.5,18.5,37.8435113694933,40.0268513997396]});
	logoFrame.place(logo);
	logoFrame.fit(FitOptions.contentToFrame);
	logoFrame.duplicate(undefined, [216.2, 0]);
}
function fixFrames(){
	for (i = 0, mfLength = mainFrames.length; i < mfLength; i++){
		var mainFrame = mainFrames[i];
		var mainPage = mainFrame.parentPage;
		mainFrame.convertShape(ConvertShapeOptions.convertToRectangle);
		var x1 = (mainPage.documentOffset % 2 == 0) ? mainPage.bounds[1] + 24.7 : 18.5;
		var x2 = x1 + 166.8;
		var y1 = (mainPage.documentOffset == 0) ? 23.5 : ((mainFrame.paragraphs[0].appliedParagraphStyle.name == 'Level 2') ? (49 + (87/90)) : 26.8);
		var y2 = (i == mfLength - 1 && mainFrame.overflows) ? (270 + (69/90)) : mainFrame.geometricBounds[2];
		mainFrame.geometricBounds = [y1, x1, y2, x2];
	}
}
function noteBoxes(){
	clearBoxes();
	var findNotes = findChangeGrep({'findWhat':'^[^\\r]+(\\r|$)', 'appliedParagraphStyle':'Note'});
	for(var y = 0, findLength = findNotes.length; y < findLength; y++){
		var note = findNotes[y];
		var notePage = note.parentTextFrames[0].parentPage;
		var notePara = mainStory.characters.itemByRange(0, note.characters.firstItem().index).paragraphs.length - 1;
		var x1 = (notePage.documentOffset % 2 == 0) ? notePage.bounds[1] + 78.1 : 71.9;
		var x2 = x1 + 115.587222222222;
		var y1 = note.words[0].baseline - note.ascent - 2.18722222222223;
		var bulletCount = 1;
		while (mainStory.paragraphs[notePara + bulletCount].appliedParagraphStyle.name == 'Note Bullets'){
			bulletCount += 1;
		}
		if (bulletCount > 1){
			var y2 = mainStory.paragraphs[notePara + bulletCount - 1].characters[-1].baseline + mainStory.paragraphs[notePara + bulletCount - 1].descent + 2.18722222222223;
		}
		else {
			var y2 = note.characters[-1].baseline + note.descent + 2.18722222222223;
		}
		var noteBox = notePage.rectangles.add({geometricBounds:[y1, x1, y2, x2], itemLayer:doc.layers.item('Default'), fillColor:'Black', fillTint:7, strokeColor:'None', textWrapPreferences:TextWrapModes.none, appliedObjectStyle:'None'});
		noteBox.sendToBack();
	}
}
function myMouseHandler(ev){
	if (ev.type == 'mouseover' && ev.target == checkDS){
		d.text = 'Doc Setup puts master items on the \'Master Default\' layer, and all others on \'Default\', skipping items on \'Old Table\'. Sets the correct properties for swatches/styles, adds absent ones, and removes any extras. Removes all guides in the document, and inserts new ones on the master spread. Removes all master spread graphics, and places a new \'DQ Logo\' on each master page. Uses the Sam\'s Club logo only if the TWD logo isn\'t found. Properly sizes and aligns the master spread footers.';
	}
	else if (ev.type == 'mouseover' && ev.target == checkFF){
		d.text = 'FixFrames adjusts every threaded text frame of the main story, straightening any Crooked frames. The sides of each frame are set on the margins. The first page\'s frame starts on the first guide, frames starting with a \'Level 2\' paragraph on the third guide, and the rest on the second guide. All frames end on the guide closest to its last line of text, but never changes the number of lines in a frame.';
	}
	else if (ev.type == 'mouseover' && ev.target == checkNB){
		d.text = 'NoteBoxes clears all existing note boxes, and checks for correct color values before running. It finds all paragraphs with the \'Note\' or \'Note Bullets\' style, and sets the format and color according to the paragraph\'s first word (note/caution/warning). The script then generates a gray note box underneath every note in the document.';
	}
	else if (ev.type == 'mouseover' && ev.target == checkBackup){
		d.text = 'Backups will be in the Documents/WT Backups folder. Backups older than two weeks will be automatically removed.';
	}
	else {
		d.text = '* Bypasses all locked content except for items on the \'Old Table\' layer.\r\r* Searches for \'suggested procedure\', and assumes its parent story as the main story.\r\rPosition the pointer over a function to see a detailed description.\r\r';
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
function trimExtras(theObjects, regx){
	for (x = theObjects.length - 1; x >= 0; x--){
		var objName = theObjects[x].name;
		if (!regx.test(objName)){
			theObjects[x].remove();
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
function backupHandler(d){
	doc.save();
	var wtBackups = Folder('~/Documents/WT Backups/');
	var backupName = ('0' + (d.getMonth() + 1)).substr(-2) + ('0' + d.getDate()).substr(-2) + d.getYear().toString().substr(-2) + ' ' + ('0' + d.getHours()).substr(-2) + ('0' + d.getMinutes()).substr(-2) + ('0' + d.getSeconds()).substr(-2) + ' ' + doc.name;
	if (wtBackups.exists){
		var backups = wtBackups.getFiles();
		for (i = 0; i < backups.length; i++){
			var dateMod = backups[i].modified;
			var dateNow = new Date().getTime();
			if ((dateNow - dateMod)/86400000 > 14){
				backups[i].remove();
			}
		}
	}
	else {
		wtBackups.create();
	}
	File(doc.fullName).copy(wtBackups + '/' + backupName);
}
