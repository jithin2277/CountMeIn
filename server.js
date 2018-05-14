const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const passwordHash = require('password-hash');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var stopTimer = false;
const magicWordHashed = "sha1$b790e13c$1$6ee8f7b035838bf3c6199c757e19e90e96be61b7";
const startCodeHashed = "sha1$15b6d08b$1$6e49bc5696b1870ef0ce29e077b33fb19219a829";
const stopCodeHashed = "sha1$c1af9b62$1$d0ac887166aa1176027aeab75fb8f421dfa69ead";
const maxAllowedPlayers = 20;

var date = new Date();
var timeOut = 30;
var logger = fs.createWriteStream('players' + date.getDay() + date.getMonth() + date.getFullYear() + '.log', {
    flags: 'a'
});

var model = {
    players: new Array(),
    isVotingsEnabled: false,
    isTimerStarted: false,
    timerDisplay: "00"
};

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.render('index', {
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
});

app.get('/admin', function (req, res) {
    res.render('admin');
});

app.get('/manage', function (req, res) {
    if (passwordHash.verify(req.query.code, startCodeHashed)) {
        if (!model.isTimerStarted && !model.isVotingsEnabled) {
            io.emit('startTimer', model.timerDisplay);

            var startTimer = function (duration) {
                model.isTimerStarted = true;
                var timer = duration, minutes, seconds;
                stopTimer = false;

                var intervalFunction = function () {
                    if (!stopTimer) {
                        minutes = parseInt(timer / 60, 10)
                        seconds = parseInt(timer % 60, 10);

                        //seconds = seconds < 10 ? "0" + seconds : seconds;

                        model.timerDisplay = seconds;

                        io.emit('startTimer', model.timerDisplay);

                        if (--timer < 0) {
                            clearInterval(interval);
                            model.isTimerStarted = false;
                            model.players = new Array();
                            model.isVotingsEnabled = true;

                            io.emit('playerList', model);

                            logger.write('================================= Bookings Started =================================' + '\r\n');
                            logger.write('\r\n');
                        }
                    }
                    else {
                        clearInterval(interval);
                        model.isTimerStarted = false;
                        model.isVotingsEnabled = false;

                        io.emit('stop', model);

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
        model.isVotingsEnabled = false;
        model.isTimerStarted = false;

        io.emit('stop', model);

        logger.write('\r\n');
        logger.write('############################ Bookings Stopped ############################' + '\r\n');
        logger.write('\r\n');
    }

    res.send("Mischief Managed");
});

io.on('connection', function (socket) {
    io.emit('playerList', model);

    socket.on('iAmIn', function (player, fn) {
        if (model.isVotingsEnabled && player) {
            var percentage = (model.players.length / maxAllowedPlayers) * 100;
            if (percentage <= 100) {
                var playerEmails = [];
                for (let i = 0; i < model.players.length; i++) {
                    playerEmails.push(model.players[i].Email);
                }
                var playerEmail = playerEmails.find(o => o === player.Email);
                if (playerEmail === null || playerEmail === undefined) {
                    model.players.push(player);
                    fn(true);
                    logger.write(player.Name + '\r\n');

                    percentage = (model.players.length / maxAllowedPlayers) * 100;
                    if (percentage === 100) {
                        io.emit('bookingsfull', model);
                    }
                    else {
                        io.emit('playerList', model);
                    }
                }
            }
            else {
                io.emit('bookingsfull', model);
            }
        }
    });

    socket.on('getRecent', function (value) {
        var percentage = (model.players.length / maxAllowedPlayers) * 100;
        if (percentage < 100) {
            io.emit('playerList', model);
        }
        else {
            io.emit('bookingsfull', model);
        }
    });

    socket.on('resetBooking', function (value) {
        if (passwordHash.verify(value, magicWordHashed)) {
            model.players = new Array();
            io.emit('playerList', model);

            logger.write('\r\n');
            logger.write('-------------------- Bookings Reset --------------------' + '\r\n');
            logger.write('\r\n');
        }
    });
});

http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});