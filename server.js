const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const passwordHash = require('password-hash');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var isTimerRunning = false;
var stopTimer = false;
var isVotingsEnabled = false;
const magicWordHashed = "sha1$b790e13c$1$6ee8f7b035838bf3c6199c757e19e90e96be61b7";
const startCodeHashed = "sha1$15b6d08b$1$6e49bc5696b1870ef0ce29e077b33fb19219a829";
const stopCodeHashed = "sha1$c1af9b62$1$d0ac887166aa1176027aeab75fb8f421dfa69ead";
const maxAllowedPlayers = 20;

var date = new Date();
var players = new Array();
var timeOut = 15;
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
    if (passwordHash.verify(req.query.code, startCodeHashed)) {
        if (!isTimerRunning && !isVotingsEnabled) {
            io.emit('startTimer', timerDisplay);

            var startTimer = function (duration) {
                isTimerRunning = true;
                var timer = duration, minutes, seconds;
                stopTimer = false;

                var intervalFunction = function () {
                    if (!stopTimer) {
                        minutes = parseInt(timer / 60, 10)
                        seconds = parseInt(timer % 60, 10);

                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;

                        timerDisplay = minutes + ":" + seconds;

                        io.emit('startTimer', timerDisplay);

                        if (--timer < 0) {
                            clearInterval(interval);
                            isTimerRunning = false;
                            players = new Array();
                            isVotingsEnabled = true;

                            io.emit('start', timerDisplay);

                            logger.write('================================= Bookings Started =================================' + '\r\n');
                            logger.write('\r\n');
                        }
                    }
                    else {
                        clearInterval(interval);
                        isTimerRunning = false;
                        isVotingsEnabled = false;

                        io.emit('stop', players);

                        logger.write('\r\n');
                        logger.write('############################ Bookings Stopped ############################' + '\r\n');
                        logger.write('\r\n');
                    }
                };

                var interval = setInterval(intervalFunction, 1000);
            }

            startTimer(timeOut);
        }
    }

    if (passwordHash.verify(req.query.code, stopCodeHashed)) {
        stopTimer = true;
        isVotingsEnabled = false;
        isTimerRunning = false;

        io.emit('stop', players);

        logger.write('\r\n');
        logger.write('############################ Bookings Stopped ############################' + '\r\n');
        logger.write('\r\n');
    }

    res.send("Mischief Managed");
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
        var percentage = (players.length / maxAllowedPlayers) * 100;
        if (percentage < 100) {
            io.emit('playerList', players);
        }
        else {
            io.emit('bookingsfull', players);
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
});

http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});