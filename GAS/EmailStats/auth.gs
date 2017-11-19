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
    getOmail(graph.getAccessToken());
  }
  else {
    var authURL = graph.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s', authURL);
  }
}

function authCallback(request) {
  var service = getGraphService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  }
  else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}
/*
function attemptTokenRefresh_() {
  var refreshToken = UserProperties.getProperty(refreshTokenPropertyName);
  if (!refreshToken) {
    Logger.log('No refresh token available to refresh with ' + tokenKey);
    return false;
  }
  var requestData = {method:'post',payload:{client_id:CLIENT_ID,client_secret:CLIENT_SECRET,refresh_token:refreshToken,grant_type:'refresh_token'}};
  var response = UrlFetchApp.fetch(TOKEN_URL, requestData).getContentText();
  storeOAuthValues_(response);
}
function storeOAuthValues_(response){
  var tokenResponse = JSON.parse(response);
  var accessToken = tokenResponse.access_token;
  var endMs = Date.now() + tokenResponse.expires_in * 1000;
  var refreshToken = tokenResponse.refresh_token;
  UserProperties.setProperty(oauthTokenPropertyName, accessToken);
  if (refreshToken) {
    UserProperties.setProperty(refreshTokenPropertyName, refreshToken);
  }
  UserProperties.setProperty(oauthTokenExpiresPropertyName, endMs);
}
*/
