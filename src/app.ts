// FIXME: Fajlovi treba na vrhu da imaju importe u sredini definicije / podesavanja i na dnu exporte
import express, { Express } from "express";
import { WebSocketService } from "./config/webSocket";
import { MoveController } from "./controllers/moveController";
import { MoveService } from "./services/moveService";
import { MoveRepository } from "./repositories/moveRepository";
import { GameRepository } from "./repositories/gameRepository";
import cors from "cors"
import dotenv from 'dotenv';
import http from "http";

const app: Express = express();
app.use(express.json());

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));

dotenv.config();

const port = process.env.PORT as string;
export const server = http.createServer(app);
server.listen(port, (): void => {
    console.log(`listening on port ${port}`);
});

export const webSocketService = new WebSocketService(server, new MoveController(new MoveService(new MoveRepository(), new GameRepository())));
require("./config/routes")(app);
