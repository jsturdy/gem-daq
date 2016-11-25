var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    error: false,
    ready: false,
    type: 0,
    vfat2: 0,
    channel: 0,
    min: 0,
    max: 0,
    step: 0,
    events: 0,
    seen: 0,
    progress: 0,
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
      ipbus_read(oh_counter_reg(100), function(data) {
        appVue.seen = data;
      });
      this.drawChart();
      this.get();
    },
    get: function() {
      ipbus_read(oh_scan_reg(9), function(data) {
        appVue.running = ((data & 0xf) != 0);
        appVue.error = (((data >> 4) & 0x1) != 0);
        appVue.ready = (((data >> 5) & 0x1) != 0);
        if (!appVue.running && appVue.ready) appVue.read();
      });
      ipbus_read(oh_counter_reg(100), function(data) {
        if (appVue.running)  appVue.progress = (data - appVue.seen) / ((appVue.max - appVue.min + 1) * appVue.events) * 100;
        else appVue.progress = 0;
      });
    },
    launch: function() {
      if (this.running) return;
      if (this.max == 0) this.max = 255;
      if (this.step == 0) this.step = 1;
      if (this.events == 0) this.events = 0xFFFFFF;
      ipbus_blockWrite(oh_scan_reg(1), [ this.type, this.vfat2, this.channel, this.min, this.max, this.step, this.events ]);
      ipbus_write(oh_scan_reg(0), 1);
      ipbus_read(oh_counter_reg(100), function(data) {
        appVue.seen = data;
      });
      this.get();
    },
    reset: function() {
      ipbus_write(oh_scan_reg(10), 1);
      this.get();
    },
    read: function() {
      this.ready = false;
      this.update();
    },
    update: function() {
      this.chart.data.labels = [ ];
      this.chart.data.datasets[0].data = [ ];
      ipbus_fifoRead(oh_scan_reg(8), (this.max - this.min - 1), function(data) {
        for (var j = 0; j < data.length; ++j) {
          appVue.chart.data.labels.push((data[j] >> 24) & 0xFF);
          appVue.chart.data.datasets[0].data.push((data[j] & 0x00FFFFFF) / (1. * appVue.events) * 100);
        }
      });
      ipbus_fifoRead(oh_scan_reg(8), 2, function(data) {
        for (var j = 0; j < data.length; ++j) {
          appVue.chart.data.labels.push((data[j] >> 24) & 0xFF);
          appVue.chart.data.datasets[0].data.push((data[j] & 0x00FFFFFF) / (1. * appVue.events) * 100);
        }
        appVue.chart.update();
      });
    },
    drawChart: function() {
      var width = $('#results').parent().width() - 40;
      var height = Math.max(200, 0.3 * width);
      var canvas = $('#results').attr('width', width).attr('height', height);
      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [ ],
          datasets: [{ label: 'VFAT2', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 }]
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
setInterval(function() { appVue.get() }, 1000);
