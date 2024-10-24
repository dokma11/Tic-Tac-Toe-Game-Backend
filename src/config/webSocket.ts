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
        console.log('WebSocket service started');
        this.moveController = mController;
    }

    private setupWebSocket() {
        this.wss.on("connection", (ws) => {
            console.log("New WebSocket connection established");

            ws.on("message", async (message) => {
                console.log("Received:", message.toString());

                console.log('Velicina klijenata: ' + this.clients.size);
                console.log('unutar websocketa je playerid: ' + message.toString());

                // ovde sada moram dodati dakle deo koji ce da prepozna da li je porukar ecimo za sam potez i da onda na sosnovu toga pozove neku metodu u kontroleru za MOVE.
                if(message.toString().includes('move:')) {
                    console.log('Move called');
                    const result = await this.moveController.handleWebSocketMessage(message);

                    if(result.success) {
                        this.broadcastMessage('move;' + result.gameId + ';' + result.player + ';' + result.moveIndex);
                    }
                }
                else {
                    this.clients.set(message.toString(), ws);
                    console.log('Velicina klijenata (nakon dodavanja): ' + this.clients.size);
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
        if (clientWs) {
            clientWs.send(message);
        } else {
            console.log(`Client with playerId ${playerId} not found`);
        }
    }

    public broadcastMessage(message: string) {
        this.clients.forEach((clientWs) => {
            clientWs.send(message);
        });
    }
}
