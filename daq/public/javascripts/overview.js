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
    vfat2s: [ ]
  },
  methods: {
    init: function() {
      for (var i = 0; i < 24; ++i) {
        this.vfat2s.push({
          id: i,
          isPresent: false,
          isOn: false
        });
      }
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
      ipbus_write(oh_ei2c_reg(256), 0);
      ipbus_read(oh_ei2c_reg(8));
      ipbus_fifoRead(oh_ei2c_reg(257), 24, function(data) {
        for (var i = 0; i < data.length; ++i) appVue.vfat2s[i].isPresent = ((data[i] >> 16) == 0x3 ? false : true);
      });
      ipbus_read(oh_ei2c_reg(0));
      ipbus_fifoRead(oh_ei2c_reg(257), 24, function(data) {
        for (var i = 0; i < data.length; ++i) appVue.vfat2s[i].isOn = (((data[i] & 0xF000000) >> 24) == 0x5 || (data[i] & 0x1) == 0 ? false : true);
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
    }
  }
});

appVue.init();
setInterval(function() { appVue.get() }, 5000);
