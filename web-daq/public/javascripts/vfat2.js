app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {   

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.vfat2Status = [];

    $scope.tkReadoutStatus = [];

    $scope.selectedVFAT2 = ((window.location.href.split('/'))[4] === undefined ? null : (window.location.href.split('/'))[4]); // Set in function of the URL
 
    $scope.defaultVFAT2 = {
        ctrl0: 55, 
        ctrl1: 0,
        ctrl2: 48,
        ctrl3: 0,
        iPreampIn: 168,
        iPremapFeed: 80,
        iPreampOut: 150,
        iShaper: 150,
        iShaperFeed: 100,
        iComp: 75,
        vthreshold2: 0
    };

    $scope.regName = "";

    $scope.regValue = 0;

    $scope.regSel = 0;

    for (var i = 0; i < 24; ++i) $scope.vfat2Status.push({
        id: i,
        isPresent: false,
        isOn: false,
        ctrl0: 0, 
        ctrl1: 0,
        ctrl2: 0,
        ctrl3: 0,
        iPreampIn: 0,
        iPremapFeed: 0,
        iPreampOut: 0,
        iShaper: 0,
        iShaperFeed: 0,
        iComp: 0,
        chipId:  0,
        chipId0: 0,
        chipId1: 0,
        latency: 0,
        vthreshold1: 0,
        vthreshold2: 0,
        vcal: 0,
        calphase: 0
    });

    for (var i = 0; i < 24; ++i) $scope.tkReadoutStatus.push({
        id: i,
        good: 0,
        bad: 0,
        masked: false
    });

    function get_vfat2_mask() {
        socket.ipbus_read(oh_system_reg(OHID, 0), function(data) {
            for (var i = 0; i < 24; ++i) $scope.tkReadoutStatus[i].masked = (((data >> i) & 0x1) == 1 ? true : false);
        });         
    }

    function get_detailed_status(vfat2) {
        socket.ipbus_blockRead(vfat2_reg(OHID, vfat2, 0), 10, function(data) { 
            $scope.vfat2Status[vfat2].ctrl0       = data[0] & 0xff;
            $scope.vfat2Status[vfat2].ctrl1       = data[1] & 0xff;
            $scope.vfat2Status[vfat2].iPreampIn   = data[2] & 0xff;
            $scope.vfat2Status[vfat2].iPremapFeed = data[3] & 0xff;
            $scope.vfat2Status[vfat2].iPreampOut  = data[4] & 0xff;
            $scope.vfat2Status[vfat2].iShaper     = data[5] & 0xff;
            $scope.vfat2Status[vfat2].iShaperFeed = data[6] & 0xff;
            $scope.vfat2Status[vfat2].iComp       = data[7] & 0xff;
            $scope.vfat2Status[vfat2].chipId      = ((data[9] & 0xff)<<8)+(data[8] & 0xff);
            $scope.vfat2Status[vfat2].chipId0     = data[8] & 0xff;
            $scope.vfat2Status[vfat2].chipId1     = data[9] & 0xff; 
        });
        socket.ipbus_read(vfat2_reg(OHID, vfat2, 16), function(data) { $scope.vfat2Status[vfat2].latency = data & 0xff; });
        socket.ipbus_blockRead(vfat2_reg(OHID, vfat2, 145), 6, function(data) { 
            $scope.vfat2Status[vfat2].vcal        = data[0] & 0xff;
            $scope.vfat2Status[vfat2].vthreshold1 = data[1] & 0xff;
            $scope.vfat2Status[vfat2].vthreshold2 = data[2] & 0xff;
            $scope.vfat2Status[vfat2].calphase    = data[3] & 0xff;
            $scope.vfat2Status[vfat2].ctrl2       = data[4] & 0xff;
            $scope.vfat2Status[vfat2].ctrl3       = data[5] & 0xff; 
        });
    }
        
    function get_vfat2_status() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_read(oh_ei2c_reg(OHID, 8));
        socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), 24, function(data) {
            for (var i = 0; i < data.length; ++i) {
                /*
                 * missing VFAT shows 0x0003XX00 in I2C broadcast result
                 *                    0x05XX0800 in single I2C request
                 * XX is slot number
                 * so if ((result >> 16) & 0x3) == 0x3, chip is missing
                 * or if ((result) & 0x30000)   == 0x30000, chip is missing
                 */
                // $scope.vfat2Status[i].isPresent = (((data[i] & 0xF000000) >> 24) == 0x5 ? false : true);
                $scope.vfat2Status[i].isPresent = ((data[i] >> 16) == 0x3 ? false : true);
                if ($scope.vfat2Status[i].isPresent) get_detailed_status(i);
            }
        });
        socket.ipbus_read(oh_ei2c_reg(OHID, 0));
        socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), 24, function(data) {
            for (var i = 0; i < data.length; ++i)
                $scope.vfat2Status[i].isOn = (((data[i] & 0xF000000) >> 24) == 0x5 || (data[i] & 0x1) == 0 ? false : true);
        });   
        socket.ipbus_blockRead(oh_counter_reg(OHID, 36), 48, function(data) {
            for (var i = 0; i < 24; ++i) {
                $scope.tkReadoutStatus[i].good = data[i];
                $scope.tkReadoutStatus[i].bad = data[i + 24];
            }
        });   
    }

    function get_status_loop() {
        get_vfat2_mask();
        get_vfat2_status();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.select_vfat2 = function(vfat2) {
        $scope.selectedVFAT2 = vfat2;
        get_vfat2_status();
    };
    
    $scope.apply_defaults = function(vfat2) {     
        socket.ipbus_blockWrite(vfat2_reg(OHID, vfat2, 1), [ 
            $scope.defaultVFAT2.ctrl1, 
            $scope.defaultVFAT2.iPreampIn, 
            $scope.defaultVFAT2.iPremapFeed, 
            $scope.defaultVFAT2.iPreampOut, 
            $scope.defaultVFAT2.iShaper,
            $scope.defaultVFAT2.iShaperFeed, 
            $scope.defaultVFAT2.iComp
        ]);
        socket.ipbus_write(vfat2_reg(OHID, vfat2, 147), $scope.defaultVFAT2.vthreshold2);
        socket.ipbus_blockWrite(vfat2_reg(OHID, vfat2, 149), [ $scope.defaultVFAT2.ctrl2, $scope.defaultVFAT2.ctrl3 ], function() { Notification.primary('The default parameters have been applied'); });
        get_vfat2_status();
    };

    $scope.start_vfat2 = function(vfat2) {
        socket.ipbus_write(vfat2_reg(OHID, vfat2, 0), $scope.defaultVFAT2.ctrl0, function() { Notification.primary('The VFAT2 has been started'); });
        get_vfat2_status();
    };

    $scope.stop_vfat2 = function(vfat2) {
        socket.ipbus_write(vfat2_reg(OHID, vfat2, 0), 0, function() { Notification.primary('The VFAT2 has been stopped'); });
        get_vfat2_status();
    };

    $scope.reset_channels = function(vfat2) {
        socket.ipbus_blockWrite(vfat2_reg(OHID, vfat2, 17), [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ], function() { Notification.primary('The VFAT2\'s channels have been reset'); });
    };

    $scope.apply_defaults_all = function() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_blockWrite(oh_ei2c_reg(OHID, 1), [ 
            $scope.defaultVFAT2.ctrl1, 
            $scope.defaultVFAT2.iPreampIn, 
            $scope.defaultVFAT2.iPremapFeed, 
            $scope.defaultVFAT2.iPreampOut, 
            $scope.defaultVFAT2.iShaper,
            $scope.defaultVFAT2.iShaperFeed, 
            $scope.defaultVFAT2.iComp
        ]);
        socket.ipbus_write(oh_ei2c_reg(OHID, 147), $scope.defaultVFAT2.vthreshold2);
        socket.ipbus_blockWrite(oh_ei2c_reg(OHID, 149), [ $scope.defaultVFAT2.ctrl2, $scope.defaultVFAT2.ctrl3 ], function() { Notification.primary('The default parameters have been applied to all VFAT2s'); });
        get_vfat2_status();
    };

    $scope.start_vfat2_all = function() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_write(oh_ei2c_reg(OHID, 0), $scope.defaultVFAT2.ctrl0, function() { Notification.primary('All the VFAT2s have been started'); });
        get_vfat2_status();
    };

    $scope.stop_vfat2_all = function() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_write(oh_ei2c_reg(OHID, 0), 0, function() { Notification.primary('All the VFAT2s have been stopped'); });
        get_vfat2_status();
    };

    $scope.reset_vfat2_all = function() {
        socket.ipbus_write(0x4B000002, 0);
        get_vfat2_status();
    };

    $scope.vfat2_toggle_mask = function(vfat2) {
        socket.ipbus_read(oh_system_reg(OHID, 0), function(data) {
            var bit = ((data >> vfat2) & 0x1);
            if (bit == 1) data &= ~(0x1 << vfat2);
            else data |= (0x1 << vfat2);
            socket.ipbus_write(oh_system_reg(OHID, 0), data);
            get_vfat2_mask();
        }); 
    };

    $scope.reset_counters = function() {
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 36), [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], function() { Notification.primary('The data counters have been reset'); });
        get_vfat2_status();
    };

    $scope.open_i2c = function(reg) {
        if (reg == 0) $scope.regName = "ControlReg 0";
        else if (reg == 1) $scope.regName = "ControlReg 1";
        else if (reg == 149) $scope.regName = "ControlReg 2";
        else if (reg == 150) $scope.regName = "ControlReg 3";
        else if (reg == 2) $scope.regName = "iPreampIn";
        else if (reg == 3) $scope.regName = "iPreampFeed";
        else if (reg == 4) $scope.regName = "iPreampOut";
        else if (reg == 5) $scope.regName = "iShaper";
        else if (reg == 6) $scope.regName = "iShaperFeed";
        else if (reg == 7) $scope.regName = "iComp";
        else if (reg == 16) $scope.regName = "Latency";
        else if (reg == 146) $scope.regName = "VThreshold 1";
        else if (reg == 147) $scope.regName = "VThreshold 2";
        else if (reg == 148) $scope.regName = "Calibration phase";
        else if (reg == 145) $scope.regName = "VCal";
        else $scope.regName = "Unknown register";
        $scope.regSel = reg;
        socket.ipbus_read(vfat2_reg(OHID, $scope.selectedVFAT2, reg), function(data) {  
            $scope.regValue = data & 0xff;
            $("#i2cModal").modal('show'); 
        });
    };

    $('#i2cModal').on('shown.bs.modal', function () {
        $('#regValueInput').focus();
    });

    $scope.perform_i2c = function() {
        socket.ipbus_write(vfat2_reg(OHID, $scope.selectedVFAT2, $scope.regSel), $scope.regValue, function(data) { Notification.primary('The register has been updated'); });
        $("#i2cModal").modal('hide');
        get_vfat2_status();
    };

    $scope.save = function() {
        socket.save({
                type: 'vfat2', 
                data: $scope.vfat2Status
            },
            function() { Notification.primary('The data has been saved to disk'); }
        );
    };
    
}]);