/*
    message array = [service,time,subject,sender name, sender email]

    the progress property holds 1, 2, or 3 based on how many of the essential functions have been completed
    starting at 0, outlook will add 1 when it is done
    google will add 1 when it finishes filling IDS and another 1 when finished fetching messages
*/
var ss = SpreadsheetApp.openById('1h_BpQR3MAtT0eFXs50S_kdNqg5UsPbU3q_7bxT3UyMM');
var oss = ss.getSheetByName('OUTLOOK');
var gss = ss.getSheetByName('GMAIL');
var idss = ss.getSheetByName('IDS');
var date = function () { return Date.now()/1000; };
var start = date();
var props = PropertiesService.getScriptProperties();
var FLAG = Number(props.getProperty('progress'));

function run() {
  try {
    main();
    logit();
  }
  catch (e) {
    logit(e);
  }
}

function main() {
  if (ScriptApp.getProjectTriggers().length == 0) {
    ScriptApp.newTrigger('main').timeBased().everyMinutes(7).create();
  }
  Logger.log('trigger created');
  if (!FLAG) {
    Logger.log('FLAG is 0');
    getAuth();
  }
  if (FLAG && date() - start < 300) {
    Logger.log('FLAG > 0');
    getGmail();
  }
  if (FLAG == 3) {
    Logger.log('FLAG = 3');
    var triggers = ScriptApp.getProjectTriggers();
    for (var t = 0; t < triggers.length; t++) {
      ScriptApp.deleteTrigger(triggers[t]);
    }
    Logger.log('triggers removed');
  }
}
