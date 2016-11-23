var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    mode: 0,
    type: 0,
    events: 0,
    interval: 0,
    delay: 0
  },
  methods: {
    init: function() {
      ipbus_blockRead(oh_t1_reg(1), 5, function(data) {
        appVue.mode = data[0];
        appVue.type = data[1];
        appVue.events = data[2];
        appVue.interval = data[3];
        appVue.delay = data[4];
      });
      this.get();
    },
    get: function() {
      ipbus_read(oh_t1_reg(14), function(data) {
        appVue.running = (data == 0 ? false : true);
      });
    },
    start: function() {
      if (this.running) return;
      ipbus_blockWrite(oh_t1_reg(1), [ this.mode, this.type, this.events, this.interval, this.delay ]);
      ipbus_write(oh_t1_reg(0), 1);
      this.get();
    },
    stop: function() {
      if (!this.running) return;
      ipbus_write(oh_t1_reg(0), 0);
      this.get();
    },
    reset: function() {
      ipbus_write(oh_t1_reg(15), 1);
      this.get();
    }
  }
});

appVue.init();
setInterval(function() { appVue.get() }, 5000);
