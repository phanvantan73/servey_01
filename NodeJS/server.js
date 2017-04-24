var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis');
server.listen(8890);

io.on('connection', function (socket) {
    var redisClient = redis.createClient();
    redisClient.subscribe('answer', 'delete', 'update', 'invite');

    redisClient.on('message', function(channel, message) {
        socket.emit(channel, message);
    });

    socket.on('disconnect', function() {
        redisClient.quit();
    });
});
