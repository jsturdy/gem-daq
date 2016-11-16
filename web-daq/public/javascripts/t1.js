app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {    
    
    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.t1Status = false;

    $scope.mode = 0;

    $scope.t1Type = 0;

    $scope.nEvents = 0;

    $scope.interval = 10;

    $scope.delay = 5;
        
    function get_current_values() {
        socket.ipbus_blockRead(oh_t1_reg(OHID, 1), 5, function(data) { 
            $scope.mode = data[0].toString();
            $scope.t1Type = data[1].toString();
            $scope.nEvents = data[2];
            $scope.interval = data[3];
            $scope.delay = data[4]; 
        });    
    };

    get_current_values();

    $scope.start_controller = function() {   
        socket.ipbus_blockWrite(oh_t1_reg(OHID, 1), [ $scope.mode, $scope.t1Type, $scope.nEvents, $scope.interval, $scope.delay ]);
        socket.ipbus_write(oh_t1_reg(OHID, 0), 1);
        get_t1_status();
    };

    $scope.stop_controller = function() {
        socket.ipbus_write(oh_t1_reg(OHID, 0), 0);
        get_t1_status();
    };

    $scope.reset_controller = function() {
        socket.ipbus_write(oh_t1_reg(OHID, 15), 1, function() { Notification.primary('The module has been reset'); });
        get_t1_status();
    };
        
    function get_t1_status() {
        socket.ipbus_read(oh_t1_reg(OHID, 14), function(data) { $scope.t1Status = (data == 0 ? false : true); });    
    };

    function get_status_loop() {
        get_t1_status();
        setTimeout(get_status_loop, 1000);
    }

    get_status_loop();

}]);