function clearSpots(doc){
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    app.scriptPreferences.enableRedraw = false;
    app.preflightOptions.preflightOff = true;
    var done = false;
    var artFolder = Folder(doc.fullName.toString().replace(/\.indd/, ''));
    artFolder.create();
    for (var i = 0; i < doc.links.length; i++){
        if (doc.links[i].status == LinkStatus.LINK_EMBEDDED){
            doc.links[i].unembed(artFolder);
        }
    }
    var artFiles = artFolder.getFiles('*.EPS');
    var jsAI = 'var files = ("' + artFiles.join('|') + '").split("|");\n';
    jsAI += 'for (var i = 0; i < files.length; i++){\n';
    jsAI += 'var doc = app.open(File(files[i]));\n';
    jsAI += 'doc.spots.removeAll();\n';
    jsAI += 'doc.saveAs(File(files[i]), new EPSSaveOptions());\n';
    jsAI += 'doc.close(SaveOptions.SAVECHANGES);\n';
    jsAI += '}';
    var bt = new BridgeTalk;
    bt.target = 'illustrator';
    bt.body = jsAI;
    bt.onResult = function (resObj){
        done = true;
    }
    bt.send(60);
    while (!done){
        $.sleep(1500);
    }
    for (var u = 0; u < doc.links.length; u++){
        doc.links[u].update();
        doc.links[u].unlink();
    }
    Folder(artFolder).remove();
    doc.save();
    app.scriptPreferences.enableRedraw = true;
    app.preflightOptions.preflightOff = false;
}
