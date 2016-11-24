var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    acquired: 0,
    sent: 0,
    received: 0,
    available: 0,
    buffer: [ ],
    events: [ ],
    chartBC: null,
    chartEC: null,
    chartFlags: null,
    chartChipID: null,
    chartStrips: null
  },
  methods: {
    init: function() {
      this.chartBC = this.drawChart('#bc', 'Bunch Counter', 41, 0);
      this.chartEC = this.drawChart('#ec', 'Event Counter', 26, 1);
      this.chartFlags = this.drawChart('#flags', 'Flags', 16, 2);
      this.chartChipID = this.drawChart('#chipid', 'Chip ID', 41, 3);
      this.chartStrips = this.drawChart('#strips', 'Strips', 128, 4);
      this.get();
    },
    get: function() {
      ipbus_blockRead(tkdata_reg(1), 3, function(data) {
        appVue.available = Math.floor(data[0] / 7.);
      });
      ipbus_read(oh_counter_reg(106), function(data) {
        appVue.sent = data;
      });
      ipbus_read(glib_counter_reg(18 + asideVue.optohybrid), function(data) {
        appVue.received = data;
      });
      if (!this.running) return;
      if (this.buffer.length <= 100) this.getData();
      if (this.buffer.length >= 7) this.createEvent();
    },
    update: function() {
      this.chartBC.update();
      this.chartEC.update();
      this.chartFlags.update();
      this.chartChipID.update();
      this.chartStrips.update();
    },
    getData: function() {
      ipbus_read(tkdata_reg(1), function(data) {
        ipbus_fifoRead(tkdata_reg(0), (data > 100 ? 100 : data), function(data) {
          if (data.length == 1) appVue.buffer.push(d);
          else {
            data.forEach(function(d) {
              appVue.buffer.push(d);
            });
          }
        });
      });
    },
    createEvent: function() {
      var packet0 = this.buffer.shift();
      if (((packet0 >> 28) & 0xf) != 0xA) return;
      var packet1 = this.buffer.shift();
      var packet2 = this.buffer.shift();
      var packet3 = this.buffer.shift();
      var packet4 = this.buffer.shift();
      var packet5 = this.buffer.shift();
      var packet6 = this.buffer.shift();
      var bc = ((0x0fff0000 & packet0) >> 16) >>> 0;
      var ec = ((0x00000ff0 & packet0) >> 4) >>> 0;
      var flags = (packet0 & 0xf) >>> 0;
      var chipID = ((0x0fff0000 & packet1) >> 16) >>> 0;
      var strips0 = (((0x0000ffff & packet1) << 16) | ((0xffff0000 & packet2) >> 16)) >>> 0;
      var strips1 = (((0x0000ffff & packet2) << 16) | ((0xffff0000 & packet3) >> 16)) >>> 0;
      var strips2 = (((0x0000ffff & packet3) << 16) | ((0xffff0000 & packet4) >> 16)) >>> 0;
      var strips3 = (((0x0000ffff & packet4) << 16) | ((0xffff0000 & packet5) >> 16)) >>> 0;
      var crc = (0x0000ffff & packet5) >>> 0;
      if (this.events.length >= 20) this.events.shift();
      this.events.push({
        bx: packet6,
        bc: bc,
        ec: ec,
        flags: flags,
        chipID: chipID,
        strips0: strips0,
        strips1: strips1,
        strips2: strips2,
        strips3: strips3,
        crc: crc
      });
      appVue.chartBC.data.datasets[0].data[Math.round(bc / 100)]++;
      appVue.chartEC.data.datasets[0].data[Math.round(ec / 10)]++;
      appVue.chartFlags.data.datasets[0].data[flags]++;
      appVue.chartChipID.data.datasets[0].data[Math.round(chipID / 100)]++;
      for (var i = 0; i < 32; ++i) {
        if (((strips0 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[i]++;
        if (((strips1 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[i + 32]++;
        if (((strips2 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[i + 64]++;
        if (((strips3 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[i + 96]++;
      }
      this.acquired++;
    },
    start: function() {
      this.running = true;
    },
    stop: function() {
      this.running = false;
    },
    reset: function() {
      ipbus_write(tkdata_reg(asideVue.OptoHybrid), 0);
      ipbus_write(oh_counter_reg(106), 0);
      ipbus_write(glib_counter_reg(18 + asideVue.optohybrid), 0);
    },
    drawChart: function(el, title, n, c) {
      var width = $(el).parent().width() - 40;
      var height = Math.max(200, 0.3 * width);
      var canvas = $(el).attr('width', width).attr('height', height);
      var labels = new Array(n).map(function(d, i) { return i; });
      var empty = new Array(n).fill(0);
      return new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{ backgroundColor: fills[c], borderColor: colors[c], borderWidth: 1, data: empty }]
        },
        options: {
          title: {
            display: true,
            text: title
          },
          legend: {
            display: false
          }
        }
      });
    }
  }
});

appVue.init();
setInterval(function() { appVue.get() }, 100);
setInterval(function() { appVue.update() }, 5000);
