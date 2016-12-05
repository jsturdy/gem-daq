var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    error: false,
    ready: false,
    masked: 0,
    type: 0,
    mask: '000000',
    channel: 0,
    min: 0,
    max: 0,
    step: 0,
    events: 0,
    seen: 0,
    progress: 0,
    chart: null,
  },
  methods: {
    init: function() {
      ipbus_blockRead(oh_ultra_reg(1), 7, function(data) {
        appVue.type = data[0];
        var mask = data[1].toString(16).toUpperCase();
        if (mask.length == 6) appVue.mask = mask;
        else appVue.mask = Array(6 - mask.length + 1).join('0') + mask;
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
      ipbus_read(oh_ultra_reg(32), function(data) {
        appVue.running = ((data & 0xf) != 0);
        appVue.error = (((data >> 4) & 0x1) != 0);
        appVue.ready = (((data >> 5) & 0x1) != 0);
        appVue.masked = ((data >> 8) & 0xffffff);
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
      ipbus_blockWrite(oh_ultra_reg(1), [ this.type, parseInt(this.mask, 16), this.channel, this.min, this.max, this.step, this.events ]);
      ipbus_write(oh_ultra_reg(0), 1);
      ipbus_read(oh_counter_reg(100), function(data) {
        appVue.seen = data;
      });
      this.get();
    },
    reset: function() {
      ipbus_write(oh_ultra_reg(33), 1);
      this.get();
    },
    read: function() {
      this.ready = false;
      var first = true;
      this.chart.data.labels = [ ];
      for (var i = 0; i < 24; ++i) {
        this.chart.data.datasets[i].data = [ ];
        if (((this.masked >> i) & 0x1) == 1) continue;
        this.update(i, first);
        first = false;
      }
    },
    update: function(i, labels) {
      ipbus_fifoRead(oh_ultra_reg(8 + i), (this.max - this.min - 1), function(data) {
        for (var j = 0; j < data.length; ++j) {
          if (labels) appVue.chart.data.labels.push((data[j] >> 24) & 0xFF);
          appVue.chart.data.datasets[i].data.push((data[j] & 0x00FFFFFF) / (1. * appVue.events) * 100);
        }
      });
      ipbus_fifoRead(oh_ultra_reg(8 + i), 2, function(data) {
        for (var j = 0; j < data.length; ++j) {
          if (labels) appVue.chart.data.labels.push((data[j] >> 24) & 0xFF);
          appVue.chart.data.datasets[i].data.push((data[j] & 0x00FFFFFF) / (1. * appVue.events) * 100);
        }
        appVue.chart.update();
      });
    },
    drawChart: function() {
      var width = $('#results').parent().width() - 40;
      var height = Math.max(300, 0.3 * width);
      var canvas = $('#results').attr('width', width).attr('height', height);
      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [ ],
          datasets: [
            { label: '0', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '1', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '2', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '3', data: [ ], borderColor: colors[3], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '4', data: [ ], borderColor: colors[4], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '5', data: [ ], borderColor: colors[5], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '6', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '7', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '8', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '9', data: [ ], borderColor: colors[3], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '10', data: [ ], borderColor: colors[4], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '11', data: [ ], borderColor: colors[5], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '12', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '13', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '14', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '15', data: [ ], borderColor: colors[3], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '16', data: [ ], borderColor: colors[4], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '17', data: [ ], borderColor: colors[5], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '18', data: [ ], borderColor: colors[0], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '19', data: [ ], borderColor: colors[1], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '20', data: [ ], borderColor: colors[2], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '21', data: [ ], borderColor: colors[3], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '22', data: [ ], borderColor: colors[4], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
            { label: '23', data: [ ], borderColor: colors[5], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 },
          ]
        },
        options: {
          legend: {
            labels: {
              boxWidth: 10
            }
          },
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
