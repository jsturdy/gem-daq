var appVue = new Vue({
  el: 'section.content',
  data: {
    systems: [
      { name: 'GLIB', version: '', date: '' },
      { name: 'OptoHybrid', version: '', date: '' }
    ],
    t1: false,
    scan: {
      running: false,
      type: false,
      ready: false,
      error: false
    },
    ultra: {
      running: false,
      type: false,
      ready: false,
      error: false
    },
    sent: 0,
    received: 0,
    available: 0,
    vfat2s: [ ],
    temperatureChart: null,
    voltageChart: null,
  },
  methods: {
    init: function() {
      for (var i = 0; i < 24; ++i) {
        this.vfat2s.push({
          id: i,
          isPresent: false,
          isOn: false,
          good: 0,
          bad: 0
        });
      }
      this.drawTemperature();
      this.get();
    },
    get: function() {
      ipbus_read(0x00000002, function(data) {
        var version = ((data >> 28) & 0xf) + "." + ((data >> 24) & 0xf) + "." + ((data >> 16) & 0xff);
        var date = (2000 + ((data >> 9) & 0x7f)) + "." + ((data >> 5) & 0xf) + "." + (data & 0x1f);
        appVue.systems[0].version = version;
        appVue.systems[0].date = date;
      });
      ipbus_read(oh_stat_reg(3), function(data) {
        var version = ((data >> 24) & 0xff).toString(16) + "." + ((data >> 16) & 0xff).toString(16) + "." + ((data >> 8) & 0xff).toString(16) + "." + (data & 0xff).toString(16);
        appVue.systems[1].version = version;
      });
      ipbus_read(oh_stat_reg(0), function(data) {
        var year = ((data >> 16) & 0xffff).toString(16);
        var month = ((data >> 8) & 0xff).toString(16);
        var day = (data & 0xff).toString(16);
        var date = year + "." + month + "." + day
        appVue.systems[1].date = date;
      });
      ipbus_blockRead(tkdata_reg(1), 3, function(data) {
        appVue.available = Math.floor(data[0] / 7.);
      });
      ipbus_read(oh_counter_reg(106), function(data) {
        appVue.sent = data;
      });
      ipbus_read(glib_counter_reg(18 + asideVue.optohybrid), function(data) {
        appVue.received = data;
      });
      ipbus_readI2C(0, 0, function(data) {
        for (var i = 0; i < data.length; ++i) {
          appVue.vfat2s[i].isPresent = ((data[i] >> 16) == 0x3 ? false : true);
          appVue.vfat2s[i].isOn = (((data[i] & 0xF000000) >> 24) == 0x5 || (data[i] & 0x1) == 0 ? false : true);
        }
      });
      ipbus_blockRead(oh_counter_reg(36), 48, function(data) {
        for (var i = 0; i < 24; ++i) {
          appVue.vfat2s[i].good = data[i] >>> 0;
          appVue.vfat2s[i].bad = data[24 + i] >>> 0;
        }
      });
      ipbus_read(oh_t1_reg(14), function(data) {
        appVue.t1 = ((data & 0xf) == 0 ? false : true);
      });
      ipbus_read(oh_scan_reg(9), function(data) {
        appVue.scan.running = ((data & 0xf) != 0);
        appVue.scan.type = (data & 0xf);
        appVue.scan.error = (((data >> 4) & 0x1) == 1);
        appVue.scan.ready = (((data >> 5) & 0x1) == 1);
      });
      ipbus_read(oh_ultra_reg(32), function(data) {
        appVue.ultra.running = ((data & 0xf) != 0);
        appVue.ultra.type = (data & 0xf);
        appVue.ultra.error = (((data >> 4) & 0x1) == 1);
        appVue.ultra.ready = (((data >> 5) & 0x1) == 1);
      });
      ipbus_read(oh_adc_reg(0), function(data) {
        appVue.temperatureChart.data.labels.push(new Date());
        appVue.temperatureChart.data.datasets[0].data.push(Math.round(((data >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100.);
      });
      ipbus_blockRead(oh_adc_reg(32), 7, function(data) {
        appVue.temperatureChart.data.datasets[1].data.push(Math.round(((data[0] >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100.);
        appVue.temperatureChart.data.datasets[2].data.push(Math.round(((data[4] >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100.);
        if (appVue.temperatureChart.data.labels.length > 40) {
          appVue.temperatureChart.data.labels.shift();
          appVue.temperatureChart.data.datasets[0].data.shift();
          appVue.temperatureChart.data.datasets[1].data.shift();
          appVue.temperatureChart.data.datasets[2].data.shift();
        }
        appVue.temperatureChart.update();
      });
    },
    drawTemperature: function() {
      var width = $('#temperature').parent().width() - 40;
      var height = Math.max(250, 0.3 * width);
      var canvas = $('#temperature').attr('width', width).attr('height', height);
      this.temperatureChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [ ],
          datasets: [
            { label: 'Mon', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'Max', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'Min', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 }
          ]
        },
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              displayFormats: 'mm:ss'
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Temperature [°C]'
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
