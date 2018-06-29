/*
 * avoid creating another file for what is, essentially, a simple script
 * function Object() already exists
 * function Procedure () { Object.call(this); }
 * Procedure.prototype = {props};
 * Procedure.constructor = Procedure;
 * var proc = new Procexure();
 * ONLY FUNCTION OBJECTS HAVE A PROTOTYPE PROPERTY
 */

function Procedure (file, constantVars) {
    var name = decodeURI(file.name.toUpperCase()).match(/^(\S+?)[. ](R(\d+))?/),
        path = decodeURI(file.path) + '/' + name[0];
    this.file = file;
    this.id = name[1];
    this.rev = name[3] || 0;
    this.path = path.replace(/.(R\d+)?$/, '$1.indd');
    this.constants = constantVars;
};
// ADDED CONSTANTS/CONSTANTVARS TO CONSTRUCTOR TO GUARANTEE THAT PROCEDURE.PROTOTYPE METHODS
// HAVE ACCESS TO GLOBALS LIKE STYLE_SHEET/NETWORK_PREFIX
// LEFT OFF IN UPDATESTYLES
Procedure.prototype.extend({
    openDoc: function () {
        this.doc = app.open(this.file);
    },
    updateStyles: function (includeTableStyles) {
        // if twd agrees to table styles, uncomment the following line
        // doc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, STYLE_SHEET);
        doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, STYLE_SHEET);
        if (includeTableStyles)
            doc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, STYLE_SHEET);
    },
    updateLinks: function () {
        /*
         * for every link, check its status
         * if missing, process it's path & relink it
         * else get decoded absoluteURI of filePath
         * either way, only add to this.links if not in there
         * 
         * IDEA: CREATE OBJ WITH OLD LINKS AS KEYS, AND NEW AS VALUES
         * THEN, IT ONLY PROCESSES EACH PATH ONCE, & CAN REFER TO IT FOR DUPLICATES
         * AFTER, SET THIS.LINKS TO OBJ.VALUES
         * 
         * actually, just use array.filter(function (link, i, self) { return self.contains(link); })
         * 
         */
        this.links = [];
        doc.links.everyItem().getElements().forEach(function (link) {
            link.update();
            this.links.push(this.processLink(link));
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
    },
    processLink: function (link) {
        // on mac, colons are really slashes, so on PC, links with slashes are U+F022
        // all unicodes will be removed except colons to slashes
        var path = link.filePath.replace(/^.*(?=share)/i, NETWORK_PREFIX),
            sep = path[path.length - link.name.length - 1],
            parts = path.split(sep);
        parts = parts.map(function (part) {
            if (/:|\uF022|\//.test(part))
                part = this.deslash(part.replace(/ *[:\uF022/] */g, '/'));
            part = part.replace(/[<>:"/\\|?*\u0000-\u001F\uE000?\uF8FF]/g, '');
            return part.trim();
        }, this);
        path = parts.join('/');
        if (link.status == LinkStatus.LINK_MISSING)
            link.relink(File(path));
    },
    deslash: function (str) {
        // convert fractions to decimal
        // convert w/ to with, f/ to for, etc
        // convert remaining slashes to spaces or ampersands
        return str;
    },
    addBookmark: function () {
        var title = grep({ruleBelow: false})[0].contents;
        title = DATA.title = title.replace(/\s+/g, ' ').trim().toUpperCase();
        doc.bookmarks.everyItem().remove();
        app.panels.item('Bookmarks').visible = false;
        doc.bookmarks.add(doc.pages[0], {name: title});
    },
    getData: function () {
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
    },
    saveAndClose: function () {
        doc.exportFile(ExportFormat.PDF_TYPE, File(this.path + '.pdf'), false);
        doc.close(SaveOptions.YES, File(this.path + '.indd'));
    }
});
