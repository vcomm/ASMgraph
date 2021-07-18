
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
                '}'+
                'setState(state) {'+
                '    this.state = state;'+
                '}'+
                'getState() {'+
                '    return this.state;'+
                '}'+
            '}'+
            'class serviceManager extends aChainEngine {'+
                'constructor() {'+
                '    super();'+
                '    this.content = new serviceContent(fsmLogic.states.init.key);'+
                '    this.initFSM();'+
                '}'+
                'eventAcceptor(ev) {'+
                '    const currState = fsmLogic.states[this.content.getState()];'+
                '    return (currState && currState.transitions[ev]) ?'+
                '            currState.transitions[ev] : null;'+
                '}'+
                'eventProcessing(ev) {'+
                '    const ev = this.eventAcceptor(ev);'+
                '    return (ev && ev.output) ? this.emitEvent(ev.output,this.content) : null;'+
                '}'     
            
            for (let [key, state] of Object.entries(logic['states'])) {
                for (let [ev, trans] of Object.entries(state['transitions'])) {
                    console.log(`State[${key}]->Trans[${ev}]`,trans)
                    ouputChains += `this.emitOn('${trans.output}',[],this.content);`
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