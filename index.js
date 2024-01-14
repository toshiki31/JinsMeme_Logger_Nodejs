"use strict";
const { Server } = require("ws");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const ws_server = new Server({ port: 5001 });
const serialPort = new SerialPort({
  path: "/dev/cu.usbmodem11401",
  baudRate: 9600,
});
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));
var count = 0;

serialPort.on("open", function () {
  console.log("Serial open.");
  ws_server.on("connection", (ws) => {
    console.log("connected from client");
    // 1000msごとに"OK"を送信
    sendMessage();
    ws.on("message", function (message) {
      if (message.indexOf("heartbeat") === -1) {
        //実際の処理する場合はparseして処理していきます
        const obj = JSON.parse(message);
        // console.log("--- obj --- \n", obj);
        if (obj.blinkSpeed !== 0) {
          // 瞬目回数をカウント
          count = count + 1;
          console.log("blink count: ", count);
        }
      }
    });
  });
});

parser.on("data", function (data) {
  console.log("Data: " + data);
});

function write(data) {
  console.log("Write: " + data);
  serialPort.write(Buffer.from(data), function (err, results) {
    if (err) {
      console.log("Err: " + err);
      console.log("Results: " + results);
    }
  });
}

async function sendMessage() {
  await setInterval(write, 3000, "OK\n");
}
