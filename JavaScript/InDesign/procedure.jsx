// getData is no good; implement a process function that takes a callback (for refresh)
// use app.doscript to control undo behavior
/*
 * consider wrapping it all in one giant object
 * this way, processes can just point to main obj methods
 * this also allows keeping a persistent collection of links in a tree for when 40 procs use same link (eg shear pins)
 * remove func_name bs from logger
 * go back over comments and implement their notes
 */
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
    // include other find/replace greps to clean up style changes
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
    // check for existence of schema first
    // check if result of grep is undefined when nothing is found (empty array would eval true)
    // 
    // REFACTOR THIS FUNCTION
    // 
    var find, match, writers;
    find = grep({appliedParagraphStyle: 'Procedure Designator'});
    this.desig = find.length ? find[0].contents.trim().toUpperCase() : null;
    
    find = grep({findWhat: '(?im)^.+system', pointSize: 6}, null, true),
    this.sys = find.length ? find[0].contents.toUpperCase() : SYSTEMS[this.prefix];
    
    find = grep({findWhat: '(?<=\\r).*[-0-9/]{5,}.*', appliedParagraphStyle: 'footer'}, null, true);
    if (find.length) {
        // date formats: mmddyy, mmyydd, mddyy, myydd, mmdyy, mmyyd; could compare with metadata
        find = find[0].contents.toUpperCase();
        // pull all dates from all indd procs to come up with a regexp; below fails if format is mmdyy
        this.modified = find.replace(/(\d\d)(?=\d\d$)/, '/$1/')
                            .match(/[-0-9/]{5,}\d/)[0];
        // do ternary test for writers; fix regex bc ED may be up against date digits
        this.writers = '';
        this.writers = find.match(/(?!ED\b)[A-Z]{2,3}\b/g) || [];
        .filter(function(item, index, self) {
            return index == self.indexOf(item);
        }).sort();
    } else
        this.modified = this.writers = null;
}

function saveAndClose () {
    this.doc.exportFile(ExportFormat.PDF_TYPE, File(this.path + '.pdf'), false);
    this.doc.close(SaveOptions.YES, File(this.path + '.indd'));
    // write metadata to closed file
}

netPath = (File.fs == 'Macintosh' ? '/Volumes' : '/n') + '/share/SERVICE/';
systems: {
    'CC': 'CASING CONNECTOR SYSTEM',
    'CFS': 'CASING CONNECTOR SYSTEM',
    'CR': 'COMPLETION RISER SYSTEM',
    'CRC': 'COMPLETION RISER SYSTEM',
    'CRJ': 'COMPLETION RISER SYSTEM',
    'CRM': 'COMPLETION RISER SYSTEM',
    'CSRP': 'CASING REPARATION SYSTEM',
    'CWS': 'CONVENTIONAL WELLHEAD SYSTEM',
    'DR': 'DRILLING RISER SYSTEM',
    'DRC': 'DRILLING RISER SYSTEM',
    'DRM': 'DRILLING RISER SYSTEM',
    'DTAP': 'DRIL-THRU SYSTEM',
    'DTCC': 'DRIL-THRU CASING CONNECTOR SYSTEM',
    'DTDR': 'DRIL-THRU DRILLING RISER SYSTEM',
    'DTMC': 'DRIL-THRU MUDLINE COMPLETION SYSTEM',
    'DTMS': 'DRIL-THRU MUDLINE SUSPENSION SYSTEM',
    'DTSC': 'DRIL-THRU SUBSEA COMPLETION SYSTEM',
    'DTSS': 'DRIL-THRU SUBSEA WELLHEAD SYSTEM',
    'DTUW': 'DRIL-THRU UNITIZED WELLHEAD SYSTEM',
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
    'MDTCC': 'MUDLINE DRIL-THRU CASING CONNECTOR',
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
        FAIL_LOG.writeln('"' + decodeURI(fileObject) + '" failed inside of ' + FUNC_NAME + ' on line #' + e.line);
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
