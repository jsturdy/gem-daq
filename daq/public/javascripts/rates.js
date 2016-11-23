app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.vfat2s = [ ];

    var timestamp = 0;
    var vfat2s = [ ];

    for (var i = 0; i < 24; ++i) {
      $scope.vfat2s.push({
          id: i,
          trigger: 0,
          good: 0,
          bad: 0
      });
      vfat2s.push({
        trigger: 0,
        good: 0,
        bad: 0
      });
    }

    function get_vfat2_status() {
        socket.ipbus_blockRead(oh_counter_reg(OHID, 0), 142, function(data) {
            data[117] = timestamp + 500000;
            for (var i = 0; i < 24; ++i) {
                $scope.vfat2s[i].trigger = (data[118 + i] - vfat2s[i].trigger) * (data[117] - timestamp) / 40000000 * 1000.;
                $scope.vfat2s[i].good = (data[36 + i] - vfat2s[i].good) * (data[117] - timestamp) / 40000000 * 1000.;
                $scope.vfat2s[i].bad = (data[60 + i] - vfat2s[i].bad) * (data[117] - timestamp) / 40000000 * 1000.;
                vfat2s[i].trigger = data[118 + i];
                vfat2s[i].good = data[36 + i];
                vfat2s[i].bad = data[60 + i];
            }
            timestamp = data[117];
        });
    }

    function get_status_loop() {
        get_vfat2_status();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

}]);
