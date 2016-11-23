var asideVue = new Vue({
  el: 'aside.main-sidebar',
  data: {
    optohybrid: OptoHybrid,
    ipbusBlock: false
  },
  methods: {
    change: function() {
      socket.emit('changeOptoHybrid', this.optohybrid);
      appVue.get();
    }
  }
});

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

function vfat2_reg(vfat2, reg) { return 0x40000000 + ((asideVue.OptoHybrid & 0xf) << 20) + ((vfat2 & 0xff) << 8) + (reg & 0xff); }

function oh_ei2c_reg(reg) { return 0x41000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xfff); }

function oh_scan_reg(reg) { return 0x42000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xff); }

function oh_t1_reg(reg) { return 0x43000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xff); }

function oh_counter_reg(reg) { return 0x4A000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xff); }

function oh_system_reg(reg) { return 0x4B000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xff); }

function oh_stat_reg(reg) { return 0x4C000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xff); }

function oh_adc_reg(reg) { return 0x48000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xff); }

function oh_ultra_reg(reg) { return 0x4D000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xff); }

function tkdata_reg(reg) { return 0x50000000 + ((asideVue.OptoHybrid & 0xf) << 20) + (reg & 0xf); }

function glib_counter_reg(reg) { return 0x60000000 + (reg & 0xff); }

function popcount(n) {
    n >>>= 0;
    for (var popcnt = 0; n; n &= n - 1) ++popcnt;
    return popcnt;
}
