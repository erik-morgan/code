var API_KEY = 'AIzaSyDg7fq3vA4Aq0mTTG0eAQjKEn17WPjMQsY';
var REDIRECT_URL = 'https://script.google.com/macros/s/AKfycbxUhB9WA9YRTQDRshxYhNV9bLgb0hLCemslxvhABYFGv8ExdfU/exec';
var CLIENT_ID = '873778939950-8rulam49hgbkuks846nmnf878f3tft5c.apps.googleusercontent.com';
var CLIENT_SECRET = 'CEG0dK9cAjWXt-2SEr70ciRr';
var PROJECT_ID = 'unzipthis-180115';
var PROJECT_NUMBER = '873778939950';
var SCOPE = ['https://www.googleapis.com/auth/drive'];
var AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/auth';
var TOKEN_URL = 'https://accounts.google.com/o/oauth2/token';
var OAUTH_TOKEN;

function doGet(e){
  if (JSON.parse(e.parameter.state).action === 'open'){
    var fileID = state.ids[0];
    UrlFetchApp.fetch(getURLForAuthorization());
    getAndStoreAccessToken
    unzipThis(fileID);
  }
  else {
    return HtmlService
      .createHtmlOutputFromFile('picker.html')
      .setWidth(600)
      .setHeight(425)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function include(fileName) {
  return HtmlService
  .createHtmlOutputFromFile(fileName)
  .getContent();
}

function unzipThis(thisId){
  var file = DriveApp.getFileById(thisId);
  var folderName = file.getName().replace(/\.zip$/i, '');
  var parent = file.getParents().next();
  var unzipTo = parent.createFolder(folderName);
  var blobList = Utilities.unzip(file);//.getBlob()
  for (var i = 0; i < blobList.length; i++){
    unzipTo.createFile(blobList[i]);
  }
}

/*
  // if we get 'code' as a parameter in, then this is a callback. we can make this more explicit
  if(e.parameter.code){
    getAndStoreAccessToken(e.parameter.code);
    HTMLToOutput = 'App is installed, you can close this window now or open up Google Drive.';
  }
  // we are starting from scratch or resetting
  else {
    var t = HtmlService.createTemplateFromFile('ui')
    t.message = HTMLToOutput;
    return t.evaluate().setSandboxMode(HtmlService.SandboxMode.NATIVE)
  }
}
*/
function getURLForAuthorization(){
  return AUTHORIZE_URL + '?response_type=code&client_id='+CLIENT_ID+'&redirect_uri='+REDIRECT_URL +'&scope=https://www.googleapis.com/auth/drive';  
}

function getAndStoreAccessToken(code){
  var parameters = {
    method : 'post',
    payload : 'client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET+'&grant_type=authorization_code&redirect_uri='+REDIRECT_URL+'&code=' + code
  };
  // no need to do anything with the token going forward. 
  var response = UrlFetchApp.fetch(TOKEN_URL,parameters).getContentText();
}