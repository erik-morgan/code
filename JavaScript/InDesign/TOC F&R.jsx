#target indesign

var doc = app.activeDocument;
var findList = ["min ", String.fromCharCode(8221), "\t\t", "BBII", ", BigBore II", "BigBore 2", "BB2", "RLD", "CHSART", "SART", "-out", " & ", "Mill and Flush", "1st", "2nd", " Pos ", "LIT", "LDS", "Max OD", "OLR", "TSJ", "OAL", "WT", "TBC"];
var replaceList = ["Min. ", "\"", "\t", "BB II", ", BB II", "BB II", "BB II", "Rigid Lockdown", "Casing Hanger and Seal Assembly Running Tool", "Seal Assembly Running Tool", "-Out", " and ", "Mill & Flush", "First", "Second", " Position ", "Lead Impression Tool", "Lockdown Sleeve", "Max. OD", "Outer Lock Ring", "Tapered Stress Joint", "Overall Length", "Wall Thickness", "Tie-Back Connector"];

app.findGrepPreferences = app.changeGrepPreferences = app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;

app.findTextPreferences.appliedParagraphStyle = doc.paragraphStyles.itemByName("TOC Parts List");
var partsList = doc.findText();
partsList[0].hyphenation = false;
var mainStory = partsList[0].parentStory;
app.findGrepPreferences.appliedParagraphStyle = app.changeGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.itemByName("TOC Parts List");
for (var x = 0; x < findList.length; x++){
	app.findGrepPreferences.findWhat = findList[x];
	app.changeGrepPreferences.changeTo = replaceList[x];
	doc.changeGrep();
}
app.findGrepPreferences.findWhat = "^(420056-02|420295-02)\t.*$";
app.changeGrepPreferences.changeTo = "$1\t18-3/4\" Jet Sub";
doc.changeGrep();
//~ var bmText = mainStory.paragraphs[0].contents + mainStory.paragraphs[1].contents;
//~ bmText = bmText.replace(/\r/," ");
//~ bmText = bmText.replace(/\r/, "");
//~ bmText = bmText.replace(/(Run)ning|
//~ $.writeln(bmText);
//~ doc.bookmarks.add(doc.pages.firstItem(), {name:bmText});
