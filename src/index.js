const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')


const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket)=> {
    console.log('New Connection')


    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message, callback)=>{
       const filter = new Filter()

       if(filter.isProfane(message)){
           return callback('Bad word used! Be careful')
       }

       io.emit('message', message)
       callback()
    })

    socket.on('disconnect', ()=> {
        io.emit('message', 'A User has left')
    })

    socket.on('sendLocation',(loc,cb) =>{
        io.emit('message', `https://google.com/maps?q=${loc.latitude},${loc.longitude}`)
        cb('Location is shared')
    })

})




app.use(express.json())

server.listen(port, () => {
    console.log('Server is running on '+ port)
})