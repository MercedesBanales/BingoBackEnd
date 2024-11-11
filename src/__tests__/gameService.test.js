import * as gameService from '../services/gamesService';
import * as gamesRepository from '../dataAccess/repositories/gamesRepository';
import * as cardsService from '../services/cardsService';
import * as usersService from '../services/userService';
import { StatusType } from '../services/gamesService';

jest.mock('../dataAccess/repositories/gamesRepository');
jest.mock('../services/cardsService');
jest.mock('../services/userService');

function generateMockCard() {
    const card = [];
    const ranges = [
      [1, 15],     
      [16, 30],    
      [31, 45],    
      [46, 60],    
      [61, 75]    
    ];
  
    ranges.forEach(([min, max]) => {
      const column = [];
      while (column.length < 5) { 
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!column.includes(number)) {
          column.push(number);
        }
      }
      card.push(column);
    });
  
    return card;
  }
  

describe('start', () => {
    it('should create a game and assign a card to each player', async () => {
      const mockPlayerIds = ['player1', 'player2'];
      const mockGameId = 'game123';
      
      gamesRepository.create.mockResolvedValue(mockGameId);
      cardsService.create.mockImplementation((player_id, game_id) => ({
        gameId: game_id,
        playerId: player_id,
        card: generateMockCard()
      }));
  
      const result = await gameService.start(mockPlayerIds);
  
      expect(gamesRepository.create).toHaveBeenCalledWith(mockPlayerIds);
      expect(cardsService.create).toHaveBeenCalledTimes(mockPlayerIds.length);
      expect(result).toBe(mockGameId);
    });
  });

  describe('play', () => {
    it('should update the card with the chosen number and return the play response', async () => {
      const mockPlayerId = 'player1';
      const mockGameId = 'game123';
      const coord_x = 1;
      const coord_y = 1;
      const mockCard = {
        gameId: mockGameId,
        playerId: mockPlayerId,
        card: generateMockCard()
      };
      mockCard.card[coord_x][coord_y] = 0; 
      cardsService.setChosenNumber.mockResolvedValue(mockCard);

      const result = await gameService.play(mockPlayerId, mockGameId, coord_x, coord_y);

      expect(cardsService.setChosenNumber).toHaveBeenCalledWith(mockPlayerId, mockGameId, coord_x, coord_y);
      expect(result).toEqual({
        card: mockCard.card,
        message: StatusType.PLAY,
        winner: null
      });
    });
  });
  
