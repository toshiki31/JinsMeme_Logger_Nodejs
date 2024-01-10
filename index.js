"use strict";
const server = require("ws").Server;
const ws_server = new server({ port: 5001 });
// const five = require("johnny-five");
// const board = new five.Board();
var count = 0;

// board.on("ready", function () {
//   ws_server.on("connection", (ws) => {
//     console.log("connected from client");
//     ws.on("message", function (message) {
//       if (message.indexOf("heartbeat") === -1) {
//         // メッセージを出力
//         // console.log(message);

//         //実際の処理する場合はparseして処理していきます
//         const obj = JSON.parse(message);
//         // console.log("--- obj --- \n", obj);
//         if (obj.blinkSpeed !== 0) {
//           // 瞬目回数をカウント
//           count = count + 1;
//           console.log("count: ", count);
//           var led = new five.Led(13);
//           if (count % 2 === 0) {
//             led.off();
//           } else {
//             led.on();
//           }
//         }
//       }
//     });
//   });
// });

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const port = new SerialPort({ path: "/dev/cu.usbmodem11401", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

port.on("open", function () {
  console.log("Serial open.");
  setInterval(write, 1000, "OK\n");
});

parser.on("data", function (data) {
  console.log("Data: " + data);
});

function write(data) {
  console.log("Write: " + data);
  port.write(new Buffer(data), function (err, results) {
    if (err) {
      console.log("Err: " + err);
      console.log("Results: " + results);
    }
  });
}
