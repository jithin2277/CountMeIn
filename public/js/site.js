(function ($) {
    $(function () {
        var cookieName = "NameCookie";
        var socket = io();
        var maxAllowedPlayers = 20;

        var getCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        var setCookie = function (name, value) {
            if (value) {
                var expires = "";
                var date = new Date();
                date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
                document.cookie = name + "=" + value + expires + "; path=/";
            }
        }

        var app = new Vue({
            el: '#app',
            data: {
                isOn: false,
                isDisabled: false,
                isRegistered: false,
                playerName: '',
                playerList: [],
                progress: 'progress-0',
                isBookingFull: false
            },
            created: function () {
                var nameCookie = getCookie(cookieName);
                if (nameCookie !== null) {
                    this.isRegistered = true;
                    this.playerName = nameCookie;
                }
                socket.emit('getRecent', true);

                socket.on('playerList', function (players) {
                    app.playerList = [];
                    players.forEach(element => {
                        app.playerList.push(element);
                    });

                    if (app.playerList.length > 0) {
                        var players = app.playerList.find(o => o === app.playerName);
                        if (players !== undefined) {
                            app.isOn = true;
                        }
                    }
                    else {
                        app.isOn = false;
                    }

                    var percentage = Math.round((app.playerList.length / maxAllowedPlayers) * 100);
                    app.progress = 'progress-' + percentage;
                    if (percentage === 100) {
                        app.isBookingFull = true;
                    }
                });

                socket.on('bookingsfull', function (player) {
                    app.isBookingFull = true;
                    app.progress = 'progress-100';
                });
            },
            methods: {
                countMeIn: function () {
                    if (!this.isDisabled && !this.isOn) {
                        this.isOn = true;
                        socket.emit('iAmIn', this.playerName);
                    }
                },
                registerUser: function () {
                    if (this.playerName.length > 0) {
                        setCookie(cookieName, this.playerName);
                        this.isRegistered = true;
                    }
                },
                submitName: function (e) {
                    if (e.keyCode === 13) {
                        this.registerUser();
                    }
                }
            }
        });
    });
})(jQuery);

