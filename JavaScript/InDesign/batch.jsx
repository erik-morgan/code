// 2018-08-05 01:26:11 //
#target indesign

(function (global) {
    Folder.current = File($.fileName).parent;
    
    var decode = global.decodeURI;
    
    #include 'helpers.jsx';
    
    function newDoc (file) {
        if (file.exists) {
            var name = decode(file.name.toUpperCase());
            app.open(file, false);
            return {
                file: file;
                prefix: /[A-Z]+/.exec(name)[0];
                id: name.match(/^\S+?(?=[. ])/)[0];
                rev: /\bR\d{1,2}\b/.test(name) ? 
                     name.match(/\bR(\d{1,2})\b/)[0] : 0;
            }
        } else {
            except('file', 'newDoc', decode(file));
        }
    }
    
    function Batch () {
        if (!(this instanceof Batch)) {
            return new Batch();
        }
        this.processes = [];
        this.queue = [];
        this.logger = logger;
        this.ui = {
            // rethink this part, but after testing, i CAN use $.evalFile
        }
    }
    
    Batch.prototype.process = function () {
        // still have to add ui & indesign events
        // use try...catch...finally to ensure logger clean-up
        if (this.queue.length == 0) {
            except('queue', 'Batch.process');
        } else if (this.processes.length == 0) {
            except('process', 'Batch.process');
        }
        if (this.logger.level) {
            this.logger.file.open('w');
        }
        // have to set up progress first, because ON_IDLE needs hooks
        // then set up ON_IDLE (only ON_IDLE, no AFTER_OPEN; maybe)
    };
    
    global.Batch = Batch();
})($.global);
