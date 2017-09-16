// Launch HTML Service Dialog Window with a Single Button that says 'Start', and use that to launch the app
// Look up the difference between a web add-on and a web app
// See what happens when you go to Publish > Test as add-on

function doGet(){
  return HtmlService
  .createTemplateFromFile("picker")
  .evaluate()
  .addMetaTag("viewport", "width=device-width, initial-scale=1")
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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

function include(fileName) {
  return HtmlService
  .createHtmlOutputFromFile(fileName)
  .getContent();
}

function getOAuthToken() {
//  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

/*

function initPicker(){
  return {
    locale: 'en',
    token: ScriptApp.getOAuthToken(),
    origin: "https://script.google.com",
    parentFolder: "xyz",
    developerKey: "ctrlq.org",
    dialogDimensions: {
      width: 600, 
      height: 425
    },
    picker: {
      viewMode: "LIST",
      mineOnly: true,
      mimeTypes: "image/png,image/jpeg,image/jpg",
      multiselectEnabled: true,
      allowFolderSelect: true,
      navhidden: true,
      hideTitle: true,
      includeFolders: true,
    }
  };
}
//unzip(unzipTo, file);
  file.createFile(Utilities.zip(getBlobs(folder, ''), 'TestArchive.zip'));


key='AIzaSyClIfn435yQkQtiz4aX8jUkaXjg3F6Z5YQ';
function onOpen(){
  DriveApp.getUi().createMenu('Google Picker')
      .addItem('Choose Folder', 'showPicker')
}

function testzip(){
var files=DocsList.getRootFolder().find('Sans titre.txt.zip');
var zipblob=files[0].getBlob();
var unzipblob = Utilities.unzip(zipblob);
var unzipstr=unzipblob[0].getDataAsString();// it is a text file
DocsList.createFile('Sans titre.txt',unzipstr);// I kept the original name to make it simple
}
function getBlobs(rootFolder, path){
  var blobs = [];
  var files = rootFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next().getBlob();
    file.setName(path+file.getName());
    blobs.push(file);
  }
  var folders = rootFolder.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    var fPath = path+folder.getName()+'/';
    blobs.push(Utilities.newBlob([]).setName(fPath));
    blobs = blobs.concat(getBlobs(folder, fPath));
  }
  return blobs;
}
*/
