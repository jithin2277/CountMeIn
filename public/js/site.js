(function ($) {
    $(function () {
        var cookieName = "NameCookie";
        var socket = io();
        var maxAllowedPlayers = 20;

        var app = new Vue({
            el: '#app',
            data: {
                isOn: false,
                isDisabled: true,
                isRegistered: false,
                timer: '00:00',
                isTimerStarted: false,
                player: {},
                playerList: [],
                progress: 'progress-0',
                isBookingFull: false,
                googleSignInParams: {
                    client_id: '174879153500-i096vnit21kgt34j0bhk25n9a1btud1f.apps.googleusercontent.com'
                    //client_id: 463475695040-9aji250pcq6nuqoj52pb59cc3bjlqp1o.apps.googleusercontent.com
                }
            },
            created: function () {
                socket.on('playerList', function (model) {
                    app.playerList = [];
                    app.isDisabled = !model.isVotingsEnabled;
                    for (let i = 0; i < model.players.length; i++) {
                        app.playerList.push(model.players[i]);
                    }

                    if (app.playerList.length > 0) {
                        var playerEmails = [];
                        $.map(app.playerList, function (val, i) {
                            playerEmails.push(val.Email);
                        });

                        var o = $.inArray(app.player.Email, playerEmails);

                        if (o >= 0) {
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

                socket.on('bookingsfull', function (model) {
                    app.isBookingFull = true;
                    app.progress = 'progress-100';
                });

                socket.on('stop', function (model) {
                    app.playerList = [];
                    app.isDisabled = true;
                    app.isTimerStarted = false;
                });

                socket.on('start', function (model) {
                    app.playerList = [];
                    app.isDisabled = false;
                    app.isTimerStarted = false;
                    app.isOn = false;
                });

                socket.on('startTimer', function (value) {
                    app.isTimerStarted = true;
                    app.timer = value;
                });
            },
            methods: {
                countMeIn: function () {
                    if (!this.isDisabled && !this.isOn) {
                        this.isOn = true;
                        socket.emit('iAmIn', this.player);
                    }
                },
                registerUser: function () {
                    if (this.playerName.length > 0) {
                        this.isRegistered = true;
                    }
                },
                submitName: function (e) {
                    if (e.keyCode === 13) {
                        this.registerUser();
                    }
                },
                onSignInSuccess: function (googleUser) {
                    const profile = googleUser.getBasicProfile();
                    if (profile) {
                        this.isRegistered = true;
                        this.player.Id = profile.getId();
                        this.player.Name = profile.getName();
                        this.player.Email = profile.getEmail();
                        
                        socket.emit('getRecent', true);
                    }
                },
                onSignInError: function (error) {
                    console.log('OH NOS', error)
                }
            }
        });
    });
})(jQuery);

