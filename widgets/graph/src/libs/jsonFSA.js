
export class jsonAction {
    /* Constructor */
    constructor(name,code) {
        this.pattern = code ? {
            name: name,
            func: code            
        } : {
            name: name
        }
    }     
    get() { return this.pattern } 
    addfunc(code) { 
        this.pattern.func = code
    }
}

export class jsonTrans {
    /* Constructor */
    constructor(name,nextstate,trans) {
        this.pattern = trans ? trans :
        {
            key: name,
            nextstatename: nextstate,
            triggers: [],
            effects: []            
        }
    }   
    get() { return this.pattern }  
    addtrigger(name, code) {
        this.pattern.triggers.push((new jsonAction(name, code)).get())
    } 
    addeffect(name, code) {
        this.pattern.effects.push((new jsonAction(name, code)).get())        
    } 
}

export class jsonState {
    /* Constructor */
    constructor(key,name,type) {
        this.transDict = {}
        this.pattern = {
            key: key,
            name: name                 
        }
        switch(type) {
            case 'initialState':
                this.pattern.key = 'init'
                this.pattern.exits = [] 
                this.pattern.transitions = []   
                break;
            case 'finalState':
                this.pattern.entries = []
                break;
            default:    
                this.pattern.entries = []
                this.pattern.stays = []
                this.pattern.exits = []     
                this.pattern.transitions = [] 
        }
    }  
    get() { return this.pattern }
    setsuperstate(link) {
        this.pattern.superstate = {
            link: link
        }
    }
    addentry(name, code) {
        if (this.pattern.hasOwnProperty("entries")) {
            let item = this.pattern.entries.find(obj => obj.name == name)
            if (item === undefined) {
                let action = new jsonAction(name, code)
                this.pattern.entries.push(action.get())    
                return action
            } else {
                item.func = code
                return null
            }
        } else return null        
    }
    addexit(name, code) {
        if (this.pattern.hasOwnProperty("exits")) {
            let action = new jsonAction(name, code)
            this.pattern.exits.push(action.get())  
            return action 
        } else return null    
    }
    addstay(name, code) {
        if (this.pattern.hasOwnProperty("stays")) {
            let action = new jsonAction(name, code)
            this.pattern.stays.push(action.get())  
            return action  
        } else return null     
    }    
    addtrans(name,nextstate) {
        if (this.pattern.hasOwnProperty("transitions")) {
            let trans = new jsonTrans(name,nextstate)
            this.pattern.transitions.push(trans.get())  
            this.transDict[name] = trans 
            return trans    
        } else return null
    }   
    deltrans(name) {
        if (this.pattern.hasOwnProperty("transitions")) {
            const translst = this.get().transitions  
            for(var i = 0; i < translst.length; i++) {
                const trans = translst[i]
                if(trans.key === name) {
                   translst.splice(i, 1)
                   if(this.transDict.hasOwnProperty(name)) {
                      delete this.transDict[name]                      
                   }
                   return true
              }
            }
        } 
        return false       
    }  
    clonetrans(transition) {
        if (this.pattern.hasOwnProperty("transitions")) {
            let trans = new jsonTrans('','',JSON.parse(JSON.stringify(transition)))
            this.pattern.transitions.push(trans.get())   
            return trans    
        } else return null        
    }
}

export class jsonFSA {
    /* Constructor */
    constructor(id,project) {
        this.pattern = {
            id: id,
            type: "FSM",
            prj: project,
            complete: false,
            start: {},
            stop: {},
            countstates: 0,
            //states: []  
            states: {}          
        }
        this.statesDict = {}
        this.stroke = [
            '#d0c4f4',
            '#f46b6d',
            '#5d8dbe',
            '#F4D03F',
            '#66bc84',
            '#e6b362',
            '#80c5e2'
        ]
    }   
    reset() {
        this.pattern.start = {}
        this.pattern.stop  = {}
        this.pattern.countstates = 0
        this.pattern.states = {}          
        this.statesDict = {}
    }
    get() { return this.pattern }
    addstate(key,name,type) {
    /*    
        let state = this.pattern.states.push((new jsonState(key,name,type)).get()) 
        this.pattern.countstates ++
        return this.pattern.states[state-1]
    */    
        let state = new jsonState(key,name,type)
        this.pattern.states[key] = state.get()
        this.pattern.countstates ++
        this.statesDict[key] = state
        return state
    }
    delstate(key) { 
    /*           
        let item = null
        for (let i=0; i<this.pattern.states.length; i++) {
            item = this.pattern.states[i]
            if (item.key === key) {
                this.pattern.states.splice(i, 1)
                break
            }
        } 
    */     
        if (this.pattern.states.hasOwnProperty(key)) {
            delete this.pattern.states[key]
            this.pattern.countstates -- 
            if (this.statesDict.hasOwnProperty(key))
                delete this.statesDict[key]
        }                       
    }
    addstart(name, code) {
        this.pattern.start = (new jsonAction(name, code)).get()  
    }
    addstop(name, code) {
        this.pattern.stop = (new jsonAction(name, code)).get()
    }
    genColor() {        
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;    
    }    
}
