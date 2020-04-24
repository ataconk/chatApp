const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocMessage}= require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket)=> {
    console.log('New Connection')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id:socket.id, username: username, room:room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}`))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()     
        
    })

    socket.on('sendMessage', ( message, callback)=>{
       const user = getUser(socket.id)
       const filter = new Filter()

       

       if(filter.isProfane(message)){
           return callback('Bad word used! Be careful')
       }

       io.to(user.room).emit('message', generateMessage(user.username, message))
       callback()
    })

    socket.on('disconnect', ()=> {

        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
    })

    socket.on('sendLocation',(loc,cb) =>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocMessage(user.username,`https://google.com/maps?q=${loc.latitude},${loc.longitude}`))
        cb()
    })

})




app.use(express.json())

server.listen(port, () => {
    console.log('Server is running on '+ port)
})