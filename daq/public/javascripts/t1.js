var appVue = new Vue({
  el: 'section.content',
  data: {
    running: false,
    mode: 0,
    type: 0,
    events: 0,
    interval: 0,
    delay: 0,
    seen: 0,
    progress: 0
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
      ipbus_read(oh_counter_reg(100), function(data) {
        appVue.seen = data;
      });
      this.get();
    },
    get: function() {
      ipbus_read(oh_t1_reg(14), function(data) {
        appVue.running = (data == 0 ? false : true);
      });
      ipbus_read(oh_counter_reg(100), function(data) {
        appVue.progress = (appVue.running && appVue.events != 0 ? ((data - appVue.seen) / (appVue.events) * 100) : 0);
      });
    },
    start: function() {
      if (this.running) {
        return;
      }
      ipbus_blockWrite(oh_t1_reg(1), [ this.mode, this.type, this.events, this.interval, this.delay ]);
      ipbus_write(oh_t1_reg(0), 1);
      ipbus_read(oh_counter_reg(100), function(data) {
        appVue.seen = data;
      });
      this.get();
    },
    stop: function() {
      if (!this.running) {
        return;
      }
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
setInterval(function() { appVue.get() }, 1000);
