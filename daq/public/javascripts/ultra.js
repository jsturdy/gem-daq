var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    type: 0,
    mask: '000000',
    channel: 0,
    min: 0,
    max: 0,
    step: 0,
    events: 0,
    status: 0,
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
      this.drawChart();
      this.get();
    },
    get: function() {
      ipbus_read(oh_ultra_reg(32), function(data) {
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
      ipbus_blockWrite(oh_ultra_reg(1), [ appVue.type, parseInt(appVue.mask, 16), appVue.channel, appVue.min, appVue.max, appVue.step, appVue.events ]);
      ipbus_write(oh_ultra_reg(0), 1);
      this.get();
    },
    reset: function() {
      ipbus_write(oh_ultra_reg(33), 1);
      this.get();
    },
    read: function() {
      if (this.status != 2) return;
      this.status = 0;
      this.chart.data.labels = [ ];
      this.chart.data.datasets = [ ];
      var mask = parseInt(this.mask, 16);
      for (var i = 0; i < 24; ++i) {
        if (((mask >> i) & 0x1) == 1) continue;
        this.update(i);
      }
    },
    update: function(i) {
      ipbus_fifoRead(oh_ultra_reg(8 + i), (this.max - this.min + 1), function(data) {
        var x = [ ];
        var y = [ ];
        for (var j = 0; j < data.length; ++j) {
          x.push((data[j] >> 24) & 0xFF);
          y.push((data[j] & 0x00FFFFFF) / (1. * appVue.events) * 100);
        }
        appVue.chart.data.labels = x;
        appVue.chart.data.datasets.push({
          label: 'VFAT2 #' + i,
          data: y,
          borderColor: colors[i % 6],
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
