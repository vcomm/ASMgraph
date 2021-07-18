import FileSaver from 'file-saver'

export default class projFSA {
    /* Constructor */
    constructor(name) {
        this._prjname_ = name || 'project'
        this._extension_ = 'dafsm'
    }

    read(file,handle) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {
          console.log(reader.result);
          if (handle) handle(reader.result);
        };  
        reader.onerror = function() {
          console.log(reader.error);
        };
    }
    save(context,filename) {
        const fname = filename || `${this._prjname_}.${this._extension_}`
        const file = new File([context],fname,{type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(file);          
    }
}