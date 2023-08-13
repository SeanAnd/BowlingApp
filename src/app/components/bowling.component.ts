import { Component, OnInit } from '@angular/core';
import { Player } from '../interfaces/player';
import { Frame } from '../interfaces/frame';

@Component({
    selector: 'bowling',
    templateUrl: './bowling.component.html',
    styleUrls: ['./bowling.component.scss']
})
export class BowlingGameComponent implements OnInit {
    players: Player[] = [];
    currentPlayerIndex = 0;

    ngOnInit() {
        this.addPlayer();
    }

    addPlayer() {
        const newPlayer: Player = {
            name: 'Player ' + (this.players.length + 1),
            frames: []
        };

        //reset frames for every player if new ones are added
        this.players.forEach(p => {
            p.frames = [];
        })
        this.players.push(newPlayer);

        this.players.forEach(p => {
            for (let i = 0; i < 10; i++) {
                p.frames.push({
                    rolls: [],
                    score: 0
                })
            }
        });
        this.currentPlayerIndex = 0;
    }

    recordRoll() {
        const currentPlayer = this.players[this.currentPlayerIndex];

        if (currentPlayer) {
            const currentFrame = currentPlayer.frames.findIndex((f, i) => (f.rolls.length < 2 && i < 9) || (f.rolls.length < 3 && i >= 9));
            if (currentFrame < 0) {
                console.log('No more frames: ', currentFrame);
                return;
            }
            if (currentPlayer.frames[currentFrame].rolls.length < 2 && currentFrame < 9) {
                if (currentPlayer.frames[currentFrame].rolls.length === 0 || (currentFrame === 0) && currentPlayer.frames[currentFrame].rolls.length === 0) {
                    const roll = this.generateRandomRoll();
                    currentPlayer.frames[currentFrame].rolls.push(roll);
                } else {
                    const roll = this.generateRandomRoll(currentPlayer.frames[currentFrame].rolls);
                    currentPlayer.frames[currentFrame].rolls.push(roll);
                    this.switchPlayer();
                }
            } else {
                if (currentPlayer.frames[currentFrame].rolls.length === 2) {
                    if (this.isStrikeFinalTurn(currentPlayer.frames[currentFrame].rolls) || this.isSpare(currentPlayer.frames[currentFrame].rolls)) {
                        let roll = 0;
                        var lastRoll = currentPlayer.frames[currentFrame].rolls[currentPlayer.frames[currentFrame].rolls.length - 1]
                        if (this.isStrike(currentPlayer.frames[currentFrame].rolls) && !this.isSpare(currentPlayer.frames[currentFrame].rolls) && lastRoll !== 10) {
                            roll = this.generateRandomRoll(currentPlayer.frames[currentFrame].rolls);
                        } else {
                            roll = this.generateRandomRoll();
                        }
                        currentPlayer.frames[currentFrame].rolls.push(roll);
                    }
                    this.switchPlayer();
                } else {
                    if (currentPlayer.frames[currentFrame].rolls.length === 0) {
                        const roll = this.generateRandomRoll();
                        currentPlayer.frames[currentFrame].rolls.push(roll);
                    } else {
                        const roll = this.generateRandomRoll(currentPlayer.frames[currentFrame].rolls);
                        currentPlayer.frames[currentFrame].rolls.push(roll);
                    }
                }
            }
            this.calculateFrameScores(currentPlayer);
        }
    }

    generateRandomRoll(previousRolls: number[] = [], maxPins: number = 11): number {
        if (previousRolls.length > 0 && !this.isStrike(previousRolls)) {
            const lastRoll = previousRolls[previousRolls.length - 1];
            maxPins = Math.min(maxPins, 11 - lastRoll);
        }
        return Math.floor(Math.random() * maxPins);
    }

    calculateFrameScores(player: Player): void {
        player.frames.forEach((frame, frameIndex) => {
            let frameScore = frame.rolls.reduce((acc, roll) => acc + roll, 0);

            if (frame.rolls.length === 2 && frameScore >= 10) {
                if (frameIndex < 9) {
                    const nextFrame = player.frames[frameIndex + 1];
                    frameScore += nextFrame.rolls[0] || 0;
                } else {
                    frameScore += frame.rolls[2] || 0;
                }
            } else if (frame.rolls.length === 1 && frameScore === 10) {
                if (frameIndex < 9) {
                    const nextFrame = player.frames[frameIndex + 1];
                    frameScore += nextFrame.rolls.reduce((acc, roll) => acc + roll, 0);
                } else {
                    frameScore += frame.rolls[1] + (frame.rolls[2] || 0);
                }
            }
            frame.score = frameScore;
        });
    }

    isStrike(rolls: number[]): boolean {
        return rolls[0] === 10;
    }

    isStrikeFinalTurn(rolls: number[]): boolean {
        return rolls.includes(10);
    }

    isSpare(rolls: number[]): boolean {
        return !rolls.slice(0, 2).includes(10) && rolls[0] + rolls[1] === 10;
    }

    calculateTotalScore(player: Player): number {
        return player.frames.reduce((total, frame) => total + frame.score, 0.00);
    }

    switchPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
}