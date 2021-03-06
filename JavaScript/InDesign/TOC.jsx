#target indesign
var doc = app.activeDocument, mainStory, mainFrame;
doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
clearBoxes();
app.scriptPreferences.enableRedraw = false;
main();
app.scriptPreferences.enableRedraw = true;

function main () {
	mainStory = findChangeGrep({'findWhat': '(?i)suggested procedure\\r'})[0].parent;
	mainFrame = mainStory.textContainers[0];
	for (var p = mainStory.paragraphs.length - 1; p > -1; p--) {
		var par = mainStory.paragraphs[p];
		if (par.appliedParagraphStyle.name[0] == 'L') {
			var pstyle = par.appliedParagraphStyle.name,
				 pnum = par.parentTextFrames[0].parentPage.name;
			par.characters[-2].insertionPoints[1].contents = '\t' + pnum;
			par.applyParagraphStyle(doc.paragraphStyles.item(pstyle.replace(/(Level \d).*/, 'TOC $1')), true);
			if (/Level [345]/i.test(pstyle)) par.properties = {hyphenation: false, rightIndent: '0.5i', lastLineIndent: '-0.375i'};
		}
		else if (par.appliedParagraphStyle.name == 'SUGGESTED PROCEDURE') {
			par.insertionPoints[-1].contents = 'Table of Contents\r';
			mainStory.paragraphs[p + 1].applyParagraphStyle(doc.paragraphStyles.item('TOC'), true);
			break;
		}
		else par.remove();
	}
	findChangeGrep({'findWhat': ' *\\n *', 'appliedFont': 'ITC Bookman Std'}, {'changeTo': ' '}, undefined);
	doc.pages.itemByRange(1, doc.pages.length-1).remove();
	var grps = doc.spreads[0].groups.everyItem().getElements();
	for (var g = grps.length - 1; g > -1; g--) {
		if (grps[g].allGraphics.length) grps[g].remove();
	}
	doc.sections.add(doc.pages.firstItem(), {pageNumberStyle:PageNumberStyle.lowerRoman});
	findChangeGrep({'findWhat': 'Page ', 'appliedParagraphStyle': 'Page No.'}, {'changeTo': ''}, {'includeMasterPages': true});
	mainStory.insertionPoints[-1].contents = 'Assembly Drawings and Parts Lists\rPlace Holder';
	mainStory.paragraphs[-2].applyParagraphStyle(doc.paragraphStyles.item('TOC Level 2'), true);
	mainStory.paragraphs[-1].applyParagraphStyle(doc.paragraphStyles.item('TOC Parts List'), true);
	app.menuActions.itemByName('Sort by Name').invoke();
	mainFrame.properties = {geometricBounds: ['67.5pt', '72pt', '648pt', '558pt'], itemLayer: 'Default'};
	if (mainFrame.overflows) handleOverflow();
	else mainFrame.geometricBounds = ['67.5pt', '72pt', '720pt', '558pt'];
	for (var p = 0; p < mainStory.paragraphs.length; p++) {
		var par = mainStory.paragraphs[p];
		if (par.appliedParagraphStyle.name.substr(0, 4) == 'TOC ' && par.words[-2].insertionPoints[-1].horizontalOffset - par.horizontalOffset > 4.375)
			par.words[-2].insertionPoints[0].contents = '\n';
	}
	mainFrame.geometricBounds = ['67.5pt', '72pt', '684pt', '558pt'];
	if (doc.pages.length > 1 && doc.pages[1].textFrames[0].paragraphs.length == 0)
		mainFrame.geometricBounds = ['67.5pt', '72pt', '648pt', '558pt'];
}

function handleOverflow () {
	var plusFrame = doc.pages[0].textFrames.add('Default', {geometricBounds: ['684pt', '72pt', '720pt', '558pt'], contents: '+'});
	plusFrame.parentStory.properties = ({appliedFont: 'ITC Bookman Std', fontStyle: 'Bold', pointSize: '24pt', justification: Justification.rightAlign, alignToBaseline: true});
	var newPage = doc.pages.add(LocationOptions.AFTER, doc.pages.firstItem());
	var newFrame = newPage.textFrames.add('Default', {geometricBounds: ['76.8pt', '54pt', '738pt', '540pt']});
	mainFrame.nextTextFrame = newFrame;
	if (mainStory.textContainers.length < 2) newFrame.previousTextFrame = mainStory.textContainers[0];
}

function clearBoxes(){
	app.loadFindChangeQuery('NoteBox', SearchModes.OBJECT_SEARCH);
	var boxes = doc.findObject();
	for (b = 0; b < boxes.length; b++){
		boxes[b].remove();
	}
}

function findChangeGrep(findPrefs, changePrefs, findChangeOptions) {
	app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
	if (findChangeOptions !== undefined) {
		app.findChangeGrepOptions.properties = findChangeOptions;
	}
	app.findGrepPreferences.properties = findPrefs;
	if (changePrefs == undefined) {
		return doc.findGrep();
	}
	else {
		app.changeGrepPreferences.properties = changePrefs;
		doc.changeGrep();
	}
}
