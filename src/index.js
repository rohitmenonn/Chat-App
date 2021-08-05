const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app) 
const io = socketio(server) 

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public') 

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New connection established')

    socket.on('join', ({ username, room }, callback) => {
        const {user, error} = addUser({ id: socket.id, username, room })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
        }
    })
})

server.listen(port, () => {
    console.log('Server running on port ' + port)
})