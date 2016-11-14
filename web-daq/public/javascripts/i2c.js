app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.dispRegisters = [
        { name: "ControlReg 0", id: 0 },
        { name: "ControlReg 1", id: 1 },
        { name: "ControlReg 2", id: 149 },
        { name: "ControlReg 3", id: 150 },
        { name: "iPreampIn", id: 2 },
        { name: "iPreampFeed", id: 3 },
        { name: "iPreampOut", id: 4 },
        { name: "iShaper", id: 5 },
        { name: "iShaperFeed", id: 6 },
        { name: "iComp", id: 7 },
        { name: "ChipID 0", id: 8 },
        { name: "ChipID 1", id: 9 },
        { name: "Upset Register", id: 10 },
        { name: "HitCounter 0", id: 11 },
        { name: "HitCounter 1", id: 12 },
        { name: "HitCounter 2", id: 13 },
        { name: "Extended Pointer", id: 14 },
        { name: "Extended Data", id: 15 },
        { name: "Latency", id: 16 },
        { name: "VThreshold 1", id: 146 },
        { name: "VThreshold 2", id: 147 },
        { name: "Calphase", id: 148 },
        { name: "VCal", id: 145 },
        { name: "ChannelReg 0", id: 17 },
        { name: "ChannelReg 1", id: 18 },
        { name: "ChannelReg 2", id: 19 },
        { name: "ChannelReg 3", id: 20 },
        { name: "ChannelReg 4", id: 21 },
        { name: "ChannelReg 5", id: 22 },
        { name: "ChannelReg 6", id: 23 },
        { name: "ChannelReg 7", id: 24 },
        { name: "ChannelReg 8", id: 25 },
        { name: "ChannelReg 9", id: 26 },
        { name: "ChannelReg 10", id: 27 },
        { name: "ChannelReg 11", id: 28 },
        { name: "ChannelReg 12", id: 29 },
        { name: "ChannelReg 13", id: 30 },
        { name: "ChannelReg 14", id: 31 },
        { name: "ChannelReg 15", id: 32 },
        { name: "ChannelReg 16", id: 33 },
        { name: "ChannelReg 17", id: 34 },
        { name: "ChannelReg 18", id: 35 },
        { name: "ChannelReg 19", id: 36 },
        { name: "ChannelReg 20", id: 37 },
        { name: "ChannelReg 21", id: 38 },
        { name: "ChannelReg 22", id: 39 },
        { name: "ChannelReg 23", id: 40 },
        { name: "ChannelReg 24", id: 41 },
        { name: "ChannelReg 25", id: 42 },
        { name: "ChannelReg 26", id: 43 },
        { name: "ChannelReg 27", id: 44 },
        { name: "ChannelReg 28", id: 45 },
        { name: "ChannelReg 29", id: 46 },
        { name: "ChannelReg 30", id: 47 },
        { name: "ChannelReg 31", id: 48 },
        { name: "ChannelReg 32", id: 49 },
        { name: "ChannelReg 33", id: 50 },
        { name: "ChannelReg 34", id: 51 },
        { name: "ChannelReg 35", id: 52 },
        { name: "ChannelReg 36", id: 53 },
        { name: "ChannelReg 37", id: 54 },
        { name: "ChannelReg 38", id: 55 },
        { name: "ChannelReg 39", id: 56 },
        { name: "ChannelReg 40", id: 57 },
        { name: "ChannelReg 41", id: 58 },
        { name: "ChannelReg 42", id: 59 },
        { name: "ChannelReg 43", id: 60 },
        { name: "ChannelReg 44", id: 61 },
        { name: "ChannelReg 45", id: 62 },
        { name: "ChannelReg 46", id: 63 },
        { name: "ChannelReg 47", id: 64 },
        { name: "ChannelReg 48", id: 65 },
        { name: "ChannelReg 49", id: 66 },
        { name: "ChannelReg 50", id: 67 },
        { name: "ChannelReg 51", id: 68 },
        { name: "ChannelReg 52", id: 69 },
        { name: "ChannelReg 53", id: 70 },
        { name: "ChannelReg 54", id: 71 },
        { name: "ChannelReg 55", id: 72 },
        { name: "ChannelReg 56", id: 73 },
        { name: "ChannelReg 57", id: 74 },
        { name: "ChannelReg 58", id: 75 },
        { name: "ChannelReg 59", id: 76 },
        { name: "ChannelReg 60", id: 77 },
        { name: "ChannelReg 61", id: 78 },
        { name: "ChannelReg 62", id: 79 },
        { name: "ChannelReg 63", id: 80 },
        { name: "ChannelReg 64", id: 81 },
        { name: "ChannelReg 65", id: 82 },
        { name: "ChannelReg 66", id: 83 },
        { name: "ChannelReg 67", id: 84 },
        { name: "ChannelReg 68", id: 85 },
        { name: "ChannelReg 69", id: 86 },
        { name: "ChannelReg 70", id: 87 },
        { name: "ChannelReg 71", id: 88 },
        { name: "ChannelReg 72", id: 89 },
        { name: "ChannelReg 73", id: 90 },
        { name: "ChannelReg 74", id: 91 },
        { name: "ChannelReg 75", id: 92 },
        { name: "ChannelReg 76", id: 93 },
        { name: "ChannelReg 77", id: 94 },
        { name: "ChannelReg 78", id: 95 },
        { name: "ChannelReg 79", id: 96 },
        { name: "ChannelReg 80", id: 97 },
        { name: "ChannelReg 81", id: 98 },
        { name: "ChannelReg 82", id: 99 },
        { name: "ChannelReg 83", id: 100 },
        { name: "ChannelReg 84", id: 101 },
        { name: "ChannelReg 85", id: 102 },
        { name: "ChannelReg 86", id: 103 },
        { name: "ChannelReg 87", id: 104 },
        { name: "ChannelReg 88", id: 105 },
        { name: "ChannelReg 89", id: 106 },
        { name: "ChannelReg 90", id: 107 },
        { name: "ChannelReg 91", id: 108 },
        { name: "ChannelReg 92", id: 109 },
        { name: "ChannelReg 93", id: 110 },
        { name: "ChannelReg 94", id: 111 },
        { name: "ChannelReg 95", id: 112 },
        { name: "ChannelReg 96", id: 113 },
        { name: "ChannelReg 97", id: 114 },
        { name: "ChannelReg 98", id: 115 },
        { name: "ChannelReg 99", id: 116 },
        { name: "ChannelReg 100", id: 117 },
        { name: "ChannelReg 101", id: 118 },
        { name: "ChannelReg 102", id: 119 },
        { name: "ChannelReg 103", id: 120 },
        { name: "ChannelReg 104", id: 121 },
        { name: "ChannelReg 105", id: 122 },
        { name: "ChannelReg 106", id: 123 },
        { name: "ChannelReg 107", id: 124 },
        { name: "ChannelReg 108", id: 125 },
        { name: "ChannelReg 109", id: 126 },
        { name: "ChannelReg 110", id: 127 },
        { name: "ChannelReg 111", id: 128 },
        { name: "ChannelReg 112", id: 129 },
        { name: "ChannelReg 113", id: 130 },
        { name: "ChannelReg 114", id: 131 },
        { name: "ChannelReg 115", id: 132 },
        { name: "ChannelReg 116", id: 133 },
        { name: "ChannelReg 117", id: 134 },
        { name: "ChannelReg 118", id: 135 },
        { name: "ChannelReg 119", id: 136 },
        { name: "ChannelReg 120", id: 137 },
        { name: "ChannelReg 121", id: 138 },
        { name: "ChannelReg 122", id: 139 },
        { name: "ChannelReg 123", id: 140 },
        { name: "ChannelReg 124", id: 141 },
        { name: "ChannelReg 125", id: 142 },
        { name: "ChannelReg 126", id: 143 },
        { name: "ChannelReg 127", id: 144 }
    ];

    $scope.vfat2ID = 0;

    $scope.vfat2Register = { id: 0 };

    $scope.vfat2Data = 0;

    $scope.readResult = null;

    $scope.vfat2sMask = "000000";

    $scope.vfat2sRegister = { id: 0 };

    $scope.vfat2sData = 0;

    $scope.readsResult = [];


    $scope.read = function() {
        $scope.readResult = null;
        socket.ipbus_read(vfat2_reg(OHID, $scope.vfat2ID, $scope.vfat2Register.id), function(data) { $scope.readResult = data & 0xff; });
    };

    $scope.write = function() {
        $scope.readResult = null;
        socket.ipbus_write(vfat2_reg(OHID, $scope.vfat2ID, $scope.vfat2Register.id), $scope.vfat2Data, function(data) { Notification.primary('The write transaction has been completed'); });
    };

    function getResults(nReads) {
      socket.ipbus_read(oh_ei2c_reg(OHID, 259), function(data) {
        if (data == 0) {
          socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), nReads, function(data) {
              for (var i = 0; i < data.length; ++i) $scope.readsResult.push({ vfat2: (data[i] >> 8) & 0xFF, data: data[i] & 0xFF });
          });
        }
        else getResults(nReads);
      });
    }

    $scope.reads = function() {
        $scope.readsResult = [];
        var mask = parseInt($scope.vfat2sMask, 16);
        var nReads = 24 - popcount(mask);
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), mask);
        socket.ipbus_read(oh_ei2c_reg(OHID, $scope.vfat2sRegister.id));
        getResults(nReads);
    };

    $scope.writes = function() {
        $scope.readsResult = [];
        var mask = parseInt($scope.vfat2sMask, 16);
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), mask);
        socket.ipbus_write(oh_ei2c_reg(OHID, $scope.vfat2sRegister.id), $scope.vfat2sData, function() { Notification.primary('The write transaction has been broadcasted'); });
    };

    $scope.reset_module = function() {
        $scope.vfat2sMask = "000000";
        $scope.readsResult = [];
        $scope.writesResult = null;
        socket.ipbus_write(oh_ei2c_reg(OHID, 258), 1, function() { Notification.primary('The module has been reset'); });
    };

}]);
