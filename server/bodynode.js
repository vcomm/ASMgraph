
module.exports = {
    build: (logic) => {
        let ouputChains = ''
        let template = "const { aChainEngine } = require('@vcomm/asynchain');"+
                       "const fsmLogic = require('./exec.json');"

        console.log(`Logic:`,JSON.stringify(logic))
        try {
            template += 
            'class serviceContent {'+
                'constructor(initState) {'+
                '    this.state = initState;'+
                '    this.locked = false;'+
                '}'+
                'setState(state) {'+
                '    this.state = state;'+
                '}'+
                'getState() {'+
                '    return this.state;'+
                '}'+
                'setNextState(nextState) {'+
                '    this.nextState = nextState;'+
                '}'+
                'getNextSate() {'+
                '    return this.nextState;'+
                '}'+
                'lock() {'+
                '    this.locked = true;'+
                '}'+
                'unlock() {'+
                '    this.locked = false;'+
                '}'+
                ' isLocked() {'+
                '    return this.locked;'+
                '}'+
            '}'+
            'class serviceManager extends aChainEngine {'+
                'constructor() {'+
                '    super();'+
                '    this.content = new serviceContent(fsmLogic.states.init.key);'+
                '    this.initFSM();'+
                '}'+
                'eventProcessing(input,content) {'+
                '   const cntx = content || this.content;'+
                '   if (cntx.isLocked()) {'+
                '       return Promise.reject(`Warning: Transition input[${input}] - content is locked`)'+
                '       .catch(error => {'+
                '           console.error(error);'+
                '       })'+
                '   } else {'+
                '       cntx.lock();'+
                '       return new Promise((resolve,reject) => {'+
                '           const trans = this.inputProcessing(input,cntx);'+
                '           if (trans) {'+
                '               console.log(`Transition:`,trans);'+
                '               resolve(trans);'+
                '           } else {'+
                '               reject(`Error: Wrong transition input[${input}] for current state`);'+
                '           }'+
                '       })'+
                '       .then(trans => {'+
                '           cntx.setNextState(trans.nextstate);'+
                '           this.emitEvent(trans.output, cntx);'+
                '           return trans.nextstate;'+
                '       })'+
                '       .catch(error => {'+
                '           console.error(error);'+
                '       })'+
                '   }'+
                '}'+
                'inputProcessing(input, cntx) {'+
                '    console.log(`Incoming input:`,input);'+
                '    const currState = fsmLogic.states[cntx.getState()];'+
                '    const trans =  (currState && currState.transitions) ? currState.transitions : null;'+
                '    if (!trans) return null;'+
                '    for (let [key, tran] of Object.entries(trans)) {'+
                '         if(tran.input === input) {'+
                '            return {'+
                '              output: tran.output,'+
                '              nextstate: tran.nextstatename'+
                '            };'+
                '         }'+
                '    }'+
                '    return null;'+
                '}'     
            
            for (let [key, state] of Object.entries(logic['states'])) {
                for (let [ev, trans] of Object.entries(state['transitions'])) {
                    console.log(`State[${key}]->Trans[${ev}]`,trans)
                    ouputChains += `this.emitOn('${trans.output}',[(cntx)=>cntx.setState(cntx.getNextSate()),(cntx)=>cntx.unlock()],this.content);`
                }
            }
            
            template += `initFSM() { ${ouputChains} }`
            template += `}`
        } catch(e) {
            console.fatal(`Build body node.js template: in ${logic["id"]} >` + e.name + ":" + e.message + "\n" + e.stack)
        } finally {
            return template
        }         
    }
};