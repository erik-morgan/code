
function getGmail() {
  var getIDs = function () {
    var ids = [];
    while (!props.getProperty('g_ids_done') && timer < 300) {
      try {
        var nextPage = props.getProperty('next_page_token');
        var response = Gmail.Users.Threads.list({
          'userId': me,
          'labelIds': ['INBOX'],
          'pageToken': nextPage
        });
      }
      catch (e) {
        var response = Gmail.Users.Threads.list({
          'userId': me,
          'labelIds': ['INBOX']
        });
      }
    }
    var r = ss_ids.getLastRow() + 1;
    /*
      var rng = ss_ids

      on first run, time function execution; calculate number of requests in 5 minutes
      when less than 100 ids are returned, set done prop to true
      while getting ids AND threads, use a single property
        to store info between runs, and make a function to handle that and the trigger

    function listMessages(userId, query, callback) {
      var getPageOfMessages = function(request, result) {
        request.execute(function(resp) {
          result = result.concat(resp.messages);
          var nextPageToken = resp.nextPageToken;
          if (nextPageToken) {
            request = gapi.client.gmail.users.messages.list({
              'userId': userId,
              'pageToken': nextPageToken,
              'q': query
            });
            getPageOfMessages(request, result);
          }
          else {
            callback(result);
          }
        });
      };
    }
    */
  };
  var getThreads = function () {};
  if (props.getProperty('g_ids_done')) {
    getThreads;
  }
  else {
    getIDs;
  }
}

function gmailStats() {
  Logger.clear();
  var start = +new Date();
  var props = PropertiesService.getScriptProperties();
  if (props.getKeys().length == 0) {
    props.setProperties({'threadIndex':0, 'rowIndex':2});
    if (ScriptApp.getProjectTriggers().length == 0) {
      ScriptApp.newTrigger('gmailStats').timeBased().everyMinutes(5).create();
    }
  }
  var sheet = SpreadsheetApp.openById('1vNX7dfILoamf1YMG8mQukvKsbMASA2afTkn4bj2C81U').getSheetByName('Sheet1');
  var tStart = Number(props.getProperty('threadIndex'));
  var rowCount = Number(props.getProperty('rowIndex'));
  var isFinished = false;
  while (!isFinished && (+new Date() - start) < 240000) {
    var threads = GmailApp.getInboxThreads(tStart, 100);
    if (threads.length == 0) {
      isFinished = true;
      break;
    }
    for (t = 0; t < threads.length; t++) {
      var messages = threads[t].getMessages();
      for (m = 0; m < messages.length; m++) {
        var msg = messages[m];
        var mStats = [[
          msg.getDate(),
          msg.getReplyTo(),
          msg.getFrom(),
          msg.getTo(),
          msg.getSubject(),
          /unsubscribe/im.test(msg.getRawContent())
        ]];
        sheet.getRange(rowCount, 1, 1, 6).setValues(mStats);
        rowCount = rowCount + 1;
      }
  }
    tStart += 100;
    props.setProperty('threadIndex', tStart);
    props.setProperty('rowIndex', rowCount);
  }
  if (isFinished) {
    props.deleteAllProperties();
    var trigger = ScriptApp.getProjectTriggers()[0];
    ScriptApp.deleteTrigger(trigger);
  }
}
