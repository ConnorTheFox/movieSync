const Primus = require('primus')
const app = require('./app.js')
const videoDB = require('./db.js').videoDB
const userDB = require('./db.js').userDB
const empty = require('is-empty')

videoDB.insert({url:'https://storage.googleapis.com/staging.europe-west-181907.appspot.com/Newmovies/dy-hot/I.T.2017.1080.HC.HDRip.mp4', room:1234 })

let roomTime = {}
let roomState = {}

let primus = new Primus.createServer({
    port:8007,
    iknowhttpsisbetter:true,
    pathname: '/ws'
})

//primus.save(__dirname + '/primus.js')

primus.on('connection', async spark => {
    let url = spark.query.url
    let sparkID = spark.id
    let room = spark.query.room
    let userCount = (await userDB.findAsync({room:room})).length
    if (userCount === 0) {
        await userDB.insertAsync({spark:spark, id:sparkID, room:room, host:true})
    } else {
        await userDB.insertAsync({spark:spark, id:sparkID, room:room, host:false})
    }
    spark.on('data', async msg => {
        if (msg.cmd === 'getUsers') {
            let users = (await userDB.findAsync({room:room}))
            spark.write({cmd:'getUsers', res:users})
        }
        if (msg.cmd === 'play') {
            roomState[room] = 'play'
            primus.write({cmd:'play'})
        }
        if (msg.cmd === 'pause') {
            roomState[room] = 'pause'
            primus.write({cmd:'pause'})
        }
        if (msg.cmd === 'timeUpdate') {
            roomTime[room] = msg.res || 0
        }
        if (msg.cmd === 'getTime') {
            spark.write({cmd:'getTime', res:roomTime[room], params:roomState[room] || 'pause' })
        }
    })
})

primus.on('disconnection', async disspark => {
    disspark.end()
    let isHost = (await userDB.findAsync({id:disspark.id}))[0]
    await userDB.removeAsync({id:disspark.id})

    let users = await userDB.findAsync({room:disspark.query.room})
    if (!empty(users) && isHost.host) {
        userDB.update({id:users[0].id}, { $set: {host:true} })
        primus.forEach((spark, id, connections) => {
            if (id === users[0].id) {
                spark.write({cmd:'setHost', res:true})
            }
        })
    }
})