const mapping0_1 = [ 127, 124, 126, 123, 125, 122, 0, 121, 1, 120, 2, 119, 3, 118, 4, 117, 5, 116, 6, 115, 103, 114, 104, 113, 105, 112, 106, 111, 107, 110, 108, 109, 82, 81, 83, 80, 84, 79, 85, 78, 86, 77, 87, 76, 88, 75, 57, 74, 58, 73, 59, 72, 60, 71, 61, 70, 62, 69, 65, 68, 63, 67, 64, 66, 16, 15, 17, 14, 18, 13, 19, 12, 20, 11, 21, 10, 22, 9, 23, 8, 24, 7, 25, 102, 26, 101, 27, 100, 28, 99, 29, 98, 30, 97, 31, 96, 32, 95, 33, 94, 34, 93, 35, 92, 36, 91, 37, 90, 38, 89, 39, 56, 40, 55, 41, 54, 42, 53, 43, 52, 44, 51, 45, 50, 46, 49, 47, 48 ];
const mapping2_15 = [ 127, 124, 126, 123, 125, 122, 0, 121, 1, 120, 2, 119, 3, 118, 4, 117, 5, 116, 6, 115, 103, 114, 104, 113, 105, 112, 106, 111, 107, 110, 108, 109, 82, 81, 83, 80, 84, 79, 85, 78, 86, 77, 87, 76, 88, 75, 57, 74, 58, 73, 59, 72, 60, 71, 61, 70, 62, 69, 65, 68, 63, 67, 64, 66, 16, 15, 17, 14, 18, 13, 19, 12, 20, 11, 21, 10, 22, 9, 23, 8, 24, 7, 25, 102, 26, 101, 27, 100, 28, 99, 29, 98, 30, 97, 31, 96, 32, 95, 33, 94, 34, 93, 35, 92, 36, 91, 37, 90, 38, 89, 39, 56, 40, 55, 41, 54, 42, 53, 43, 52, 44, 51, 45, 50, 46, 49, 47, 48 ];
const mapping16_17 = [ 63, 60, 62, 59, 61, 58, 64, 57, 65, 56, 66, 55, 67, 54, 68, 53, 69, 52, 70, 51, 39, 50, 40, 49, 41, 48, 42, 47, 43, 46, 44, 45, 18, 17, 19, 16, 20, 15, 21, 14, 22, 13, 23, 12, 24, 11, 121, 10, 122, 9, 123, 8, 124, 7, 125, 6, 126, 5, 1, 4, 127, 3, 0, 2, 80, 79, 81, 78, 82, 77, 83, 76, 84, 75, 85, 74, 86, 73, 87, 72, 88, 71, 89, 38, 90, 37, 91, 36, 92, 35, 93, 34, 94, 33, 95, 32, 96, 31, 97, 30, 98, 29, 99, 28, 100, 27, 101, 26, 102, 25, 103, 120, 104, 119, 105, 118, 106, 117, 107, 116, 108, 115, 109, 114, 110, 113, 111, 112 ];
const mapping18_23 = [ 0, 3, 1, 4, 2, 5, 127, 6, 126, 7, 125, 8, 124, 9, 123, 10, 122, 11, 121, 12, 24, 13, 23, 14, 22, 15, 21, 16, 20, 17, 19, 18, 45, 46, 44, 47, 43, 48, 42, 49, 41, 50, 40, 51, 39, 52, 70, 53, 69, 54, 68, 55, 67, 56, 66, 57, 65, 58, 62, 59, 64, 60, 63, 61, 111, 112, 110, 113, 109, 114, 108, 115, 107, 116, 106, 117, 105, 118, 104, 119, 103, 120, 102, 25, 101, 26, 100, 27, 99, 28, 98, 29, 97, 30, 96, 31, 95, 32, 94, 33, 93, 34, 92, 35, 91, 36, 90, 37, 89, 38, 88, 71, 87, 72, 86, 73, 85, 74, 84, 75, 83, 76, 82, 77, 81, 78, 80, 79 ];

