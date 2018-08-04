// 2018-08-03 21:42:28 //
#target indesign

(function (global) {
    Folder.current = File($.fileName).parent;
    
    var decode = global.decodeURI;
    
    #include 'helpers.jsx';
    
    function newDoc (file) {
        if (!file.exists) {
            Batch.log('dne', file);
        }
        var name = decode(file.name.toUpperCase());
        return {
            file: file;
            prefix: /[A-Z]+/.exec(name)[0];
            id: name.match(/^\S+?(?=[. ])/)[0];
            rev: /\bR\d{1,2}\b/.test(name) ? 
                 name.match(/\bR(\d{1,2})\b/)[0] : 0;
        }
    }
    
    function Batch () {
        if (!(this instanceof Batch)) {
            return new Batch();
        }
        this.processes = [];
        this.queue = [];
        this.logger = logger;
    }
    
    Batch.prototype.process = function () {
        // still have to add ui & indesign events
        // use try...catch...finally to ensure logger clean-up
        if (this.queue.length == 0) {
            except('queue');
        } else if (this.processes.length == 0) {
            except('process');
        }
        if (this.logger.level) {
            this.logger.file.open('w');
        }
    };
    
    global.Batch = Batch();
})($.global);
