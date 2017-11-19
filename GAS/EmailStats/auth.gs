function getGraphService() {
  return OAuth2.createService('graph')
    .setAuthorizationBaseUrl('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
    .setTokenUrl('https://login.microsoftonline.com/common/oauth2/v2.0/token')
    .setClientId('2c7bbb43-f224-4d37-aa3d-1cbb320c47bb')
    .setClientSecret('xqsIAMH83=[tzqrYGX811##')
    .setCallbackFunction('authCallback')
    .setPropertyStore(props)
    .setScope('offline_access https://graph.microsoft.com mail.read')
    .setParam('grant_type', 'client_credentials');
}

function getAuth() {
  var graph = getGraphService();
  if (graph.hasAccess()) {
    Logger.log('access granted');
    getOmail(graph.getAccessToken());
  }
  else {
    Logger.log('access denied');
    var authURL = graph.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s', authURL);
  }
}

function authCallback(request) {
  Logger.log('authCallback reached');
  var service = getGraphService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    Logger.log('authorization successful');
    return HtmlService.createHtmlOutput('Success!');
  }
  else {
    Logger.log('authorization failed');
    return HtmlService.createHtmlOutput('Denied.');
  }
}
