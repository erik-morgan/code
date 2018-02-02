#target indesign
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
var doc;
var indd = Folder('/Users/HD6904/Erik/PM2INDD/QUEUE/INDD/').getFiles('*.indd');
var doneINDD = '/Users/HD6904/Erik/PM2INDD/DONE/INDD/';
var doneP65 = '/Users/HD6904/Erik/PM2INDD/DONE/P65/';
var profile = app.preflightProfiles.item('PM2INDD');

for (var i = 0; i < indd.length; i++){
    doc = app.open(indd[i]);
    var docName = doc.name;
    doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    var isDone = (testDoc() && testPreflight());
    doc.close(SaveOptions.YES);
    if (isDone){
        app.doScript('do shell script "mv ' + indd[i] + ' ' + doneINDD + docName + '"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
        try {
            app.doScript('do shell script "mv /Users/HD6904/Erik/PM2INDD/QUEUE/P65/' + docName.replace(/indd$/, 'p65') + ' ' + doneP65 + docName.replace(/indd$/, 'p65') + '"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
        }
        catch (e){}
    }
}

app.scriptPreferences.enableRedraw = true;

function testDoc(){
    if (doc.swatches.length == 10 && doc.characterStyles.length == 5 && doc.paragraphStyles.length == 33 && doc.links.item('DQ Logo.ai').isValid && doc.links.item('DQ Logo.ai').status == LinkStatus.NORMAL){
        try {
            app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
            app.findGrepPreferences.properties = {findWhat:'.+', appliedParagraphStyle:doc.paragraphStyles.item('SUGGESTED PROCEDURE')};
            var sugProc = doc.findGrep();
            app.findGrepPreferences.appliedParagraphStyle = doc.paragraphStyles.item('Level 2 (Tools)');
            var toolsNeeded = doc.findGrep();
            if (sugProc.length == 0 || toolsNeeded.length == 0 || sugProc[0].parentStory !== toolsNeeded[0].parentStory) return false;
            else return true;
        }
        catch (e){
            return false;
        }
    }
    return false;
}

function testPreflight(){
    var process = app.preflightProcesses.add(doc, profile);
    process.waitForProcess();
    var results = (/^None/.test(process.processResults));
    process.remove();
    return results;
}
