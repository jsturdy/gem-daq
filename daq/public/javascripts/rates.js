var appVue = new Vue({
  el: 'section.content',
  data: {
    timestamp: 0,
    delta: 0,
    vfat2s: [ ],
    chartTrigger: null,
    chartTracking: null,
  },
  methods: {
    init: function() {
      for (var i = 0; i < 24; ++i) {
        this.vfat2s.push({
          id: i,
          trigger: 0,
          tracking: 0,
          good: 0,
          bad: 0,
          dTrigger: 0,
          dTracking: 0,
          dGood: 0,
          dBad: 0
        })
      }
      ipbus_blockRead(oh_counter_reg(0), 166, function(data) {
        appVue.timestamp = data[117] >>> 0;
        for (var i = 0; i < 24; ++i) {
          appVue.vfat2s[i].trigger = data[118 + i] >>> 0;
          appVue.vfat2s[i].tracking = data[142 + i] >>> 0;
          appVue.vfat2s[i].good = data[36 + i] >>> 0;
          appVue.vfat2s[i].bad = data[60 + i] >>> 0;
        }
      });
      this.chartTrigger = this.drawChart('#trigger', 'Rate [kHz]', 40000);
      this.chartTracking = this.drawChart('#tracking', 'Rate [Hz]', undefined);
    },
    get: function() {
      ipbus_blockRead(oh_counter_reg(0), 166, function(data) {
        // Time
        var timestamp = data[117] >>> 0;
        if (timestamp < appVue.timestamp) appVue.delta = (0xFFFFFFFF - appVue.timestamp + timestamp) >>> 0;
        else appVue.delta = (timestamp - appVue.timestamp) >>> 0;
        appVue.timestamp = timestamp;
        for (var i = 0; i < 24; ++i) {
          // Trigger
          var trigger = (data[118 + i] >>> 0);
          if (trigger < appVue.vfat2s[i].trigger) var rTrigger = ((0xFFFFFFFF - ((appVue.vfat2s[i].trigger + trigger) >>> 0)) / appVue.delta * 40000).toFixed(2);
          else var rTrigger = (((trigger - appVue.vfat2s[i].trigger) >>> 0) / appVue.delta * 40000).toFixed(2);
          appVue.vfat2s[i].trigger = trigger;
          appVue.vfat2s[i].dTrigger = rTrigger;
          appVue.chartTrigger.data.datasets[i].data.push(rTrigger);
          // Trigger
          var tracking = (data[142 + i] >>> 0);
          if (tracking < appVue.vfat2s[i].tracking) var rTracking = ((0xFFFFFFFF - ((appVue.vfat2s[i].tracking + tracking) >>> 0)) / appVue.delta * 40000000).toFixed(2);
          else var rTracking = (((tracking - appVue.vfat2s[i].tracking) >>> 0) / appVue.delta * 40000000).toFixed(2);
          appVue.vfat2s[i].tracking = tracking;
          appVue.vfat2s[i].dTracking = rTracking;
          appVue.chartTracking.data.datasets[i].data.push(rTracking);
          // Good TK
          var good = (data[36 + i] >>> 0);
          if (good < appVue.vfat2s[i].good) var rGood = (((0xFFFFFFFF - appVue.vfat2s[i].good + good) >>> 0) / appVue.delta * 40000000).toFixed(2);
          else var rGood = (((good - appVue.vfat2s[i].good) >>> 0) / appVue.delta * 40000000).toFixed(2);
          appVue.vfat2s[i].good = good;
          appVue.vfat2s[i].dGood = rGood;
          // Bad TK
          var bad = (data[60 + i] >>> 0);
          if (bad < appVue.vfat2s[i].bad) var rBad = (((0xFFFFFFFF - appVue.vfat2s[i].bad + bad) >>> 0) / appVue.delta * 40000000).toFixed(2);
          else var rBad = (((bad - appVue.vfat2s[i].bad) >>> 0) / appVue.delta * 40000000).toFixed(2);
          appVue.vfat2s[i].bad = bad;
          appVue.vfat2s[i].dBad = rBad;
        }
        if (appVue.chartTrigger.data.labels.length > 40) {
          appVue.chartTrigger.data.labels.shift();
          appVue.chartTracking.data.labels.shift();
          for (var i = 0; i < 24; ++i) {
            appVue.chartTrigger.data.datasets[i].data.shift();
            appVue.chartTracking.data.datasets[i].data.shift();
          }
        }
        appVue.chartTrigger.data.labels.push(new Date());
        appVue.chartTracking.data.labels.push(new Date());
        appVue.chartTrigger.update();
        appVue.chartTracking.update();
      });
    },
    drawChart: function(el, legend, max) {
      var width = $(el).parent().width() - 40;
      var height = Math.max(300, 0.3 * width);
      var canvas = $(el).attr('width', width).attr('height', height);
      return new Chart(canvas, {
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
            { label: '23', data: [ ], borderColor: colors[5], backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2 }
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
              type: 'time',
              displayFormats: 'mm:ss'
            }],
            yAxes: [{
              ticks: {
                min: 0,
                max: max
              },
              scaleLabel: {
                display: true,
                labelString: legend
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
