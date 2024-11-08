import { CardDTO } from "../DTOs/cardDTO";

export interface PlayResponse {
    card: CardDTO | null;
    message: string;
}