
function validTransition(state) {
    const transitions = {}
    if (state && state.hasOwnProperty("transitions")) {
        state.transitions.forEach(trans => {
            transitions[trans.key] = {
                nextstatename: trans.nextstatename,
            }
            console.log(`Trans[${trans.key}]:`, trans)    
            if (trans.hasOwnProperty("triggers")) {
                trans.triggers.forEach(trig => {
                    transitions[trans.key].input = trig.name
                })
            }
            if (trans.hasOwnProperty("effects")) {
                trans.effects.forEach(eff => {
                    transitions[trans.key].output = eff.name
                })
            }
        })                        
    }
    return transitions
}

function validArrayStates(states,ejstates) {
    states.forEach(state => {
        ejstates[key] = {
            key: key,
            transitions: validTransition(state)
        }        
    })
}

function validObjectStates(states,ejstates) {
    for (let [key, state] of Object.entries(states)) {
        ejstates[key] = {
            key: key,
            transitions: validTransition(state)
        }
    }
}

module.exports = {
    build: (logic) => {
        const template = {
            id : logic.id,
            prj: logic.prj,
            states: {}
        }

        try {
            const states = logic['states']
            if (states instanceof Array) {
                validArrayStates(states,template['states'])
            } else if (states instanceof Object) {
                validObjectStates(states,template['states'])
            } else {      
                console.error('Not compatible States')
            }
        } catch(e) {
            console.fatal(`Build Execute JSON ERROR: in ${logic["id"]} >` + e.name + ":" + e.message + "\n" + e.stack)
        } finally {
            return template
        } 
    }
};