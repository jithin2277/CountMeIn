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
                manageCode: ""
            },
            created: function () {
                socket.emit('getRecent', true);

                socket.on('playerList', function (players) {
                    app.playerList = [];
                    players.forEach(element => {
                        app.playerList.push(element);
                    });
                });

                socket.on('stop', function (players) {
                    app.playerList = [];
                    players.forEach(element => {
                        app.playerList.push(element);
                    });
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


