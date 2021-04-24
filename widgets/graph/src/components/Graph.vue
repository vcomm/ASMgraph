<template>
  <div>  
    <nav>
        <div class="dropdown">
            <button class="btn">[ File ] 
                <i class="fa fa-caret-down"></i>
            </button>
            <div class="dropdown-content">
                <a href="#" @click="newGraph()"><i class="fas fa-folder-plus"></i> New</a>
                <a href="#" @click="openGraph()"><i class="fas fa-folder-open"></i> Open</a>
                <a href="#" @click="saveGraph()"><i class="fas fa-save"></i> Save</a>
            </div>
        </div> 
        <button class="btn"
            @click="showModal('State')"
        ><i class="fas fa-project-diagram"></i> State</button>
        <button class="btn"
            @click="showModal('Trans')"
        ><i class="fas fa-exchange-alt"></i> Trans</button>
        <div class="dropdown">
            <button class="btn">[ <b ref="more">Paper</b> ] 
                <i class="fa fa-caret-down"></i>
            </button>
            <div class="dropdown-content">
                <a href="#" class="paper" @click="showModal('State')"><i class="fas fa-project-diagram"></i>   new State</a>
                <a href="#" class="paper" @click="showModal('Trans')"><i class="fas fa-exchange-alt"></i>   new Trans</a>
                <a href="#" class="paper" @click="showDAFSM()"><i class="fas fa-list"></i> show DAFSM</a>

                <a href="#" class="state" style="display:none" @click="sellRemove()"><i class="fas fa-trash"></i>   del State</a>
                <a href="#" class="state init" style="display:none" @click="showModal('Action','entries')"><i class="fas fa-sign-in-alt"></i>   add Entry</a>
                <a href="#" class="state final" style="display:none" @click="showModal('Action','exits')"><i class="fas fa-sign-out-alt"></i>   add Exit</a>
                <a href="#" class="state init final" style="display:none" @click="showModal('Action','stays')"><i class="fas fa-recycle"></i>   add Stay</a>

                <a class="trans" href="#" style="display:none" @click="sellRemove()"><i class="fas fa-trash"></i>   del Trans</a>
                <a class="trans" href="#" style="display:none" @click="showModal('Action','triggers')"><i class="fas fa-bolt"></i>   add Trigger</a>
                <a class="trans" href="#" style="display:none" @click="showModal('Action','effects')"><i class="fab fa-buffer"></i>   add Effect</a>
            </div>
        </div> 
    </nav>
    <div class="container" ref="joint"/>

    <div id="dialog" class="modal" ref="dialog">
    <div class="modal-dialog">
      <!-- Modal content -->
      <div class="modal-content">
        <span id="closeModal" class="close"
            @click="hideModal()"
        >&times;</span>
    
      <div id="State" ref="State" style="display:none">
        <input autofocus="autofocus" class="modal-enter" id="stateName" ref="stateName" v-bind:placeholder="[stateType === 'initialState' ? 'init' : stateType === 'finalState' ? 'final' : 'choose a state name']" type="text">
        <button id="confirmState" class="modal-enter"
            @click="newState()"
        >Confirm</button> 
        <p/><label style="margin-left: -100px;"><b>Type: </b></label>
        <input type="radio" name="stateType" value="initialState" v-model="stateType">Start
        <input type="radio" name="stateType" value="finalState" v-model="stateType">End
        <input type="radio" name="stateType" value="regularState" v-model="stateType" checked>Regular
      </div>
    
      <div id="Trans" ref="Trans" style="display:none">  
        <input autofocus="autofocus" class="modal-enter" ref="transName" v-bind:placeholder="`${transSrc}=>T=>${transDst}`" type="text" disabled><p/>
        <label style="margin-left: -100px;"><b>Transition Src: </b></label>      
        <select id="fromState" v-model="transSrc" class="modal-enter">
            <option v-bind:key="option.id" 
                    v-for="option in srcOptions" 
                    v-bind:value="option.value">
                {{ option.text }}
            </option>
        </select><p/>
        <label style="margin-left: -100px;"><b>Transition Dst: </b></label>
        <select id="toState" v-model="transDst" class="modal-enter">
            <option v-bind:key="option.id" 
                    v-for="option in dstOptions" 
                    v-bind:value="option.value">
                {{ option.text }}
            </option>
        </select><p/>
        <button id="confirmTrans" class="modal-enter"
            @click="newTrans()"
        >Confirm</button>
      </div>

      <div id="Action" ref="Action" style="display:none">
        <input autofocus="autofocus" class="modal-enter" id="actionName" ref="actionName" placeholder="choose a action name" type="text">
        <button id="confirmAction" class="modal-enter"
            @click="newAction()"
        >Confirm</button>          
      </div>    
  
      </div>
    </div>
      <input id="projectinput" ref="projectinput" @change="onLoad($event)" type="file" style="display:none;" />
    </div>
  </div>  
