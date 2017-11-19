/*
    message array = [service,time,subject,sender]

    the progress property holds 1, 2, or 3 based on how many of the essential functions have been completed
    starting at 0, outlook will add 1 when it is done
    google will add 1 when it finishes filling IDS and another 1 when finished fetching messages
*/
//var ss = SpreadsheetApp.openById('1h_BpQR3MAtT0eFXs50S_kdNqg5UsPbU3q_7bxT3UyMM');
//var ss_msg = ss.getSheetByName('MESSAGES');
//var ss_ids = ss.getSheetByName('IDS');
//var date = function () { return Date.now()/1000; };
//var start = date();
//var props = PropertiesService.getScriptProperties();
//if (props.getKeys().length == 0) {
//	props.setProperty('progress', false);
//}

function main() {
  getAuth();
  getGmail();
  logGmail();
}
