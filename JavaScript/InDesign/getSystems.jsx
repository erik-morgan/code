#target indesign
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
app.preflightOptions.preflightOff = true;
var ssFile = File('/Users/HD6904/Downloads/SS-List.txt');
ssFile.open('r');
var ssText = ssFile.read();
ssFile.close();
var ssList = ssText.split('\n');
var sysList = [];
for (var f = 0; f < ssList.length; f++){
    var rp = ssList[f];
    if (/^.+BP$/i.test(rp)){
        var indd = Folder('/Users/HD6904/Desktop/TOCs/BP').getFiles(rp + ' *indd');
    }
    else {
        var indd = Folder('/Users/HD6904/Desktop/TOCs').getFiles(rp + ' *indd');
    }
    if (indd.length == 0){
        var indd = Folder('/Users/HD6904/Desktop/TOCs/InDesign Source Files').getFiles(rp + ' *indd');
        if (indd.length == 0){
            var foot = '';
        }
        else {
            var foot = getFooter(indd.pop());
        }
    }
    else {
        var foot = getFooter(indd.pop());
    }
    sysList.push(foot);
}
var sysFile = new File('/Users/HD6904/Downloads/syslist.txt');
sysFile.open('w');
sysFile.write(sysList.join('\n'));
sysFile.close();
$.writeln(sysList);

function getFooter(inddFile){
    var doc = app.open(inddFile);
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences.findWhat = '(?i)\\A.*SS-\\d\\d.+SYSTEM';
    app.findGrepPreferences.appliedParagraphStyle = 'footer';
    app.findChangeGrepOptions.includeMasterPages = true;
    try {
        var sysText = doc.findGrep()[0].contents;
    }
    catch (e){
        var masterFrames = doc.masterSpreads[0].textFrames.everyItem().getElements();
        masterFrames.sort(function (a,b){
            return (a.geometricBounds[1]+a.geometricBounds[3])/2 - (b.geometricBounds[1]+b.geometricBounds[3])/2;
        });
        var sysText = masterFrames[1].contents;
    }
    doc.close(SaveOptions.NO);
    return sysText;
}