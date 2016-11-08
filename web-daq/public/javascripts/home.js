app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.statRegs = [
        { name: "GLIB firmware version", data: 0 },
        { name: "OptoHybrid firmware date", data: 0 },
        { name: "OptoHybrid firmware version", data: 0 }
    ];

    $scope.fifoFull = false;

    $scope.t1Status = false;

    $scope.scanStatus = 0;

    $scope.vfat2Status = [];

    for (var i = 0; i < 24; ++i) $scope.vfat2Status.push({ id: i, isPresent: false, isOn: false });

    function get_stat_registers() {
        socket.ipbus_read(0x00000002, function(data) { $scope.statRegs[0].data = data; });
        socket.ipbus_read(oh_stat_reg(OHID, 0), 2, function(data) {
            $scope.statRegs[1].data = data[0];
            $scope.statRegs[2].data = data[1]; 
        });
    }

    function get_glib_status() {
        socket.ipbus_read(tkdata_reg(OHID, 2), function(data) { $scope.fifoFull = (data == 1); });
    }

    function get_oh_status() {
        socket.ipbus_read(oh_scan_reg(OHID, 9), function(data) { $scope.scanStatus = data; });
        socket.ipbus_read(oh_t1_reg(OHID, 14), function(data) { $scope.t1Status = (data == 0 ? false : true); });
    }

    function get_vfat2_status() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_read(oh_ei2c_reg(OHID, 8));
        socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), 24, function(data) {
            for (var i = 0; i < data.length; ++i)
                /*
                 * missing VFAT shows 0x0003XX00 in I2C broadcast result
                 *                    0x05XX0800 in single I2C request
                 * XX is slot number
                 * so if ((result >> 16) & 0x3) == 0x3, chip is missing
                 * or if ((result) & 0x30000)   == 0x30000, chip is missing
                 */
                // $scope.vfat2Status[i].isPresent = (((data[i] & 0xF000000) >> 24) == 0x5 ? false : true);
                $scope.vfat2Status[i].isPresent = ((data[i] >> 16) == 0x3 ? false : true);
        });
        socket.ipbus_read(oh_ei2c_reg(OHID, 0));
        socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), 24, function(data) {
            for (var i = 0; i < data.length; ++i)
                $scope.vfat2Status[i].isOn = (((data[i] & 0xF000000) >> 24) == 0x5 || (data[i] & 0x1) == 0 ? false : true);
        });
    };

    function get_status_loop() {
        get_stat_registers();
        get_glib_status();
        get_oh_status();
        get_vfat2_status();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

}]);
