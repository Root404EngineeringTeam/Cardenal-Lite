var Gui = function() {
    this.handlers = [
          'uploadButtonHandler'
        , 'uploadFilehandler'
    ];

    this.domElements = [
          'upload-button'
        , 'upload-file'
        , 'encryption-key'
        , 'encryption-queue'
    ];

    this.domElementsObjs = new Object();

    for (var i = 0; i < this.domElements.length; i++) {
        var obj = document.getElementById(this.domElements[i]);
        this.domElementsObjs[this.domElements[i]] = obj;
    }
};

Gui.prototype.cipherStartHandler = function(file_name) {
    // TODO
};

Gui.prototype.cipherProgressHandler = function(percet) {
    // TODO
};

Gui.prototype.cipherDoneHandler = function(file_obj, file_name, url) {
    // TODO
};

Gui.prototype.showEnqueuedFiles = function(files) {
    var gui = this;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var listElement = document.createElement('li');

        listElement.innerHTML = '<b>' + file.name + '</b> - ' + file.size + ' Bytes (' + file.type + ')';
        gui.domElementsObjs['encryption-queue'].appendChild(listElement);
    }
};

Gui.prototype.uploadFilehandler = function() {
    var gui = this;

    gui.domElementsObjs['upload-file'].onchange = function() {
        cardenal.enqueueFiles(this.files);
        gui.showEnqueuedFiles(this.files);
    };
};

Gui.prototype.uploadButtonHandler = function() {
    var gui = this;

    gui.domElementsObjs['upload-button'].onclick = function() {
        var key = gui.domElementsObjs['encryption-key'].value;

        if (key == '') {
            //TODO JuakerAlert
            alert('We need an encryption key');
            return;
        };

        cardenal.key = key;
        gui.domElementsObjs['upload-file'].click();
    };
};

Gui.prototype.bindAllHandlers = function() {
    for (var i = 0; i < this.handlers.length; i++) {
        this[this.handlers[i]]();
    }

    // TODO

    /**

    cardenal.callbacks.done = this.cipherDoneHandler;
    cardenal.callbacks.started = this.cipherStartHandler;
    cardenal.callbacks.onprogress = this.cipherProgressHandler;


     */
};