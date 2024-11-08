export interface DataPacket {
    clientData: { coord_x: number, coord_y: number, value: number } | null;
    serverData: { card: number[][] }
    type: 'REQUEST' | 'RESPONSE';
    action: 'PUT' | 'BINGO';
}