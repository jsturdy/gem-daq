app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.statRegs = [
        { name: "GLIB firmware",       data: { date: 0, version: 0 } },
        { name: "OptoHybrid firmware", data: { date: 0, version: 0 } }
    ];

    $scope.fifoFull = false;

    $scope.t1Status = false;

    $scope.scanStatus = 0;

    $scope.ultraStatus = 0;

    $scope.vfat2Status = [];

    for (var i = 0; i < 24; ++i) $scope.vfat2Status.push({ id: i, isPresent: false, isOn: false });

    function get_stat_registers() {
        socket.ipbus_read(0x00000002, function(data) {
            var version = ((data>>28)&0xf)+"."+((data>>24)&0xf)+"."+((data>>16)&0xff);
            var date = (2000+((data>>9)&0x7f))+"."+((data>>5)&0xf)+"."+((data)&0x1f);
            $scope.statRegs[0].data.date    = date;
            $scope.statRegs[0].data.version = version;
        });
        socket.ipbus_read(oh_stat_reg(OHID, 0), function(data) {
            var year  = ((data>>16)&0xffff).toString(16);
            var month = ((data>>8)&0xff).toString(16);
            var day   = ((data>>0)&0xff).toString(16);
            var date  = year+"."+month+"."+day
            $scope.statRegs[1].data.date = date;
        });
        socket.ipbus_read(oh_stat_reg(OHID, 3), function(data) {
            var result = ((data>>24)&0xff).toString(16)+"."+((data>>16)&0xff).toString(16)+"."+((data>>8)&0xff).toString(16)+"."+(data&0xff).toString(16);
            $scope.statRegs[1].data.version = result;
        });
    }

    function get_glib_status() {
        socket.ipbus_read(tkdata_reg(OHID, 2), function(data) { $scope.fifoFull = (data == 1); });
    }

    function get_oh_status() {
        socket.ipbus_read(oh_scan_reg(OHID, 9), function(data) { $scope.scanStatus = data; });
        socket.ipbus_read(oh_ultra_reg(OHID, 32), function(data) { $scope.ultraStatus = data; });
        socket.ipbus_read(oh_t1_reg(OHID, 14), function(data) { $scope.t1Status = (data == 0 ? false : true); });
    }

    function get_vfat2_status() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_read(oh_ei2c_reg(OHID, 8));
        socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), 24, function(data) {
            for (var i = 0; i < data.length; ++i)
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
