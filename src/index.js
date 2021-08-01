const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app) 
const io = socketio(server) 

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public') 

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New connection established')

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message, callback) => {
        io.emit('sendMessage', message)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`) // Not accurate at all find alternative
        callback()
    })

})

server.listen(port, () => {
    console.log('Server running on port ' + port)
})