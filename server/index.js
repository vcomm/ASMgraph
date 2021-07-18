
const express = require('express')
const { join } = require('path')
const bodyparser = require('body-parser')
const app = express()

const PORT = process.env.PORT || 5050
const apath = join(__dirname, '../widgets/graph/', 'dist')

const swaggerUi      = require('swagger-ui-express');
const swagerDocument = require('../api.json');

const execJson = require('./execjson')
const bodyNode = require('./bodynode')

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}: `,apath);
    console.log('Press Ctrl+C to quit.');
})

app
.use(bodyparser.urlencoded({ extended: false }))
.use(bodyparser.json())
.use(express.static(apath))
.use('/api',swaggerUi.serve,swaggerUi.setup(swagerDocument))
.post('/code/json/:suid', (req,res)=>{
    const json = execJson.build(req.body)
    console.log(`Generate Executable JSON:`,JSON.stringify(json))
    res.status(200).json(json)  
})
.post('/code/nodejs/:suid', async (req,res)=>{
    const code = bodyNode.build(execJson.build(req.body))
    console.log(`Generate Node.js code template:`,code)
    res.setHeader('Content-Type', 'application/javascript')
    res.status(200).send(code)  
})