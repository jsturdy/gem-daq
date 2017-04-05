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
        if (appVue.temperatureChart.data.labels.length > 40) {
          appVue.temperatureChart.data.labels.shift();
          appVue.voltageChart.data.labels.shift();
          appVue.temperatureChart.data.datasets[0].data.shift();
          appVue.temperatureChart.data.datasets[1].data.shift();
          appVue.temperatureChart.data.datasets[2].data.shift();
          appVue.voltageChart.data.datasets[0].data.shift();
          appVue.voltageChart.data.datasets[1].data.shift();
          appVue.voltageChart.data.datasets[2].data.shift();
          appVue.voltageChart.data.datasets[3].data.shift();
          appVue.voltageChart.data.datasets[4].data.shift();
          appVue.voltageChart.data.datasets[5].data.shift();
        }
        appVue.temperatureChart.update();
        appVue.voltageChart.update();
      });
    },
    read: function() {
      ipbus_read(oh_adc_reg(this.register), function(data) {
        // Temperature
        if (appVue.register == 0 || appVue.register == 32 || appVue.register == 36) {
          appVue.result = Math.round(((data >> 6) * 503.975 / 1024. - 273.15) * 100.) / 100. +  " °C";
        }
        // Vccint, Vccaux
        else if (appVue.register == 1 || appVue.register == 2 || appVue.register == 33 || appVue.register == 34 || appVue.register == 37 || appVue.register == 38) {
          appVue.result = Math.round((data >> 6) / 1024. * 3. * 100.) / 100. +  " V";
        }
        // Control
        else if (appVue.register >= 64) {
          appVue.result = data & 0xffff;
        }
        // Other
        else {
          appVue.result = Math.round((data >> 6) / 1024. * 100. * 100.) / 100. + " mV";
        }
      });
    },
    write: function() {
      ipbus_write(oh_adc_reg(this.register), this.writeData);
      this.writeData = 0;
      this.result = null;
    },
    drawTemperature: function() {
      const width = $('#temperature').parent().width() - 40;
      const height = Math.max(250, 0.3 * width);
      const canvas = $('#temperature').attr('width', width).attr('height', height);
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
    },
    drawVoltage: function() {
      const width = $('#voltage').parent().width() - 40;
      const height = Math.max(300, 0.3 * width);
      const canvas = $('#voltage').attr('width', width).attr('height', height);
      this.voltageChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [ ],
          datasets: [
            { label: 'VCC_INT Mon', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_AUX Mon', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_INT Max', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_AUX Max', data: [ ], borderColor: colors[3], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_INT Min', data: [ ], borderColor: colors[4], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: 'VCC_AUX Min', data: [ ], borderColor: colors[5], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 }
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
setInterval(function() { appVue.get() }, 1000);
