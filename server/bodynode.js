
module.exports = {
    build: (logic) => {
        let ouputChains = ''
        let template = `
        const fsmLogic = require('./manual.json');
        const { serviceContent, serviceDeploy } = require('@vcomm/asmcore');`

        console.log(`Logic:`,JSON.stringify(logic))
        try {
            template += `
            class serviceManager extends serviceDeploy {
                constructor() {
                    super();
                }            
            `
            
            for (let [key, state] of Object.entries(logic['states'])) {
                for (let [ev, trans] of Object.entries(state['transitions'])) {
                    console.log(`State[${key}]->Trans[${ev}]`,trans)
                    ouputChains += `this.emitOn('${trans.output}',[(cntx)=>cntx.setState(cntx.getNextSate()),(cntx)=>cntx.unlock()],this.content);`
                }
            }
            
            template += `initLogic() { ${ouputChains} }`
            template += `}`
        } catch(e) {
            console.fatal(`Build body node.js template: in ${logic["id"]} >` + e.name + ":" + e.message + "\n" + e.stack)
        } finally {
            return template
        }         
    }
};