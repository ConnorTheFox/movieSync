const express = require('express')
const path = require('path')
const hbs = require('express-hbs')
const videoDB = require('./db.js').videoDB
const empty = require('is-empty')

let app = express()

app.use(express.static(path.join(__dirname, '../')))

app.get('/*', async (req, res) => {
    let video = await videoDB.findAsync({room:parseInt(req.url.replace('/', ''))})
    if (!empty(video)) {
        res.render('index', {url:video[0].url})
    }
})

app.listen(8006)

app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

app.engine('hbs', hbs.express4({}))

module.exports = app
