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

import http from "http";

import { WebSocketService } from "./config/webSocket";
import { MoveController } from "./controllers/moveController";
import { MoveService } from "./services/moveService";
import { MoveRepository } from "./repositories/moveRepository";
import { GameRepository } from "./repositories/gameRepository";
export const server = http.createServer(app);
export const webSocketService = new WebSocketService(server, new MoveController(new MoveService(new MoveRepository(), new GameRepository())));

require("./config/routes")(app);

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});
