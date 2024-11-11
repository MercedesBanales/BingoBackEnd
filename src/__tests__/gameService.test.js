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

  describe('bingo', () => {
    it('should notify the winner if the player wins', async () => {
      const mockPlayerId = 'player1';
      const mockGameId = 'game123';
      const mockCard = {
        gameId: mockGameId,
        playerId: mockPlayerId,
        card: generateMockCard()
      };
      cardsService.find.mockResolvedValue(mockCard);
      cardsService.checkWin.mockReturnValue(true);
      usersService.find.mockResolvedValue({ id: mockPlayerId, email: 'player1@example.com' });

      const result = await gameService.bingo(mockPlayerId, mockGameId);

      expect(cardsService.find).toHaveBeenCalledWith(mockPlayerId, mockGameId);
      expect(cardsService.checkWin).toHaveBeenCalledWith({card: mockCard.card, gameId: mockGameId, playerId: mockPlayerId});
      expect(usersService.find).toHaveBeenCalledWith({ where: { id: mockPlayerId } });
      expect(result).toEqual({
        card: mockCard.card,
        message: StatusType.WIN,
        winner: { id: mockPlayerId, email: 'player1@example.com' }
      });
    });

    it('should return disqualified if the player did not win', async () => {
      const mockPlayerId = 'player1';
      const mockGameId = 'game123';
      const mockCard = {
        gameId: mockGameId,
        playerId: mockPlayerId,
        card: generateMockCard()
      };
      cardsService.find.mockResolvedValue(mockCard);
      cardsService.checkWin.mockReturnValue(false);

      const result = await gameService.bingo(mockPlayerId, mockGameId);

      expect(result).toEqual({
        card: mockCard.card,
        message: StatusType.DISQUALIFIED,
        winner: null
      });
    });
  });

  describe('getCard', () => {
    it('should return the card for the player', async () => {
      const mockPlayerId = 'player1';
      const mockGameId = 'game123';
      const mockCard = {
        gameId: mockGameId,
        playerId: mockPlayerId,
        card: generateMockCard()
      };

      cardsService.find.mockResolvedValue(mockCard);

      const result = await gameService.getCard(mockPlayerId, mockGameId);

      expect(cardsService.find).toHaveBeenCalledWith(mockPlayerId, mockGameId);
      expect(result).toEqual(mockCard);
    });
  });

  describe('getPlayers', () => {
    it('should return the list of players for a given game', async () => {
      const mockGameId = 'game123';
      const mockPlayers = [
        { id: 'player1', email: 'player1@example.com' },
        { id: 'player2', email: 'player2@example.com' }
      ];

      gamesRepository.findMany.mockResolvedValue(mockPlayers);

      const result = await gameService.getPlayers(mockGameId);

      expect(gamesRepository.findMany).toHaveBeenCalledWith({ where: { GameId: mockGameId } });
      expect(result).toEqual(mockPlayers);
    });
  });

  
  
