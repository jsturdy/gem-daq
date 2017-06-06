const fs = require('fs');
const path = require('path');
const dgram = require('dgram');
const net = require('net');
const moment = require('moment');

const ipaddr = process.env.NODE_IPADDR || '137.138.115.185';
const useUDP = process.env.NODE_UDP === 'false' ? false : true;
const port = useUDP ? 50001 : 60002;

console.log('Connecting to ' + ipaddr + ' on port ' + port + ' through ' + (useUDP ? 'UDP' : 'TCP'));

const udp = dgram.createSocket('udp4');
const client = new net.Socket();

if (useUDP === true) {
  udp.bind();
  udp.on('message', handleResponse);
}
else {
  client.connect(port, ipaddr);
  client.on('data', handleResponse);
}

let packets = new Array();
let packet = undefined;
let packetId = 0;

// Recieve
function handleResponse(frame) {
  let message = [ ];

  // UDP
  if (useUDP === true) {
     message = frame;
  }
  // TCP
  else {
    for (let i = 4; i < frame.length; i += 4) {
      message.push(frame[i + 3]);
      message.push(frame[i + 2]);
      message.push(frame[i + 1]);
      message.push(frame[i]);
    }
  }

  // Response
  let response = {
    ipbusVersion: (message[0] >> 4),
    id: ((message[4] & 0xf) << 8) | message[5],
    size: message[6],
    type: (message[7] & 0xf0) >> 4,
    infoCode: message[7] & 0xf,
    data: [ ]
  };
  // Read
  if (response.type == 0 || response.type == 2) {
    if (response.size == 1) {
      response.data = (message[8] << 24) | (message[9] << 16) | (message[10] << 8) | message[11];
    }
    else {
      for (var i = 0; i < response.size; ++i) {
        response.data.push((message[8 + i * 4] << 24) | (message[9 + i * 4] << 16) | (message[10 + i * 4] << 8) | message[11 + i * 4]);
      }
    }
  }
  // Write
  else if (response.type == 1) {
    response.data = 0;
  }

  // Callback
  if (packet !== undefined) {
    (packet.callback)(response);
    packet = undefined;
  }
  else {
    console.log('Rreceived packet', response.id, 'but NO callback :(');
  }
}

// Send
setInterval(function() {
  if (packet !== undefined) {
    if (packet.timeout > 0) {
      --packet.timeout;
    }
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
  else if (packet === undefined && packets.length > 0) {
    packet = packets.shift();
    if (useUDP === true) {
      udp.send(packet.data, 0, packet.data.length, port, ipaddr);
    }
    else {
      client.write(packet.data);
    }
  }
}, 1);

/*
 * IPBus
 */

function ipbus(transaction, callback) {
  let udp_data = [
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
    for (let i = 0; i < transaction.size; ++i) {
      udp_data.push((transaction.data[i] & 0xff000000) >> 24);
      udp_data.push((transaction.data[i] & 0x00ff0000) >> 16);
      udp_data.push((transaction.data[i] & 0x0000ff00) >> 8);
      udp_data.push(transaction.data[i] & 0x000000ff);
    }
  }

  let len = 0;
  let tcp_data = [ ];
  for (let i = 0; i < udp_data.length; i += 4) {
     tcp_data.push(udp_data[i + 3]);
     tcp_data.push(udp_data[i + 2]);
     tcp_data.push(udp_data[i + 1]);
     tcp_data.push(udp_data[i]);
     len += 4;
  }
  tcp_data.unshift(0);
  tcp_data.unshift(0);
  tcp_data.unshift(0);
  tcp_data.unshift(len);

  const data = (useUDP ? udp_data : tcp_data);
  packets.push({
    id: packetId++,
    data: new Buffer(data),
    callback: callback,
    timeout: 1000
  });
}

module.exports = (io) => {

  io.on('connection', function (socket) {

    var wstream = null;

    socket.on('ipbus', function(transaction, callback) { ipbus(transaction, callback); });

    socket.on('tkdata_init', function() {
      const now = moment();
      const fileName = 'data/' + now.format('YY-MM-DD-HH-mm-ss') + '.txt';
      wstream = fs.createWriteStream(fileName);
    });

    socket.on('tkdata_stop', function() {
      if (wstream !== null) wstream.end();
      wstream = null;
    });

    socket.on('tkdata_write', function(data) {
      if (wstream !== null) {
        let buf = Buffer.alloc(data.length * 4);
        for (let i = 0; i < data.length; ++i) {
          buf.writeUInt32BE(data[i] >>> 0, i * 4);
        }
        wstream.write(buf);
      }
    });

  });

};
