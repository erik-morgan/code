/*
 * avoid creating another file for what is, essentially, a simple script
 */

function Procedure (fileObject) {
    this.file = fileObject;
    this.name = decodeURI(fileObject.name.toUpperCase());
    this.id = this.name.match(/^([^. ]+)/)[0];
    this.rev = /\bR(\d+)\b/.test(this.name) ? /\bR(\d+)\b/.exec(this.name)[0] : 0;
    this.name = this.id + (this.rev ? '.R' + this.rev : '');
    this.path = decodeURI(this.file.path) + '/' + this.name;
};

Procedure.prototype.updateStyles = function () {
    // if twd agrees to table styles, uncomment the following line
    // doc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, STYLE_SHEET);
    doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, STYLE_SHEET);
    if (doc.paragraphStyles.item('TOC Level 1').isValid)
        doc.paragraphStyles.item('TOC Level 1').remove();
};

Procedure.prototype.updateLinks = function () {
    // using forEach
    doc.links.everyItem().getElements().forEach(function (link) {
        link.update();
        if (link.status == LinkStatus.LINK_MISSING)
            refactorLink(link);
        if (link.filePath !== linkPaths[linkPaths.length - 1])
            linkPaths.push(link.filePath);        
    }, this);
    // using reduce
    var self = this,
        links = doc.links.everyItem().getElements();
    this.links = links.reduce(function (uniq, link) {
        link.update();
        link = self.refactorLink(link);
        if (!uniq.contains(link))
            uniq.push(link);
        return uniq;
    }, []);
};

Procedure.prototype.refactorLink = function (link) {
    // relink can take a string
    // invalidChars (<, >, :, ", /, \, |, ?, *, NUL, TAB, CR, LF) & leading/trailing spaces
    // first, replace all unicode dots, and then process the chars (/, :, ", * are all dots)
    // 
    // this needs to take a link OBJECT, NOT PATH, & relink if necessary
    var name = link.name,
        path = link.filePath,
        sep = path[path.length - name.length - 1],
        parts = path.replace(/^.*(?=share)/i, NETWORK_PREFIX).split(sep);
    return pathAfterSomeProcessing;
};

Procedure.prototype.addBookmark = function () {
    var title = grep({ruleBelow: false})[0].contents;
    title = DATA.title = title.replace(/\s+/g, ' ').trim().toUpperCase();
    doc.bookmarks.everyItem().remove();
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
};

Procedure.prototype.getData = function () {
    var desig = grep({appliedParagraphStyle: 'PROCEDURE DESIGNATOR'}),
        sys = grep({findWhat: '(?im)^.+system', pointSize: 6}, null, true),
        footer = grep({findWhat: '(?<=\\r).*[-0-9/]{5,}.*', appliedParagraphStyle: 'footer'}, undefined, true);
    DATA.desig = desig ? desig[0].contents.trim().toUpperCase() : null;
    DATA.system = (sys.length ? sys[0].contents : SYSTEMS[prefix]).toUpperCase();
    if (footer.length) {
        // date format is: mmddyy, mmyydd, mddyy, myydd, mmdyy, or mmyyd; could compare with metadata
        var match, re = /\b[A-Z]{2,3}\b/g;
        footer = footer[0].contents.toUpperCase();
        DATA.modified = footer.replace(/(\d\d)(?=\d\d$)/, '/$1/')
                              .match(/[-0-9/]{5,}\d/)[0];
        while (match = re.exec(footer)) {
            if (match[0] !== 'ED' && !DATA.writers.contains(match[0]))
                DATA.writers.push(match[0]);
        }
        DATA.writers = DATA.writers.sort();
    } else
        DATA.modified = DATA.writers = null;
};

Procedure.prototype.saveAndClose = function () {
    doc.exportFile(ExportFormat.PDF_TYPE, File(this.path + '.pdf'), false);
    doc.close(SaveOptions.YES, File(this.path + '.indd'));
};
