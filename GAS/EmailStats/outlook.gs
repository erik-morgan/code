function getOmail(token) {
  var messages = [];
  var heads = {
    'Authorization': 'Bearer ' + token,
    'X-AnchorMailbox': 'morgan.erik@outlook.com'
  };
  if (props.getProperty('onext')) {
    getMessages(props.getProperty('onext'));
  }
  else {
    getMessages();
  }
  function getMessages(link){
    var request = link || props.getProperty('olink');
    var response = JSON.parse(UrlFetchApp.fetch(request, {headers: heads}).getContentText());
    var olist = response['value'];
    for (var m = 0; m < olist.length; m++) {
      var msg = olist[m];
      var from = msg['from']['emailAddress'];
      messages.push(['Outlook', msg['receivedDateTime'], msg['subject'], from.name, from.address]);
    }
    if (response['@odata.nextLink']){
      if (date() - start < 300){
        getMessages(response['@odata.nextLink']);
      }
      else {
        props.setProperty('onext', response['@odata.nextLink']);
      }
    }
    else {
      FLAG++;
      props.setProperty('progress', FLAG);
    }
  }
  var rng = oss.getRange(oss.getLastRow() + 1, 1, messages.length, messages[0].length);
  rng.setValues(messages);
}
