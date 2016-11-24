app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    var charts = [ ];

    for (var i = 0; i < 24; ++i) charts.push(new google.visualization.LineChart(document.getElementById('chart'+i)));

    $scope.types = [
        { name: "Threshold scan", id: 0 },
        { name: "Threshold scan by channel", id: 1 },
        { name: "Latency scan", id: 2 },
        { name: "S-Curve scan", id: 3 },
        { name: "Threshold scan using tracking data", id: 4 }
    ];

    $scope.scanStatus = 0;

    $scope.type = $scope.types[0];

    $scope.mask = "000000";

    $scope.channel = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 0xFFFFFF;

    function get_current_values() {
        socket.ipbus_blockRead(oh_ultra_reg(OHID, 1), 7, function(data) {
            $scope.type = $scope.types[data[0]];
            var mask2 = data[1].toString(16).toUpperCase();
            if (mask2.length == 6) $scope.mask = mask2;
            else $scope.mask = Array(6 - mask2.length + 1).join('0') + mask2;
            $scope.channel = data[2];
            $scope.minVal = data[3];
            $scope.maxVal = data[4];
            $scope.steps = data[5];
            $scope.nEvents = data[6];
        });
    }

    get_current_values();

    $scope.start_scan = function() {
        socket.ipbus_blockWrite(oh_ultra_reg(OHID, 1), [ $scope.type.id, parseInt($scope.mask, 16), $scope.channel, $scope.minVal, $scope.maxVal, $scope.steps, $scope.nEvents ]);
        socket.ipbus_write(oh_ultra_reg(OHID, 0), 1);
        $scope.scanStatus = 1;
        check_results();
    };

    $scope.read_scan = function() {
      var mask = parseInt($scope.mask, 16);
      for (var i = 0; i < 24; ++i) {
        if (((mask >> i) & 0x1) == 0) plot_results(i);
      }
    };

    function check_results() {
        socket.ipbus_read(oh_ultra_reg(OHID, 32), function(data) {
            $scope.scanStatus = ((data & 0xf) == 0 ? 2 : 1);
            if ($scope.scanStatus == 2) {
                var mask = parseInt($scope.mask, 16);
                for (var i = 0; i < 24; ++i) {
                  if (((mask >> i) & 0x1) == 0) plot_results(i);
                }
            }
            else setTimeout(check_results, 500);
        });
    };

    $scope.reset_scan = function() {
        socket.ipbus_write(oh_ultra_reg(OHID, 33), 1, function() { Notification.primary('The module has been reset'); });
        get_current_values();
    };

    function plot_results(vfat2) {
        var nSamples = $scope.maxVal - $scope.minVal + 1;

        var chartData = new google.visualization.DataTable();
        chartData.addColumn('number', 'X');
        chartData.addColumn('number', 'Percentage');

        if ($scope.type.id == 0) var title = 'Threshold scan of VFAT2 #' + vfat2;
        else if ($scope.type.id == 1) var title = 'Threshold scan by channel of VFAT2 #' + vfat2;
        else if ($scope.type.id == 2) var title = 'Latency scan of VFAT2 #' + vfat2;
        else if ($scope.type.id == 3) var title = 'S-Curve scan of VFAT2 #' + vfat2;
        else if ($scope.type.id == 4) var title = 'Threshold scan (TK data) of VFAT2 #' + vfat2;

        var options = {
            title: title,
            hAxis: {
                title: 'Register value (VFAT2 units)'
            },
            vAxis: {
                title: 'Hit percentage'
            },
            height: 300,
            legend: {
                position: 'none'
            }
        };

        socket.ipbus_fifoRead(oh_ultra_reg(OHID, 8 + vfat2), nSamples, function(data) {
            for (var i = 0; i < data.length; ++i) chartData.addRow([ (data[i] >> 24) & 0xFF, (data[i] & 0x00FFFFFF) / (1. * $scope.nEvents) * 100 ]);
            charts[vfat2].draw(chartData, options);
        });
    };

}]);
