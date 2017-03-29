var asideVue = new Vue({
  el: 'aside.main-sidebar',
  data: {
    optohybrid: OptoHybrid,
    ipbusBlock: IpbusBlock
  },
  methods: {
    change: function() {
      socket.emit('change', [ this.optohybrid, this.ipbusBlock ]);
      appVue.get();
    }
  }
});

var fills = [ 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)' ];
var colors = [ 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)' ];

function ipbus_read(addr, clientCallback) {
  if (asideVue.ipbusBlock) return;
  socket.emit('ipbus', {
    type: 0,
    size: 1,
    addr: addr
  }, function(response) {
    if (clientCallback) clientCallback(response.data);
  });
}

function ipbus_blockRead(addr, size, clientCallback) {
  if (asideVue.ipbusBlock) return;
  socket.emit('ipbus', {
    type: 0,
    size: size,
    addr: addr
  }, function(response) {
    if (clientCallback) clientCallback(response.data);
  });
}

function ipbus_fifoRead(addr, size, clientCallback) {
  if (asideVue.ipbusBlock) return;
  socket.emit('ipbus', {
    type: 2,
    size: size,
    addr: addr
  }, function(response) {
    if (clientCallback) clientCallback(response.data);
  });
}

function ipbus_write(addr, data, clientCallback) {
  if (asideVue.ipbusBlock) return;
  socket.emit('ipbus', {
    type: 1,
    size: 1,
    addr: addr,
    data: [ data ]
  }, function(response) {
    if (clientCallback) clientCallback(true);
  });
}

function ipbus_blockWrite(addr, data, clientCallback) {
  if (asideVue.ipbusBlock) return;
  socket.emit('ipbus', {
    type: 1,
    size: data.length,
    addr: addr,
    data: data
  }, function(response) {
    if (clientCallback) clientCallback(true);
  });
}

function ipbus_fifoWrite(addr, data, clientCallback) {
  if (asideVue.ipbusBlock) return;
  socket.emit('ipbus', {
    type: 3,
    size: data.length,
    addr: addr,
    data: data
  }, function(response) {
    if (clientCallback) clientCallback(true);
  });
}

function tkdata_init() {
  socket.emit('tkdata_init');
}

function tkdata_stop() {
  socket.emit('tkdata_stop');
}

function tkdata_write(data) {
  socket.emit('tkdata_write', data);
}

function vfat2_reg(vfat2, reg) { return 0x40000000 + ((asideVue.optohybrid & 0xf) << 20) + ((vfat2 & 0xff) << 8) + (reg & 0xff); }

function oh_ei2c_reg(reg) { return 0x41000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xfff); }

function oh_scan_reg(reg) { return 0x42000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xff); }

function oh_t1_reg(reg) { return 0x43000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xff); }

function oh_counter_reg(reg) { return 0x4A000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xff); }

function oh_system_reg(reg) { return 0x4B000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xff); }

function oh_stat_reg(reg) { return 0x4C000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xff); }

function oh_adc_reg(reg) { return 0x48000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xff); }

function oh_ultra_reg(reg) { return 0x4D000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xff); }

function tkdata_reg(reg) { return 0x50000000 + ((asideVue.optohybrid & 0xf) << 20) + (reg & 0xf); }

function glib_counter_reg(reg) { return 0x60000000 + (reg & 0xff); }

function popcount(n) {
    n >>>= 0;
    for (var popcnt = 0; n; n &= n - 1) ++popcnt;
    return popcnt;
}

$.notifyDefaults({
	type: 'success',
	allow_dismiss: true,
  newest_on_top: true,
  delay: 1000,
});
