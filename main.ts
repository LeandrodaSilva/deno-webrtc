import express from "npm:express";
import { ExpressPeerServer } from "npm:peer";

const app = express();

const peerServer = ExpressPeerServer(app, {
  proxied: true,
  debug: true,
  path: "/myapp",
  ssl: {},
});

app.use(peerServer);

app.use(express.static('public'));


app.listen(Deno.env.get("PORT") || 8000, () => {
  console.log("Peer server is running on port", Deno.env.get("PORT") || 8000);
});
