(function ($) {
    $(function () {

    });
})(jQuery);
var maxAllowedPlayers = 20;
var socket = io();

var app = new Vue({
    el: '#admin',
    data: {
        playerList: [],
        magicWord: ""
    },
    created: function () {
        socket.emit('getRecent', true);

        socket.on('playerList', function (players) {
            app.playerList = [];
            players.forEach(element => {
                app.playerList.push(element);
            });
        });
    },
    methods: {
        resetBookings: function () {
            socket.emit('resetBooking', this.magicWord);
        }
    }
});

