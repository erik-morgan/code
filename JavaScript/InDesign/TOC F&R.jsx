#target indesign

var doc = app.activeDocument;
var mainStory = findChangeGrep({'findWhat': '(?i)SUGGESTED PROCEDURE'}, undefined, undefined)[0].parentStory;
var findList = ['\\r$', '\\bm(in|ax)\\b', String.fromCharCode(8221), '\\t{2,}', '\\b(BB|BigBore).?(II|2)', '\\bCHSART\\b', '\\bSART\\b', '-in\\b', '-out\\b', ' & ', 'Mill and Flush', '1st', '2nd', '\\bPos\\b', '\\bLIT\\b', '\\bLDS\\b', '\\bOLR\\b', '\\bTSJ\\b', '\\bOAL\\b', '\\bWT\\b', '\\bTBC\\b', '\\bbr.style', '^(420056-02|420295-02)\\t.*$', 'f\\/ ?', '\\r\\z', '\\bx\\b'];
var replaceList = ['', 'M$1.', '"', '\\t', 'BB II', 'Casing Hanger and Seal Assembly Running Tool', 'Seal Assembly Running Tool', '-In', '-Out', ' and ', 'Mill & Flush', 'First', 'Second', 'Position', 'Lead Impression Tool', 'Lockdown Sleeve', 'Outer Lock Ring', 'Tapered Stress Joint', 'Overall Length', 'Wall Thickness', 'Tie-Back Connector', 'BR-Style', '$1\\t18-3/4" Jet Sub', 'for ', '', 'x'];
// "MRLD", "RLD",  
// "Mechanical Rigid Lockdown",  "Rigid Lockdown",  

doc.paragraphStyles.item('TOC Parts List').hyphenation = false;

app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('TOC Parts List');
for (var i = 0; i < findList.length; i++) {
	app.findGrepPreferences.findWhat = '(?i)' + findList[i];
	app.changeGrepPreferences.changeTo = replaceList[i];
	doc.changeGrep();
}
if (/^Assembly Drawing/i.test(mainStory.paragraphs[-2].contents)) findChangeGrep({'findWhat': '(Assembly Drawing)s?( and Parts List)s?'}, {'changeTo': '$1$2'}, undefined);
processIllustrations();

function processIllustrations(){
	for (var i = 0; i < mainStory.paragraphs.length; i++){
		if (/^Assembly Drawing/.test(mainStory.paragraphs[i].contents)){
			var assDraw = mainStory.paragraphs[i];
			if (/^(\d-|[A-Z])[A-Z]+/.test(mainStory.paragraphs[i+1].contents)){
				for (var j = i + 1; j < mainStory.paragraphs.length; j++){
					if (!(/^\d-[A-Z]+/.test(mainStory.paragraphs[j + 1].contents))){
						mainStory.paragraphs[j+1].insertionPoints[0].contents = assDraw.contents;
						mainStory.paragraphs[j+1].appliedParagraphStyle = doc.paragraphStyles.item('TOC Level 2');
						assDraw.contents = (j - i > 1) ? 'Illustrations\r' : 'Illustration\r';
						mainStory.paragraphs[i+1].appliedParagraphStyle = doc.paragraphStyles.item('TOC Parts List');
						return;
					}
				}
			}
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
