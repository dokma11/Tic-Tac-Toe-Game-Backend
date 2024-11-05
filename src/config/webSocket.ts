import http from "http";
import { WebSocketServer, WebSocket } from "ws";
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

    private setupWebSocket(): void {
        this.wss.on("connection", (ws: WebSocketServer): void => {
            console.log("New WebSocket connection established");

            ws.on("message", async (message: string): Promise<void> => {
                console.log("Received:", message);
                console.log('Broj klijenata: ', this.clients.size);
                try {
                    return await this.handleMessage(message, ws);
                } catch (e) {
                    console.log(e, e.message);
                    throw e;
                }
            });
            ws.on("close", (): void => {
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

    private async handleMessage(message: string, ws: WebSocketServer): Promise<void> {
        if(message.toString().includes('move')) {
            console.log('Move called');
            try {
                return await this.handleMoveMessage(message);
            } catch (e) {
                console.log(e, e.message);
                throw e;
            }
        } else if(message.toString().includes('single-player')) {
            console.log('Single player move called');
            try {
                return await this.handleSinglePlayerMoveMessage(message);
            } catch (e) {
                console.log(e, e.message);
                throw e;
            }
        } else {
            this.clients.set(message, ws);
            return console.log('Broj klijenata (nakon dodavanja): ' + this.clients.size);
        }
    }

    private async handleMoveMessage(message: string): Promise<void> {
        const result = await this.moveController.handleWebSocketMessage(message);
        if (!result) {
            console.log('Error: could not handle the websocket message');
            return null;
        }

        if(result.success && result.gameOver) {
            return this.broadcastMessage('finish;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';' + result.draw);
        }

        if(result.success) {
            return this.broadcastMessage('move;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';' + result.gameOver.toString() + ';' + result.draw);
        }
    }

    private async handleSinglePlayerMoveMessage(message: string): Promise<void> {
        // user made move
        const result = await this.moveController.handleWebSocketMessage(message);
        if (!result) {
            console.log('Error: could not handle the websocket message');
            return null;
        }

        if (result.success && result.gameOver) {
            return this.broadcastMessage('single-player-finish;' + result.gameId + ';x;' + result.moveIndex +
                ';' + result.gameOver + ';' + '' + ';' + result.draw);
        }

        // now create a computer move
        const computerResult = await this.moveController.computerMove(message);
        if (!computerResult) {
            console.log('Error: could not make the computer move');
            return null;
        }

        if (computerResult.success && computerResult.gameOver) {
            return this.broadcastMessage('single-player-finish;' + result.gameId + ';y;' + result.moveIndex + ';' +
                computerResult.gameOver + ';' + computerResult.moveIndex + ';' + result.draw);
        }

        return this.broadcastMessage('single-player-move;' + result.gameId + ';' + result.player + ';' + result.moveIndex + ';'
            + result.gameOver.toString() + ';' + computerResult.moveIndex);
    }

    public broadcastMessage(message: string): void {
        this.clients.forEach((clientWs: WebSocket): void => {
            clientWs.send(message);
        });
    }
}
