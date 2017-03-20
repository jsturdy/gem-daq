var appVue = new Vue({
  el: 'section.content',
  data: {
    network: [ "00:00:00:00:00:00", "192.168.0.161" ],
    statRegs: [
      { name: 'SFP1 mod abs', data: 0 },
      { name: 'SFP1 RX loss', data: 0 },
      { name: 'SFP1 TX fault', data: 0 },
      { name: 'SFP2 mod abs', data: 0 },
      { name: 'SFP2 RX loss', data: 0 },
      { name: 'SFP2 TX fault', data: 0 },
      { name: 'SFP3 mod abs', data: 0 },
      { name: 'SFP3 RX loss', data: 0 },
      { name: 'SFP4 TX fault', data: 0 },
      { name: 'SFP4 mod abs', data: 0 },
      { name: 'SFP4 RX loss', data: 0 },
      { name: 'SFP4 TX fault', data: 0 },
      { name: 'GBE int', data: 0 },
      { name: 'FMC1 present', data: 0 },
      { name: 'FMC2 present', data: 0 },
      { name: 'FPGA reset', data: 0 },
      { name: 'CDCE locked', data: 0 },
      { name: 'SFP phase monitoring done', data: 0 },
      { name: 'SFP phase monitoring OK', data: 0 },
      { name: 'FMC1 phase monitoring done', data: 0 },
      { name: 'FMC1 phase monitoring OK', data: 0 }
    ],
    ipbusCounters: [
      { name: 'OptoHybrid forward 0', stb: 0, ack: 0 },
      { name: 'Tracking data readout 0', stb: 0, ack: 0 },
      { name: 'OptoHybrid forward 1', stb: 0, ack: 0 },
      { name: 'Tracking data readout 1', stb: 0, ack: 0 },
      { name: 'Counters', stb: 0, ack: 0 }
    ],
    t1Counters: [
      { name: 'AMC13 LV1A', cnt: 0 },
      { name: 'AMC13 Calpulse', cnt: 0 },
      { name: 'AMC13 Resync', cnt: 0 },
      { name: 'AMC13 BC0', cnt: 0 }
    ],
    gtxCounters: [
      { name: 'Data link 0', cnt: 0 },
      { name: 'Data link 1', cnt: 0 },
      { name: 'Data link 2', cnt: 0 },
      { name: 'Data link 3', cnt: 0 }
    ]
  },
  methods: {
    init: function() {
      this.get();
    },
    get: function() {
      ipbus_blockRead(0x0000001c, 3, function(data) {
        appVue.network[0] = (("0" + ((data[0] & 0xff00) >> 8).toString(16)).slice(-2) + ":" +
                            ("0" + (data[0] & 0xff).toString(16)).slice(-2) + ":" +
                            ("0" + ((data[1] & 0xff000000) >> 24).toString(16)).slice(-2) + ":" +
                            ("0" + ((data[1] & 0xff0000) >> 16).toString(16)).slice(-2) + ":" +
                            ("0" + ((data[1] & 0xff00) >> 8).toString(16)).slice(-2) + ":" +
                            ("0" + (data[1] & 0xff).toString(16)).slice(-2)).toUpperCase();
        appVue.network[1] = ((data[2] >> 24) & 0xff).toString() + "." +
                            ((data[2] >> 16) & 0xff).toString() + "." +
                            ((data[2] >> 8) & 0xff).toString() + "." +
                            (data[2] & 0xff).toString();
      });
      ipbus_read(0x00000006, function(data) {
        appVue.statRegs[0].data = (data & 0x1);
        appVue.statRegs[1].data = (data & 0x2) >> 1;
        appVue.statRegs[2].data = (data & 0x4) >> 2;
        appVue.statRegs[3].data = (data & 0x10) >> 4;
        appVue.statRegs[4].data = (data & 0x20) >> 5;
        appVue.statRegs[5].data = (data & 0x40) >> 6;
        appVue.statRegs[6].data = (data & 0x100) >> 8;
        appVue.statRegs[7].data = (data & 0x200) >> 9;
        appVue.statRegs[8].data = (data & 0x400) >> 10;
        appVue.statRegs[9].data = (data & 0x1000) >> 12;
        appVue.statRegs[10].data = (data & 0x2000) >> 13;
        appVue.statRegs[11].data = (data & 0x4000) >> 14;
        appVue.statRegs[12].data = (data & 0x10000) >> 16;
        appVue.statRegs[13].data = (data & 0x20000) >> 17;
        appVue.statRegs[14].data = (data & 0x40000) >> 18;
        appVue.statRegs[15].data = (data & 0x80000) >> 22;
        appVue.statRegs[16].data = (data & 0x8000000) >> 27;
        appVue.statRegs[17].data = (data & 0x10000000) >> 28;
        appVue.statRegs[18].data = (data & 0x20000000) >> 29;
        appVue.statRegs[19].data = (data & 0x40000000) >> 30;
        appVue.statRegs[20].data = (data & 0x80000000) >> 31;
      });
      ipbus_blockRead(glib_counter_reg(0), 18, function(data) {
        appVue.ipbusCounters[0].stb = data[0] >>> 0;
        appVue.ipbusCounters[1].stb = data[2] >>> 0;
        appVue.ipbusCounters[2].stb = data[1] >>> 0;
        appVue.ipbusCounters[3].stb = data[3] >>> 0;
        appVue.ipbusCounters[4].stb = data[4] >>> 0;
        appVue.ipbusCounters[0].ack = data[5] >>> 0;
        appVue.ipbusCounters[1].ack = data[7] >>> 0;
        appVue.ipbusCounters[2].ack = data[6] >>> 0;
        appVue.ipbusCounters[3].ack = data[8] >>> 0;
        appVue.ipbusCounters[4].ack = data[9] >>> 0;
        appVue.t1Counters[0].cnt = data[10] >>> 0;
        appVue.t1Counters[1].cnt = data[11] >>> 0;
        appVue.t1Counters[2].cnt = data[12] >>> 0;
        appVue.t1Counters[3].cnt = data[13] >>> 0;
        appVue.gtxCounters[0].cnt = data[14] >>> 0;
        appVue.gtxCounters[1].cnt = data[16] >>> 0;
        appVue.gtxCounters[2].cnt = data[15] >>> 0;
        appVue.gtxCounters[3].cnt = data[17] >>> 0;
      });
    },
    resetIpbusCounters: function() {
      ipbus_blockWrite(glib_counter_reg(0), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      $.notify('The counters have been reset');
      this.get();
    },
    resetT1Counters: function() {
      ipbus_blockWrite(glib_counter_reg(10), [0, 0, 0, 0]);
      $.notify('The counters have been reset');
      this.get();
    },
    resetGTXCounters: function() {
      ipbus_blockWrite(glib_counter_reg(14), [0, 0, 0, 0]);
      $.notify('The counters have been reset');
      this.get();
    }
  }
});

appVue.init();
setInterval(function() { appVue.get() }, 5000);