</template>

<script>
import * as joint from 'jointjs'
import "jointjs/dist/joint.css"
//import Component from 'vue-class-component'
import { jsonFSA } from '../libs/jsonFSA'
import projFSA from '../libs/projFSA'

//@Component
export default /*class umlFsm extends jsonFSA*/ {
    name: 'Graph',

    data() {
        return {
            uml : joint.shapes.uml, 
            selected: null,
            fsaJSON : new jsonFSA('tst','prj'),
            fsaPROJ : new projFSA('myproj'),
            stateType: 'regularState',
            transSrc: undefined,
            srcOptions: [],
            transDst: undefined,
            dstOptions: []
        }
    },

	created() {
        const self = this
		this.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
        this.graph.on('remove', (cell) => {
            let fsa = self.fsaJSON.get()
            switch (cell.fsa.type) {
            case 'trans':
              const owner = cell.fsa.owner.pattern
              const remtrans = cell.fsa.item.get().key
              console.log(`Remove from Owner ${JSON.stringify(cell.fsa.owner)} Transition: ${JSON.stringify(cell.fsa.item.get())}`);
              cell.fsa.owner.deltrans(cell.fsa.item.get().key)
              if (fsa.states.hasOwnProperty(owner.key)) {
                if (fsa.states[owner.key].hasOwnProperty("transitions")) {
                    const translst = fsa.states[owner.key].transitions  
                    for(var i = 0; i < translst.length; i++) {
                        const trans = translst[i]
                        if(trans.key === remtrans) {
                           translst.splice(i, 1)
                      }
                    }
                }
              }
              break;
            case 'state':
              const key = cell.fsa.item.get().key  
              console.log('Remove State: ',cell.fsa.item.get());  
              self.fsaJSON.delstate(key)
              if (fsa.states.hasOwnProperty(key)) {
                  delete fsa.states[key]
                  //fsa.countstates -- 
              }              
              break;
            }
        });
        this.graph.on('change:source', (trans) => {
            if (trans.attributes.source.id)
                self.changeTransSrc(trans)
        });          
        this.graph.on('change:target', (trans) => { 
            self.changeTransDst(trans)
        });
	},

    mounted() {
        const self = this;
        this.paper = new joint.dia.Paper({
            el: this.$refs.joint,
            width: this.$refs.joint.clientWidth,
            height: this.$refs.joint.clientHeight,
            gridSize: 1,
            model: this.graph,
            cellViewNamespace: joint.shapes
        });       

        this.paper.on('cell:pointerdown',(cellView)=>{
//            console.log(`cell:pointerdown`, this.fsaJSON.get())
            if (self.selected) 
                self.selected.attr({
                    rect: { fill: 'rgba(48, 208, 198, 0.1)' },
                    text: { fill: 'black', 'font-size': 15 }
                });
            cellView.model.attr({
              rect: { fill: 'yellow' },
              text: { fill: 'black', 'font-size': 15 }
            });
            self.selected  = cellView.model;
            if (self.selected.fsa.type === 'state') {
                this.$refs.more.innerText = 'State'
                self.showhide(['.state'],['.paper','.trans'])
                if (self.selected.fsa.item.pattern.key === 'init')
                    self.showhide([],['.init'])
                if (self.selected.fsa.item.pattern.key === 'final')
                    self.showhide([],['.final'])
            } else if (self.selected.fsa.type === 'trans') {
                this.$refs.more.innerText = 'Trans'
                self.showhide(['.trans'],['.paper','.state'])
            } else {
                self.showhide([],['.paper','.state','.trans'])    
            }
            console.log('selected '+self.selected.fsa.type,self.selected.fsa.item)
            //$('code#selectedItem').text(self.selected.fsa.item.pattern.key)
        });
        this.paper.on('blank:pointerdown', ()=>{
//            console.log(`blank:pointerdown`)
            if(self.selected) {
                self.selected.attr({
                    rect: { fill: 'rgba(48, 208, 198, 0.1)' },
                    text: { fill: 'black', 'font-size': 15 }
                });
                self.selected  = null;
                self.showhide(['.paper'],['.state','.trans'])
                console.log('Reset All')
                this.$refs.more.innerText = 'Paper'
                //$('code#selectedItem').text('Not Selected')
            }
        });
        this.paper.on('cell:pointerclick', (cellView, eventObject, eventX, eventY)=>{
            console.log(`cell:pointerclick - x[${eventX}], y[${eventY}]`)
        }); 
        this.paper.on('cell:pointerdblclick', (cellView)=>{
            console.log('Show State:',cellView.model.fsa.item.get());
        });        
        this.paper.on('element:contextmenu', (cellView)=>{
            console.log('Rigth Click Context Menu:');
        })       
    },

    watch: {

    },
    
    computed: {

    },

    methods: { 
        newGraph() {
            this.graph.clear(); 
            this.fsaJSON.reset();
            console.log(`Start new graph`)
        },
        openGraph() {
            this.$refs.projectinput.click()
        },
        onLoad(e) {
            const file = e.target.files[0]
            console.log(`Load Project File: ${file.name}, size: ${file.size}`)
            this.fsaPROJ.read(file,(result)=>{
                const dafsm = JSON.parse(result)
                console.debug(`Read Project: `,dafsm)
                this.restoreGraph(dafsm.states)
            })

        },
        saveGraph() {
            this.fsaPROJ.save(JSON.stringify(this.fsaJSON.get()))
        },
        getSelectedItem() {
            if(this.selected)
                return { type: this.selected.fsa.type, name: this.selected.fsa.item.pattern.key }
            else
                return null
        },
        sellRemove() {
            if(this.selected) this.selected.remove();
        },
        showhide(showlist,hidelist) {
            showlist.forEach(function(item, i, arr) {
                const elems = document.querySelectorAll(item)
                for ( i = 0; i < elems.length; i++)
                      elems[i].style.display = "block";
            });    
            hidelist.forEach(function(item, i, arr) {
                const elems = document.querySelectorAll(item)
                for ( i = 0; i < elems.length; i++)
                      elems[i].style.display = "none";
            });            
        },
        showDAFSM() {
            console.log('DAFSM:',this.fsaJSON.get());
            const dafsm = window.open("_blank");
            dafsm.document.write(JSON.stringify(this.fsaJSON.get()));
        },
        showModal(elem,actiontype) {
            this.$refs.dialog.style.display = "block"
            this.$refs[elem].style.display = "block"
            this.actionType = actiontype
            this.updateStateList()
        },
        hideModal() {
            this.$refs['State'].style.display = "none"
            this.$refs['Trans'].style.display = "none"
            this.$refs['Action'].style.display = "none"
            this.$refs.dialog.style.display = "none"
        },
        updateStateList() {
            this.srcOptions = [];
            this.dstOptions = [];
            for (var s in this.fsaJSON.get().states) {
                console.log("Update state list",s);
                this.srcOptions.push({id: s, text:s, value:s});
                this.dstOptions.push({id: s, text:s, value:s});
            }
        },
        newAction() {
            const actionName = this.$refs.actionName.value;

            this.addAction(this.actionType,actionName)
            this.hideModal()
        },
        newState() {
            const type = this.stateType;
//            const stateName = this.$refs.stateName.value; 
            const stateName = (this.stateType === 'initialState') ? 'init' : 
                              (this.stateType === 'finalState') ? 'final' : this.$refs.stateName.value;    

            console.log(`New State: ${stateName} [${type}]`)    
            if (this.fsaJSON.get().states[stateName]) {
                this.$refs.stateName.value = ''
                this.$refs.stateName.setAttribute('placeholder', "state[ "+stateName+"] exist - choose other name") 
                console.log("state[ "+stateName+"] exist - choose other name");
                return;
            }            
            this.makeState(type,stateName)
            this.hideModal()
        },
        makeState(type,stateName) {
            let uml = this.uml
            let fsa = this.fsaJSON.get() 
            let state = null, fsaState = null;
            const delta = (10*fsa.countstates)

            switch(type) {
                case 'initialState':
                    state = new uml.StartState({
                        position: { x:150  , y: 20 },
                        size: { width: 30, height: 30 },
                        attrs: {
                            'circle': {
                            fill: '#4b4a67',
                            stroke: 'none'
                            }
                        }
                    });
                    fsaState = this.fsaJSON.addstate('init','init'/*stateName*/,type)
                    fsa['states']['init'] = fsaState.pattern
                    break;
                case 'finalState':
                    state = new uml.EndState({
                        position: { x:750  , y: 550 },
                        size: { width: 30, height: 30 },
                        attrs: {
                            '.outer': {
                            stroke: "#4b4a67",
                            'stroke-width': 2
                            },
                            '.inner': {
                            fill: '#4b4a67'
                            }
                        }
                    });
                    fsaState = this.fsaJSON.addstate('final','final'/*stateName*/,type)
                    fsa['states']['final'] = fsaState.pattern
                    break;
                default:
                    const color = this.fsaJSON.genColor()
                    state = new uml.State({
                        position: { x:500+delta, y:50+delta },
                        size: { width: 150, height: 80 },
                        name: stateName,
                        events: ['{"entries":0}','{"stays":0}','{"exits":0}'],
                        attrs: {
                            '.uml-state-body': {
                            fill: 'rgba(48, 208, 198, 0.1)',
                            //stroke: '#4b4a67',
                            //stroke: this.stroke[this.get().countstates],
                            stroke: color,
                            'stroke-width': 3.0
                            },
                            '.uml-state-separator': {
                            //stroke: '#4b4a67'
                            //stroke: this.stroke[this.get().countstates],
                            stroke: color
                            }
                        }                    
                    });
                    fsaState = this.fsaJSON.addstate(stateName,stateName,type)
                    fsa['states'][stateName] = fsaState.pattern
            }

            fsaState.get().model = state
            state.fsa = { type: 'state', item: fsaState}
            this.graph.addCell(state)   
            console.log(`${stateName}[${state.id}]`,state)   
        },
        newTrans() {
            if (!this.transSrc || !this.transDst) {
                this.$refs.transName.value = ''
                this.$refs.transName.setAttribute('placeholder', "please select transition source & destination") 
                console.log("please fill all fields and select side");
                return;
            } else if (this.transSrc === this.transDst) {
                this.$refs.transName.value = ''
                this.$refs.transName.setAttribute('placeholder', "Wrong: selected src and dst is same state, please select one other and after change trans dst") 
                console.log("selected src and dst is same state, please select one other and after change trans dst");
                return;            
            }
                
            this.makeTrans(this.transSrc,this.transDst)
            this.hideModal()
        },
        makeTrans(src,dst) {
            let uml = this.uml
            let fsa = this.fsaJSON.get() 
            const transName = `${src}=>T=>${dst}`
            const srcState = fsa.states[src]
            const dstState = fsa.states[dst]
            const label = transName
            
            let trans = new uml.Transition({
                source: { id: srcState.model.id },
                target: { id: dstState.model.id },
                attrs: {'.connection': {
                    'fill': 'none',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    'stroke': (src === 'init') ? "#4b4a67" : srcState.model.attributes.attrs['.uml-state-body'].stroke
                    },
                    '.marker-arrowheads': {
                        display: 'none'
                    }
                },
                labels: [{
                    position: {
                        distance: 0.5,
                        offset: (label.indexOf('\n') > -1 || label.length === 1) ? 0 : 10,
                        args: {
                            keepGradient: true,
                            ensureLegibility: true
                        }
                    },
                    attrs: {
                        text: {
                            text: label,
                            fontWeight: 'bold'
                        }
                    }
                }]            
            });     
            /*
            let trans = this.transLink(srcState.model, dstState.model, 
                srcState.model.attributes.attrs['.uml-state-body'].stroke, label)
            */
            let fsaTrans = srcState.model.fsa.item.addtrans(transName,dstState.key)
            //fsa['states'][src]['transitions'].push(fsaTrans.pattern)
            fsaTrans.get().model = trans
            trans.fsa = { type: 'trans', item: fsaTrans, owner: srcState.model.fsa.item}
            this.graph.addCell(trans);
            console.log(`${src}[${srcState.model.id}] => ${dst}[${dstState.model.id}]`,trans)  
        },
        addAction(type,actname,actfunc) {
            const item = this.getSelectedItem()
            if (!item) return
            const objItem = this.selected.fsa.item
            switch(item.type) {
                case 'state':       
                    let events = this.selected.get('events')
                    switch (type) {
                        case 'entries':
                            if (events) {
                                let entries = JSON.parse(events[0])
                                entries.entries++
                                this.selected.set('events', [JSON.stringify(entries),events[1],events[2]])
                            }
                            objItem.addentry(actname,actfunc || 'return')
                            break;
                        case 'stays':
                            if (events) {
                                let stays = JSON.parse(events[1])
                                stays.stays++
                                this.selected.set('events', [events[0],JSON.stringify(stays),events[2]])
                            }
                            objItem.addstay(actname,actfunc || 'return')
                            break;
                        case 'exits':
                            if (events) {
                                let exits = JSON.parse(events[2])
                                exits.exits++
                                this.selected.set('events', [events[0],events[1],JSON.stringify(exits)])   
                            }  
                            objItem.addexit(actname,actfunc || 'return')           
                            break;    
                    } 
                    break;
                case 'trans':
                    switch (type) {
                        case 'triggers':
                            objItem.addtrigger(actname,actfunc || 'return true')
                            break;
                        case 'effects':
                            objItem.addeffect(actname,actfunc || 'return')
                            break;    
                    }
                    break; 
            }      
        },
        changeTransDst(trans) {
            if (trans.attributes.target.id) {
                const newTargetID = trans.attributes.target.id
                const newTarget = trans.graph.getCell(newTargetID)
                trans.fsa.item.pattern.key = `T:${trans.fsa.owner.pattern.key}=>${newTarget.fsa.item.pattern.key}`
                trans.fsa.item.pattern.nextstatename = newTarget.fsa.item.pattern.key
                console.log(`target of the link changed to ${trans.fsa.item.pattern.nextstatename}:`,trans,newTarget);
                console.log(`updated FSA`,this.get().states)
            }
        },
        changeTransSrc(trans) {
            const newSourceID = trans.attributes.source.id
            const newSource   = trans.graph.getCell(newSourceID)
            const oldOwnerKey = trans.fsa.owner.pattern.key
            const newOwnerKey = newSource.fsa.item.pattern.key
            if (oldOwnerKey !== newOwnerKey) {
                const fsaOldSource = this.get().states[oldOwnerKey]
                const fsaNewSource = this.get().states[newOwnerKey]
                const removedTranKey = trans.fsa.item.pattern.key
                let remTrans = fsaOldSource.model.fsa.item.deltrans(removedTranKey)
                if (Array.isArray(remTrans)) {
                    remTrans = remTrans[0]
                    remTrans.key = `T:${newOwnerKey}=>${trans.fsa.item.pattern.nextstatename}`
                    fsaNewSource.model.fsa.item.clonetrans(remTrans/*trans.fsa.item.pattern*/)
                    trans.fsa.item.pattern.key = remTrans.key
                    trans.fsa.owner = fsaNewSource.model.fsa.item
                    console.log(`source of the link changed and updated FSA`,this.get().states)
                } else {
                    trans.remove();
                    console.log(`source of the link changed failed, was deleted`,this.get().states)
                }
            }
        },
        // Restore Graph utils
        restoreState(jsonState) {
            let uml = this.uml
            const typeState = {
                StartState : function(jsonState,self) {
                    const state = new uml.StartState(jsonState.model)
                    const fsaState = self.fsaJSON.addstate('init',jsonState.name,type)
                    fsaState.get().model = state
                    state.fsa = { type: 'state', item: fsaState}
                    return state
                },
                EndState  : function(jsonState,self) {
                    const state = new uml.EndState(jsonState.model)
                    const fsaState = self.fsaJSON.addstate('final',jsonState.name,type)
                    fsaState.get().model = state
                    state.fsa = { type: 'state', item: fsaState}
                    return state
                },
                State     : function(jsonState,self) {
                    const state = new uml.State(jsonState.model)
                    const fsaState = self.fsaJSON.addstate(jsonState.key,jsonState.name,type)
                    fsaState.get().model = state
                    state.fsa = { type: 'state', item: fsaState}
                    return state
                }
            }
            const type = jsonState.model.type.substring(jsonState.model.type.indexOf('.')+1)
            console.log(`Restore State: `, jsonState.model)
            this.graph.addCell(typeState[type](jsonState,this)) 
        },
        restoreTrans(model,srcState,dstKey,transName) {
            let uml = this.uml
            const trans = new uml.Transition(model)
            const fsaTrans = srcState.addtrans(transName,dstKey)
            fsaTrans.get().model = trans
            trans.fsa = { type: 'trans', item: fsaTrans, owner: srcState}
            console.log(`Restore Trans: `, model)
            this.graph.addCell(trans) 
        },
        restoreGraph(states) {
            if (states instanceof Object) {
                for (let [key, state] of Object.entries(states)) {
                    if (state.hasOwnProperty("model"))
                        this.restoreState(state)
                }     
                for (let [key, state] of Object.entries(states)) {
                    if (state && state.hasOwnProperty("transitions")) {
                        state.transitions.forEach(trans => {
                            if (trans.hasOwnProperty("model"))
                                this.restoreTrans(
                                    trans.model,
                                    this.fsaJSON.statesDict[state.key],
                                    trans.nextstatename,
                                    trans.key)
                        })                        
                    } 
                } 
            } else {
                console.warn(`Cannon Restore old style format`)
            }  
        }

    }
}
</script>

