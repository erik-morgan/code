//////////////
// JS Notes //
//////////////
/* 
 * remove leeches from pytor.py; make filtor incorporate smaller output array
 * 
 * CONSIDER FILTERING DUPLICATE NAME/SIZE IN ADDITION TO HASHES
 *     BC OF PERIOD/NON-PERIOD VARIATIONS & TITLES VS INNERHTML
 * 
 * table var might need to be redeclared in torSearch: table = document.querySelector('.results')
 * 
 * add catch to torSearch fetch sequence (for server/connection error)
 * 
 * adjust pytor so that it searches wider and deeper, doesn't bother with leeches,
 *     limits returned torrents, and returns the expected js object with status
 */

///////////////
// CSS Notes //
///////////////
/* 
 * Add title attribute with javascript if name length exceeds 63/77 characters (2/1.5 rem font-size)
 * 
 * Replace periods in torrent names in python (or add special breaking in css)
 * 
 * for filtor in python, exclude results with any part of the query at the end of the torrent name
 * 
 * when adding js onclick for .plus, make content a checkmark after clicked and add disable attribute
 * 
 * change all sizes to MB in python?
 */

//////////////////
// Python Notes //
//////////////////
/* 
 * set static ip on VPN subnet (192.168.2.x) & set up DNS/port forwarding (py.tor)
 * return index http template
 * add better error handling
 * add logging to main.py; flask comes with a logging.Logger object for Flask app
 * 
 * sort by seeders
 * do byte conversions
 * # from math import floor, pow, log
 * # if type(tor[1]) is int:
 * #     i = int(floor(log(int(b), 1024)))
 * #     str(round(int(b) / pow(1024, i), 2)) + ' ' + ('KB', 'MB', 'GB')[i]
 * torlock has a good selection, cats, sorting, and 75 per page all 0 seeds
 * leetx no magnets
 * magnetdl has sorting, cats, magnets, 40 per page, but results are iffy correct seeds
 * http://www.magnetdl.com/t/the-librarians/se/desc/
 * retest concurrent.futures solution multiple times
 * test brooklyn nine-nine to see how dashes get urlencoded
 * 
 */

