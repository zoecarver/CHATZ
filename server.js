//server side of the app

//vars
var socketio = require('socket.io');
var room;
var io = socketio.listen(6969);

console.log('server running on prot 6969')
//start server
io.sockets.on('connection', function (socket) {
    socket.on('send', function (data) {
        socket.join(data.Mroom);
        io.sockets.in(data.Mroom).emit('message', data);
        console.log(data.Mroom);
    });

});
