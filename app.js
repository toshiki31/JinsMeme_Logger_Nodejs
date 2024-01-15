"use strict";

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const WEBSOCKET_PORT = 5001;
const SERIAL_PORT_PATH = "/dev/cu.usbmodem11401";

const httpServer = createServer();
const wsServer = new WebSocketServer({ port: WEBSOCKET_PORT });
const serialPort = new SerialPort({ path: SERIAL_PORT_PATH, baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));
let blinkCount = 0;
let pushCount = 0;

const init = () => {
  // httpServer.listen(TCP_PORT, function () {
  //   console.log("HTTP server listening on *:" + TCP_PORT);
  // });

  serialPort.on("open", function () {
    console.log("Serial port open.");
    wsServer.on("connection", (ws) => {
      console.log("WebSocket connected from client");
      // setInterval()の第２引数(ms)ごとに"OK"を送信
      sendMessage();

      ws.on("message", function (message) {
        if (message.indexOf("heartbeat") === -1) {
          //実際の処理する場合はparseして処理していきます
          const obj = JSON.parse(message);
          if (obj.blinkSpeed !== 0) {
            // 瞬目回数をカウント
            blinkCount = blinkCount + 1;
            const time = Date.now();
            const today = new Date(time);
            console.log("Blink count: ", blinkCount);
            console.log("Blink date: ", today);
          }
        }
      });
      // websocketを閉じたときの処理
      ws.on("close", function () {
        console.log("WebSocket closed");
      });
    });
  });
};
parser.on("data", function (data) {
  console.log("Data from serial port: " + data);
  pushCount = pushCount + 1;
  const time = Date.now();
  const today = new Date(time);
  console.log("Push count: ", pushCount);
  console.log("Push date: ", today);
});

const write = (data) => {
  console.log("Write to serial port: " + data);
  serialPort.write(Buffer.from(data), function (err, results) {
    if (err) {
      console.log("Error writing to serial port: " + err);
      console.log("Write results: " + results);
    }
  });
};

const sendMessage = async () => {
  setInterval(write, 3000, "OK\n");
};

init();
