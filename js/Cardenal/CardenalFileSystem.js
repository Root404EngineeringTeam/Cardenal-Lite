// para el filesystem, http://www.html5rocks.com/en/tutorials/file/filesystem/
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

// Clase para manejar el filesystem
var CardenalFileSystem = function() {}

CardenalFileSystem.fs = null;

// Manejo de errores del filesystem
CardenalFileSystem.onError = function(e) {
   var msg = '';

   switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
   };

   CardenalDebug.error('FileSystemError: ' + msg);
};

CardenalFileSystem.readFile = function(filename, callback) {
   CardenalDebug.info('Opening ' + filename + ' from file system');
   CardenalFileSystem.fs.root.getFile(filename, {create: false}, function(fileEntry) {
      fileEntry.file(function(file) {
         callback(file, filename, fileEntry.toURL());
      });
   }, CardenalFileSystem.onError);
}

// Para abrir el filesystem solicitando el tamaño del archivo a descargar
CardenalFileSystem.open = function(size, callback) {
   CardenalDebug.alert('Requesting ' + size + ' for file system');
   window.requestFileSystem(window.TEMPORARY, size, function(fs) {
      CardenalFileSystem.fs = fs;
      callback();
      CardenalDebug.info('FileSystem opened: ' + fs.name);
   }, CardenalFileSystem.onError);
};

// Escribe los Bytes de un Int8Array a un archivo (name) del filesystem
// Int8Array, para escribir directamente valores binarios
CardenalFileSystem.saveInt8Array = function(name, part_saver, callback) {
   CardenalFileSystem.fs.root.getFile(name, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
         blob = new Blob([part_saver.data], {type:"application/octet-stream"});

         fileWriter.onwritestart = function() {
            //CardenalDebug.log(fileEntry.name + '.part' + part_saver.index  + ' saving');
         };

         fileWriter.onwriteend = function() {
            callback(fileEntry.toURL());

            blob = undefined;
            part_saver.data = undefined;
            part_saver.data = '';
         };

         fileWriter.seek(part_saver.offset);
         fileWriter.write(blob);

      }, CardenalFileSystem.onError);
   }, CardenalFileSystem.onError);
}

// Para agregar la parte descargada al archivo en el filesystem (y liberar ram)
CardenalFileSystem.savePart = function(c, name, part_saver, callback) {
   // algoritmo para poder guardar en orden las partes
   // la parte 3 no puede guardarse antes de la parte 2, etc...
   if((c.download.last_part_saved + 1) != part_saver.index) {
      setTimeout(function() {
         CardenalFileSystem.savePart(c, name, part_saver, callback);
      }, 1000);

      return;
   }

   CardenalFileSystem.fs.root.getFile(name, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
         blob = new Blob([part_saver.data]);

         fileWriter.onwritestart = function() {
            //CardenalDebug.log(fileEntry.name + '.part' + part_saver.index  + ' saving');
         };

         fileWriter.onwriteend = function() {
            c.download.last_part_saved = part_saver.index;

            callback(fileEntry.toURL());

            blob = undefined;
            part_saver.data = undefined;
            part_saver.data = '';
         };

         fileWriter.seek(part_saver.offset);
         fileWriter.write(blob);

      }, CardenalFileSystem.onError);
   }, CardenalFileSystem.onError);
}

CardenalFileSystem.removeLater = function(file) {
   CardenalFileSystem.fs.root.getFile(file, {create: false}, function(fileEntry) {
      fileEntry.getMetadata(function(metadata) {
         var Mb = Math.round(((metadata.size / 1024) / 1024));
         var timeToDelete =  Math.round((Mb / 15) * 1000); // suponiendo que guarda 15 MBps

         if(timeToDelete < 10000) timeToDelete = 10000;

         CardenalDebug.warning('Removing temp file (' + file + ') in ' + (timeToDelete / 1000) + 's');

         setTimeout(function(){
            fileEntry.remove(function(){
               CardenalDebug.log(file + ' removed from temp storange');
            }, CardenalFileSystem.onError);
         }, timeToDelete)
      });
   }, CardenalFileSystem.onError);
};

CardenalFileSystem.removeNow = function(file, callback) {
   CardenalFileSystem.fs.root.getFile(file, {create: false}, function(fileEntry) {
      CardenalDebug.alert("Removing now " + file + ' from file system');
      fileEntry.remove(callback);
   }, CardenalFileSystem.onError);
};

// Cuando el archivo se termina de descargar no se descarga directamente
// si no que se llama esta funcion desde el callback "done" del archivo
// para guardarlo (como una descarga normal)
CardenalFileSystem.saveFile = function(url, file, delete_from_filesystem) {
   CardenalDebug.info('Saving ' + file + '...');

   // lo que hace es simplemente "crear" un zelda a la url (del filesystem)
   // del archivo y darle click
   a = document.createElement('a');
   a.href = url;
   a.setAttribute('download', '');
   a.click();

   if(typeof delete_from_filesystem == 'undefined') delete_from_filesystem = true;

   // el archivo se elimina del filesystem una vez ya bien descargado
   // pero como no hay forma de saber si esa descarga ya finalizo (creo)
   // se calcula que se descarga (aprox) del filesystem a 15 MBps
   // entonces depues de X segundos que supuestamente tardará en guardarse
   // se manda a eliminar
   if(delete_from_filesystem) CardenalFileSystem.removeLater(file);
}