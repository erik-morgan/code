#target indesign

doc = app.activeDocument;

var mainStory;

clearBoxes();
main();

function main(){
	var headings=[], headingStyles=[], pageNum=[];
	var pStyles = ["Level 2", "Level 2 (Tools)", "Level 3", "Level 4", "Level 5"];
	app.findGrepPreferences = app.findChangeGrepOptions = app.changeGrepPreferences = NothingEnum.nothing;
	app.findChangeGrepOptions.properties = {includeLockedLayersForFind:true, includeLockedStoriesForFind:true};
	app.findGrepPreferences.findWhat = "(?i)suggested procedure";
	mainStory = doc.findGrep()[0].parentTextFrames[0].parentStory;
	var p = 0;
	for (x=0; x<mainStory.paragraphs.length; x++){
		var thisPara = mainStory.paragraphs[x];
		if (contains(thisPara.appliedParagraphStyle.name, pStyles)){
			headings[p] = thisPara.contents;
			headingStyles[p] = "TOC " + thisPara.appliedParagraphStyle.name;
			pageNum[p] = thisPara.parentTextFrames[0].parentPage.name;
			p+=1;
		}
	}
	doc.pages.itemByRange(1, doc.pages.length-1).remove();
	doc.sections.add(doc.pages.firstItem(), {pageNumberStyle:PageNumberStyle.lowerRoman});
	app.findChangeTextOptions.includeMasterPages = true;
	app.findTextPreferences.findWhat = "Page";
	app.findTextPreferences.appliedParagraphStyle = "Page No.";
	app.changeTextPreferences.changeTo = "";
	doc.changeText();
	mainStory.paragraphs.itemByRange(3, mainStory.paragraphs.length-1).remove();
	var toc = mainStory.insertionPoints[-1].contents = "Table of Contents\r";
	mainStory.paragraphs[3].appliedParagraphStyle = "TOC";
	for (y=0; y<headings.length; y++){
		mainStory.insertionPoints[-1].contents = headings[y].substring(0, headings[y].length-1) + "\t" + pageNum[y] + "\r";
		mainStory.paragraphs[4+y].appliedParagraphStyle = headingStyles[y];
		if (contains(headingStyles[y], ["TOC Level 3", "TOC Level 4", "TOC Level 5"])){
			if (headings[y].length > 50){
				mainStory.paragraphs[4+y].hyphenation = false;
				mainStory.paragraphs[4+y].rightIndent = "0.25i";
				mainStory.paragraphs[4+y].insertionPoints[mainStory.paragraphs[4+y].contents.lastIndexOf(" ")+1].contents = "\n";
			}
		}
	}
	mainStory.insertionPoints[-1].contents = "Assembly Drawings and Parts Lists\r";
	mainStory.paragraphs[mainStory.paragraphs.length-1].applyParagraphStyle(doc.paragraphStyles.itemByName("TOC Level 2"), true);
	mainStory.insertionPoints[-1].applyParagraphStyle(doc.paragraphStyles.itemByName("TOC Parts List"), true);
	mainStory.insertionPoints[-1].clearOverrides();
	mainStory.insertionPoints[-2].clearOverrides();
//	mainStory.insertionPoints[-2].appliedParagraphStyle = mainStory.insertionPoints[-1].appliedParagraphStyle = doc.paragraphStyles.itemByName("TOC Parts List");
//	mainStory.insertionPoints[-2].properties = mainStory.insertionPoints[-1].properties = ({appliedFont:"ITC Bookman Std", fontStyle:"Light", spaceBefore:0, spaceAfter:0}); //, leftIndent:"3.2188in", firstLineIndent:"1.4597in"
	app.menuActions.itemByName("Sort by Name").invoke();
	var tocFrame = mainStory.textContainers[0];
	tocFrame.geometricBounds = ["67.5pt", "72pt", "720pt", "558pt"];
	tocFrame.itemLayer = "Default";
	if (tocFrame.overflows){
		tocFrame.geometricBounds = ["67.5pt", "72pt", "684pt", "558pt"];
		multiPageTOC(tocFrame);
	}
}

function multiPageTOC(tocFrame){
	var plusFrame = doc.pages[0].textFrames.add("Default");
	plusFrame.geometricBounds = ["684pt", "72pt", "720pt", "558pt"];
	plusFrame.contents = "+";
	plusFrame.texts[0].properties = ({appliedFont:"ITC Bookman Std", fontStyle:"Bold", pointSize:"24pt", justification:Justification.rightAlign, alignToBaseline:true});
	var newPage = doc.pages.add(LocationOptions.AFTER, doc.pages.firstItem());
	var newFrame = newPage.textFrames.add({itemLayer:"Default"});
	newFrame.geometricBounds = ["76.8pt", "54pt", "738pt", "540pt"];
	tocFrame.nextTextFrame = newFrame;
	if (tocFrame.parentStory.textContainers.length < 2){
		newFrame.previousTextFrame = tocFrame;
	}
	if (newFrame.overflows){
		newFrame.geometricBounds[2] = "684pt";
		var newPlusFrame = plusFrame.duplicate(newPage);
		newPlusFrame.geometricBounds = ["684pt", "54pt", "720pt", "540pt"];
		var newerPage = doc.pages.add();
		var newerFrame = newerPage.textFrames.add({geometricBounds:["76.8pt", "684pt", "737.975pt", "1170pt"]});
		newFrame.nextTextFrame = newerFrame;
	}
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

function contains(theItem, theArray){
	for (z = 0; z < theArray.length; z++){
		var arrayItem = theArray[z];
		if (theItem == arrayItem){
			return true;
		}
	}
	return false;
}
