"use strict";

import { WebSocketServer } from "ws";
import { createObjectCsvWriter } from "csv-writer";

// JINS MEMEのWebSocketサーバーのポート番号
const WEBSOCKET_PORT = 5001;

const wsServer = new WebSocketServer({ port: WEBSOCKET_PORT });
const now = Date.now();
const csvWriter = createObjectCsvWriter({
  path: `${now}_base.csv`,
  header: [
    { id: "name", title: "name" },
    { id: "date", title: "date" },
  ],
});
const records = [];
let blinkCount = 0;

const init = () => {
  console.log("base_experiment stared");
  wsServer.on("connection", (ws) => {
    console.log("WebSocket connected from client");

    ws.on("message", function (message) {
      if (message.indexOf("heartbeat") === -1) {
        //実際の処理する場合はparseして処理
        const obj = JSON.parse(message);
        if (obj.blinkSpeed !== 0) {
          // 瞬目回数をカウント
          blinkCount = blinkCount + 1;
          const time = Date.now();
          // const today = new Date(time);
          console.log("Blink count: ", blinkCount);
          // console.log("Blink date: ", time);
          const record = {
            name: "blink",
            date: time,
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
};

init();
