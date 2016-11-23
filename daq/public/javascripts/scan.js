var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    type: 0,
    vfat2: 0,
    channel: 0,
    min: 0,
    max: 0,
    step: 0,
    events: 0,
    status: 0,
    chart: null
  },
  methods: {
    init: function() {
      ipbus_blockRead(oh_scan_reg(1), 7, function(data) {
        appVue.type = data[0];
        appVue.vfat2 = data[1];
        appVue.channel = data[2];
        appVue.min = data[3];
        appVue.max = data[4];
        appVue.step = data[5];
        appVue.events = data[6];
      });
      this.drawChart();
      this.get();
    },
    get: function() {
      ipbus_read(oh_scan_reg(9), function(data) {
        appVue.running = (data != 0);
        if (appVue.status == 0 && !appVue.running) appVue.status = 0;
        else if (appVue.status == 0 && appVue.running) appVue.status = 1;
        else if (appVue.status == 1 && appVue.running) appVue.status = 1;
        else if (appVue.status == 1 && !appVue.running) appVue.status = 2;
        else if (appVue.status == 2 && appVue.running) appVue.status = 1;
        else if (appVue.status == 2 && !appVue.running) appVue.status = 2;
        else appVue.status = 0;
        if (appVue.status == 2) appVue.read();
      });
    },
    launch: function() {
      if (this.running) return;
      ipbus_blockWrite(oh_scan_reg(1), [ appVue.type, appVue.vfat2, appVue.channel, appVue.min, appVue.max, appVue.step, appVue.events ]);
      ipbus_write(oh_scan_reg(0), 1);
      this.get();
    },
    reset: function() {
      ipbus_write(oh_scan_reg(10), 1);
      this.get();
    },
    read: function() {
      if (this.status != 2) return;
      this.status = 0;
      this.chart.data.labels = [ ];
      this.chart.data.datasets = [ ];
      this.update();
    },
    update: function() {
      ipbus_fifoRead(oh_scan_reg(8), (this.max - this.min + 1), function(data) {
        var x = [ ];
        var y = [ ];
        for (var j = 0; j < data.length; ++j) {
          x.push((data[j] >> 24) & 0xFF);
          y.push((data[j] & 0x00FFFFFF) / (1. * appVue.events) * 100);
        }
        appVue.chart.data.labels = x;
        appVue.chart.data.datasets.push({
          label: 'VFAT2 #' + appVue.vfat2,
          data: y,
          borderColor: colors[appVue.vfat2 % 6],
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2
        });
        appVue.chart.update();
      });
    },
    drawChart: function() {
      var width = $('#results').parent().width() - 40;
      var height = 0.3 * width;
      var canvas = $('#results').attr('width', width).attr('height', height);
      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [ ],
          datasets: [ ]
        },
        options: {
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'VFAT2 register value'
              }
            }],
            yAxes: [{
              ticks: {
                min: 0,
                max: 100
              },
              scaleLabel: {
                display: true,
                labelString: 'Hit ration [%]'
              }
            }]
          }
        }
      });
    }
  }
});

appVue.init();
setInterval(function() { appVue.get() }, 5000);
