"use strict";

import { WebSocketServer } from "ws";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { createObjectCsvWriter } from "csv-writer";

// JINS MEMEのWebSocketサーバーのポート番号
const WEBSOCKET_PORT = 5001;
const SERIAL_PORT_PATH = "/dev/cu.usbmodem11401";

const wsServer = new WebSocketServer({ port: WEBSOCKET_PORT });
const serialPort = new SerialPort({ path: SERIAL_PORT_PATH, baudRate: 57600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));
const csvWriter = createObjectCsvWriter({
  path: "airpuf_out.csv",
  header: [
    { id: "name", title: "name" },
    { id: "date", title: "date" },
  ],
});
const records = [];
let blinkCount = 0;
let pushCount = 0;
let timerId;

const init = () => {
  serialPort.on("open", function () {
    console.log("Serial port open.");
    wsServer.on("connection", (ws) => {
      console.log("WebSocket connected from client");
      // 初回タイマー開始
      // setTimeout()の第２引数(ms)ごとに"OK"を送信
      timerId = setTimeout(write, 3000, "OK\n");
      // console.log(`Timer is on: ${timerId}`);

      ws.on("message", function (message) {
        if (message.indexOf("heartbeat") === -1) {
          //実際の処理する場合はparseして処理
          const obj = JSON.parse(message);
          if (obj.blinkSpeed !== 0) {
            // 瞬目したの処理
            clearTimeout(timerId); // タイマー停止
            // console.log(`Timer is off: ${timerId}\n**********`);
            timerId = setTimeout(write, 3000, "OK\n"); // タイマー再開
            // console.log(`B Timer is on: ${timerId}`);

            // 瞬目回数をカウント
            blinkCount = blinkCount + 1;
            const time = Date.now();
            const today = new Date(time);
            console.log("Blink count: ", blinkCount);
            console.log("Blink date: ", today);
            const record = {
              name: "blink",
              date: today,
            };
            records.push(record);
          }
        }
      });
      // websocketを閉じたときの処理
      ws.on("close", function () {
        console.log("WebSocket closed");
        // csvWriter
        csvWriter.writeRecords(records).then(() => {
          console.log("...Done");
        });
      });
    });
  });
};

// シリアルポートからのデータを受信したときの処理
parser.on("data", function (data) {
  console.log("Arduino: " + data);
  pushCount = pushCount + 1;
  const time = Date.now();
  const today = new Date(time);
  console.log("Push count: ", pushCount);
  console.log("Push date: ", today);
  const record = {
    name: "push",
    date: today,
  };
  records.push(record);
  // console.log(`Timer pushed: ${timerId}\n**********`);
  timerId = setTimeout(write, 3000, "OK\n");
  // console.log(`A Timer is on: ${timerId}`);
});

const write = (data) => {
  console.log("Write: " + data);
  serialPort.write(Buffer.from(data), function (err, results) {
    if (err) {
      console.log("Error writing to serial port: " + err);
      console.log("Write results: " + results);
    }
  });
};

init();
