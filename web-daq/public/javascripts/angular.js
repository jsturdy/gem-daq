// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', { 'packages': ['corechart'] });

var blockAllIPBUS = false;

var app = angular.module('app', ['ui-notification']);

app.factory('socket', function ($rootScope) {

    var socket = io.connect();

    return {

        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },

        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) callback.apply(socket, args);
                });
            })
        },

        ipbus_read: function(addr, clientCallback) {
            if (blockAllIPBUS) return console.log('blocked');
            socket.emit('ipbus', {
                type: 0,
                size: 1,
                addr: addr
            }, function(response) { $rootScope.$apply(function() { if (clientCallback) clientCallback(response.data); }); });
        },

        ipbus_blockRead: function(addr, size, clientCallback) {
            if (blockAllIPBUS) return;
            socket.emit('ipbus', {
                type: 0,
                size: size,
                addr: addr
            }, function(response) { $rootScope.$apply(function() { if (clientCallback) clientCallback(response.data); }); });
        },

        ipbus_fifoRead: function(addr, size, clientCallback) {
            if (blockAllIPBUS) return;
            socket.emit('ipbus', {
                type: 2,
                size: size,
                addr: addr
            }, function(response) { $rootScope.$apply(function() { if (clientCallback) clientCallback(response.data); }); });
        },

        ipbus_write: function(addr, data, clientCallback) {
            if (blockAllIPBUS) return;
            socket.emit('ipbus', {
                type: 1,
                size: 1,
                addr: addr,
                data: [ data ]
            }, function(response) { $rootScope.$apply(function() { if (clientCallback) clientCallback(true); }); });
        },

        ipbus_blockWrite: function(addr, data, clientCallback) {
            if (blockAllIPBUS) return;
            socket.emit('ipbus', {
                type: 1,
                size: data.length,
                addr: addr,
                data: data
            }, function(response) { $rootScope.$apply(function() { if (clientCallback) clientCallback(true); }); });
        },

        ipbus_fifoWrite: function(addr, data, clientCallback) {
            if (blockAllIPBUS) return;
            socket.emit('ipbus', {
                type: 3,
                size: data.length,
                addr: addr,
                data: data
            }, function(response) { $rootScope.$apply(function() { if (clientCallback) clientCallback(true); }); });
        },

        save: function(data, clientCallback) {
            socket.emit('save', data, clientCallback);
        }

    };
});

app.filter('hex', function() {
    return function(n) {
        n = parseInt(n);
        if (n < 0) n += 0xFFFFFFFF + 1;
        return '0x' + n.toString(16).toUpperCase();
    };
});

app.config(function(NotificationProvider) {
    NotificationProvider.setOptions({
        delay: 3000,
        startTop: 10,
        startRight: 10,
        verticalSpacing: 10,
        horizontalSpacing: 10,
        positionX: 'right',
        positionY: 'top'
    });
});

app.controller('commonCtrl', ['$scope', 'socket', function($scope, socket) {

    $scope.OHID = (window.sessionStorage.OHID == undefined ? 0 : window.sessionStorage.OHID);

    $scope.blockIPBus = false;

    $scope.oh_change = function() {
        window.sessionStorage.OHID = $scope.OHID;
        location.reload();
    };

    $scope.ipbus_block = function() {
        blockAllIPBUS = $scope.blockIPBus;
    };

}]);
