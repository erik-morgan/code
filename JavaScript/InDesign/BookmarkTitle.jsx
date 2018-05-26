#target indesign

var doc = app.activeDocument;
app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = '^.+$';
app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('RUNNING THE');
runThe = doc.findGrep()[0].contents.split(' ');
for (var i = 0; i < runThe.length; i++){
	runThe[i] = changeTense(runThe[i].toLowerCase());
}
runThe = runThe.join(' ');
app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
try {
	app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('Level 1 (18 pt)');
	levelOne = doc.findGrep()[0].contents;
}
catch (e){
	app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('Level 1 (24 pt)');
	levelOne = doc.findGrep()[0].contents;
}

var titleString = (runThe + ' ' + levelOne);
titleString = titleString.replace(/\s+|\n|\r/g, ' ');
titleString = titleString.replace(/\s+$/, '');
rpTitle = caseHandler(titleString.split(' ')).join(' ');
var bm = doc.bookmarks.add(doc.pages[0], {name:rpTitle});
if (bm.name !== rpTitle){
	bm.name = rpTitle;
}

function changeTense(verb){
	var comma = (verb[verb.length-2] == ',') ? ',' : '';
	if (verb == 'running') return 'run' + comma;
	else if (verb == 'retrieving') return 'retrieve' + comma;
	else if (verb == 'testing') return 'test' + comma;
	else if (verb == 'using') return 'use' + comma;
	else if (verb == 'installing') return 'install' + comma;
	else if (verb == 'operating') return 'operate' + comma;
	else return verb.toLowerCase() + comma;
}

function caseHandler(words){
	var retWords = [];
	for (var i = 0; i < words.length; i++){
		if (words[i].search(/bigbore/i) > -1) {
			retWords.push(words[i].replace(/b/ig, 'B'));
			continue;
		}
		if (words[i].search(/SS-/i) > -1){
			retWords.push(words[i].toUpperCase());
			continue;
		}
		if (/(i{2,3}|PSI|BOP|HPHT|HTHL|HCLD|MPT|CADA)/i.test(words[i])){
			retWords.push(words[i].toUpperCase());
			continue;
		}
		else if (/^BR-Style/i.test(words[i])){
			retWords.push(words[i].replace(/BR-Style/i, 'BR-Style'));
			continue;
		}
		else if (words[i].search('-') > -1){
			var tempStr = caseHandler(words[i].split('-')).join('-');
			retWords.push(tempStr);
			continue;
		}
		var lowerWords = /^(a|about|above|across|after|along|an|and|around|as|at|before|behind|below|between|but|by|down|for|from|in|into|like|mid|near|next|nor|of|on|onto|or|out|over|past|per|plus|save|so|than|the|till|to|under|until|unto|up|upon|via|with|within|without|yet)$/i;
		if (words[i].search(lowerWords) >= 0){
			retWords.push(words[i].toLowerCase());
		}
		else {
			if (words[i].charAt(0) == '('){
				retWords.push(words[i].substr(0,2).toUpperCase() + words[i].substr(2).toLowerCase());
			}
			else {
				retWords.push(words[i].charAt(0).toUpperCase() + words[i].substr(1).toLowerCase());
			}
		}
	}
	return retWords;
}