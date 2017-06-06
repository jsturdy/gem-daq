var appVue = new Vue({
  el: 'section.content',
  data: {
    vfat2s: [ ],
    selected: ((window.location.href.split('/'))[4] === undefined ? -1 : (window.location.href.split('/'))[4]),
    params: {
      ctrl0: 55,
      ctrl1: 0,
      ctrl2: 48,
      ctrl3: 0,
      iPreampIn: 168,
      iPremapFeed: 80,
      iPreampOut: 150,
      iShaper: 150,
      iShaperFeed: 100,
      iComp: 75,
      vthreshold2: 0
    }
  },
  methods: {
    init: function() {
      for (let i = 0; i < 24; ++i) {
        this.vfat2s.push({
          id: i,
          isPresent: false,
          isOn: false,
          isMasked: false,
          ctrl0: 0,
          ctrl1: 0,
          ctrl2: 0,
          ctrl3: 0,
          iPreampIn: 0,
          iPremapFeed: 0,
          iPreampOut: 0,
          iShaper: 0,
          iShaperFeed: 0,
          iComp: 0,
          chipId:  0,
          chipId0: 0,
          chipId1: 0,
          latency: 0,
          vthreshold1: 0,
          vthreshold2: 0,
          vcal: 0,
          calphase: 0
        });
      }
      this.get();
    },
    get: function() {
      for (let i = 0; i < 24; ++i) {
        this.getVFAT2Summary(i);
      }
      ipbus_read(oh_system_reg(0), function(data) {
        for (let i = 0; i < 24; ++i) {
          appVue.vfat2s[i].isMasked = (((data >> i) & 0x1) == 1 ? true : false);
        }
      });
      if (this.selected != -1) {
        this.getVFAT2(this.selected);
      }
    },
    getVFAT2Summary: function(i) {
      ipbus_read(vfat2_reg(i, 0), function(data) {
        appVue.vfat2s[i].isPresent = (((data >> 24) & 0x7) != 0x3 ? false : true);
        appVue.vfat2s[i].isOn = ((data & 0x1) == 0 ? false : true);
      });
    },
    getVFAT2: function(vfat2) {
      ipbus_blockRead(vfat2_reg(vfat2, 0), 10, function(data) {
        appVue.vfat2s[vfat2].ctrl0 = data[0] & 0xff;
        appVue.vfat2s[vfat2].ctrl1 = data[1] & 0xff;
        appVue.vfat2s[vfat2].iPreampIn = data[2] & 0xff;
        appVue.vfat2s[vfat2].iPremapFeed = data[3] & 0xff;
        appVue.vfat2s[vfat2].iPreampOut = data[4] & 0xff;
        appVue.vfat2s[vfat2].iShaper = data[5] & 0xff;
        appVue.vfat2s[vfat2].iShaperFeed = data[6] & 0xff;
        appVue.vfat2s[vfat2].iComp = data[7] & 0xff;
        appVue.vfat2s[vfat2].chipId = ((data[9] & 0xff) << 8) + (data[8] & 0xff);
        appVue.vfat2s[vfat2].chipId0 = data[8] & 0xff;
        appVue.vfat2s[vfat2].chipId1 = data[9] & 0xff;
      });
      ipbus_read(vfat2_reg(vfat2, 16), function(data) {
        appVue.vfat2s[vfat2].latency = data & 0xff;
      });
      ipbus_blockRead(vfat2_reg(vfat2, 145), 6, function(data) {
        appVue.vfat2s[vfat2].vcal = data[0] & 0xff;
        appVue.vfat2s[vfat2].vthreshold1 = data[1] & 0xff;
        appVue.vfat2s[vfat2].vthreshold2 = data[2] & 0xff;
        appVue.vfat2s[vfat2].calphase = data[3] & 0xff;
        appVue.vfat2s[vfat2].ctrl2 = data[4] & 0xff;
        appVue.vfat2s[vfat2].ctrl3 = data[5] & 0xff;
      });
    },
    show: function(vfat2) {
      this.getVFAT2(vfat2);
      this.selected = vfat2;
    },
    applyDefaultsAll: function() {
      this.writeToAll(1, this.params.ctrl1);
      this.writeToAll(2, this.params.iPreampIn);
      this.writeToAll(3, this.params.iPremapFeed);
      this.writeToAll(4, this.params.iPreampOut);
      this.writeToAll(5, this.params.iShaper);
      this.writeToAll(6, this.params.iShaperFeed);
      this.writeToAll(7, this.params.iComp);
      this.writeToAll(147, this.params.vthreshold2);
      this.writeToAll(149, this.params.ctrl2);
      this.writeToAll(150, this.params.ctrl3);
      $.notify('Default settings applied to all VFAT2s');
      setTimeout(this.get, 100);
    },
    startAll: function() {
      this.writeToAll(0, this.params.ctrl0, 0);
      $.notify('All VFAT2s have been started');
      setTimeout(this.get, 100);
    },
    stopAll: function() {
      this.writeToAll(0, 0, 0);
      $.notify('All VFAT2s have been stopped');
      setTimeout(this.get, 100);
    },
    writeToAll: function(reg, value) {
      for (var i = 0; i < 24; ++i) ipbus_write(vfat2_reg(i, reg), value);
    },
    toggleMask: function() {
      ipbus_read(oh_system_reg(0), function(data) {
        var bit = ((data >> appVue.selected) & 0x1);
        if (bit == 1) data &= ~(0x1 << appVue.selected);
        else data |= (0x1 << appVue.selected);
        ipbus_write(oh_system_reg(0), data);
        appVue.vfat2s[appVue.selected].isMasked = !appVue.vfat2s[appVue.selected].isMasked;
      });
    },
    edit: function(reg, event) {
      var elem = $(event.target)[0];
      if (elem.tagName == 'B') elem = elem.parentElement;
      if (elem.tagName == 'SPAN') elem = elem.parentElement;
      if (elem.tagName == 'SPAN') elem = elem.parentElement;
      elem = $(elem);
      var parent = elem.parent();
      var input = $('<input type="number" data-reg="' + reg + '" placeholder="' + elem.text() + '">');
      parent.append(input);
      input.focus();
      elem.hide();
      function done() {
        if (input.val() == '') return cancel();
        ipbus_write(vfat2_reg(appVue.selected, input.data('reg')), input.val());
        appVue.getVFAT2(appVue.selected);
        cancel();
      }
      function cancel() {
        elem.show();
        input.remove();
      }
      input.on('blur', done);
      input.on('keydown', function(e) {
        if (e.keyCode == 13) done();
        else if (e.keyCode == 27) cancel();
      });
    },
    applyDefaults: function() {
      ipbus_blockWrite(vfat2_reg(this.selected, 1), [
        this.params.ctrl1,
        this.params.iPreampIn,
        this.params.iPremapFeed,
        this.params.iPreampOut,
        this.params.iShaper,
        this.params.iShaperFeed,
        this.params.iComp
      ]);
      ipbus_write(vfat2_reg(this.selected, 147), this.params.vthreshold2);
      ipbus_blockWrite(vfat2_reg(this.selected, 149), [ this.params.ctrl2, this.params.ctrl3 ]);
      $.notify('The default parameters have been applied to the VFAT2');
      this.get();
    },
    start: function() {
      ipbus_write(vfat2_reg(this.selected, 0), this.params.ctrl0);
      $.notify('The VFAT2 has been started');
      this.get();
    },
    stop: function() {
      ipbus_write(vfat2_reg(this.selected, 0), 0);
      $.notify('The VFAT2 has been stopped');
      this.get();
    },
    resetChannels: function() {
      ipbus_blockWrite(vfat2_reg(this.selected, 17), [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ]);
      $.notify('All channels have been reset');
    }
  }
});

appVue.init();
setInterval(function() { appVue.get() }, 5000);
