// esta clase para el debugeo de errores y cosas asi xD
var CardenalDebug = function() {}

CardenalDebug.htmlConsole = false;
CardenalDebug.enable = false;
CardenalDebug.logs = [];

// si hay un elemento en el DOM con id "cardenal-html-console", a este se logeara
// todo lo que se logee en la consola
CardenalDebug.initHtmlConsole = function() {
   CardenalDebug.htmlConsole = document.getElementById('cardenal-html-console') || false;

   var self = this;

   // esto mete lineas cada 250ms (una por una) a la consola
   // por que si varias lineas se menten al mismo tiempo se ve feo xd
   setInterval(function() {
      if(CardenalDebug.htmlConsole !== false) {
         if(typeof CardenalDebug.logs[0] != 'undefined') {
            CardenalDebug.htmlConsole.appendChild(CardenalDebug.logs[0]);
            CardenalDebug.logs.shift();

            scroll_pos = CardenalDebug.htmlConsole.scrollHeight - CardenalDebug.htmlConsole.offsetHeight;
            //if(CardenalDebug.htmlConsole.scrollTop >= (CardenalDebug.htmlConsole - 20))
            CardenalDebug.htmlConsole.scrollTop = CardenalDebug.htmlConsole.scrollHeight;
         }
      }
   }, 250);
}

CardenalDebug.clearHtmlConsole = function() {
   if(CardenalDebug.htmlConsole !== false) {
      CardenalDebug.htmlConsole.innerHTML = '';
   }
};

// log de logs :vvvvv
CardenalDebug.log = function(err, type) {
   if(!CardenalDebug.enable) return;
   
   console.log(err);

   if(!CardenalDebug.htmlConsole) return;

   var div = document.createElement('div');
   type = typeof type == 'undefined' ? 'log' : type;

   div.setAttribute('class', 'console-' + type);
   div.innerHTML = err;

   CardenalDebug.logs.push(div);
}


// log de errores
CardenalDebug.error = function(err) {
   CardenalDebug.log(err, 'error');
}

CardenalDebug.info = function(err) {
   CardenalDebug.log(err, 'info');
}

CardenalDebug.alert = function(err) {
   CardenalDebug.log(err, 'alert');
}

CardenalDebug.success = function(err) {
   CardenalDebug.log(err, 'success');
}

CardenalDebug.warning = function(err) {
   CardenalDebug.log(err, 'warning');
}