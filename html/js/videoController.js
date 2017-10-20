let popcornVideo
let documentVideo
let primus
let primusID
let host

$(document).ready(() => {
    popcornVideo = Popcorn('#video')
    documentVideo = document.getElementById('video')
    if (window.location.host === 'localhost:8006') {
        primus = Primus.connect(`http://localhost:8007/ws/?url=${$('#video').attr('src')}&room=${window.location.pathname.replace('/', '')}`)
    } else {
        primus = Primus.connect(`https://moviesync.nerdfox.me/ws/?url=${$('#video').attr('src')}&room=${window.location.pathname.replace('/', '')}`)
    }

    primus.on('open', () => {
        primus.id(id => {
            primusID = id
        })
    })

    primus.write({cmd:'getUsers'})

    primus.on('data', msg => {
        if (msg.cmd === 'getUsers') {
            for (let i in msg.res) {
                if (msg.res[i].id === primusID) {
                    if (msg.res[i].host) {
                        host = true
                    } else {
                        host = false
                        primus.write({cmd:'getTime'})
                    }
                }
            }
        }
        if (msg.cmd === 'setHost') {
            host = true
            popcornVideo.controls(true)
        }
        if (msg.cmd === 'play' && !host) {
            popcornVideo.play()
        }
        if (msg.cmd === 'pause' && !host) {
            popcornVideo.pause()
        }
        if (msg.cmd === 'getTime' && !host) {
            if (msg.params === 'play') {
                popcornVideo.play()
                popcornVideo.currentTime(msg.res)
            }
            if (msg.params === 'pause') {
                popcornVideo.pause()
                popcornVideo.currentTime(msg.res)
            }
        }
    })

    documentVideo.addEventListener('play', () => {
        if (host) {
            primus.write({cmd:'play'})
        }
    })
    documentVideo.addEventListener('pause', () => {
        if (host) {
            primus.write({cmd:'pause'})
        }
    })
    documentVideo.addEventListener('timeupdate', () => {
        if (host) {
            primus.write({cmd:'timeUpdate', res:documentVideo.currentTime})
        }
    })
    documentVideo.addEventListener('canplay', () => {
        if (!host && documentVideo.paused) {
            primus.write({cmd:'getTime'})
        }
    })
    documentVideo.addEventListener('seeked', () => {
        if (host) {

        }
    })
})