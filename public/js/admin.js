(function ($) {
    $(function () {
        var socket = io();

        var getQueryStringValue = function (key) {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        var code = getQueryStringValue("code");
        if(code) {
            socket.emit('manageBookings', code);
        }        

        var app = new Vue({
            el: '#admin',
            data: {
                playerList: [],
                magicWord: "",
                stopCode: ""
            },
            created: function () {
                socket.emit('getRecent', true);

                socket.on('playerList', function (players) {
                    app.playerList = [];
                    players.forEach(element => {
                        app.playerList.push(element);
                    });
                });

                socket.on('stop', function (player) {
                    app.playerList = [];
                });
            },
            methods: {
                resetBookings: function () {
                    socket.emit('resetBooking', this.magicWord);
                },
                stopBookings: function () {
                    socket.emit('manageBookings', this.stopCode);
                }
            }
        });
    });
})(jQuery);


