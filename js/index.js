var gui;
var cardenal;

document.addEventListener('DOMContentLoaded', function() {
    gui = new Gui();
    cardenal = new CardenalLite();

    gui.bindAllHandlers();
}, false);
