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

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New connection established')

    socket.on('join', ({ username, room }) => {
        socket.join(room)
        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
    })

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'))
    })
})

server.listen(port, () => {
    console.log('Server running on port ' + port)
})