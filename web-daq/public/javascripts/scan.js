app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    var chart = new google.visualization.LineChart(document.getElementById('chart'));
    google.visualization.events.addListener(chart, 'select', selectHandler);

    var saveData = [];

    $scope.types = [
        { name: "Threshold scan", id: 0 },
        { name: "Threshold scan by channel", id: 1 },
        { name: "Latency scan", id: 2 },
        { name: "S-Curve scan", id: 3 },
        { name: "Threshold scan using tracking data", id: 4 }
    ];

    $scope.scanStatus = 0;

    $scope.type = $scope.types[0];

    $scope.vfat2 = 0;

    $scope.channel = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 0xFFFFFF;

    function get_current_values() {
        socket.ipbus_blockRead(oh_scan_reg(OHID, 1), 7, function(data) {
            $scope.type = $scope.types[data[0]];
            $scope.vfat2 = data[1];
            $scope.channel = data[2];
            $scope.minVal = data[3];
            $scope.maxVal = data[4];
            $scope.steps = data[5];
            $scope.nEvents = data[6];
        });
    }

    get_current_values();

    $scope.start_scan = function() {
        socket.ipbus_blockWrite(oh_scan_reg(OHID, 1), [ $scope.type.id, $scope.vfat2, $scope.channel, $scope.minVal, $scope.maxVal, $scope.steps, $scope.nEvents ]);
        socket.ipbus_write(oh_scan_reg(OHID, 0), 1);
        $scope.scanStatus = 1;
        check_results();
    };

    $scope.read_scan = function() {
      plot_results();
    };

    function check_results() {
        socket.ipbus_read(oh_scan_reg(OHID, 9), function(data) {
            $scope.scanStatus = ((data & 0xf) == 0 ? 2 : 1);
            if ($scope.scanStatus == 2) plot_results();
            else setTimeout(check_results, 500);
        });
    };

    $scope.reset_scan = function() {
        socket.ipbus_write(oh_scan_reg(OHID, 10), 1, function() { Notification.primary('The module has been reset'); });
        get_current_values();
    };

    function plot_results() {
        var nSamples = $scope.maxVal - $scope.minVal + 1;

        var chartData = new google.visualization.DataTable();
        chartData.addColumn('number', 'X');
        chartData.addColumn('number', 'Percentage');

        if ($scope.type.id == 0) var title = 'Threshold scan';
        else if ($scope.type.id == 1) var title = 'Threshold scan by channel';
        else if ($scope.type.id == 2) var title = 'Latency scan';
        else if ($scope.type.id == 3) var title = 'S-Curve scan';
        else if ($scope.type.id == 4) var title = 'Threshold scan (TK data)';

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

        socket.ipbus_fifoRead(oh_scan_reg(OHID, 8), nSamples, function(data) {
            saveData = data;
            for (var i = 0; i < data.length; ++i) chartData.addRow([ (data[i] >> 24) & 0xFF, (data[i] & 0x00FFFFFF) / (1. * $scope.nEvents) * 100 ]);
            chart.draw(chartData, options);
        });
    };

    function selectHandler() {
        if ($scope.type.id == 0 || $scope.type == 1) socket.ipbus_write(vfat2_reg(OHID, $scope.vfat2, 146), chart.getSelection()[0].row + $scope.minVal, function() { Notification.primary('The threshold\'s value has been updated'); });
        else if ($scope.type.id == 2) socket.ipbus_write(vfat2_reg(OHID, $scope.vfat2, 16), chart.getSelection()[0].row + $scope.minVal, function() { Notification.primary('The latency\'s value has been updated'); });
        else if ($scope.type.id == 3) socket.ipbus_write(vfat2_reg(OHID, $scope.vfat2, 145), chart.getSelection()[0].row + $scope.minVal, function() { Notification.primary('The calibration pulse\'s value has been updated'); });
    }

    $scope.save = function() {
        if ($scope.type.id == 0) var type = 'threshold';
        if ($scope.type.id == 1) var type = 'threshold_channel';
        else if ($scope.type.id == 2) var type = 'latency';
        else if ($scope.type.id == 3) var type = 'scurve';

        socket.save({
                type: type,
                data: saveData,
                oh: OHID,
                vfat2: $scope.vfat2,
                channel: $scope.channel,
                min: $scope.minVal,
                max: $scope.maxVal,
                step: $scope.steps,
                n: $scope.nEvents
            },
            function() { Notification.primary('The data has been saved to disk'); }
        );
    };

}]);
