// test-local.js
import http from "http";

http.get("http://localhost:3000/api/tg/download/9999999?session=MYSESSION12341234", (res) => {
  let data = "";
  console.log("Status Code:", res.statusCode);
  console.log("Headers:", res.headers);
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Response Body Length:", data.length);
    console.log("Response Body (first 200 chars):", data.substring(0, 200));
  });
});
