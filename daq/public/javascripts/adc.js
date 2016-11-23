var appVue = new Vue({
  el: 'section.content',
  data: {
    register: 0,
    writeData: 0,
    result: null,
    temperatureChart: null,
    voltageChart: null,
  },
  methods: {
    init: function() {
      this.drawTemperature();
      this.drawVoltage();
      this.get();
    },
    get: function() {
      ipbus_blockRead(oh_adc_reg(0), 3, function(data) {
        appVue.temperatureChart.data.labels.push(new Date());
        appVue.voltageChart.data.labels.push(new Date());
        appVue.temperatureChart.data.datasets[0].data.push(Math.round(((data[0] >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100.);
        appVue.voltageChart.data.datasets[0].data.push(Math.round((data[1] >> 6) / 1024. * 3. * 100.) / 100.);
        appVue.voltageChart.data.datasets[1].data.push(Math.round((data[2] >> 6) / 1024. * 3. * 100.) / 100.);
      });
      ipbus_blockRead(oh_adc_reg(32), 7, function(data) {
        appVue.temperatureChart.data.datasets[1].data.push(Math.round(((data[0] >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100.);
        appVue.temperatureChart.data.datasets[2].data.push(Math.round(((data[4] >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100.);
        appVue.voltageChart.data.datasets[2].data.push(Math.round((data[1] >> 6) / 1024. * 3. * 100.) / 100.);
        appVue.voltageChart.data.datasets[3].data.push(Math.round((data[2] >> 6) / 1024. * 3. * 100.) / 100.);
        appVue.voltageChart.data.datasets[4].data.push(Math.round((data[5] >> 6) / 1024. * 3. * 100.) / 100.);
        appVue.voltageChart.data.datasets[5].data.push(Math.round((data[6] >> 6) / 1024. * 3. * 100.) / 100.);
      });
      appVue.temperatureChart.update();
      appVue.voltageChart.update();
    },
    read: function() {
      ipbus_read(oh_adc_reg(this.register), function(data) {
        // Temperature
        if (appVue.register == 0 || appVue.register == 32 || appVue.register == 36) appVue.result = Math.round(((data >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100. +  " °C";
        // Vccint, Vccaux
        else if (appVue.register == 1 || appVue.register == 2 || appVue.register == 33 || appVue.register == 34 || appVue.register == 37 || appVue.register == 38) appVue.result = Math.round((data >> 6) / 1024. * 3. * 100.) / 100. +  " V";
        // Control
        else if (appVue.register >= 64) appVue.result = data & 0xffff;
        // Other
        else appVue.result = Math.round((data >> 6) / 1024. * 100. * 100.) / 100. + " mV";
      });
    },
    write: function() {
      ipbus_write(oh_adc_reg(this.register), this.writeData);
      this.writeData = 0;
      this.result = null;
    },
    drawTemperature: function() {
      var width = $('#temperature').parent().width() - 40;
      var height = 0.3 * width;
      var canvas = $('#temperature').attr('width', width).attr('height', height);
      this.temperatureChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [ ],
          datasets: [
            { label: 'Monitoring', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'Maximum', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'Minimum', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 }
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
    },
    drawVoltage: function() {
      var width = $('#voltage').parent().width() - 40;
      var height = 0.3 * width;
      var canvas = $('#voltage').attr('width', width).attr('height', height);
      this.voltageChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [ ],
          datasets: [
            { label: 'VCC_INT Monitoring', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_AUX Monitoring', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_INT Maximum', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_AUX Maximum', data: [ ], borderColor: colors[3], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_INT Minimum', data: [ ], borderColor: colors[4], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_AUX Minimum', data: [ ], borderColor: colors[5], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 }
          ]
        },
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              displayFormats: 'mm:ss'
            }],
            yAxes: [{
              ticks: {
                min: 0.,
                max: 3.
              },
              scaleLabel: {
                display: true,
                labelString: 'Voltage [V]'
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
