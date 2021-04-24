
const express = require('express')
const { join } = require('path')
const app = express()

const PORT = process.env.PORT || 5050
const apath = join(__dirname, '../widgets/graph/', 'dist')

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}: `,apath);
    console.log('Press Ctrl+C to quit.');
})

app
.use(express.static(apath))