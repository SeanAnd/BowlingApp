import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BowlingGameComponent } from './bowling.component';
import { Player } from '../interfaces/player';

describe('BowlingGameComponent', () => {
  let component: BowlingGameComponent;
  let fixture: ComponentFixture<BowlingGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BowlingGameComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BowlingGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should properly initialize players and frames on initialization', () => {
    expect(component.players.length).toBe(1);
    expect(component.players[0].name).toBe('Player 1');
    expect(component.players[0].frames.length).toBe(10);
  });

  it('should add a player with initialized frames', () => {
    component.addPlayer();

    expect(component.players.length).toBe(2);
    expect(component.players[1].name).toBe('Player 2');
    expect(component.players[1].frames.length).toBe(10);

    component.addPlayer();

    expect(component.players.length).toBe(3);
    expect(component.players[2].name).toBe('Player 3');
    expect(component.players[2].frames.length).toBe(10);
  });

  it('should switch players correctly', () => {
    component.addPlayer();

    expect(component.currentPlayerIndex).toBe(0);

    component.switchPlayer();
    expect(component.currentPlayerIndex).toBe(1);

    component.switchPlayer();
    expect(component.currentPlayerIndex).toBe(0);
  });

  it('should calculate frame scores for strikes and spares', () => {
    const player: Player = {
      name: 'Test Player 1',
      frames: [
        { rolls: [10, 0], score: 0 },
        { rolls: [5, 5], score: 0 },
        { rolls: [3, 4], score: 0 }
      ],
    };

    component.calculateFrameScores(player);

    expect(player.frames[0].score).toBe(15);
    expect(player.frames[1].score).toBe(13);
    expect(player.frames[2].score).toBe(7);
  });

  it('should correctly identify a strike', () => {
    expect(component.isStrike([10])).toBeTruthy();
    expect(component.isStrike([5, 5])).toBeFalsy();
  });

  it('should correctly identify a spare', () => {
    expect(component.isSpare([5, 5])).toBeTruthy();
    expect(component.isSpare([10, 0])).toBeFalsy();
    expect(component.isSpare([4, 5])).toBeFalsy();
  });

  it('should correctly identify a strike in the final turn', () => {
    const rollsWithStrike = [4, 3, 10];
    const rollsWithoutStrike = [4, 6, 7];

    const hasStrikeFinalTurn = component.isStrikeFinalTurn(rollsWithStrike);
    const hasNoStrikeFinalTurn = component.isStrikeFinalTurn(rollsWithoutStrike);

    expect(hasStrikeFinalTurn).toBeTruthy();
    expect(hasNoStrikeFinalTurn).toBeFalsy();
  });

  it('should calculate total scores for multiple players', () => {
    const player1: Player = {
      name: 'Player 1',
      frames: [
        { rolls: [10, 0], score: 20 },
        { rolls: [5, 5], score: 13 },
        { rolls: [3, 4], score: 7 }
      ],
    };
    const player2: Player = {
      name: 'Player 2',
      frames: [
        { rolls: [3, 0], score: 3 },
        { rolls: [1, 5], score: 6 },
        { rolls: [3, 2], score: 5 }
      ],
    };

    const totalScorePlayer1 = component.calculateTotalScore(player1);
    const totalScorePlayer2 = component.calculateTotalScore(player2);

    expect(totalScorePlayer1).toBe(40);
    expect(totalScorePlayer2).toBe(14);
  });

  it('should generate a random roll with correct pins based on previous rolls', () => {
    const previousRolls = [3, 5];
    const maxPins = 6;

    spyOn(Math, 'random').and.returnValue(0.4);

    const roll = component.generateRandomRoll(previousRolls, maxPins);

    expect(roll).toBe(2);
  });

  it('should generate a random roll with all pins if no previous rolls', () => {
    spyOn(Math, 'random').and.returnValue(0.7);

    const roll = component.generateRandomRoll();

    expect(roll).toBe(7);
  });

  it('should record 3 rolls and switch players when 2 rolls are recorded', () => {
    component.currentPlayerIndex = 0;
    component.addPlayer();
    spyOn(component, 'generateRandomRoll').and.returnValue(5);

    component.recordRoll();
    component.recordRoll();
    component.recordRoll();

    // Expectations for player change and frame rolls
    expect(component.currentPlayerIndex).toBe(1);
    expect(component.players[0].frames[0].rolls.length).toBe(2);
    expect(component.players[1].frames[0].rolls.length).toBe(1);
  });

  it('should record only 2 rolls on 10th frame if no strike or spare', () => {
    spyOn(component, 'generateRandomRoll').and.returnValue(1);

    for (let i = 0; i < 21; i++) {
      component.recordRoll();
    }

    expect(component.players[0].frames.reduce((total, frame) => total + frame.rolls.length, 0.00)).toBe(20);
  });

  it('should record 3 rolls on 10th frame if strike', () => {
    spyOn(component, 'generateRandomRoll').and.returnValue(10);

    for (let i = 0; i < 21; i++) {
      component.recordRoll();
    }

    expect(component.players[0].frames.reduce((total, frame) => total + frame.rolls.length, 0.00)).toBe(21);
  });

  it('should record 3 rolls on 10th frame if spare', () => {
    spyOn(component, 'generateRandomRoll').and.returnValue(5);

    for (let i = 0; i < 21; i++) {
      component.recordRoll();
    }

    expect(component.players[0].frames.reduce((total, frame) => total + frame.rolls.length, 0.00)).toBe(21);
  });

  it('should have expected score from sample', () => {
    spyOn(component, 'generateRandomRoll').and.returnValues(
      4, 3,
      7, 3,
      5, 2,
      8, 1,
      4, 6,
      2, 4,
      8, 0,
      8, 0,
      8, 2,
      10, 1, 7
    );
    console.log('player', component.players[0].frames)
    for (let i = 0; i < 21; i++) {
      component.recordRoll();
    }
    const totalScorePlayer1 = component.calculateTotalScore(component.players[0]);
    expect(component.players[0].frames[0].score).toBe(7);
    expect(component.players[0].frames[1].score).toBe(15);
    expect(component.players[0].frames[2].score).toBe(7);
    expect(component.players[0].frames[3].score).toBe(9);
    expect(component.players[0].frames[4].score).toBe(12);
    expect(component.players[0].frames[5].score).toBe(6);
    expect(component.players[0].frames[6].score).toBe(8);
    expect(component.players[0].frames[7].score).toBe(8);
    expect(component.players[0].frames[8].score).toBe(20);
    expect(component.players[0].frames[9].score).toBe(18);
    expect(component.players[0].frames.reduce((total, frame) => total + frame.rolls.length, 0.00)).toBe(21);
    expect(totalScorePlayer1).toBe(110);
  });

});
