#target indesign
#include "polyfills.jsx";

/*
 * TODO: implement a process function that takes a callback (for refresh)
 * TODO: consider using app.doscript to control undo behavior
 * TODO: finish wrapping everything in one giant object;
 *       processes can just point to main obj methods
 *       allows persistent collection of links for when 40 procs use same link
 * TODO: 
 */

Folder.current = File($.fileName).parent;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

function ProcessID () {
    var f = File('indds.txt');
    this.log = File('processID.log');
    this.styleSheet = app.scriptPreferences.scriptsFolder.getFiles('TWD Stylesheet.indd')[0];
    if (!ExternalObject.AdobeXMPScript)
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    if (!this.styleSheet.exists)
        throw Error('styleSheet does not exist in InDesign\'s Scripts folder.');
    if (!f.exists)
        throw Error('A list of file paths in indds.txt is required in this folder.');
    f.open() && this.files = f.read().split(/[\n\r]+/) && f.close() && f = null;
    this.net = (File.fs == 'Macintosh' ? '' : '/n/') + 'share/SERVICE/';
    // i COULD break this into a function like so:
    //     if rx matches the collapsible ones, only use first two chars for lookup
    //     eg if /CR|DR|FD/.test(prefix) return this.systems[prefix.slice(0, 2)]
    //     if dt, only use last two chars for lookup
    this.systems = {
        'CC': 'CASING CONNECTOR',
        'CFS': 'CASING CONNECTOR',
        'CR': 'COMPLETION RISER',
        'CRC': 'COMPLETION RISER',
        'CRJ': 'COMPLETION RISER',
        'CRM': 'COMPLETION RISER',
        'CSRP': 'CASING REPARATION',
        'CWS': 'CONVENTIONAL WELLHEAD',
        'DR': 'DRILLING RISER',
        'DRC': 'DRILLING RISER',
        'DRM': 'DRILLING RISER',
        'DTAP': 'DRIL-THRU',
        'DTCC': 'DRIL-THRU CASING CONNECTOR',
        'DTDR': 'DRIL-THRU DRILLING RISER',
        'DTMC': 'DRIL-THRU MUDLINE COMPLETION',
        'DTMS': 'DRIL-THRU MUDLINE SUSPENSION',
        'DTSC': 'DRIL-THRU SUBSEA COMPLETION',
        'DTSS': 'DRIL-THRU SUBSEA WELLHEAD',
        'DTUW': 'DRIL-THRU UNITIZED WELLHEAD',
        'DV': 'VALVES',
        'ER': 'EXPORT RISER',
        'FD': 'FIXED DIVERTER',
        'FDC': 'FIXED DIVERTER',
        'FDM': 'FIXED DIVERTER',
        'GVS': 'GATE VALVES',
        'GPU': 'PRODUCTION CONTROLS',
        'HPU': 'PRODUCTION CONTROLS',
        'LS': 'LS-15 LINER HANGER',
        'MC': 'MUDLINE COMPLETION',
        'MS': 'MS-10/MS-15 MUDLINE SUSPENSION',
        'MSCM': 'MUDLINE SUBSEA CONTROLS MODULE',
        'RT': 'RISER TENSIONER',
        'SC': 'SUBSEA COMPLETION',
        'SCC': 'SUBSEA COMPLETION',
        'SCCM': 'SUBSEA COMPLETION CONTROLS MODULE',
        'SCJ': 'SUBSEA COMPLETION',
        'SCMS': 'SUBSEA COMPLETION MUDLINE',
        'SS': 'SUBSEA WELLHEAD',
        'SSC': 'SUBSEA CONTROLS',
        'SSH': 'SS-15 BIGBORE II-H SUBSEA WELLHEAD',
        'SSJ': 'SUBSEA WELLHEAD',
        'SW': 'SURFACE WELLHEAD',
        'UW': 'UNITIZED WELLHEAD',
        'UWHTS': 'UNITIZED WELLHEAD HORIZONTAL TREE',
        'UWHTSM': 'UNITIZED WELLHEAD HORIZONTAL TREE',
        'WOC': 'WORKOVER CONTROLS'
    }
}

try {
    $.ProcessID = new ProcessID();
} catch (e) {
    ExternalObject.AdobeXMPScript.terminate();
}

function main () {
    filePaths.forEach(function (path) {
        if (!File(path).exists)
            continue;
        var proc = new Procedure(File(path));
        try {
            proc.process();
        } catch (e) {
            // should encapsulate each call in a try/catch &
            // this catch should catch that error, close the doc, 
            // destroy the instance, & log the problems
        }
    });
}

function Procedure (file) {
    var name = decodeURI(file.name.toUpperCase()).match(/^(\S+?)[. ](R(\d+))?/),
        path = decodeURI(file.path) + '/' + name[0];
    this.file = file;
    this.prefix = /[A-Z]+/.exec(name[1])[0];
    this.id = name[1];
    this.rev = name[3] || 0;
    this.path = path.replace(/.(R\d+)?$/, '$1.indd');
    this.doc = app.open(this.file);
};

Procedure.prototype.processes = {
    updateStyles: updateStyles,
    updateLinks: updateLinks,
    addBookmark: addBookmark,
    addMetadata: addMetadata,
    saveAndClose: saveAndClose
};

