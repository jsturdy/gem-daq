/*
 * Socket IO interface
 */

module.exports = function(io, ipaddr, useUDP) {

    var fs = require('fs');
    var path = require('path');

    // UDP
    var dgram = require('dgram');
    var udp = dgram.createSocket('udp4');
    // TCP
    var net = require('net');
    var client = new net.Socket();

    var ipaddr = (typeof ipaddr !== 'undefined') ?  ipaddr : '192.168.0.161';
    var useUDP = (typeof useUDP !== 'undefined') ?  useUDP : true;
    var port = 50001;

    var packets = new Array();
    var packet = undefined;
    var packetId = 0;

  /*
   * Receive transactions
   */

  function handleResponse(message) {
      // Response
      var response = {
          ipbusVersion: (message[0] >> 4),
          id: ((message[4] & 0xf) << 8) | message[5],
          size: message[6],
          type: (message[7] & 0xf0) >> 4,
          infoCode: message[7] & 0xf,
          data: [ ]
      };
      // Read
      if (response.type == 0 || response.type == 2) {
          if (response.size == 1) response.data = (message[8] << 24) | (message[9] << 16) | (message[10] << 8) | message[11];
          else {
              for (var i = 0; i < response.size; ++i) response.data.push((message[8 + i * 4] << 24) | (message[9 + i * 4] << 16) | (message[10 + i * 4] << 8) | message[11 + i * 4]);
          }
      }
      // Write
      else if (response.type == 1) response.data = 0;

      // Callback
      if (packet !== undefined) {
          (packet.callback)(response);
          packet = undefined;
      }
      else console.log('UDP: received packet', response.id, 'but NO callback :(');
  }

  if (useUDP) {
      udp.bind();
      udp.on('message', handleResponse);
  }
  else {
      client.connect(port, ipaddr, function() { console.log('Connected to CTP7'); });
      client.on('data', handleResponse);
  }

  /*
   * Send transactions
   */

  setInterval(function() {
      if (packet === undefined && packets.length > 0) {
          packet = packets.shift();
          if (useUDP) udp.send(packet.data, 0, packet.data.length, port, ipaddr);
          else client.write(packet.data);
      }
  }, 1);

  /*
   * Handle timeouts
   */

  setInterval(function() {
      if (packet !== undefined) {
          if (packet.timeout > 0) --packet.timeout;
          else {
              (packet.callback)({
                  ipbusVersion: 0x2,
                  id: packet.id,
                  type: null,
                  infoCode: 0x6,
                  data: null
              });
              console.log('Timeout: transaction', packet.id, 'timed out :(');
              packet = undefined;
          }
      }
  }, 10);

  /*
   * IPBus
   */

  function ipbus(transaction, callback) {
      var udp_data = [
          // Transaction Header
          0x20, // Protocol version & RSVD
          0x0, // Transaction ID (0 or bug)
          0x0, // Transaction ID (0 or bug)
          0xf0, // Packet order & type
          // Packet Header
          (0x20 | ((packetId & 0xf00) >> 8)), // Protocol version & Packet ID MSB
          (packetId & 0xff), // Packet ID LSB,
          transaction.size, // Words
          (((transaction.type & 0xf) << 4) | 0xf), // Type & Info code
          // Address
          ((transaction.addr & 0xff000000) >> 24),
          ((transaction.addr & 0x00ff0000) >> 16),
          ((transaction.addr & 0x0000ff00) >> 8),
          (transaction.addr & 0x000000ff)
      ];
      if (transaction.type == 1 || transaction.type == 3) {
          for (var i = 0; i < transaction.size; ++i) {
              udp_data.push((transaction.data[i] & 0xff000000) >> 24);
              udp_data.push((transaction.data[i] & 0x00ff0000) >> 16);
              udp_data.push((transaction.data[i] & 0x0000ff00) >> 8);
              udp_data.push(transaction.data[i] & 0x000000ff);
          }
      }
      packets.push({
          id: packetId++,
          data: new Buffer(udp_data),
          callback: callback,
          timeout: 100
      });
  }

  /*
   * Save to disk
   */

  var vfat2Status = {
      id: 0,
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
      chipId0: 0,
      chipId1: 0,
      latency: 0,
      vthreshold1: 0,
      vthreshold2: 0,
      vcal: 0,
      calphase: 0
  };

  function vfat2_reg(oh, vfat2, reg) { return 0x40000000 + ((oh & 0xf) << 20) + ((vfat2 & 0xff) << 8) + (reg & 0xff); }

  function save_threshold_latency(transaction, callback) {
      ipbus({ type: 0, size: 10, addr: vfat2_reg(transaction.oh, transaction.vfat2, 0) }, function(data) {
          vfat2Status.ctrl0 = data.data[0] & 0xff;
          vfat2Status.ctrl1 = data.data[1] & 0xff;
          vfat2Status.iPreampIn = data.data[2] & 0xff;
          vfat2Status.iPremapFeed = data.data[3] & 0xff;
          vfat2Status.iPreampOut = data.data[4] & 0xff;
          vfat2Status.iShaper = data.data[5] & 0xff;
          vfat2Status.iShaperFeed = data.data[6] & 0xff;
          vfat2Status.iComp = data.data[7] & 0xff;
          vfat2Status.chipId0 = data.data[8] & 0xff;
          vfat2Status.chipId1 = data.data[9] & 0xff;
      });
      ipbus({ type: 0, size: 1, addr: vfat2_reg(transaction.oh, transaction.vfat2, 16) }, function(data) { vfat2Status.latency = data.data & 0xff; });
      ipbus({ type: 0, size: 6, addr: vfat2_reg(transaction.oh, transaction.vfat2, 145) }, function(data) {
          vfat2Status.vcal = data.data[0] & 0xff;
          vfat2Status.vthreshold1 = data.data[1] & 0xff;
          vfat2Status.vthreshold2 = data.data[2] & 0xff;
          vfat2Status.calphase = data.data[3] & 0xff;
          vfat2Status.ctrl2 = data.data[4] & 0xff;
          vfat2Status.ctrl3 = data.data[5] & 0xff;

          var now = require('moment')();
          var fileName = "../data/" + transaction.type + "/" + now.format('YY-MM-DD-HH-mm-ss') + ".txt";
          var content = "";

          content += "Type\t" + transaction.type + "\n";
          content += "OptoHybrid\t" + transaction.oh + "\n";
          content += "VFAT2\t" + transaction.vfat2 + "\n";
          content += "min\t" + transaction.min + "\n";
          content += "max\t" + transaction.max + "\n";
          content += "step\t" + transaction.step + "\n";
          content += "n\t" + transaction.n + "\n";
          content += "----\n";
          content += "slot\t" + transaction.vfat2 + "\n";
          content += "ctrl0\t" + vfat2Status.ctrl0 + "\n";
          content += "ctrl1\t" + vfat2Status.ctrl1 + "\n";
          content += "ctrl2\t" + vfat2Status.ctrl2 + "\n";
          content += "ctrl3\t" + vfat2Status.ctrl3 + "\n";
          content += "iPreampIn\t" + vfat2Status.iPreampIn + "\n";
          content += "iPremapFeed\t" + vfat2Status.iPremapFeed + "\n";
          content += "iPreampOut\t" + vfat2Status.iPreampOut + "\n";
          content += "iShaper\t" + vfat2Status.iShaper + "\n";
          content += "iShaperFeed\t" + vfat2Status.iShaperFeed + "\n";
          content += "iComp\t" + vfat2Status.iComp + "\n";
          content += "chipId0\t" + vfat2Status.chipId0 + "\n";
          content += "chipId1\t" + vfat2Status.chipId1 + "\n";
          content += "latency\t" + vfat2Status.latency + "\n";
          content += "vthreshold1\t" + vfat2Status.vthreshold1 + "\n";
          content += "vthreshold2\t" + vfat2Status.vthreshold2 + "\n";
          content += "vcal\t" + vfat2Status.vcal + "\n";
          content += "calphase\t" + vfat2Status.calphase + "\n";
          content += "----\n";
          for (var i = 0; i < transaction.data.length; ++i) content += transaction.data[i] + "\n";

          fs.writeFile(fileName, content, callback);
      });
  }

  function save_vfat2(transaction, callback) {
      var now = require('moment')();
      var fileName = "../data/" + transaction.type + "/" + now.format('YY-MM-DD-HH-mm-ss') + ".txt";
      var content = "";

      for (var i = 0; i < transaction.data.length; ++i) {
          content += "--------------------" + transaction.data[i].id + "--------------------\n";
          content += "isPresent\t" + (transaction.data[i].isPresent ? "1" : "0") + "\n";
          content += "isOn\t" + (transaction.data[i].isOn ? "1" : "0") + "\n";
          content += "ctrl0\t" + transaction.data[i].ctrl0 + "\n";
          content += "ctrl1\t" + transaction.data[i].ctrl1 + "\n";
          content += "ctrl2\t" + transaction.data[i].ctrl2 + "\n";
          content += "ctrl3\t" + transaction.data[i].ctrl3 + "\n";
          content += "iPreampIn\t" + transaction.data[i].iPreampIn + "\n";
          content += "iPremapFeed\t" + transaction.data[i].iPremapFeed + "\n";
          content += "iPreampOut\t" + transaction.data[i].iPreampOut + "\n";
          content += "iShaper\t" + transaction.data[i].iShaper + "\n";
          content += "iShaperFeed\t" + transaction.data[i].iShaperFeed + "\n";
          content += "iComp\t" + transaction.data[i].iComp + "\n";
          content += "chipId0\t" + transaction.data[i].chipId0 + "\n";
          content += "chipId1\t" + transaction.data[i].chipId1 + "\n";
          content += "latency\t" + transaction.data[i].latency + "\n";
          content += "vthreshold1\t" + transaction.data[i].vthreshold1 + "\n";
          content += "vthreshold2\t" + transaction.data[i].vthreshold2 + "\n";
          content += "vcal\t" + transaction.data[i].vcal + "\n";
          content += "calphase\t" + transaction.data[i].calphase + "\n";
      }

      fs.writeFile(fileName, content, callback);
  }

    io.on('connection', function (socket) {

        socket.on('ipbus', function(transaction, callback) { ipbus(transaction, callback); });

        socket.on('save', function(transaction, callback) {
            var now = require('moment')();
            var fileName = path.join(__dirname, '/../../data/' + transaction.type + "/" + now.format('YY-MM-DD-HH-mm-ss') + ".txt");
            var content = "";

            if (transaction.type == "threshold" || transaction.type == "latency") {
                content += "VFAT2\t" + transaction.vfat2 + "\n";
                content += "MIN\t" + transaction.min + "\n";
                content += "MAX\t" + transaction.max + "\n";
                content += "STEP\t" + transaction.step + "\n";
                content += "N\t" + transaction.n + "\n";
                for (var i = 0; i < transaction.data.length; ++i) content += transaction.data[i] + "\n";
            }
            else if (transaction.type == "scurve" || transaction.type == "threshold_channel") {
                content += "VFAT2\t" + transaction.vfat2 + "\n";
                content += "CHANNEL\t" + transaction.channel + "\n";
                content += "MIN\t" + transaction.min + "\n";
                content += "MAX\t" + transaction.max + "\n";
                content += "STEP\t" + transaction.step + "\n";
                content += "N\t" + transaction.n + "\n";
                for (var i = 0; i < transaction.data.length; ++i) content += transaction.data[i] + "\n";
            }
            else if (transaction.type == "vfat2") {
                for (var i = 0; i < transaction.data.length; ++i) {
                    content += "--------------------" + transaction.data[i].id + "--------------------\n";
                    content += "isPresent\t" + (transaction.data[i].isPresent ? "1" : "0") + "\n";
                    content += "isOn\t" + (transaction.data[i].isOn ? "1" : "0") + "\n";
                    content += "ctrl0\t" + transaction.data[i].ctrl0 + "\n";
                    content += "ctrl1\t" + transaction.data[i].ctrl1 + "\n";
                    content += "ctrl2\t" + transaction.data[i].ctrl2 + "\n";
                    content += "ctrl3\t" + transaction.data[i].ctrl3 + "\n";
                    content += "iPreampIn\t" + transaction.data[i].iPreampIn + "\n";
                    content += "iPremapFeed\t" + transaction.data[i].iPremapFeed + "\n";
                    content += "iPreampOut\t" + transaction.data[i].iPreampOut + "\n";
                    content += "iShaper\t" + transaction.data[i].iShaper + "\n";
                    content += "iShaperFeed\t" + transaction.data[i].iShaperFeed + "\n";
                    content += "iComp\t" + transaction.data[i].iComp + "\n";
                    content += "chipId0\t" + transaction.data[i].chipId0 + "\n";
                    content += "chipId1\t" + transaction.data[i].chipId1 + "\n";
                    content += "latency\t" + transaction.data[i].latency + "\n";
                    content += "vthreshold1\t" + transaction.data[i].vthreshold1 + "\n";
                    content += "vthreshold2\t" + transaction.data[i].vthreshold2 + "\n";
                    content += "vcal\t" + transaction.data[i].vcal + "\n";
                    content += "calphase\t" + transaction.data[i].calphase + "\n";
                }
            }

            fs.writeFile(fileName, content, callback);
        });

    });
};
