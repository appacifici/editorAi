import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import dotenv from 'dotenv';

const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
if (result.error) {
    console.log(result.error);
}

class SocketServer {
    private aliveSockets: { [key: string]: any };
    private app: HTTPServer;
    private io: SocketIOServer;
    public isConnected: boolean;

    constructor(port: number) {
        this.aliveSockets = {};

        this.app = createServer();

        this.io = new SocketIOServer(this.app, {
            cors: {
                origin: "*", // Aggiusta secondo la tua politica CORS
                methods: ["GET", "POST"]
            },
            transports: ['websocket', 'polling']
        });

        this.app.listen(port, () => {
            console.log(`Socket server is listening on port ${port}`);
        });
        this.isConnected = false;

        setInterval(() => {
            this.io.sockets.emit('ping', { timestamp: new Date().getTime() });
        }, 10000); // 10 seconds

        setInterval(() => {
            for (const key in this.aliveSockets) {
                const aliveSocket = this.aliveSockets[key];
                if (!aliveSocket) {
                    return;
                }

                const lastPongTime = String(aliveSocket.lastPong).split('.');
                const nowPongTime = String(new Date().getTime() / 1000).split('.');

                if (parseInt(lastPongTime[0]) + 10 < parseInt(nowPongTime[0])) {
                    aliveSocket.socket.disconnect();
                    delete this.aliveSockets[key];
                    console.log(`Socket ${key} disconnected due to timeout`);
                }
            }
        }, 5000); // 5 seconds
    }

    connectClientSocket(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('A client connected:', socket.id);
            // if (!this.authorizedReferer(socket)) {
            //     console.log('Client disconnected due to unauthorized referer:', socket.id);
            //     socket.disconnect();
            //     return;
            // }

            this.isConnected = true;

            socket.on('forceDisconnect', () => {
                socket.disconnect();
                console.log('Client disconnected by force:', socket.id);
                delete this.aliveSockets[socket.id];
            });

            this.aliveSockets[socket.id] = { socket: socket, id: socket.id, lastPong: new Date().getTime() / 1000 };

            socket.on('pongSocket', (data: any) => {
                this.aliveSockets[socket.id].lastPong = new Date().getTime() / 1000;
                console.log(data);
                if (data.hidden) {
                    console.log('Client disconnected due to hidden data:', socket.id);
                    socket.disconnect();
                    delete this.aliveSockets[socket.id];
                }
            });

            socket.on('emitCommandClient', (data: any) => {                                 
                this.io.sockets.emit('emitCommandServer', { action: data.action });
            });

            socket.on('emitCommandServerProcessExit', (data: any) => {                                 
                this.io.sockets.emit('emitCommandServerProcessExit', data);
            });

            socket.on('disconnect', (reason) => {
                console.log(`Client disconnected: ${socket.id}, reasons: ${reason}`);
                delete this.aliveSockets[socket.id];
            });
        });
    }

    authorizedReferer(socket: Socket): boolean {
        let authorized = false;
        let referer: string | null = null;

        const refererHeader = socket.request.headers.referer;
        const originHeader = socket.request.headers.origin;

        if (typeof refererHeader === 'string' && refererHeader !== '') {
            referer = refererHeader;
        } else if (typeof originHeader === 'string' && originHeader !== '') {
            referer = originHeader;
        }

        if (!referer) {
            return false;
        }

        //referer = this.rtrim(referer, '/').replace('http://', '').split('/')[0];
        //referer = 'http://' + referer;

        console.info('Referer:', referer);

        switch (referer) {
            case 'http://192.168.1.74:3000/':
                authorized = true;
                break;
            case 'https://www.direttagol.it/':
                authorized = true;
                break;
        }
        return authorized;
    }

    sendDataLive(jsonData: string): void {
        this.io.sockets.emit('dataLive', jsonData);
        //console.log('jsonData  =>' + jsonData);
    }

    rtrim(str: string, char: string): string {
        let end = str.length - 1;
        while (end >= 0 && str[end] === char) {
            end--;
        }
        return str.substring(0, end + 1);
    }
}

export default SocketServer;
