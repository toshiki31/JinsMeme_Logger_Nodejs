const server = require("ws").Server;
const ws_server = new server({ port: 5001 });
var count = 0;

ws_server.on("connection", (ws) => {
  console.log("connected from client");
  ws.on("message", function (message) {
    if (message.indexOf("heartbeat") === -1) {
      // メッセージを出力
      // console.log(message);

      //実際の処理する場合はparseして処理していきます
      const obj = JSON.parse(message);
      // console.log("--- obj --- \n", obj);
      if (obj.blinkSpeed !== 0) {
        count = count + 1;
        console.log("count: ", count);
      }
    }
  });
});
