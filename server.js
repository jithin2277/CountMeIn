const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const passwordHash = require('password-hash');

var isVotingsEnabled = false;
const magicWordHashed = "sha1$b790e13c$1$6ee8f7b035838bf3c6199c757e19e90e96be61b7";
const startCodeHashed = "sha1$15b6d08b$1$6e49bc5696b1870ef0ce29e077b33fb19219a829";
const stopCodeHashed = "sha1$c1af9b62$1$d0ac887166aa1176027aeab75fb8f421dfa69ead";
const maxAllowedPlayers = 20;
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var date = new Date();
var players = new Array();
var timeOut = 60;
var timerDisplay = "00:00";
var logger = fs.createWriteStream('players' + date.getDay() + date.getMonth() + date.getFullYear() + '.log', {
    flags: 'a'
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/admin', function (req, res) {
    res.render('admin');
});

app.get('/manage', function (req, res) {
    io.emit('manageBookings', req.query.code);
    
    res.send("true");
});

io.on('connection', function (socket) {
    socket.on('iAmIn', function (playerName) {
        if (isVotingsEnabled) {
            var percentage = (players.length / maxAllowedPlayers) * 100;
            if (percentage <= 100) {
                var player = players.find(o => o === playerName);
                if (player === null || player === undefined) {
                    socket.nickname = playerName;
                    players.push(playerName);
                    logger.write(playerName + '\r\n');
                    console.log(playerName);
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
        }
    });

    socket.on('getRecent', function (value) {
        if (isVotingsEnabled) {
            var percentage = (players.length / maxAllowedPlayers) * 100;
            if (percentage < 100) {
                io.emit('playerList', players);
            }
            else {
                io.emit('bookingsfull', players);
            }
        }
    });

    socket.on('resetBooking', function (value) {
        if (passwordHash.verify(value, magicWordHashed)) {
            players = new Array();
            io.emit('playerList', players);

            logger.write('\r\n');
            logger.write('-------------------- Bookings Reset --------------------' + '\r\n');
            logger.write('\r\n');
        }
    });

    socket.on('manageBookings', function (value) {
        console.log("asdfasdf");
        if (passwordHash.verify(value, startCodeHashed)) {
            io.emit('startTimer', timerDisplay);
            var startTimer = function (duration) {
                var timer = duration, minutes, seconds;

                var intervalFunction = function () {
                    minutes = parseInt(timer / 60, 10)
                    seconds = parseInt(timer % 60, 10);

                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;

                    timerDisplay = minutes + ":" + seconds;

                    io.emit('startTimer', timerDisplay);

                    if (--timer < 0) {
                        clearInterval(interval);

                        players = new Array();
                        isVotingsEnabled = true;

                        io.emit('start', timerDisplay);

                        logger.write('================================= Bookings Started =================================' + '\r\n');
                        logger.write('\r\n');
                    }
                };

                var interval = setInterval(intervalFunction, 1000);                
            }
            startTimer(timeOut);
        }

        if (passwordHash.verify(value, stopCodeHashed)) {
            players = new Array();
            isVotingsEnabled = false;
            io.emit('stop', players);

            logger.write('\r\n');
            logger.write('############################ Bookings Stopped ############################' + '\r\n');
            logger.write('\r\n');
        }
    });
});

http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});