var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    saveToFile: false,
    acquired: 0,
    sent: 0,
    received: 0,
    available: 0,
    buffer: [ ],
    events: [ ],
    vfat2s: [ ],
    chartBC: null,
    chartEC: null,
    chartFlags: null,
    chartChipID: null,
    chartStrips: null
  },
  methods: {
    init: function() {
      for (let i = 0; i < 24; ++i) {
        this.vfat2s.push({
          id: i,
          isPresent: false,
          good: 0,
          bad: 0
        });
      }
      for (let i = 0; i < 24; ++i) {
        this.getVFAT2(i);
      }
      this.chartBC = this.drawChart('#bc', 'Bunch Counter', 41, 0);
      this.chartEC = this.drawChart('#ec', 'Event Counter', 26, 1);
      this.chartFlags = this.drawChart('#flags', 'Flags', 16, 2);
      this.chartChipID = this.drawChart('#chipid', 'Chip ID', 41, 3);
      this.chartStrips = this.drawChart('#strips', 'Strips', 128, 4);
      this.get();
      this.getSlow();
    },
    getVFAT2: function(i) {
      ipbus_read(vfat2_reg(i, 0), function(data) {
        appVue.vfat2s[i].isPresent = (((data >> 24) & 0x7) != 0x3 ? false : true);
      });
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
      if (!this.running) {
        return;
      }
      if (this.buffer.length <= 70) {
        this.getData();
      }
      if (this.buffer.length >= 7) {
        this.createEvent();
      }
    },
    getSlow: function() {
      ipbus_blockRead(oh_counter_reg(36), 48, function(data) {
        for (let i = 0; i < 24; ++i) {
          appVue.vfat2s[i].good = data[i] >>> 0;
          appVue.vfat2s[i].bad = data[24 + i] >>> 0;
        }
      });
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
        if (data >= 7) {
          ipbus_fifoRead(tkdata_reg(0), (data > 70 ? 70 : Math.floor(data / 7) * 7), function(data) {
            data.forEach(function(d) {
              appVue.buffer.push(d);
            });
          });
        }
      });
    },
    createEvent: function() {
      const packet0 = this.buffer.shift();
      if (((packet0 >> 28) & 0xf) != 0xA) return;
      if (((packet0 >> 12) & 0xf) != 0xC) return;
      const packet1 = this.buffer.shift();
      const packet2 = this.buffer.shift();
      const packet3 = this.buffer.shift();
      const packet4 = this.buffer.shift();
      const packet5 = this.buffer.shift();
      const packet6 = this.buffer.shift();
      const ohBC = ((0xfff00000 & packet6) >> 12) >>> 0;
      const ohEC = (0xfffff & packet6) >>> 0;
      const bc = ((0x0fff0000 & packet0) >> 16) >>> 0;
      const ec = ((0x00000ff0 & packet0) >> 4) >>> 0;
      const flags = (packet0 & 0xf) >>> 0;
      const chipID = ((0x0fff0000 & packet1) >> 16) >>> 0;
      const strips0 = (((0x0000ffff & packet1) << 16) | ((0xffff0000 & packet2) >> 16)) >>> 0;
      const strips1 = (((0x0000ffff & packet2) << 16) | ((0xffff0000 & packet3) >> 16)) >>> 0;
      const strips2 = (((0x0000ffff & packet3) << 16) | ((0xffff0000 & packet4) >> 16)) >>> 0;
      const strips3 = (((0x0000ffff & packet4) << 16) | ((0xffff0000 & packet5) >> 16)) >>> 0;
      const crc = (0x0000ffff & packet5) >>> 0;
      if (this.events.length >= 20) {
        this.events.shift();
      }
      //
      const data = {
        ohBC: ohBC,
        ohEC: ohEC,
        bc: bc,
        ec: ec,
        flags: flags,
        chipID: chipID,
        strips0: strips0,
        strips1: strips1,
        strips2: strips2,
        strips3: strips3,
        crc: crc
      };
      this.events.push(data);
      if (this.saveToFile) {
        tkdata_write([ packet0, packet1, packet2, packet3, packet4, packet5, packet6 ]);
      }
      //
      appVue.chartBC.data.datasets[0].data[Math.round(bc / 100)]++;
      appVue.chartEC.data.datasets[0].data[Math.round(ec / 10)]++;
      appVue.chartFlags.data.datasets[0].data[flags]++;
      appVue.chartChipID.data.datasets[0].data[Math.round(chipID / 100)]++;
      let mapping = mapping0_1;
      for (let i = 0; i < 32; ++i) {
        if (((strips0 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[mapping[i]]++;
        if (((strips1 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[mapping[i + 32]]++;
        if (((strips2 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[mapping[i + 64]]++;
        if (((strips3 >> i) & 0x1) == 1) appVue.chartStrips.data.datasets[0].data[mapping[i + 96]]++;
      }
      this.acquired++;
    },
    start: function() {
      this.running = true;
      this.buffer = [ ];
      if (this.saveToFile) {
        tkdata_init();
      }
    },
    stop: function() {
      this.running = false;
      this.buffer = [ ];
      if (this.saveToFile) {
        tkdata_stop();
      }
    },
    empty: function() {
      ipbus_write(tkdata_reg(asideVue.OptoHybrid), 0);
      ipbus_write(oh_counter_reg(106), 0);
      ipbus_write(glib_counter_reg(18 + asideVue.optohybrid), 0);
    },
    reset: function() {
      ipbus_blockWrite(oh_counter_reg(36), [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
      this.getSlow();
    },
    drawChart: function(el, title, n, c) {
      const width = $(el).parent().width() - 40;
      const height = Math.max(200, 0.3 * width);
      const canvas = $(el).attr('width', width).attr('height', height);
      const labels = new Array(n).map(function(d, i) { return i; });
      const empty = new Array(n).fill(0);
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
setInterval(function() { appVue.getSlow() }, 1000);
setInterval(function() { appVue.update() }, 5000);
