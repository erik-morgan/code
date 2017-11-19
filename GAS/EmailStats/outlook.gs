function getOmail(token) {
  var FLAG = Number(props.getProperty('progress'));
  if (FLAG) return;
  var messages = [];
  var heads = {
    'Authorization': 'Bearer ' + token,
    'X-AnchorMailbox': 'morgan.erik@outlook.com'
  };
  while (date() - start < 300 && !FLAG){
    var request = (props.getProperty('onext')) ? props.getProperty('onext') : props.getProperty('olink');
    var response = JSON.parse(UrlFetchApp.fetch(request, {headers: heads}).getContentText());
    try {
      props.setProperty('onext', response['@odata.nextLink']);
    }
    catch (e){
      FLAG++;
    }
    var olist = response['value'];
    for (var m = 0; m < olist.length; m++) {
      var msg = olist[m];
      var from = msg['from']['emailAddress'];
      messages.push(['Outlook', msg['receivedDateTime'], msg['subject'], from.name, from.address]);
    }
  }
  props.setProperty('progress', FLAG);
  var rng = ss_msg.getRange(ss_msg.getLastRow(), 1, messages.length, messages[0].length);
  rng.setValues(messages);
}
