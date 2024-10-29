import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { MoveController } from "../controllers/moveController";

export class WebSocketService {
    private wss: WebSocketServer;
    private clients: Map<string, WebSocket>;
    private moveController: MoveController;

    constructor(server: http.Server, private mController) {
        this.wss = new WebSocketServer({ server });
        this.clients = new Map();
        this.setupWebSocket();
        this.moveController = mController;
        console.log('WebSocket service started');
    }

    private setupWebSocket() {
        this.wss.on("connection", (ws) => {
            console.log("New WebSocket connection established");

            ws.on("message", async (message) => {
                console.log("Received:", message.toString());
                console.log('Broj klijenata: ' + this.clients.size);

                if(message.toString().includes('move')) {
                    console.log('Move called');
                    const result = await this.moveController.handleWebSocketMessage(message);

                    if(result.success && result.gameOver) {
                        return this.broadcastMessage('finish;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';');
                    }

                    if(result.success) {
                        return this.broadcastMessage('move;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';' + result.gameOver.toString());
                    }
                } else if(message.toString().includes('single-player')) {
                    console.log('Single player move called');
                    // user made move
                    const result = await this.moveController.handleWebSocketMessage(message);

                    // now create a computer move
                    const computerResult = await this.moveController.computerMove(message);

                    if(result.success && computerResult.success) {
                        if (result.gameOver) return this.broadcastMessage('single-player-finish;' + result.gameId + ';x;' + result.moveIndex + ';' + result.gameOver + ';' + computerResult.moveIndex);

                        if (computerResult.gameOver) return this.broadcastMessage('single-player-finish;' + result.gameId + ';y;' + result.moveIndex + ';' + computerResult.gameOver + ';' + computerResult.moveIndex);

                        return this.broadcastMessage('single-player-move;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';' + result.gameOver.toString() + ';' + computerResult.moveIndex);
                    }
                } else {
                    this.clients.set(message.toString(), ws);
                    return console.log('Broj klijenata (nakon dodavanja): ' + this.clients.size);
                }
            });

            ws.on("close", () => {
                console.log("WebSocket connection closed");
                for (const [key, clientWs] of this.clients.entries()) {
                    if (clientWs === ws) {
                        this.clients.delete(key);
                        break;
                    }
                }
            });
        });
    }

    public sendMessageToClient(playerId: string, message: string) {
        const clientWs = this.clients.get(playerId);
        if (!clientWs) return console.log(`Client with playerId ${playerId} not found`);
        return clientWs.send(message);
    }

    public broadcastMessage(message: string) {
        this.clients.forEach((clientWs) => {
            clientWs.send(message);
        });
    }
}
