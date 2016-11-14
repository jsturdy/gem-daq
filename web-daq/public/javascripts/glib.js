app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {
     
    $scope.statRegs = [
        { name: 'SFP1 mod abs', data: 0 },
        { name: 'SFP1 RX loss', data: 0 },
        { name: 'SFP1 TX fault', data: 0 },
        { name: 'SFP2 mod abs', data: 0 },
        { name: 'SFP2 RX loss', data: 0 },
        { name: 'SFP2 TX fault', data: 0 },
        { name: 'SFP3 mod abs', data: 0 },
        { name: 'SFP3 RX loss', data: 0 },
        { name: 'SFP4 TX fault', data: 0 },
        { name: 'SFP4 mod abs', data: 0 },
        { name: 'SFP4 RX loss', data: 0 },
        { name: 'SFP4 TX fault', data: 0 },
        { name: 'GBE int', data: 0 },
        { name: 'FMC1 present', data: 0 },
        { name: 'FMC2 present', data: 0 },
        { name: 'FPGA reset', data: 0 },
        { name: 'CDCE locked', data: 0 },
        { name: 'SFP phase monitoring done', data: 0 },
        { name: 'SFP phase monitoring OK', data: 0 },
        { name: 'FMC1 phase monitoring done', data: 0 },
        { name: 'FMC1 phase monitoring OK', data: 0 }
    ];

    $scope.network = [ "00:00:00:00:00:00", "192.168.0.161" ];

    $scope.ipbusCounters = [ 
        { name: 'OptoHybrid forward 0', stb: 0, ack: 0 }, 
        { name: 'Tracking data readout 0', stb: 0, ack: 0 }, 
        { name: 'OptoHybrid forward 1', stb: 0, ack: 0 }, 
        { name: 'Tracking data readout 1', stb: 0, ack: 0 }, 
        { name: 'Counters', stb: 0, ack: 0 }
    ];    

    $scope.t1Counters = [
        { name: 'AMC13 LV1A', cnt: 0 },
        { name: 'AMC13 Calpulse', cnt: 0 },
        { name: 'AMC13 Resync', cnt: 0 },
        { name: 'AMC13 BC0', cnt: 0 }
    ];

    $scope.gtxCounters = [
        { name: 'Tracking data link 0', cnt: 0 },
        { name: 'Trigger data link 0', cnt: 0 },
        { name: 'Tracking data link 1', cnt: 0 },
        { name: 'Trigger data link 1', cnt: 0 } 
    ];

    function get_status_reg() {
        socket.ipbus_blockRead(0x0000001c, 3, function(data) { 
            $scope.network[0] = (("0" + ((data[0] & 0xff00) >> 8).toString(16)).slice(-2) + ":" + 
                                ("0" + (data[0] & 0xff).toString(16)).slice(-2) + ":" +
                                ("0" + ((data[1] & 0xff000000) >> 24).toString(16)).slice(-2) + ":" + 
                                ("0" + ((data[1] & 0xff0000) >> 16).toString(16)).slice(-2) + ":" + 
                                ("0" + ((data[1] & 0xff00) >> 8).toString(16)).slice(-2) + ":" + 
                                ("0" + (data[1] & 0xff).toString(16)).slice(-2)).toUpperCase();
            $scope.network[1] = ((data[2] >> 24) & 0xff).toString() + "." + 
                                ((data[2] >> 16) & 0xff).toString() + "." + 
                                ((data[2] >> 8) & 0xff).toString() + "." + 
                                (data[2] & 0xff).toString();
        }); 
        socket.ipbus_read(0x00000006, function(data) { 
            $scope.statRegs[0].data = (data & 0x1);  
            $scope.statRegs[1].data = (data & 0x2) >> 1;  
            $scope.statRegs[2].data = (data & 0x4) >> 2;  
            $scope.statRegs[3].data = (data & 0x10) >> 4;  
            $scope.statRegs[4].data = (data & 0x20) >> 5;  
            $scope.statRegs[5].data = (data & 0x40) >> 6;  
            $scope.statRegs[6].data = (data & 0x100) >> 8;  
            $scope.statRegs[7].data = (data & 0x200) >> 9;  
            $scope.statRegs[8].data = (data & 0x400) >> 10;  
            $scope.statRegs[9].data = (data & 0x1000) >> 12;  
            $scope.statRegs[10].data = (data & 0x2000) >> 13;  
            $scope.statRegs[11].data = (data & 0x4000) >> 14;  
            $scope.statRegs[12].data = (data & 0x10000) >> 16;  
            $scope.statRegs[13].data = (data & 0x20000) >> 17;  
            $scope.statRegs[14].data = (data & 0x40000) >> 18;  
            $scope.statRegs[15].data = (data & 0x80000) >> 22;  
            $scope.statRegs[16].data = (data & 0x8000000) >> 27;  
            $scope.statRegs[17].data = (data & 0x10000000) >> 28;  
            $scope.statRegs[18].data = (data & 0x20000000) >> 29;  
            $scope.statRegs[19].data = (data & 0x40000000) >> 30;  
            $scope.statRegs[20].data = (data & 0x80000000) >> 31;  
        });
    }

    function get_glib_counters() {
        socket.ipbus_blockRead(glib_counter_reg(0), 18, function(data) { 
            $scope.ipbusCounters[0].stb = data[0];  
            $scope.ipbusCounters[1].stb = data[2];  
            $scope.ipbusCounters[2].stb = data[1];  
            $scope.ipbusCounters[3].stb = data[3];  
            $scope.ipbusCounters[4].stb = data[4]; 
            $scope.ipbusCounters[0].ack = data[5];  
            $scope.ipbusCounters[1].ack = data[7];  
            $scope.ipbusCounters[2].ack = data[6];  
            $scope.ipbusCounters[3].ack = data[8];  
            $scope.ipbusCounters[4].ack = data[9];  
            $scope.t1Counters[0].cnt = data[10];  
            $scope.t1Counters[1].cnt = data[11];  
            $scope.t1Counters[2].cnt = data[12];  
            $scope.t1Counters[3].cnt = data[13];  
            $scope.gtxCounters[0].cnt = data[14];  
            $scope.gtxCounters[1].cnt = data[16];  
            $scope.gtxCounters[2].cnt = data[15];  
            $scope.gtxCounters[3].cnt = data[17];   
        });
    }

    function get_status_loop() {
        get_status_reg();
        get_glib_counters();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.reset_ipbus_counters = function() {       
        socket.ipbus_blockWrite(glib_counter_reg(0), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], function() { Notification.primary('The IPBus counters have been reset'); });
        get_glib_counters();
    };

    $scope.reset_t1_counters = function() {       
        socket.ipbus_blockWrite(glib_counter_reg(10), [0, 0, 0, 0], function() { Notification.primary('The T1 counters have been reset'); });
        get_glib_counters();
    };

    $scope.reset_gtx_counters = function() {   
        socket.ipbus_blockWrite(glib_counter_reg(14), [0, 0, 0, 0], function() { Notification.primary('The GTX counters have been reset'); }); 
        get_glib_counters();
    };

}]);