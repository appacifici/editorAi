import { Socket, io as socketIOClient } from 'socket.io-client';

class SocketClient {
    private params: { [key: string]: string };
    private host: string;

    constructor() {
        this.params = {};        
        this.host = 'ws://nodebackendgpt:3002';

        process.argv.forEach((val) => {
            const param = val.split('=');
            this.params[param[0]] = param.length > 1 ? param[1] : '';
        });

        this.controlParameters();
    }

    private controlParameters(): void {        
        if (this.params['host']) {
            this.host = this.params['host'];
        }
    }

    public connectClient(cronName:string): void {                
        const socket: Socket = socketIOClient(this.host);
        console.info('eccomi: '+this.host);
        socket.on('connect', () => {
            console.info('Client connesso' );
        });
        socket.on('emitCommandServer', (data) => {
            socket.emit('emitCommandServerProcessExit', cronName);
            process.exit(1);            
        });
        socket.on('disconnect', () => {
            console.info('Client Disconnesso' );
        });
        socket.on('ping', function() {    
            let nowHidden = false;
            socket.emit('pongSocket', {'hidden': nowHidden, 'lastHidden' : false });
        });
    }
}

export default SocketClient;