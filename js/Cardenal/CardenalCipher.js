CardenalCipher = function() {}

CardenalCipher.queue = [];
CardenalCipher.file = null;
CardenalCipher.file_name = null;
CardenalCipher.fURL = null;
CardenalCipher.reading = false;
CardenalCipher.action = 'crypt';
CardenalCipher.done = function() {};
CardenalCipher.onprogress = function() {};
CardenalCipher.loaded = 0;
CardenalCipher.timer = null;

// Algoritmo de cifrado simetrico
// Aplica una operación bitwise XOR a cada Byte del bloque con cada Byte de la llave

// a -> Byte de bloque
// k -> Byte de la llave
// r -> Byte cifrado

// r = a ^ k // cifrado
// a = r ^ k // decifrado

// por tanto si k no es correcta no se pueden decifrar los datos
CardenalCipher.encode = function(data, key, done) {
   key = CryptoJS.SHA256(key).toString();
   var keysize = key.length;
   keyindex = 0;
   output = new Int8Array(data.length); // El resutado se almacena en un Buffer
                                        // para poder ser escrito de manera correcta en el
                                        // filesystem

   for (var i = 0; i < data.length; i++) {
      if(keyindex >= keysize)
         keyindex = 0;

      var datachar = data.charCodeAt(i);
      var keychar = key.charCodeAt(keyindex);
      
      output[i] = datachar ^ keychar; // bitwise XOR
      CardenalCipher.loaded++;
   }

   done(output);
}

// Guarda el bloque procesado a traves del FileSystem
CardenalCipher.saveBlock = function(part) {
   CardenalFileSystem.saveInt8Array(CardenalCipher.file_name, part, function(fURL) {
      CardenalCipher.fURL = fURL;
      CardenalCipher.queue.shift();
      CardenalCipher.reading = false;
      CardenalCipher.proccessQueue();
   });
}

// Lee un bloque de X a Z Bytes de un archivo
CardenalCipher.read = function(part) {
   var reader = new FileReader();

   reader.onloadend = function(e) {
      if(e.target.readyState == FileReader.DONE) {
         var data = e.target.result;
         
         CardenalCipher.encode(data, CardenalCipher.key, function(output) {
            part.data = output;
            CardenalCipher.saveBlock(part);
         });
      }
   }

   var blob = CardenalCipher.file.slice(part.offset, part.len);
   reader.readAsBinaryString(blob);
}

// Procesa (manda a que se lean) los bloques para cifrar/decifrar
CardenalCipher.proccessQueue = function() {
   if(CardenalCipher.reading) return;
   if(typeof CardenalCipher.queue[0] != 'undefined') {
      CardenalCipher.reading = true;
      CardenalCipher.read(CardenalCipher.queue[0]);
   } else {
      // el proceso finalizo
      CardenalFileSystem.readFile(CardenalCipher.file_name, CardenalCipher.done);      
      clearInterval(CardenalCipher.timer);
   }
}

// pROCESA UN ARCHIVO PARA CIFRAR/DECIFRAR
CardenalCipher.process = function(action, file, key, callbacks) {
   var parts = [];
   var part_counter = 0;
   var part_size = 10485760; // Bloques de 10Mb

   // Se arman los inicios-finales de los bloques
   while(true) {
      var start = part_size * part_counter;
      var end = start + part_size;

      if(end > file.size) end = file.size;

      part = {
         data: '',
         offset: start,
         len: end,
         index: part_counter
      };

      parts.push(part);
      part_counter++;

      if((part_counter * part_size) > file.size) break;
   }

   // Se abre el fileSystem para ir escribiendo temporalmente 
   // el archivo (ahorra RAM)
   CardenalFileSystem.open(file.size, function() {
      CardenalCipher.action = action;
      CardenalCipher.file = file;
      CardenalCipher.key = key;
      CardenalCipher.queue = parts;
      CardenalCipher.done = callbacks.done;
      CardenalCipher.loaded = 0;
      CardenalCipher.onprogress = callbacks.onprogress;

      if(action == 'encrypt') {
         CardenalCipher.file_name = file.name + '.crypted';
         CardenalDebug.info('Encrypting ' + CardenalCipher.file_name);
      } else {
         CardenalCipher.file_name = file.name.replace('.crypted', '');
         CardenalDebug.info('Decrypting ' + CardenalCipher.file_name);
      }

      CardenalCipher.proccessQueue();

      // Para monitorizar el progreso de cifrado
      CardenalCipher.timer = setInterval(function() {
         CardenalCipher.onprogress(Math.round((CardenalCipher.loaded / CardenalCipher.file.size) * 100));
      }, 500);
   });
}

// Prueba
CardenalCipher.test = function() {
   var key = 'Hola';
   var opt = "Hola mundo";

   CardenalCipher.encode(opt, key, function(data) {
      console.log(data.length);

      var pt = CardenalCipher.encode(data, key, function(r) {
         console.log(r);
      });
   });
}