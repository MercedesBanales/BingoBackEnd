import { DataPacket } from "../utils/interfaces/DataPacket";
import { NotFoundException } from "../validators/exceptions/notFoundException";
import * as gamesService from '../services/gamesService';
import { UserDTO } from "../utils/DTOs/userDTO";
import * as gameHandler from '../handlers/gameHandler';

export interface Connection {
    socket: WebSocket;
    player_id: string;
    status: 'WAITING' | 'AVAILABLE' | 'PLAYING';
    game_id: string | null;
}

export interface Response {
    player_id: string;
    success: boolean;
    message?: string;
    action?: string;
    game_id?: string;
    card?: number[][];
    players?: UserDTO[];
    sequence?: string[];
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
            const res = { player_id: connection.player_id, success: true, message: 'Game started', game_id: game_id } as Response;
            send(res)
        }
    });
    gameHandler.startGameWithRandomNumbers(game_id);
}

export const disconnect = (condition: (connection: Connection) => boolean) : void => {
    const connectionsToClose = filterConnections(condition);
    connectionsToClose.forEach(connection => connection.socket.close());
    connections = connections.filter(connection => !condition(connection));
}

export const getAvailablePlayersInLobby = () : Connection[] => {
    return filterConnections(connection => connection.status === 'AVAILABLE');
}

export const send = (res: Response) : void=> {
    const connection = connections.find(connection => connection.player_id === res.player_id);
    if (connection) {
        const data = JSON.stringify({ data: { message: res.message, game_id: res.game_id, card: res.card, players: res.players, sequence: res.sequence }, 
            type: 'RESPONSE', 
            action: res.action, 
            success: res.success } as DataPacket);
        connection.socket.send(data);
    }
}

export const broadcast = (game_id: string, action: string, message: string, success: boolean, sequence?: string[]) : void => {
    const connectionsInLobby = filterConnections(connection => connection.game_id === game_id);
    connectionsInLobby.forEach(connection => {
        const res = { player_id: connection.player_id, success, action, game_id, message, sequence } as Response;
        send(res)
    });
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

export const getGamePlayers = async (game_id: string) : Promise<UserDTO[]> => {
    return await gamesService.getPlayers(game_id);
}

const filterConnections = (condition: (connection: Connection) => boolean) : Connection[] => {
    return connections.filter(condition);
}

export const find = (game_id: string) : boolean => {
    return connections.some(connection => connection.game_id === game_id);
}
