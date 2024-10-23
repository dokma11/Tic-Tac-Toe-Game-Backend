import { WebSocketServer } from "ws";
import http from "http";
import { MoveController } from "../controllers/moveController";

export class WebSocketService {
    private wss: WebSocketServer;
    private moveController: MoveController;

    constructor(server: http.Server, moveController: MoveController) {
        this.wss = new WebSocketServer({ server });
        this.moveController = moveController;
        this.setupWebSocket();
    }

    private setupWebSocket() {
        this.wss.on("connection", (ws) => {
            console.log("New WebSocket connection established");

            ws.on("message", async (message) => {
                console.log("Received:", message.toString());

                // vratiti se ovde samo jer vrv moramd a dodam neki uslov kako cu prosedliti i kome ws
                await this.moveController.handleWebSocketMessage(message, ws);
            });

            ws.on("close", () => {
                console.log("WebSocket connection closed");
            });
        });
    }
}
