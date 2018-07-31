#target indesign

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

if (!ExternalObject.AdobeXMPScript)
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');

docFile = File('/c/Users/erik/Downloads/SS6277-03 r3 Run Something.indd');
doc = app.open(docFile);
name = /^([^. ]+)(.R(\d+))?/.exec(doc.name.toUpperCase());
links = getLinks();
doc.close(SaveOptions.YES);

fxmp = new XMPFile(docFile.fsName, XMPConst.FILE_UNKNOWN, XMPConst.OPEN_FOR_UPDATE);
xmp = fxmp.getXMP();
ns = 'http://dril-quip.com/rp/';
XMPMeta.registerNamespace(ns, 'rp');
xmp.setProperty(ns, 'id', name[1]);
xmp.setProperty(ns, 'revision', name[3] || 0);
XMPUtils.separateArrayItems(xmp, ns, 'links', XMPConst.SEPARATE_ALLOW_COMMAS, links.join('\t'));
// inspecting XMPUtils.catenateArrayItems() & XMPUtils.separateArrayItems()
// for (var i = 0; i < links.length; i++) {
//     xmp.appendArrayItem(ns, 'links', File(links[i]).absoluteURI, 0, XMPConst.ARRAY_IS_ORDERED);
// }
/*
 * XMPUtils.separateArrayItems(xmpObj, schemaNS, arrayName, arrayOptions, concatString)
 * XMPConst.SEPARATE_ALLOW_COMMAS | XMPConst.APPEND_ALL_PROPERTIES
 * XMPConst.APPEND_ALL_PROPERTIES vs XMPConst.APPEND_REPLACE_OLD_VALUES
 * $.writeln(XMPUtils.catenateArrayItems(xmp, ns, 'links', '; ', '"', XMPConst.SEPARATE_ALLOW_COMMAS));
 */
fxmp.putXMP(xmp);
fxmp.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);

function getLinks () {
    var links = doc.links.everyItem().filePath.sort();
    for (var i = links.length - 1; i > -1; i--) {
        if (links[i - 1] == links[i])
            links.splice(i, 1);
        else
            links[i] = decodeURI(File(links[i]));
    }
    return links;
}

function getLinksOG () {
    var links = doc.links.everyItem().filePath.sort();
    for (var i = links.length - 1; i > -1; i--) {
        if (links[i - 1] == links[i])
            links.splice(i, 1);
    }
    return links;
}
