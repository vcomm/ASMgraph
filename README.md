# ASMgraph
## State Diagram Notation (Graph) 

State diagrams (also called State Chart diagrams) are used to help the developer better understand any complex/unusual functionalities or business flows of specialized areas of the system. In short, State diagrams depict the dynamic behavior of the entire system, or a sub-system, or even a single object in a system. This is done with the help of Behavioral elements.

### Finite State Machine (FSM) 

A Finite State Machine (FSM) is the representation of a system in terms of its states and events. A state is simply a decision point at the system level , and an event is a stimulus that causes a state transition within the system. Therefore , a state machine stays in the current state until n event is received causing a state transition. If the state to transition to is the current state, a new state is not entered event though a state transition occurs.

### Mealy and Moore

Two well known types of state machine are the Mealy and Moore machines. The difference between these state machines is their output. The output of the Mealy state machine depends on the received event, while the output of the Moore state machine does not.

The functions defining the Moore state machine at transition t are: 

`S(t+1) = Function (S(t),I(t)); O(t+1) = Function (S(t))`

The functions defining the Mealy state machine at transition t are: 

`S(t+1) = Function (S(t),I(t)); O(t+1) = Function (S(t),I(t))`

While the state transition function S is same for both states machine, the output function O is different. The output of the Moore machine depends solely on the current state, while the output of the Mealy machine depends on both the current state and input.

### Deterministic and Non- Deterministic

In a state transition diagram, if no two outgoing edges of a state have the same label, then the corresponding machine is called a deterministic finite state machine …if two or more outgoing edges of a state have the same label, then it is called a non-deterministic finite state machine.

### Install

` npm install @vcomm/asmgraph `
 
### Build

` cd @vcomm/asmgraph/widgets/graph `
` npm run build `

### Run

` cd ../.. `

Start application

` npm start `

<img src="https://ibb.co/9VypbL4">

## Example: Generated Executable JSON

```json
{
    "id": "tst",
    "prj": "prj",
    "states": {
        "init": {
            "key": "init",
            "transitions": {
                "init=>[evCheck/efConfig]=>wait": {
                    "nextstatename": "wait",
                    "input": "evCheck",
                    "output": "efConfig"
                }
            }
        },
        "final": {
            "key": "final",
            "transitions": {}
        },
        "wait": {
            "key": "wait",
            "transitions": {
                "wait=>[evComplete/efReport]=>final": {
                    "nextstatename": "final",
                    "input": "evComplete",
                    "output": "efReport"
                },
                "wait=>[evReplay/efRequest]=>wait": {
                    "nextstatename": "wait",
                    "input": "evReplay",
                    "output": "efRequest"
                }
            }
        }
    }
}
```

## Example: Generated Node.js code template

```javascript
const { aChainEngine } = require('@vcomm/asynchain');
const fsmLogic = require('./exec.json');

class serviceContent {
    constructor(initState) {
        this.state = initState;
        this.locked = false;
    }
    setState(state) {
        this.state = state;
    }
    getState() {
        return this.state;
    }
    setNextState(nextState) {
        this.nextState = nextState;
    }
    getNextSate() {
        return this.nextState;
    }
    lock() {
        this.locked = true;
    }
    unlock() {
        this.locked = false;
    }
    isLocked() {
        return this.locked;
    }
}

class serviceManager extends aChainEngine {
    constructor() {
        super();
        this.content = new serviceContent(fsmLogic.states.init.key);
        this.initFSM();
    }
    eventProcessing(input, content) {
        const cntx = content || this.content;
        if (cntx.isLocked()) {
            return Promise.reject(`Warning: Transition input[${input}] - content is locked`)
            .catch(error => {
                console.error(error);
            })
        } else {
            cntx.lock();
            return new Promise((resolve, reject) => {
                const trans = this.inputProcessing(input, cntx);
                if (trans) {
                    console.log(`Transition:`, trans);
                    resolve(trans);
                } else {
                    reject(`Error: Wrong transition input[${input}] for current state`);
                }
            }).then(trans => {
                cntx.setNextState(trans.nextstate);
                this.emitEvent(trans.output, cntx);
                return trans.nextstate;
            }).catch(error => {
                console.error(error);
            })
        }
    }
    inputProcessing(input, cntx) {
        console.log(`Incoming input:`, input);
        const currState = fsmLogic.states[cntx.getState()];
        const trans = (currState && currState.transitions) ? currState.transitions : null;
        if (!trans) return null;
        for (let [key, tran] of Object.entries(trans)) {
            if (tran.input === input) {
                return {
                    output: tran.output,
                    nextstate: tran.nextstatename
                };
            }
        }
        return null;
    }
    initFSM() {
        this.emitOn('efConfig', [
            (cntx) => cntx.setState(cntx.getNextSate()), 
            (cntx) => cntx.unlock()
        ], this.content);
        this.emitOn('efReport', [
            (cntx) => cntx.setState(cntx.getNextSate()), 
            (cntx) => cntx.unlock()
        ], this.content);
        this.emitOn('efRequest', [
            (cntx) => cntx.setState(cntx.getNextSate()), 
            (cntx) => cntx.unlock()
        ], this.content);
    }
}
```
## Example: Using

```javascript
const mng = new serviceManager()
mng.eventProcessing('evCheck')   // build in internal content
mng.eventProcessing('evComplete',new serviceContent('wait')) // external content
```

## Debug in REPL.it 
https://repl.it/@YakovLiskoff/ASMtest?lite=true