function updateStyles (includeTableStyles) {
    // if twd agrees to table styles, uncomment the following line
    // this.doc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, STYLE_SHEET);
    this.doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, STYLE_SHEET);
    if (this.doc.paragraphStyles.item('TOC Level 1').isValid)
        this.doc.paragraphStyles.item('TOC Level 1').remove();
    if (includeTableStyles)
        this.doc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, STYLE_SHEET);
    grep({findWhat: '^\s*[~8a-z0-9]+\.?\s*'}, {changeTo: ''}, undefined);
    grep({findWhat: '(?!^)(Figure \\d+)'}, {changeTo: '$1', fontStyle: 'Bold'}, undefined);
}

function updateLinks () {
    // this makes the links loaded from text file option seem much better (more concise)
    this.links = {};
    this.doc.links.everyItem().getElements().forEach(function (olink) {
        var lpath = olink.filePath;
        // continue if link is local (non-network hd)
        if (!/share.service/i.test(lpath))
            continue;
        if (!lpath in this.links) {
            var flink = File(lpath);
            if (!flink.exists) {
                var path = lpath.replace(/.+?SERVICE/i, ''), name, files;
                flink = File(netPath + 
                    path.split(path[0]).map(function (seg) {
                        seg = deslash(seg.replace(/[:\uF022]/g, '/'));
                        seg = seg.replace(/[<>"/|?*\u0000-\u001F\uE000-\uF8FF]/g, '');
                        return seg.trim();
                    }).join('/')
                );
                name = flink.displayName.replace(/(\.\w{2,4})?$/, '*');
                files = flink.parent.getFiles(namePattern);
                for (var f = 0; !flink.exists && f < files.length; f++) {
                    var fname = files[f].displayName;
                    if (/(ai|eps)$/i.test(fname))
                        flink = files[f];
                }
            }
            this.links[lpath] = decodeURI(flink);
        }
        olink.relink(this.links[lpath]);
    });
}

function deslash (str) {
    if (str.indexOf('/') < 0)
        return str
    str = str.replace(/\s*\/\s*/g, '/');
    str = str.replace(/1\/(2|4)(?= slice)/gi, function (match, g1) {
        return g1 < 3 ? 'Half' : 'Quarter';
    });
    str = str.replace(/[- ]*\b(\d\d?)/(\d\d?)/g, function(match, n1, n2){
        if (n1 < n2 && n1 <= 16 && n2 <= 16 && n1 % 2)
            return (n1/n2).toString().substr(1, 5);
        return match;
    });
    str = str.replace(/\b([fw]\/o?) ?\b/gi, function (match, g1) {
        if (g1.toLowerCase() == 'f/')
            return 'for ';
        return 'with' + (/o/i.test(g1) ? 'out ' : ' ');
    });
    str = str.replace(\b([A-Z])\/([A-Z])\b/gi, '$1$2');
    return str.replace('/', '-');
}

function addBookmark () {
    this.title = grep({ruleBelow: false})[0].contents
                 .replace(/\s+/g, ' ').trim().toUpperCase();
    this.doc.bookmarks.everyItem().remove();
    app.panels.item('Bookmarks').visible = false;
    this.doc.bookmarks.add(this.doc.pages[0], {name: this.title});
}

function getData () {
    var find, match, writers;
    find = grep({appliedParagraphStyle: 'Procedure Designator'});
    this.desig = find.length ? find[0].contents.trim().toUpperCase() : null;
    
    find = grep({findWhat: '(?im)^.+system', pointSize: 6}, null, true),
    this.sys = find.length ? find[0].contents.toUpperCase() : SYSTEMS[this.prefix];
    
    find = grep({findWhat: '(?<=\\r).*[-0-9/]{5,}.*', appliedParagraphStyle: 'footer'}, null, true);
    if (find.length) {
        // date formats: mmddyy, mmyydd, mddyy, myydd, mmdyy, mmyyd; could compare with metadata
        find = find[0].contents.toUpperCase();
        // pull all dates from all indd procs to come up with a regexp
        this.modified = find.replace(/(\d\d)(\d\d)(?=\d\d)/, '$1/$2/')
                            .match(/[-0-9/]{5,}\d/)[0];
        this.writers = find.match(/(?!ED\b)[A-Z]{2,3}\b/g);
    } else
        this.modified = this.writers = null;
}

function saveAndClose () {
    this.doc.exportFile(ExportFormat.PDF_TYPE, File(this.path + '.pdf'), false);
    this.doc.close(SaveOptions.YES, File(this.path + '.indd'));
    // write metadata to closed file
    // check for existence of schema first
    // put this into metadata part where if (this.writers) {
        this.writers.filter(function(item, index, self) {
            return index == self.indexOf(item);
        }).sort();
}

function processINDD (fileObject) {
    try {
        updateStyles();
        updateLinks();
        addBookmark();
        getData();
        addXMP(getPath(fileObject));
    } catch (e) {
        app.this.documents.everyItem().close(SaveOptions.NO);
        FAIL_LOG.open('a');
        FAIL_LOG.writeln('"' + decodeURI(fileObject) + '" failed on line #' + e.line);
        FAIL_LOG.close();
    }
}

function grep (findPrefs, changePrefs, masters) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.includeMasterPages = masters ? true : false;
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? this.doc.changeGrep() : this.doc.findGrep();
}
