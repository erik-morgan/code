#target indesign

var doc = app.activeDocument;

app.findGrepPreferences.findWhat = '^.+$';
app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('RUNNING THE');
runThe = doc.findGrep()[0].contents;
runThe = runThe.replace(/(run)ning|(test)ing|(install)ing/gi, '$1');
runThe = runThe.replace(/(retriev)ing|(us)ing|(operat)ing/gi, '$1e');

try {
	app.findGrepPreferences.findWhat = '[^\r]+';
	app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('Level 1 (18 pt)');
	levelOne = doc.findGrep()[0].contents;
}
catch (e){
	app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('Level 1 (24 pt)');
	levelOne = doc.findGrep()[0].contents;
}

var titleString = (runThe + ' ' + levelOne);
titleString = titleString.replace(/\s+/g, ' ');
titleString = titleString.replace(/[A-Za-z0-9]+/g, toTitleCase);

doc.bookmarks.add(doc.pages[0], {name:titleString});

function toTitleCase(title){
	return title.replace(/[A-Za-z]+[^\s-]*/g, caseHandler);
}

function caseHandler(match, index, fullText){
	if (/^i+$|PSI/i.test(match)){
		return match.toUpperCase();
	}
	var lowerWords = /^(a|about|above|across|after|along|an|and|around|as|at|before|behind|below|between|but|by|down|for|from|in|inside|into|like|mid|near|next|nor|of|off|on|onto|or|out|over|past|per|plus|save|so|than|the|till|to|under|until|unto|up|upon|via|with|within|without|yet)$/i;
	var isFirst = (index == 0) ? true : false;
	var isLast = (index + match.length == fullText.length) ? true : false;
	var notLower = (match.search(lowerWords) == -1) ? true : false;
	var isHyphenated = (fullText.charAt(index + match.length) == '-' || fullText.charAt(index - 1) === '-') ? true : false;
	if (isFirst || isLast || notLower || isHyphenated){
		return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
	}
	else {
		return match.toLowerCase();
	}
}

/*

var pastParts = ["running", "retrieving", "testing", "using", "installing", "operating"];
var presParts = ["Run", "Retrieve", "Test", "Use", "Install", "Operate"];
var xLower = ["a", "an", "the", "about", "above", "across", "after", "along", "around", "as", "at", "before", "behind", "below", "between", "by", "down", "from", "in", "inside", "into", "near", "of", "off", "on", "onto", "over", "past", "than", "to", "under", "until", "up", "upon", "with", "within", "without", "and", "but", "for", "nor", "or", "so", "yet"];
var newBM = doc.bookmarks.add(doc.pages.firstItem(), {name:titleRP});

*/