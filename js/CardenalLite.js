var CardenalLite = function() {
    this.fileQueue = [];
    this.key = 'D3f4ult_';

    this.callbacks = {
          done: function(o, n, u) {
            console.log(o);
            console.log(n);
            console.log(u);
          }

        , onprogress: function(p) {
            console.log('%' + p);
        }

        , started: function(f) {
            console.log(f + ' cryption has been started...');
        }
    };
};

CardenalLite.prototype.processQueue = function() {
    var cardenal = this;

    if (typeof this.fileQueue[0] != 'undefined') {
        var action = this.fileQueue[0].name.indexOf('.crypted') >= 0 ? 'decrypt' : 'encrypt';

        CardenalDebug.info('Processing ' + this.fileQueue[0].name);

        CardenalCipher.process(action, this.fileQueue[0], this.key, {
            done: function(obj, name, url) {
                cardenal.processQueue();
                CardenalFileSystem.saveFile(url, name);
                cardenal.callbacks.done(obj, name, url);
            },

            onprogress: cardenal.callbacks.onprogress
        });

        cardenal.fileQueue.shift();
    };
};

CardenalLite.prototype.enqueueFiles = function(files) {
    for (var i = 0; i < files.length; i++) {
        this.fileQueue.push(files[i]);
    }

    this.processQueue();
};