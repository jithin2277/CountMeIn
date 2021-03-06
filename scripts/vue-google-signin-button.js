'use strict';
var _typeof = 'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator ? function (obj) {
    return typeof obj
} : function (obj) {
    return obj && 'function' == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
};
(function () {
    function a(c) {
        'undefined' != typeof console && console.error('[g-signin-button] ' + c)
    }

    function b(c) {
        c.component('g-signin-button', {
            data: function () {
                return {
                    containerclassName: "g-signin-button-container loading"
                }
            },
            render: function (createElement) {
                return createElement('div', {
                    attrs: {
                        class: this.containerclassName
                    }
                },
                    [
                        createElement('div', {
                            attrs: {
                                class: "lds-ring"
                            }
                        }, [createElement('div', {
                        }, ""), createElement('div', {
                        }, ""), createElement('div', {
                        }, ""), createElement('div', {
                        }, "")]),
                        createElement('div', {
                            attrs: {
                                class: "g-signin-button"
                            },
                            ref: 'signinBtn'
                        }, "Sign In using Google")
                    ]);
            },
            props: {
                params: {
                    type: Object,
                    required: !0,
                    default: function _default() {
                        return {}
                    }
                }
            },
            mounted: function mounted() {
                var _this = this;

                return window.gapi ? this.params.client_id ? void window.gapi.load('auth2', function () {
                    var d = window.gapi.auth2.init(_this.params);
                    d.attachClickHandler(_this.$refs.signinBtn, {}, function (e) {
                        _this.$emit('success', e);
                    }, function (e) {
                        _this.$emit('error', e), _this.$emit('failure', e);
                    });

                    d.currentUser.listen(function (e) {
                        if (e.getBasicProfile()) {
                            _this.$emit('success', e);
                        }
                        else {
                            _this.containerclassName = 'g-signin-button-container';
                        }
                    });

                    if (d.isSignedIn.get() == true) {
                        d.signIn();
                    }
                }) : void a('params.client_id must be specified.') : void a('"https://apis.google.com/js/api:client.js" needs to be included as a <script>.')
            }
        })
    }
    'object' == ('undefined' == typeof exports ? 'undefined' : _typeof(exports)) ? module.exports = b : 'function' == typeof define && define.amd ? define([], function () {
        return b
    }) : window.Vue && window.Vue.use(b)
})();