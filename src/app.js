const express = require('express')
const path = require('path')
const hbs = require('express-hbs')
const videoDB = require('./db.js').videoDB
const empty = require('is-empty')

let app = express()

app.use(express.static(path.join(__dirname, '../html')))

app.get('/player/*', async (req, res) => {
    let video = await videoDB.findAsync({room:parseInt(req.url.replace('/player/', ''))})
    if (!empty(video)) {
        res.render('player', {url:video[0].url})
    } else {
        res.end('Invaild Room ID')
    }
})

app.listen(8006)

app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

app.engine('hbs', hbs.express4({}))

module.exports = app
