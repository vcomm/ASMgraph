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

## Start docker instance

`docker run --name asmgraph -p 5050:5050 -d --rm vcomm/asmgraph:latest`

### Install

` npm install `
 
### Build

` cd widgets/graph `
` npm install `
` npm run build `

### Run

` cd ../.. `

Start application

` npm start `

<img src="https://i.ibb.co/8dPmrpx/graph-demo.png">

## Example: Generated Executable JSON

```json
{
    "id": "tst",
    "prj": "prj",
    "type": "manual",
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
const fsmLogic = require('./manual.json');
const { serviceContent, serviceDeploy } = require('@vcomm/asmcore');

class serviceManager extends serviceDeploy {
    constructor() {
        super();
    }
    initLogic() {  // You have to implement the method 
        this.emitOn('efConfig', [
          (cntx)=>console.log('efConfig'),
          async (cntx)=>{
              return new Promise(resolve => {
                  setTimeout(() => resolve(cntx), 3000)
              })
              .then(data => {
                  console.log(`: Run async func: Anominus 1`);
              }) 
          },
          (cntx)=>cntx.setState(cntx.getNextSate()),
          (cntx)=>cntx.unlock()
        ], {});
        this.emitOn('efReport', [
          (cntx)=>console.log('efReport'),
          (cntx)=>cntx.setState(cntx.getNextSate()),
          (cntx)=>cntx.unlock()
        ], {});
        this.emitOn('efRequest', [
          (cntx)=>console.log('efRequest'),
          async (cntx)=>{
            const promise = new Promise((resolve,reject) => {
                setTimeout(() => resolve(cntx), 1000)
            })
            const data = await promise
            console.log(`: Run async func: Anominus 2`); 
          },
          (cntx)=>cntx.setState(cntx.getNextSate()),
          (cntx)=>cntx.unlock()
        ], {});
    }
}
```
## Example: Using

```javascript
const content  = new serviceContent(fsmLogic);
const manager  = new serviceManager();
manager.initLogic();

async function runLoop(trig, cntx, srvmng) {
    const state = await cntx.eventLoop(trig, srvmng);
    console.debug(` EvProc[${trig}] => nextState[${state}]:`)
}

(async (cntx, srvmng) => {
    await runLoop('evCheck', cntx, srvmng)
    await runLoop('evReplay', cntx, srvmng)
    await runLoop('evComplete', cntx, srvmng)
})(content, manager);
```

## Debug in REPL.it 
https://repl.it/@YakovLiskoff/ASMtest?lite=true