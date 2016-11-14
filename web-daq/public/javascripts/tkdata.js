app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {    
    
    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.enableReadout = false;

    var mapping0_1 = [ 127, 124, 126, 123, 125, 122, 0, 121, 1, 120, 2, 119, 3, 118, 4, 117, 5, 116, 6, 115, 103, 114, 104, 113, 105, 112, 106, 111, 107, 110, 108, 109, 82, 81, 83, 80, 84, 79, 85, 78, 86, 77, 87, 76, 88, 75, 57, 74, 58, 73, 59, 72, 60, 71, 61, 70, 62, 69, 65, 68, 63, 67, 64, 66, 16, 15, 17, 14, 18, 13, 19, 12, 20, 11, 21, 10, 22, 9, 23, 8, 24, 7, 25, 102, 26, 101, 27, 100, 28, 99, 29, 98, 30, 97, 31, 96, 32, 95, 33, 94, 34, 93, 35, 92, 36, 91, 37, 90, 38, 89, 39, 56, 40, 55, 41, 54, 42, 53, 43, 52, 44, 51, 45, 50, 46, 49, 47, 48 ];
    var mapping2_15 = [ 127, 124, 126, 123, 125, 122, 0, 121, 1, 120, 2, 119, 3, 118, 4, 117, 5, 116, 6, 115, 103, 114, 104, 113, 105, 112, 106, 111, 107, 110, 108, 109, 82, 81, 83, 80, 84, 79, 85, 78, 86, 77, 87, 76, 88, 75, 57, 74, 58, 73, 59, 72, 60, 71, 61, 70, 62, 69, 65, 68, 63, 67, 64, 66, 16, 15, 17, 14, 18, 13, 19, 12, 20, 11, 21, 10, 22, 9, 23, 8, 24, 7, 25, 102, 26, 101, 27, 100, 28, 99, 29, 98, 30, 97, 31, 96, 32, 95, 33, 94, 34, 93, 35, 92, 36, 91, 37, 90, 38, 89, 39, 56, 40, 55, 41, 54, 42, 53, 43, 52, 44, 51, 45, 50, 46, 49, 47, 48 ];
    var mapping16_17 = [ 63, 60, 62, 59, 61, 58, 64, 57, 65, 56, 66, 55, 67, 54, 68, 53, 69, 52, 70, 51, 39, 50, 40, 49, 41, 48, 42, 47, 43, 46, 44, 45, 18, 17, 19, 16, 20, 15, 21, 14, 22, 13, 23, 12, 24, 11, 121, 10, 122, 9, 123, 8, 124, 7, 125, 6, 126, 5, 1, 4, 127, 3, 0, 2, 80, 79, 81, 78, 82, 77, 83, 76, 84, 75, 85, 74, 86, 73, 87, 72, 88, 71, 89, 38, 90, 37, 91, 36, 92, 35, 93, 34, 94, 33, 95, 32, 96, 31, 97, 30, 98, 29, 99, 28, 100, 27, 101, 26, 102, 25, 103, 120, 104, 119, 105, 118, 106, 117, 107, 116, 108, 115, 109, 114, 110, 113, 111, 112 ];
    var mapping18_23 = [ 0, 3, 1, 4, 2, 5, 127, 6, 126, 7, 125, 8, 124, 9, 123, 10, 122, 11, 121, 12, 24, 13, 23, 14, 22, 15, 21, 16, 20, 17, 19, 18, 45, 46, 44, 47, 43, 48, 42, 49, 41, 50, 40, 51, 39, 52, 70, 53, 69, 54, 68, 55, 67, 56, 66, 57, 65, 58, 62, 59, 64, 60, 63, 61, 111, 112, 110, 113, 109, 114, 108, 115, 107, 116, 106, 117, 105, 118, 104, 119, 103, 120, 102, 25, 101, 26, 100, 27, 99, 28, 98, 29, 97, 30, 96, 31, 95, 32, 94, 33, 93, 34, 92, 35, 91, 36, 90, 37, 89, 38, 88, 71, 87, 72, 86, 73, 85, 74, 84, 75, 83, 76, 82, 77, 81, 78, 80, 79 ];

    var readOutBuffer = [];

    $scope.tkDataEvents = []; 

    $scope.nAcquired = 0; 

    $scope.tkEventsAvailable = 0;

    $scope.nSent = 0;

    $scope.nReceived = 0;

    var plotDataBC = [ ['Bunch Counter'] ];
    var plotDataEC = [ ['Event Counter'] ];
    var plotDataFlags = [ ['Flags'] ];
    var plotDataChipID = [ ['ChipID'] ];
    var plotDataStrips = [ ['Strips'] ];

    $scope.toggle_readout = function() {
        $scope.enableReadout = !$scope.enableReadout;
    };

    $scope.reset_module = function() {
        $scope.tkDataEvents = []; 
        $scope.nAcquired = 0;
        plotDataBC = [ [ 'Bunch Counter' ] ];
        plotDataEC = [ ['Event Counter'] ];
        plotDataFlags = [ ['Flags'] ];
        plotDataChipID = [ ['ChipID'] ];
        plotDataStrips = [ ['Strips'] ];
        plot_graphs();
        socket.ipbus_write(tkdata_reg(OHID), 0);
        socket.ipbus_write(oh_counter_reg(OHID, 106), 0);
        socket.ipbus_write(glib_counter_reg(18 + OHID), 0, function() { Notification.primary('The buffers have been emptied'); });
    };

    function plot_graph(id, title, data) {
        var chartData = google.visualization.arrayToDataTable(data);

        var options = {
            title: title,
            hAxis: { title: title },
            height: 300,
            legend: { position: 'none' },
            histogram: { bucketSize: 1 }
        };  

        var chart = new google.visualization.Histogram(document.getElementById(id));
        chart.draw(chartData, options);        
    }

    function plot_graphs() {
        plot_graph("bc_chart", "Bunch Counter", plotDataBC);
        plot_graph("ec_chart", "Event Counter", plotDataEC);
        plot_graph("flags_chart", "Flags", plotDataFlags);
        plot_graph("chipid_chart", "Chip ID", plotDataChipID);
        plot_graph("strips_chart", "Beam Profile", plotDataStrips);
        setTimeout(plot_graphs, 5000);
    }

    plot_graphs();

    function form_vfat2_event() {     
        packet0 = readOutBuffer.shift();            
        if (((packet0 >> 28) & 0xf) != 0xA) return;
        packet1 = readOutBuffer.shift();    
        packet2 = readOutBuffer.shift(); 
        packet3 = readOutBuffer.shift(); 
        packet4 = readOutBuffer.shift(); 
        packet5 = readOutBuffer.shift(); 
        packet6 = readOutBuffer.shift(); 

        var bc = (0x0fff0000 & packet0) >> 16;
        var ec = (0x00000ff0 & packet0) >> 4;
        var flags = packet0 & 0xf;
        var chipID = (0x0fff0000 & packet1) >> 16;
        var strips0 = ((0x0000ffff & packet1) << 16) | ((0xffff0000 & packet2) >> 16);
        var strips1 = ((0x0000ffff & packet2) << 16) | ((0xffff0000 & packet3) >> 16);
        var strips2 = ((0x0000ffff & packet3) << 16) | ((0xffff0000 & packet4) >> 16);
        var strips3 = ((0x0000ffff & packet4) << 16) | ((0xffff0000 & packet5) >> 16);
        var crc = 0x0000ffff & packet5;

        if ($scope.tkDataEvents.length >= 20) $scope.tkDataEvents.shift();

        $scope.tkDataEvents.push({
            bx: packet6,
            bc: bc,
            ec: ec,
            flags: flags,
            chipID: chipID,
            strips0: strips0,
            strips1: strips1,
            strips2: strips2,
            strips3: strips3,
            crc: crc
        });   
                               
        // Add to graphs
        plotDataBC.push([ bc ]);
        plotDataEC.push([ ec ]);
        plotDataFlags.push([ flags ]);
        plotDataChipID.push([ chipID ]);

        for (var i = 0; i < 32; ++i) {
            if (((strips0 >> i) & 0x1) == 1) plotDataStrips.push([ mapping2_15[127 - i] ]);
            if (((strips1 >> i) & 0x1) == 1) plotDataStrips.push([ mapping2_15[127 - (i + 32)] ]);
            if (((strips2 >> i) & 0x1) == 1) plotDataStrips.push([ mapping2_15[127 - (i + 64)] ]);
            if (((strips3 >> i) & 0x1) == 1) plotDataStrips.push([ mapping2_15[127 - (i + 96)] ]);
        }

        if (plotDataBC.length > 500) {
            plotDataBC.splice(1, 100);
            plotDataEC.splice(1, 100);
            plotDataFlags.splice(1, 100);
            plotDataChipID.splice(1, 100);
        }

        ++$scope.nAcquired;
    }

    function get_vfat2_event() {
        socket.ipbus_read(tkdata_reg(OHID, 1), function(data) {            
            socket.ipbus_fifoRead(tkdata_reg(OHID, 0), (data > 100 ? 100 : data), function(data) { readOutBuffer = readOutBuffer.concat(data); });
        });
    }

    function get_status_loop() {
        if ($scope.enableReadout && readOutBuffer.length <= 700) get_vfat2_event();
        if (readOutBuffer.length >= 7) form_vfat2_event();
        socket.ipbus_blockRead(tkdata_reg(OHID, 1), 3, function(data) { 
            $scope.tkEventsAvailable = Math.floor(data[0] / 7.);
            $scope.tkFifoFull = (data[1] == 1);
            $scope.tkFifoEmpty = (data[2] == 1); 
        });
        socket.ipbus_read(oh_counter_reg(OHID, 106), function(data) { $scope.nSent = data; });
        socket.ipbus_read(glib_counter_reg(18 + OHID), function(data) { $scope.nReceived = data; });
        setTimeout(get_status_loop, 100);
    }

    get_status_loop();

}]);