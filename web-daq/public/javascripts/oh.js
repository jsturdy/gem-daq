app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.t1SourceChoices = [
        { name: "AMC13 over GTX", id: 0},
        { name: "OptoHybrid (Internal)", id: 1},
        { name: "External", id: 2},
        { name: "Loopback", id: 3},
        { name: "All", id: 4},
        { name: "AMC13 over GBT", id: 5},
        { name: "AMC13 over GTX or GBT", id: 6},
        { name: "OptoHybrid or External", id: 7}
    ];

    $scope.t1Source = 0;

    $scope.loopbackSource = 0;

    $scope.sbitModeChoices = [
        { name: "Single VFAT2", id: 0 },
        { name: "iEta row", id: 1 },
        { name: "iPhi sector", id: 2 },
        { name: "Nothing (constant 0s)", id: 3 }
    ];

    $scope.sbitMode = 0;

    $scope.sbitSelect = [0, 0, 0, 0, 0, 0];

    $scope.vfat2sMask = "000000";

    $scope.sbitsMask = "000000";

    $scope.triggerThrottling = 0;

    $scope.zeroSuppress = false;

    $scope.clkSource = 0;

    $scope.clkSourceChoices = [
        { name: "QPLL", id: 0 },
        { name: "GBT", id: 1 }
    ];

    $scope.crcSuppress = false;

    $scope.wbCounters = [
        { name: 'GBT master', stb: 0, ack: 0 },
        { name: 'GTX master', stb: 0, ack: 0 },
        { name: 'Extended I2C master', stb: 0, ack: 0 },
        { name: 'Scan module master', stb: 0, ack: 0 },
        { name: 'DAC module master', stb: 0, ack: 0 },
        { name: 'I2C 0 slave', stb: 0, ack: 0 },
        { name: 'I2C 1 slave', stb: 0, ack: 0 },
        { name: 'I2C 2 slave', stb: 0, ack: 0 },
        { name: 'I2C 3 slave', stb: 0, ack: 0 },
        { name: 'I2C 4 slave', stb: 0, ack: 0 },
        { name: 'I2C 5 slave', stb: 0, ack: 0 },
        { name: 'Extended I2C slave', stb: 0, ack: 0 },
        { name: 'Scan module slave', stb: 0, ack: 0 },
        { name: 'T1 controller slave', stb: 0, ack: 0 },
        { name: 'DAC scan slave', stb: 0, ack: 0 },
        { name: 'ADC module slave', stb: 0, ack: 0 },
        { name: 'Clocking module slave', stb: 0, ack: 0 },
        { name: 'Counter module slave', stb: 0, ack: 0 },
        { name: 'System module slave', stb: 0, ack: 0 }
    ];

    $scope.t1Counters = [
        { name: 'AMC13 GBT LV1A', cnt: 0 },
        { name: 'AMC13 GBT Calpulse', cnt: 0 },
        { name: 'AMC13 GBT Resync', cnt: 0 },
        { name: 'AMC13 GBT BC0', cnt: 0 },
        { name: 'AMC13 GTX LV1A', cnt: 0 },
        { name: 'AMC13 GTX Calpulse', cnt: 0 },
        { name: 'AMC13 GTX Resync', cnt: 0 },
        { name: 'AMC13 GTX BC0', cnt: 0 },
        { name: 'OptoHybrid LV1A', cnt: 0 },
        { name: 'OptoHybrid Calpulse', cnt: 0 },
        { name: 'OptoHybrid Resync', cnt: 0 },
        { name: 'OptoHybrid BC0', cnt: 0 },
        { name: 'External LV1A', cnt: 0 },
        { name: 'External Calpulse', cnt: 0 },
        { name: 'External Resync', cnt: 0 },
        { name: 'External BC0', cnt: 0 },
        { name: 'Loopback LV1A', cnt: 0 },
        { name: 'Loopback Calpulse', cnt: 0 },
        { name: 'Loopback Resync', cnt: 0 },
        { name: 'Loopback BC0', cnt: 0 },
        { name: 'Sent LV1A', cnt: 0 },
        { name: 'Sent Calpulse', cnt: 0 },
        { name: 'Sent Resync', cnt: 0 },
        { name: 'Sent BC0', cnt: 0 }
    ];

    $scope.gtxCounters = [
        { name: 'Tracking data link', cnt: 0 },
        { name: 'Trigger data link', cnt: 0 },
        { name: 'GBT data link', cnt: 0 }
    ];

    $scope.statRegs = [
        { name: 'Firmware',  data: {val1: 0, val2: 0 } },
        { name: 'QPLL',      data: {val1: 0, val2: 0 } },
        { name: 'QPLL PLL',  data: {val1: 0, val2: 0 } }
    ];

    $scope.set_system_regs = function() {
        socket.ipbus_blockWrite(oh_system_reg(OHID, 0), [
            parseInt($scope.vfat2sMask, 16),
            $scope.t1Source.id,
            $scope.loopbackSource
        ]);
        socket.ipbus_blockWrite(oh_system_reg(OHID, 4), [
            parseInt($scope.sbitsMask, 16),
            (($scope.sbitSelect[5] & 0x1F) << 25) |
              (($scope.sbitSelect[4] & 0x1F) << 20) |
              (($scope.sbitSelect[3] & 0x1F) << 15) |
              (($scope.sbitSelect[2] & 0x1F) << 10) |
              (($scope.sbitSelect[1] & 0x1F) << 5) |
              ($scope.sbitSelect[0] & 0x1F),
              $scope.triggerThrottling,
              ($scope.zeroSuppress == true ? 1 : 0),
              $scope.sbitMode.id,
              $scope.clkSource.id,
              ($scope.crcSuppress == true ? 1 : 0)
            ],
            function() { Notification.primary('The OptoHybrid system registers have been updated'); }
        );
        get_oh_system_regs();
    };

    function get_oh_system_regs() {
        socket.ipbus_blockRead(oh_system_reg(OHID, 0), 11, function(data) {
            var mask = data[0].toString(16).toUpperCase();
            if (mask.length == 6) $scope.vfat2sMask = mask;
            else $scope.vfat2sMask = Array(6 - mask.length + 1).join('0') + mask;
            $scope.t1Source = $scope.t1SourceChoices[data[1]];
            $scope.loopbackSource = data[2];
            var mask2 = data[4].toString(16).toUpperCase();
            if (mask2.length == 6) $scope.sbitsMask = mask2;
            else $scope.sbitsMask = Array(6 - mask2.length + 1).join('0') + mask2;
            $scope.sbitSelect[0] = data[5] & 0x1F;
            $scope.sbitSelect[1] = (data[5] >> 5) & 0x1F;
            $scope.sbitSelect[2] = (data[5] >> 10) & 0x1F;
            $scope.sbitSelect[3] = (data[5] >> 15) & 0x1F;
            $scope.sbitSelect[4] = (data[5] >> 20) & 0x1F;
            $scope.sbitSelect[5] = (data[5] >> 25) & 0x1F;
            $scope.triggerThrottling = data[6];
            $scope.zeroSuppress = (data[7] == 1 ? true : false);
            $scope.sbitMode = $scope.sbitModeChoices[data[8]];
            $scope.clkSource = $scope.clkSourceChoices[data[9]]
            $scope.crcSuppress = (data[10] == 1 ? true : false);
        });
    }

    get_oh_system_regs();

    function get_oh_status_regs() {
        socket.ipbus_blockRead(oh_stat_reg(OHID, 0), 4, function(data) {
            var year  = ((data[0]>>16)&0xffff).toString(16);
            var month = ((data[0]>>8)&0xff).toString(16);
            var day   = ((data[0]>>0)&0xff).toString(16);
            var date  = year+"."+month+"."+day
            $scope.statRegs[0].data.val1 = date;
            var version = ((data[3]>>24)&0xff)+"."+((data[3]>>16)&0xff)+"."+((data[3]>>8)&0xff)+"."+(data[3]&0xff).toString(16);
            $scope.statRegs[0].data.val2 = version;
            $scope.statRegs[2].data.val1 = data[1];
            $scope.statRegs[3].data.val1 = data[2];
        });
    }

    function get_oh_counters() {
        socket.ipbus_blockRead(oh_counter_reg(OHID, 0), 36, function(data) {
            $scope.wbCounters[1].stb = data[0];
            $scope.wbCounters[2].stb = data[1];
            $scope.wbCounters[3].stb = data[2];
            $scope.wbCounters[4].stb = data[3];
            $scope.wbCounters[1].ack = data[4];
            $scope.wbCounters[2].ack = data[5];
            $scope.wbCounters[3].ack = data[6];
            $scope.wbCounters[4].ack = data[7];
            $scope.wbCounters[5].stb = data[8];
            $scope.wbCounters[6].stb = data[9];
            $scope.wbCounters[7].stb = data[10];
            $scope.wbCounters[8].stb = data[11];
            $scope.wbCounters[9].stb = data[12];
            $scope.wbCounters[10].stb = data[13];
            $scope.wbCounters[11].stb = data[14];
            $scope.wbCounters[12].stb = data[15];
            $scope.wbCounters[13].stb = data[16];
            $scope.wbCounters[14].stb = data[17];
            $scope.wbCounters[15].stb = data[18];
            $scope.wbCounters[16].stb = data[19];
            $scope.wbCounters[17].stb = data[20] + 1;
            $scope.wbCounters[18].stb = data[21];
            $scope.wbCounters[5].ack = data[22];
            $scope.wbCounters[6].ack = data[23];
            $scope.wbCounters[7].ack = data[24];
            $scope.wbCounters[8].ack = data[25];
            $scope.wbCounters[9].ack = data[26];
            $scope.wbCounters[10].ack = data[27];
            $scope.wbCounters[11].ack = data[28];
            $scope.wbCounters[12].ack = data[29];
            $scope.wbCounters[13].ack = data[30];
            $scope.wbCounters[14].ack = data[31];
            $scope.wbCounters[15].ack = data[32];
            $scope.wbCounters[16].ack = data[33];
            $scope.wbCounters[17].ack = data[34];
            $scope.wbCounters[18].ack = data[35];
        });
        socket.ipbus_blockRead(oh_counter_reg(OHID, 84), 22, function(data) {
            $scope.t1Counters[4].cnt = data[0];
            $scope.t1Counters[5].cnt = data[1];
            $scope.t1Counters[6].cnt = data[2];
            $scope.t1Counters[7].cnt = data[3];
            $scope.t1Counters[8].cnt = data[4];
            $scope.t1Counters[9].cnt = data[5];
            $scope.t1Counters[10].cnt = data[6];
            $scope.t1Counters[11].cnt = data[7];
            $scope.t1Counters[12].cnt = data[8];
            $scope.t1Counters[13].cnt = data[9];
            $scope.t1Counters[14].cnt = data[10];
            $scope.t1Counters[15].cnt = data[11];
            $scope.t1Counters[16].cnt = data[12];
            $scope.t1Counters[17].cnt = data[13];
            $scope.t1Counters[18].cnt = data[14];
            $scope.t1Counters[19].cnt = data[15];
            $scope.t1Counters[20].cnt = data[16];
            $scope.t1Counters[21].cnt = data[17];
            $scope.t1Counters[22].cnt = data[18];
            $scope.t1Counters[23].cnt = data[19];
            $scope.gtxCounters[0].cnt = data[20];
            $scope.gtxCounters[1].cnt = data[21];
        });
        socket.ipbus_blockRead(oh_counter_reg(OHID, 109), 7, function(data) {
            $scope.wbCounters[0].stb = data[0];
            $scope.wbCounters[0].ack = data[1];
            $scope.t1Counters[0].cnt = data[2];
            $scope.t1Counters[1].cnt = data[3];
            $scope.t1Counters[2].cnt = data[4];
            $scope.t1Counters[3].cnt = data[5];
            $scope.gtxCounters[2].cnt = data[6];
      });
        socket.ipbus_blockRead(oh_counter_reg(OHID, 107), 2, function(data) {
            $scope.statRegs[2].data.val2 = data[0];
            $scope.statRegs[3].data.val2 = data[1];
        });
    }

    function get_status_loop() {
        get_oh_status_regs();
        get_oh_counters();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.reset_wb_counters = function() {
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 0), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 109), [0, 0], function() { Notification.primary('The WishBone counters have been reset'); });
        get_oh_counters();
    };

    $scope.reset_t1_counters = function() {
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 84), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 111), [0, 0, 0, 0], function() { Notification.primary('The T1 counters have been reset'); });
        get_oh_counters();
    };

    $scope.reset_gtx_counters = function() {
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 104), [0, 0]);
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 112), 0, function() { Notification.primary('The GBT and GTX counters have been reset'); });
        get_oh_counters();
    };

    $scope.reset_qpll_counters = function() {
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 107), [0, 0], function() { Notification.primary('The QPLL and QPLL PLL counters have been reset'); });
        get_oh_counters();
    };
}]);
