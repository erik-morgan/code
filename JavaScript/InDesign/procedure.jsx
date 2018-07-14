// getData is no good; implement a process function that takes a callback (for refresh)
// use app.doscript to control undo behavior
/*
 * consider wrapping it all in one giant object
 * this way, processes can just point to main obj methods
 * this also allows keeping a persistent collection of links in a tree for when 40 procs use same link (eg shear pins)
 */
function Procedure (file) {
    var name = decodeURI(file.name.toUpperCase()).match(/^(\S+?)[. ](R(\d+))?/),
        path = decodeURI(file.path) + '/' + name[0];
    this.file = file;
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
}

// function updateLinksNotes () {
//     this.links = {};
//     this.doc.links.everyItem().getElements().forEach(function (olink) {
//         var lpath = olink.filePath;
//         if (!lpath in this.links) {
//             var key = lpath,
//                 flink = File(lpath);
//             if (!flink.exists) {
//                 // process link path
//                 // if modified path doesn't exist, try getFiles
//                 // otherwise, set it to incorrect path (seeing as it's broken anyway)
//                 // should probably just set it to incorrect path initially, and try getFiles
//             }
//             // add flink.absoluteURI to this.links
//             // i guess it doesn't really matter if link is missing or not...
//         }
//         // relink using this.links[lpath]
//     });
// }

function updateLinks () {
    // add support for local paths (to non-network hd)
    this.links = {};
    this.doc.links.everyItem().getElements().forEach(function (olink) {
        var lpath = olink.filePath;
        if (!lpath in this.links) {
            var flink = File(lpath);
            if (!flink.exists) {
                // test UW0180-08-06 paths in VM tomorrow
                // try flink.absoluteURI
                var path = lpath.replace(/^.*(?=share)/i, ''),
                    sep = lpath[lpath.length - olink.name.length - 1];
                flink = File(netPath + path.split(sep).map(function (seg) {
                    return deslash(
                        seg.replace(/ *[:\uF022/] */g, '/')
                    ).replace(/[<>:"/|?*\u0000-\u001F\uE000-\uF8FF]/g, '').trim();
                }).join('/'));
                if (!flink.exists) {
                    var options = flink.parent.getFiles(decodeURI(flink.name).replace(/(\.\w{2,4})?$/, '*'));
                    // get correct option to make sure you don't pull a pdf or dxf? or force tidy artwork storage...
                }
            }
            // or just decodeURI(flink) ?
            this.links[lpath] = decodeURI(flink.absoluteURI);
        }
        olink.relink(this.links[lpath]);
    });
}

function deslash (str) {
    // convert fractions to decimal
    // convert w/ to with, f/ to for, etc
    // convert remaining slashes to spaces or ampersands
    if (str.indexOf('/') < 0)
        return str
    return str;
}

function addBookmark () {
    var title = grep({ruleBelow: false})[0].contents;
    title = DATA.title = title.replace(/\s+/g, ' ').trim().toUpperCase();
    this.doc.bookmarks.everyItem().remove();
    app.panels.item('Bookmarks').visible = false;
    this.doc.bookmarks.add(this.doc.pages[0], {name: title});
}

function getData () {
    // check for existence of schema first
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
}

function saveAndClose () {
    this.doc.exportFile(ExportFormat.PDF_TYPE, File(this.path + '.pdf'), false);
    this.doc.close(SaveOptions.YES, File(this.path + '.indd'));
    if (this.hasOwnProperty('onClose'))
        this.onClose();
}

function fixPath (file) {
    // on mac, colons are really slashes, so on PC, links with slashes are U+F022
    // all unicodes will be removed except colons to slashes
    var path = decodeURI(file).replace(/^.*(?=share)/i, NETWORK_PREFIX);
    var sep = path[path.length - link.name.length - 1];
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
    
}

// see fs check used in estk
netPath = (File.fs == 'Macintosh' ? '/Volumes' : '/n') + '/share/SERVICE/';
systems: {
    'CC': 'Casing Connector System',
    'CFS': 'Casing Connector System',
    'CR': 'Completion Riser System',
    'CRC': 'Completion Riser System',
    'CRJ': 'Completion Riser System',
    'CRM': 'Completion Riser System',
    'CWS': 'Conventional Wellhead System',
    'DR': 'Drilling Riser System',
    'DRC': 'Drilling Riser System',
    'DRM': 'Drilling Riser System',
    'DTAP': 'Dril-Thru System',
    'DTCC': 'Dril-Thru Casing Connector System',
    'DTDR': 'Dril-Thru Drilling Riser System',
    'DTMC': 'Dril-Thru Mudline Completion System',
    'DTSC': 'Dril-Thru Subsea Completion System',
    'DTSS': 'Dril-Thru Subsea Wellhead System',
    'DTUW': 'Dril-Thru Unitized Wellhead System',
    'DV': 'Valve System',
    'FD': 'Fixed Diverter System',
    'FDC': 'Fixed Diverter System',
    'FDM': 'Fixed Diverter System',
    'GVS': 'Gate Valve System',
    'HPU': 'Production Controls System',
    'MC': 'Mudline Completion System',
    'MS': 'MS-10/MS-15 Mudline Suspension System',
    'SC': 'Subsea Completion System',
    'SCC': 'Subsea Completion System',
    'SCJ': 'Subsea Completion System',
    'SS': 'Subsea Wellhead System',
    'SSC': 'Subsea Controls System',
    'SSH': 'SS-15 BigBore II-H System',
    'SSJ': 'Subsea Wellhead System',
    'UW': 'Unitized Wellhead System',
    'UWHTS': 'Unitized Wellhead Horizontal Tree System',
    'UWHTSM': 'Unitized Wellhead Horizontal Tree System',
    'WOC': 'Workover Controls System'
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
