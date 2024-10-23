import express from "express";
const app = express();
app.use(express.json());

import cors from "cors"
const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
app.use(cors(corsOptions));

import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT as string;

require("./config/routes")(app);

import http from "http";
import { WebSocketService } from "./config/webSocket";
import { MoveRepository } from "./repositories/moveRepository";
import { MoveService } from "./services/moveService";
import { MoveController } from "./controllers/moveController";
const server = http.createServer(app);

const moveController = new MoveController(new MoveService(new MoveRepository()));
const webSocketService = new WebSocketService(server, moveController);

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});
