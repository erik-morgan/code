function getGmail() {
  if (FLAG == 1) {
    var ids = [];
    var params = {
      'labelIds': 'INBOX',
      'maxResults': 500
    }
    if (props.getProperty('gnext')) {
      getIDs(params, props.getProperty('gnext'));
    }
    else {
      getIDs(params);
    }
    function getIDs(options, nextToken){
      if (nextToken) {
        options.pageToken = nextToken;
      }
      var response = Gmail.Users.Messages.list('me', options);
      var glist = response['messages'];
      for (var m = 0; m < glist.length; m++) {
        ids.push(glist[m]['id']);
      }
      if (response['nextPageToken']){
        if (date() - start < 300){
          getIDs(params, response['nextPageToken']);
        }
        else {
          props.setProperty('gnext', response['nextPageToken']);
        }
      }
      else {
        FLAG++;
        props.setProperty('progress', FLAG);
      }
    }
    var rng = idss.getRange(idss.getLastRow() + 1, 1, ids.length, ids[0].length);
    rng.setValues(ids);
  }
  if (FLAG == 2){
    var index = (props.getProperty('gindex')) ? props.getProperty('gindex') : 2;
    var mids = idss.getRange(index, 1, idss.getLastRow() - index + 1).getValues();
    var messages = [];
    for (var i = 0; i < mids.length; i++){
      var m = GmailApp.getMessageById(mids[i][0]);
      var from = m.getFrom().split(' <');
      messages.push(['Gmail', m.getDate(), m.getSubject(), from[0], from[1].substr(0, from[1].length - 1)]);
      index++;
      if (date() - start > 300){
        props.setProperty('gindex', index + 1);
        break;
      }
    }
    if (i == mids.length){
      FLAG++;
      props.setProperty('progress', FLAG);
    }
    var rng = gss.getRange(gss.getLastRow() + 1, 1, messages.length, messages[0].length);
    rng.setValues(messages);
  }
}
