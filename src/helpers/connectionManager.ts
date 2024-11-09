import { DataPacket } from "../utils/interfaces/DataPacket";
import { NotFoundException } from "../validators/exceptions/notFoundException";

export interface Connection {
    socket: WebSocket;
    player_id: string;
    status: 'WAITING' | 'AVAILABLE' | 'PLAYING';
    game_id: string | null;
}

let connections: Connection[] = [];
let gameStarting = false;

export const isGameStarting = (): boolean => gameStarting;
export const setGameStarting = (status: boolean): void => {
    gameStarting = status;
};


export const connect = (socket: WebSocket, player_id: string) : void => {
    connections.push({ socket, player_id, status: 'WAITING', game_id: null });
}

export const start = (game_id: string) : void => {
    connections.forEach(connection => {
        if (connection.status === 'AVAILABLE') {
            connection.status = 'PLAYING';
            connection.game_id = game_id;
            send(connection.player_id, true, 'Game started')
        }
    });
}

export const disconnect = (socket: WebSocket) : void => {
    connections = connections.filter(connection => connection.socket !== socket);
}

export const getAvailablePlayersInLobby = () : Connection[] => {
    return filterConnections(connection => connection.status === 'AVAILABLE');
}

export const send = (player_id: string,  success: boolean, message?: string) : void=> {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) {
        const data = JSON.stringify({ data: { message }, 
            type: 'RESPONSE', 
            action: null,
            success: success} as DataPacket);
        connection.socket.send(data);
    }
}

export const broadcast = (game_id: string, message: string, success: boolean) : void => {
    const connectionsInLobby = filterConnections(connection => connection.game_id === game_id);
    connectionsInLobby.forEach(connection => send(connection.player_id, success, message));
}

export const disconnectAll = () : void=> {
    const connectionsInRoom = filterConnections(connection => connection.status === 'WAITING');
    connectionsInRoom.forEach(connection => connection.socket.close());
}

export const setAvailable = (player_id: string) : void => {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) connection.status = 'AVAILABLE';
    else throw new NotFoundException('Player not found');
}

export const getCurrentPlayer = (player_id: string) : Connection => {
    const connection = connections.find(connection => connection.player_id === player_id);
    if (connection) return connection;
    else throw new NotFoundException('Player not found');
}

const filterConnections = (condition: (connection: Connection) => boolean) : Connection[] => {
    return connections.filter(condition);
}