<style lang="scss" scoped>
//@import "~@jointjs/dist/joint.css";

.container {
    background-color:#f0ebeb6e;
    margin: auto;
    border-radius: 5px;
    border: 2px solid black;
    width: 100%; /* Full width */
    height: 90vh; /* Full height */
}

nav {
  background-color: #e3f2fd;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border: 2px solid black;
//  width: 95%;
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
}

.btn {
  background-color: DodgerBlue;
  border: none;
  color: white;
  padding: 12px 15px;
  cursor: pointer;
  font-size: 20px;
  border-radius: 5px; 
  margin: 3px;
}

/* Darker background on mouse-over */
.btn:hover {
  background-color: RoyalBlue;
}

/* The Modal (background) */
.modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    padding-top: 100px; /* Location of the box */
    left: 30%;
    top: 10%;
    width: 500px;
//	opacity : 1.0;
}

/* Modal Content */
.modal-content {
    background-color:#6e6e6e6e;
    margin: auto;
    padding: 20px;
    border: 2px solid black;
    width: 90%;
}

/* The Close Button */
.close {
    color: #070707;
    float: right;
    font-size: 28px;
    font-weight: bold;
    position: absolute;
    right: 20px;
}

.close:hover,
.close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}
select.modal-enter, input.modal-enter {
    width: 50%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 2px solid black;
    border-radius: 4px;
    box-sizing: border-box;
}
button.modal-enter {
	border-radius: 10px;
    background-color: #88bbd4;
	border: 2px solid #060606;
    color: black;
    padding: 16px 32px;
    text-decoration: none;
    margin: 4px 2px;
    cursor: pointer;
}
button.modal-enter:hover {
    background-color:rgb(4, 37, 54);
    color: white;
}

.dropdown {
  float: left;
  overflow: hidden;
}
.dropdown .dropbtn {
  font-size: 16px;  
  border: none;
  outline: none;
  color: white;
  padding: 14px 16px;
  background-color: inherit;
  font-family: inherit;
  margin: 0;
}
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}
.dropdown-content a {
  float: none;
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}
.dropdown-content a:hover {
  background-color: #ddd;
}
.dropdown:hover .dropdown-content {
  display: block;
}

</style>