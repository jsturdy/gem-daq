var appVue = new Vue({
  el: 'section.content',
  data: {
    clkSourceOptions: [
      { name: "QPLL", id: 0 },
      { name: "GBT", id: 1 }
    ],
    clkSourceSelected: 0,
    t1SourceOptions: [
      { name: "AMC13 over GTX", id: 0 },
      { name: "OptoHybrid (Internal)", id: 1 },
      { name: "External", id: 2 },
      { name: "Loopback", id: 3 },
      { name: "All", id: 4 },
      { name: "AMC13 over GBT", id: 5 },
      { name: "AMC13 over GTX or GBT", id: 6 },
      { name: "OptoHybrid or External", id: 7 }
    ],
    t1SourceSelected: 0,
    loopbackSource: 0,
    triggerThrottling: 0,
    sbitModeOptions: [
      { name: "Single VFAT2", id: 0 },
      { name: "iEta row", id: 1 },
      { name: "iPhi sector", id: 2 },
      { name: "Nothing (constant 0s)", id: 3 }
    ],
    sbitModeSelected: 0,
    sbitSelect: [ 0, 0, 0, 0, 0, 0 ],
    trackingMask: '000000',
    triggerMask: '000000',
    zeroSuppress: false,
    crcSuppress: false,
    statRegs: [
      { name: 'Firmware', data0: 0, data1: 0 },
      { name: 'QPLL', data0: 0, data1: 0 },
      { name: 'QPLL PLL', data0: 0, data1: 0 }
    ],
    wbCounters: [
      { name: 'GBT master', stb: 0, ack: 0 },
      { name: 'GTX master', stb: 0, ack: 0 },
      { name: 'Extended I2C master', stb: 0, ack: 0 },
      { name: 'Scan module master', stb: 0, ack: 0 },
      { name: 'DAC module master', stb: 0, ack: 0 },
      { name: 'I2C 0 slave', stb: 0, ack: 0 },
      { name: 'I2C 1 slave', stb: 0, ack: 0 },
      { name: 'I2C 2 slave', stb: 0, ack: 0 },
      { name: 'I2C 3 slave', stb: 0, ack: 0 },
      { name: 'I2C 4 slave', stb: 0, ack: 0 },
      { name: 'I2C 5 slave', stb: 0, ack: 0 },
      { name: 'Extended I2C slave', stb: 0, ack: 0 },
      { name: 'Scan module slave', stb: 0, ack: 0 },
      { name: 'T1 controller slave', stb: 0, ack: 0 },
      { name: 'DAC scan slave', stb: 0, ack: 0 },
      { name: 'ADC module slave', stb: 0, ack: 0 },
      { name: 'Clocking module slave', stb: 0, ack: 0 },
      { name: 'Counter module slave', stb: 0, ack: 0 },
      { name: 'System module slave', stb: 0, ack: 0 }
    ],
    t1Counters: [
      { name: 'AMC13 GBT LV1A', cnt: 0 },
      { name: 'AMC13 GBT Calpulse', cnt: 0 },
      { name: 'AMC13 GBT Resync', cnt: 0 },
      { name: 'AMC13 GBT BC0', cnt: 0 },
      { name: 'AMC13 GTX LV1A', cnt: 0 },
      { name: 'AMC13 GTX Calpulse', cnt: 0 },
      { name: 'AMC13 GTX Resync', cnt: 0 },
      { name: 'AMC13 GTX BC0', cnt: 0 },
      { name: 'OptoHybrid LV1A', cnt: 0 },
      { name: 'OptoHybrid Calpulse', cnt: 0 },
      { name: 'OptoHybrid Resync', cnt: 0 },
      { name: 'OptoHybrid BC0', cnt: 0 },
      { name: 'External LV1A', cnt: 0 },
      { name: 'External Calpulse', cnt: 0 },
      { name: 'External Resync', cnt: 0 },
      { name: 'External BC0', cnt: 0 },
      { name: 'Loopback LV1A', cnt: 0 },
      { name: 'Loopback Calpulse', cnt: 0 },
      { name: 'Loopback Resync', cnt: 0 },
      { name: 'Loopback BC0', cnt: 0 },
      { name: 'Sent LV1A', cnt: 0 },
      { name: 'Sent Calpulse', cnt: 0 },
      { name: 'Sent Resync', cnt: 0 },
      { name: 'Sent BC0', cnt: 0 }
    ],
    linkCounters: [
      { name: 'Tracking data link', cnt: 0 },
      { name: 'Trigger data link', cnt: 0 },
      { name: 'GBT data link', cnt: 0 }
    ]
  },
  methods: {
    init: function() {
      this.system();
      this.get();
    },
    system: function() {
      ipbus_blockRead(oh_system_reg(0), 11, function(data) {
        const mask = data[0].toString(16).toUpperCase();
        appVue.trackingMask = (mask.length == 6 ? mask : Array(6 - mask.length + 1).join('0') + mask);
        appVue.t1SourceSelected = data[1];
        appVue.loopbackSource = data[2];
        const mask2 = data[4].toString(16).toUpperCase();
        appVue.triggerMask = (mask2.length == 6 ? mask2 : Array(6 - mask2.length + 1).join('0') + mask2);
        appVue.sbitSelect[0] = data[5] & 0x1F;
        appVue.sbitSelect[1] = (data[5] >> 5) & 0x1F;
        appVue.sbitSelect[2] = (data[5] >> 10) & 0x1F;
        appVue.sbitSelect[3] = (data[5] >> 15) & 0x1F;
        appVue.sbitSelect[4] = (data[5] >> 20) & 0x1F;
        appVue.sbitSelect[5] = (data[5] >> 25) & 0x1F;
        appVue.triggerThrottling = data[6];
        appVue.zeroSuppress = (data[7] == 1 ? true : false);
        appVue.sbitModeSelected = data[8];
        appVue.clkSourceSelected = data[9]
        appVue.crcSuppress = (data[10] == 1 ? true : false);
      });
    },
    apply: function() {
      ipbus_blockWrite(oh_system_reg(0), [
        parseInt(appVue.trackingMask, 16),
        appVue.t1SourceSelected,
        appVue.loopbackSource
      ]);
      ipbus_blockWrite(oh_system_reg(4), [
        parseInt(appVue.triggerMask, 16),
        ((appVue.sbitSelect[5] & 0x1F) << 25) |
          ((appVue.sbitSelect[4] & 0x1F) << 20) |
          ((appVue.sbitSelect[3] & 0x1F) << 15) |
          ((appVue.sbitSelect[2] & 0x1F) << 10) |
          ((appVue.sbitSelect[1] & 0x1F) << 5) |
          (appVue.sbitSelect[0] & 0x1F),
          appVue.triggerThrottling,
          (appVue.zeroSuppress == true ? 1 : 0),
          appVue.sbitModeSelected,
          appVue.clkSourceSelected,
          (appVue.crcSuppress == true ? 1 : 0)
        ]);
      $.notify('The parameters have been applied');
      this.system();
    },
    get: function() {
      ipbus_blockRead(oh_stat_reg(0), 4, function(data) {
        const year = ((data[0] >> 16) & 0xffff).toString(16);
        const month = ((data[0] >> 8) & 0xff).toString(16);
        const day = (data[0] & 0xff).toString(16);
        const date = year + "." + month + "." + day
        appVue.statRegs[0].data1 = date;
        const version = ((data[3] >> 24) & 0xff).toString(16) + "." + ((data[3] >> 16) & 0xff).toString(16) + "." + ((data[3] >> 8) & 0xff).toString(16) + "." + (data[3] & 0xff).toString(16);
        appVue.statRegs[0].data0 = version;
        appVue.statRegs[1].data0 = data[1];
        appVue.statRegs[2].data0 = data[2];
      });
      ipbus_blockRead(oh_counter_reg(0), 36, function(data) {
        appVue.wbCounters[1].stb = data[0] >>> 0;
        appVue.wbCounters[2].stb = data[1] >>> 0;
        appVue.wbCounters[3].stb = data[2] >>> 0;
        appVue.wbCounters[4].stb = data[3] >>> 0;
        appVue.wbCounters[1].ack = data[4] >>> 0;
        appVue.wbCounters[2].ack = data[5] >>> 0;
        appVue.wbCounters[3].ack = data[6] >>> 0;
        appVue.wbCounters[4].ack = data[7] >>> 0;
        appVue.wbCounters[5].stb = data[8] >>> 0;
        appVue.wbCounters[6].stb = data[9] >>> 0;
        appVue.wbCounters[7].stb = data[10] >>> 0;
        appVue.wbCounters[8].stb = data[11] >>> 0;
        appVue.wbCounters[9].stb = data[12] >>> 0;
        appVue.wbCounters[10].stb = data[13] >>> 0;
        appVue.wbCounters[11].stb = data[14] >>> 0;
        appVue.wbCounters[12].stb = data[15] >>> 0;
        appVue.wbCounters[13].stb = data[16] >>> 0;
        appVue.wbCounters[14].stb = data[17] >>> 0;
        appVue.wbCounters[15].stb = data[18] >>> 0;
        appVue.wbCounters[16].stb = data[19] >>> 0;
        appVue.wbCounters[17].stb = data[20] + 1 >>> 0;
        appVue.wbCounters[18].stb = data[21] >>> 0;
        appVue.wbCounters[5].ack = data[22] >>> 0;
        appVue.wbCounters[6].ack = data[23] >>> 0;
        appVue.wbCounters[7].ack = data[24] >>> 0;
        appVue.wbCounters[8].ack = data[25] >>> 0;
        appVue.wbCounters[9].ack = data[26] >>> 0;
        appVue.wbCounters[10].ack = data[27] >>> 0;
        appVue.wbCounters[11].ack = data[28] >>> 0;
        appVue.wbCounters[12].ack = data[29] >>> 0;
        appVue.wbCounters[13].ack = data[30] >>> 0;
        appVue.wbCounters[14].ack = data[31] >>> 0;
        appVue.wbCounters[15].ack = data[32] >>> 0;
        appVue.wbCounters[16].ack = data[33] >>> 0;
        appVue.wbCounters[17].ack = data[34] >>> 0;
        appVue.wbCounters[18].ack = data[35] >>> 0;
      });
      ipbus_blockRead(oh_counter_reg(84), 22, function(data) {
        appVue.t1Counters[4].cnt = data[0] >>> 0;
        appVue.t1Counters[5].cnt = data[1] >>> 0;
        appVue.t1Counters[6].cnt = data[2] >>> 0;
        appVue.t1Counters[7].cnt = data[3] >>> 0;
        appVue.t1Counters[8].cnt = data[4] >>> 0;
        appVue.t1Counters[9].cnt = data[5] >>> 0;
        appVue.t1Counters[10].cnt = data[6] >>> 0;
        appVue.t1Counters[11].cnt = data[7] >>> 0;
        appVue.t1Counters[12].cnt = data[8] >>> 0;
        appVue.t1Counters[13].cnt = data[9] >>> 0;
        appVue.t1Counters[14].cnt = data[10] >>> 0;
        appVue.t1Counters[15].cnt = data[11] >>> 0;
        appVue.t1Counters[16].cnt = data[12] >>> 0;
        appVue.t1Counters[17].cnt = data[13] >>> 0;
        appVue.t1Counters[18].cnt = data[14] >>> 0;
        appVue.t1Counters[19].cnt = data[15] >>> 0;
        appVue.t1Counters[20].cnt = data[16] >>> 0;
        appVue.t1Counters[21].cnt = data[17] >>> 0;
        appVue.t1Counters[22].cnt = data[18] >>> 0;
        appVue.t1Counters[23].cnt = data[19] >>> 0;
        appVue.linkCounters[0].cnt = data[20] >>> 0;
        appVue.linkCounters[1].cnt = data[21] >>> 0;
      });
      ipbus_blockRead(oh_counter_reg(107), 9, function(data) {
        appVue.statRegs[1].data1 = data[0] >>> 0;
        appVue.statRegs[2].data1 = data[1] >>> 0;
        appVue.wbCounters[0].stb = data[2] >>> 0;
        appVue.wbCounters[0].ack = data[3] >>> 0;
        appVue.t1Counters[0].cnt = data[4] >>> 0;
        appVue.t1Counters[1].cnt = data[5] >>> 0;
        appVue.t1Counters[2].cnt = data[6] >>> 0;
        appVue.t1Counters[3].cnt = data[7] >>> 0;
        appVue.linkCounters[2].cnt = data[8] >>> 0;
      });
    },
    resetStatCounters: function() {
      ipbus_blockWrite(oh_counter_reg(107), [0, 0]);
      $.notify('The counters have been reset');
      this.get();
    },
    resetWishboneCounters: function() {
      ipbus_blockWrite(oh_counter_reg(0), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      ipbus_blockWrite(oh_counter_reg(109), [0, 0]);
      $.notify('The counters have been reset');
      this.get();
    },
    resetT1Counters: function() {
      ipbus_blockWrite(oh_counter_reg(84), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      ipbus_blockWrite(oh_counter_reg(111), [0, 0, 0, 0]);
      $.notify('The counters have been reset');
      this.get();
    },
    resetLinkCounters: function() {
      ipbus_blockWrite(oh_counter_reg(104), [0, 0]);
      ipbus_blockWrite(oh_counter_reg(112), 0);
      $.notify('The counters have been reset');
      this.get();
    }
  }
});

appVue.init();
setInterval(function() { appVue.get() }, 5000);
