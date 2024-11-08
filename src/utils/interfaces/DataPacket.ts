export interface DataPacket {
    data: { coord_x: number, coord_y: number, game_id: string } 
    | { card: number[][] | null, message: string | null} | null;
    type: 'REQUEST' | 'RESPONSE';
    action: 'PUT' | 'BINGO' | null;
    success: boolean;
}