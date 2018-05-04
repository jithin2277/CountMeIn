const maxAllowedPlayers = 20;
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')

const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var date = new Date();
var logger = fs.createWriteStream('players' + date.getDay() + date.getMonth() + date.getFullYear() + '.txt', {
    flags: 'a'
});
var players = new Array();
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/', function (req, res) {
    res.render('index');
});

io.on('connection', function (socket) {
    socket.on('iAmIn', function (playerName) {
        var percentage = (players.length / maxAllowedPlayers) * 100;
        if (percentage <= 100) {
            var player = players.find(o => o === playerName);
            if (player === null || player === undefined) {
                socket.nickname = playerName;
                players.push(playerName);
                logger.write(playerName + '\r\n');
            }
            
            if (percentage === 100) {
                io.emit('bookingsfull', players);
            }
            else {
                io.emit('playerList', players);
            }
        }
        else {
            io.emit('bookingsfull', players);
        }
    });

    socket.on('getRecent', function (value) {
        var percentage = (players.length / maxAllowedPlayers) * 100;
        if (percentage < 100) {
            io.emit('playerList', players);
        }
        else {
            io.emit('bookingsfull', players);
        }
    });
});

http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});