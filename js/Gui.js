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
        , 'progress-bar'
        , 'form-label'
        , 'progress-label'
        , 'encryption-queue-label'
    ];

    this.domElementsObjs = new Object();

    for (var i = 0; i < this.domElements.length; i++) {
        var obj = document.getElementById(this.domElements[i]);
        this.domElementsObjs[this.domElements[i]] = obj;
    }
};

Gui.prototype.cipherStartHandler = function(file_name) {
    file_name = file_name.length > 25 ? file_name.slice(0, 21) + '...' : file_name;

    gui.domElementsObjs['form-label'].innerHTML = file_name + ' ';
    gui.domElementsObjs['progress-label'].innerHTML = '0%';
};

Gui.prototype.cipherProgressHandler = function(percet) {
    gui.domElementsObjs['progress-bar'].setAttribute('style', 'width:' + percet + '%;');
    gui.domElementsObjs['progress-label'].innerHTML = percet + '%';
};

Gui.prototype.cipherDoneHandler = function(file_obj, file_name, url) {
    gui.domElementsObjs['progress-bar'].setAttribute('style', 'width:0%;');
    gui.domElementsObjs['encryption-queue-label'].innerHTML = "(" + cardenal.fileQueue.length + ") files enqueued";

    var original_file_name = file_name.replace('.crypted', '');

    console.log(original_file_name);

    document.getElementById(CryptoJS.SHA256(original_file_name).toString()).setAttribute('style', 'display:none;');
};

Gui.prototype.cipherFinishedHandler = function() {
    gui.domElementsObjs['form-label'].innerHTML = 'Your files has been protected';
    gui.domElementsObjs['progress-label'].innerHTML = '';
    gui.domElementsObjs['encryption-queue'].innerHTML = '';

    setTimeout(function() {
        gui.domElementsObjs['form-label'].innerHTML = '2.- Select files to encrypt/decrypt';
    }, 3000);
};

Gui.prototype.showEnqueuedFiles = function(files) {
    var gui = this;

    gui.domElementsObjs['encryption-queue-label'].innerHTML = "(" + files.length + ") files enqueued";

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var listElement = document.createElement('tr');
        var a = document.createElement('th');
        var b = document.createElement('td');
        var c = document.createElement('td');

        var original_file_name = file.name.replace('.crypted', '');

        listElement.setAttribute('id', CryptoJS.SHA256(original_file_name).toString());
        
        a.innerHTML = file.name.length > 40 ? file.name.slice(0, 36) + '...' : file.name;
        b.innerHTML = convertBytes(file.size);
        c.innerHTML = file.type == '' ? 'file/crypted' : file.type;

        listElement.appendChild(a);
        listElement.appendChild(b);
        listElement.appendChild(c);

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

    cardenal.callbacks.started = this.cipherStartHandler;
    cardenal.callbacks.onprogress = this.cipherProgressHandler;
    cardenal.callbacks.done = this.cipherDoneHandler;
    cardenal.callbacks.onfinished = this. cipherFinishedHandler;
};