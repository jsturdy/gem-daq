app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {    

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.register = '0';

    $scope.regData = 0;

    $scope.readsResult = [];    

    $scope.read = function() {      
        $scope.readResult = null;
        socket.ipbus_read(oh_adc_reg(OHID, $scope.register), function(data) { 
            // Temperature
            if ($scope.register == 0 || $scope.register == 32 || $scope.register == 36) $scope.readResult = Math.round(((data >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100. +  " °C";
            // Vccint, Vccaux
            else if ($scope.register == 1 || $scope.register == 2 || $scope.register == 33 || $scope.register == 34 || $scope.register == 37 || $scope.register == 38) $scope.readResult = Math.round((data >> 6) / 1024. * 3. * 100.) / 100. +  " V";
            // Control
            else if ($scope.register >= 64) $scope.readResult = data & 0xffff;
            // Other
            else $scope.readResult = Math.round((data >> 6) / 1024. * 100. * 100.) / 100. + " mV";
        });
    };

    $scope.write = function() {
        $scope.readResult = null;
        socket.ipbus_write(oh_adc_reg(OHID, $scope.register), $scope.regData, function(data) { Notification.primary('The write transaction has been completed'); });
    };

}]);