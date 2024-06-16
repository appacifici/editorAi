import { Socket, io as socketIOClient } from 'socket.io-client';
import { BACKEND_SOCKET } 	            from '../constants';

let lastHidden          = false; 
const socket: Socket    = socketIOClient(BACKEND_SOCKET, { secure: false, rejectUnauthorized: false });
socket.on('connect', () => {
    console.info('Client connesso: '+BACKEND_SOCKET);        
});

socket.on('error', (error) => {
    console.error('Errore di connessione', error); // Modifica per riflettere l'errore
    
});
socket.on('emitCommandServerProcessExit', (data) => {        
    alert(data+ ' - Riavviato');
});    

socket.on('ping', function() {    
    let nowHidden = false;
    socket.emit('pongSocket', {'hidden': nowHidden, 'lastHidden' : lastHidden });
});

const emitCommand = (command:string) => {
    
    socket.emit('emitCommandClient', {'action': command });
}

export {emitCommand};