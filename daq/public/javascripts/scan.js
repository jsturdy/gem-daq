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
        if (!appVue.running && appVue.ready) {
          appVue.read();
        }
      });
      ipbus_read(oh_counter_reg(100), function(data) {
        appVue.progress = (appVue.running ? 0 : ((data - appVue.seen) / ((appVue.max - appVue.min + 1) * appVue.events) * 100));
      });
    },
    launch: function() {
      if (this.running) {
        return;
      }
      this.max = (this.max == 0 ? 255 : this.max);
      this.min = (this.min == 0 ? 0 : this.min);
      this.step = (this.step == 0 ? 1 : this.step);
      this.events = (this.events == 0 ? 1000 : this.events);
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
      let n = Math.ceil((this.max - this.min + 1) / this.step);
      while (n > 0) {
        ipbus_fifoRead(oh_scan_reg(8), (n > 100 ? 100 : n), function(data) {
          if (data.length === undefined) {
            data = [ data ];
          }
          for (let j = 0; j < data.length; ++j) {
            appVue.chart.data.labels.push((data[j] >> 24) & 0xFF);
            appVue.chart.data.datasets[0].data.push((data[j] & 0x00FFFFFF) / (1. * appVue.events) * 100);
          }
          appVue.chart.update();
        });
        n -= 100;
      }
    },
    drawChart: function() {
      const width = $('#results').parent().width() - 40;
      const height = Math.max(200, 0.3 * width);
      const canvas = $('#results').attr('width', width).attr('height', height);
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
