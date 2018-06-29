#target indesign
#include "polyfills.jsx";
#include "procedure.jsx";

/*
 * THIS SCRIPT WILL PROCESS ALL INDD FILES & COULD THEORETICALLY BE USED WITH BATCH PROCESSING SCRIPT
 * 
 * STANDARDIZE STYLE SHEETS (INCLUDES CLEANING UP MANUALLY ENTERED NUMBERED LIST)
 * RELINK ARTWORK THAT WAS RENAMED
 * ADD DOCUMENT TITLE, AUTHOR, REVISION, SYSTEM, & MAYBE LINK NAMES AS METADATA
 * RE-EXPORT PDF
 * EXTRACT FOOTER INFO, TITLE, SYSTEM, LINK NAMES
 * 
 * USE METADATA INSTEAD OF LOGGING, THEN EXTRACT & USE METADATA IN SEPARATE SCRIPTS
 * ALSO WRITE A COMPANION METADATA SCRIPT THAT AUTOMATICALLY UPDATES XMP DATA ON SAVE
 * AND PLACE IT INTO STARTUP SCRIPTS
 * 
 * CONSIDER ADDING BEFORE_CLOSE EVENT HANDLER FOR SAVING/PDFING
 */

STYLE_SHEET = app.scriptPreferences.scriptsFolder.getFiles('TWD Stylesheet.indd')[0];
FILE_LIST = File('/path/to/text file/listing paths of procedures/to process.txt');
NETWORK_PREFIX = File.fs == 'Macintosh' ? '/Volumes/' : '/n/';
FAIL_LOG = File('/path/to/text file/to log/failures into.txt');
SYSTEMS = {
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
};
DATA = {
    id: '',
    revision: '',
    title: '',
    desig: '',
    system: '',
    modified: '',
    writers: [],
    links: []
};

if (initProcess()) {
	wrapFunctions(processes)
	// 
	// MAKE PROCEDURE CONSTRUCTOR FUNCTION
	// null globals
	// 
	// 
    main();

function main () {
    var paths = parseFile(FILE_LIST);
    paths.forEach(function (path, pathIndex) {
        if (File(path).exists) {
            doc = app.open(File(path));

        if (f.exists)
            processINDD(f);
    }
}

function processINDD (fileObject) {
    try {
        updateStyles();
            if (doc.paragraphStyles.item('TOC Level 1').isValid)
                doc.paragraphStyles.item('TOC Level 1').remove();
            doc.links.everyItem().getElements().forEach(function (link) {
                link.update();
                proc.processLink(link);
        
        updateLinks();
        addBookmark();
        getData();
        addXMP(getPath(fileObject));
    } catch (e) {
        app.documents.everyItem().close(SaveOptions.NO);
        FAIL_LOG.open('a');
        FAIL_LOG.writeln('"' + decodeURI(fileObject) + '" failed inside of ' + FUNC_NAME + ' on line #' + e.line);
        FAIL_LOG.close();
    }
}

function updateStyles () {
    doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, STYLE_SHEET);
    // if twd agrees to table styles, uncomment the following line
    // doc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, STYLE_SHEET);
    if (doc.paragraphStyles.item('TOC Level 1').isValid)
        doc.paragraphStyles.item('TOC Level 1').remove();
}

function updateLinks () {
    var links = doc.links.everyItem().getElements().sort(function (a, b) {
            return a.filePath == b.filePath ? 0 : (a.filePath > b.filePath ? 1 : -1);
        }),
        linkPaths = [];
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.update();
        if (link.status == LinkStatus.LINK_MISSING)
            refactorLink(link);
        if (link.filePath !== linkPaths[linkPaths.length - 1])
            linkPaths.push(link.filePath);
    }
    DATA.links = linkPaths;
}

function refactorLink (link) {
    // relink can take a string
    // invalidChars & leading/trailing spaces = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', 'NUL', 'TAB', 'CR', 'LF'];
    // first, replace all unicode dots, and then process the chars
    // /, :, ", * are all dots
    var name = link.name,
        path = link.filePath,
        sep = path[path.length - name.length - 1],
        parts = path.replace(/^.*(?=share)/i, NETWORK_PREFIX).split(sep);
    
}

function addBookmark () {
    var title = grep({ruleBelow: false})[0].contents;
    title = DATA.title = title.replace(/\s+/g, ' ').trim().toUpperCase();
    doc.bookmarks.everyItem().remove();
    app.panels.item('Bookmarks').visible = false;
    doc.bookmarks.add(doc.pages[0], {name: title});
}

function getData () {
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

function addXMP () {
    var fxmp, xmp, ns = 'http://dril-quip.com/rp/';
    fxmp = new XMPFile(doc.fullName.fsName, XMPConst.FILE_INDESIGN, XMPConst.OPEN_FOR_UPDATE);
    xmp = fxmp.getXMP();
    XMPMeta.registerNamespace(ns, 'rp');
    // USE DATA OBJECT FOR PROPERTY ASSIGNMENT
    xmp.setProperty(ns, 'id', name[1]);
    xmp.setProperty(ns, 'revision', name[3] || 0);
    xmp.setProperty(ns, 'title', title);
    xmp.setProperty(ns, 'system', system);
    if (DATA.modified)
        xmp.setProperty(ns, 'modified', DATA.modified);
    if (DATA.writers)
        XMPUtils.separateArrayItems(xmp, ns, 'writers', XMPConst.SEPARATE_ALLOW_COMMAS, DATA.writers.join('\t'));
    XMPUtils.separateArrayItems(xmp, ns, 'links', XMPConst.SEPARATE_ALLOW_COMMAS, DATA.links.join('\t'));
    fxmp.putXMP(xmp);
    fxmp.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
}

function grep (findPrefs, changePrefs, masters) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.includeMasterPages = masters ? true : false;
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? doc.changeGrep() : doc.findGrep();
}

function getPath (file) {
    var path = decodeURI(file.path) + '/',
        name = decodeURI(file.name.toUpperCase());
    path += name.replace(/^([^. ]+).(R(\d+))?.*/, function (m, g1, g2, g3) {
        var id = g1.replace(/[^A-Z0-9]+/g, '').replace(/(\d\d)/g, '-$1');
        id = id.replace(/([A-Z]+)-(\d\d)(-(\d\d))?/g, '$1$2$4');
        DATA.id = id;
        DATA.revision = g3 || 0;
        return [id, g2 ? g2 : ''].join('.');
    });
    return path;
}

function initProcess () {
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    if (!STYLE_SHEET.exists || !FILE_LIST.exists)
        return false;
    if (!ExternalObject.AdobeXMPScript)
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    return true;
}

function parseFile (f) {
    if (f.exists) {
        f.open();
        var lines = f.read().split(f.lineFeed == 'Windows' ? '\r\n' : '\n');
        f.close();
        return lines;
    }
}
