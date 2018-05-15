(function ($) {
    $(function () {
        var socket = io();

        var getQueryStringValue = function (key) {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        var app = new Vue({
            el: '#admin',
            data: {
                playerList: [],
                magicWord: "",
                manageCode: "",
                isVotingsEnabled: false,
                isTimerStarted: false,
                timerDisplay: "00:00"
            },
            created: function () {
                socket.emit('getRecent', true);

                socket.on('playerList', function (model) {
                    app.playerList = [];
                    for (var i = 0; i < model.players.length; i++) {
                        app.playerList.push(model.players[i]);
                    }
                    app.isVotingsEnabled = model.isVotingsEnabled;
                    app.isTimerStarted = model.isTimerStarted
                });

                socket.on('stop', function (model) {
                    app.playerList = [];
                    for (var i = 0; i < model.players.length; i++) {
                        app.playerList.push(model.players[i]);
                    }
                    app.isVotingsEnabled = model.isVotingsEnabled;
                    app.isTimerStarted = model.isTimerStarted                    
                });

                socket.on('startTimer', function (value) {
                    app.isTimerStarted = true;
                    app.timerDisplay = value;
                });
            },
            methods: {
                resetBookings: function () {
                    socket.emit('resetBooking', this.magicWord);
                },
                manageBookings: function () {
                    $.get("/manage?code=" + this.manageCode);
                }
            }
        });
    });
})(jQuery);


