import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { MoveController } from "../controllers/moveController";

export class WebSocketService {
    private wss: WebSocketServer;
    private clients: Map<string, WebSocket>;
    private moveController: MoveController;

    constructor(server: http.Server, private readonly mController) {
        this.wss = new WebSocketServer({ server });
        this.clients = new Map();
        this.setupWebSocket();
        this.moveController = mController;
        console.log('WebSocket service started');
    }

    private setupWebSocket() {
        // FIXME: Dodaj tip na ws
        this.wss.on("connection", (ws) => {
            console.log("New WebSocket connection established");

            // FIXME: Dodaj tip na message i tip koji funkcija vraca
            ws.on("message", async (message) => {
                console.log("Received:", message.toString());
                console.log('Broj klijenata: ' + this.clients.size);
                return await this.handleMessage(message, ws);
            });
            // FIXME: Dodaj tip koji funkcija vraca
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

    // FIXME: Dodaj tipove za oba parametra i tip koji funkcija vraca
    private async handleMessage(message, ws) {
        if(message.toString().includes('move')) {
            console.log('Move called');
            return await this.handleMoveMessage(message);
        } else if(message.toString().includes('single-player')) {
            console.log('Single player move called');
            return await this.handleSinglePlayerMoveMessage(message);
        } else {
            this.clients.set(message.toString(), ws);
            return console.log('Broj klijenata (nakon dodavanja): ' + this.clients.size);
        }
    }

    // FIXME: Dodaj tip za parametar i tip koji funkcija vraca
    private async handleMoveMessage(message) {
        const result = await this.moveController.handleWebSocketMessage(message);

        if(result.success && result.gameOver) {
            return this.broadcastMessage('finish;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';' + result.draw);
        }

        if(result.success) {
            return this.broadcastMessage('move;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';' + result.gameOver.toString() + ';' + result.draw);
        }
    }

    // FIXME: Dodaj tip za parametar i tip koji funkcija vraca
    private async handleSinglePlayerMoveMessage(message) {
        // user made move
        const result = await this.moveController.handleWebSocketMessage(message);
        if (result.success && result.gameOver) {
            return this.broadcastMessage('single-player-finish;' + result.gameId + ';x;' + result.moveIndex +
                ';' + result.gameOver + ';' + '' + ';' + result.draw);
        }

        // now create a computer move
        const computerResult = await this.moveController.computerMove(message);
        if (result.success && result.gameOver) {
            return this.broadcastMessage('single-player-finish;' + result.gameId + ';y;' + result.moveIndex + ';' +
                computerResult.gameOver + ';' + computerResult.moveIndex + ';' + result.draw);
        }

        return this.broadcastMessage('single-player-move;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';'
            + result.gameOver.toString() + ';' + computerResult.moveIndex);
    }

    // FIXME: Dodaj tip koji funkcija vraca
    public sendMessageToClient(playerId: string, message: string) {
        const clientWs = this.clients.get(playerId);
        if (!clientWs) return console.log(`Client with playerId ${playerId} not found`);
        return clientWs.send(message);
    }

    // FIXME: Dodaj tip koji funkcija vraca
    public broadcastMessage(message: string) {
        this.clients.forEach((clientWs) => {
            clientWs.send(message);
        });
    }
}
