#target indesign
var doc = app.activeDocument;
var links = doc.links.everyItem().getElements();

if (File.fs == 'Macintosh'){
    for (i = 0; i < links.length; i++){
        var link = links[i];
        var linkPath = link.filePath;
        linkPath = linkPath.replace(/N:\/S/, "s");
        if (File(linkPath).exists && link.status == LinkStatus.linkMissing)
            link.relink(File(linkPath));
    }
}
else if (File.fs == 'Macintosh' && (/macvol/).test(links[0].filePath)){
    for (i = 0; i < links.length; i++){
        var link = links[i];
        var linkPath = link.filePath;
        linkPath = linkPath.replace(/macvol/, 'share');
        if (File(linkPath).exists && link.status == LinkStatus.linkMissing)
            link.relink(File(linkPath));
    }
}
