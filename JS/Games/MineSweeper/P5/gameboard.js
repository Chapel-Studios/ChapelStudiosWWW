'use strict';
//require('../grammar-helper')

function GameBoard(canvasWidth, canvasHeight, cellWidth
    // Handles
    , mineOptionHandle, resetHandle
    , timerHandle, flagDisplayHandle
    , exposedDisplayHandle, unflaggedHandle
    , volumeSliderHandle, scoreBoardHandle
    , winPercentHandle
) {
    this.ColumnCount = Math.floor(canvasWidth / cellWidth);
    this.RowCount = Math.floor(canvasHeight / cellWidth);
    this.CellSize = cellWidth;
    this.WIN_TEXT = "Grats, Warrior of Light!";
    this.WIN_COLOR = [0, 255, 100];
    this.WIN_FILL = [0, 255, 100];
    this.LOSE_TEXT = "You Lose, Your Soul Is Mine!";
    this.LOSE_COLOR = [255, 0, 0];
    this.LOSE_FILL = [255, 0, 0];
    this.ActiveEndText = this.LOSE_TEXT;
    this.ActiveEndColor = this.LOSE_COLOR;
    this.ActiveEndFill = this.LOSE_FILL;
    this.MaxMineCount = 75;
    this._ScoreBoardSize = 5;
    this._CurrentVolumeLevel = 0.5;
    this._GameStartTime = null;
    this._TimerID = null;
    this._VolumeScale = 0.23;
    this._VolumeStartPosition = 50;
    this._MouseStartLocation = [-1, -1];
    this._NewScoreRank = 0;
    this.PlayInfo = {};

    this.Assets = {
        Images: {
            Flag: null
        }
        , Sounds: {
            Win: null
            , Lose: null
        }
    }
    this.Handles = {
        Reset: resetHandle
        , Timer: timerHandle
        , FlagDisplay: flagDisplayHandle
        , ExposedDisplay: exposedDisplayHandle
        , UnflaggedDisplay: unflaggedHandle
        , MaxMineCountOption: mineOptionHandle
        , Volume: volumeSliderHandle
        , ScoreBoard: scoreBoardHandle
        , WinPercent: winPercentHandle
    }
}

//--> Methods
// Setup
GameBoard.prototype.PlaceMines = function (exemptX, exemptY) {
    let placedMines = 0;
    while (placedMines < this.MaxMineCount) {
        function rdm(max, min = 0) {
            return Math.floor(Math.random() * (max - min) + min);
        }

        let c = rdm(this.ColumnCount);
        let r = rdm(this.RowCount);

        if (!this.Cells[c][r].IsDangerous
            && !(c === exemptX && r === exemptY)
        ) {
            this.Cells[c][r].IsDangerous = true;
            placedMines++;
        }
    }
}

GameBoard.prototype.SetDangerLevels = function () {
    let self = this;
    this.RunCallBackOnAllCells(function (cellLocationInfo) {
        self.Cells[cellLocationInfo[0]][cellLocationInfo[1]].DangerLevel = self.GetDangerLevel(...cellLocationInfo);
    });
}

GameBoard.prototype.SetNewBoard = function () {
    let self = this;
    self.IsBoardPrepared = false;
    self.IsEndSplashShowing = false;
    self.Timer = 0;
    this._NewScoreRank = 0;
    self.CellCount = 0;

    self.Cells = new Array(self.ColumnCount);
    for (let i = 0; i < self.ColumnCount; i++) {
        self.Cells[i] = new Array(self.RowCount);
    }

    self.RunCallBackOnAllCells(function (coords) {
        let xPos = coords[0] * self.CellSize;
        let yPos = coords[1] * self.CellSize;
        self.CellCount++;
        self.Cells[coords[0]][coords[1]] = new Cell(xPos, yPos, self.CellSize);
    });

    self.UpdateFlagCount(0);
    self.UpdateRevealCount(0);
    self.ResetTimer();
    document.getElementById(self.Handles.Timer).innerText = ConvertTimerToString(self.Timer);

    self.IsGameActive = true;
};

GameBoard.prototype.PrepareBoard = function (clickLocation) {
    this.PlaceMines(...clickLocation);
    this.SetDangerLevels();
    this._GameStartTime = new Date().getTime();
    this._TimerID = setInterval(this.UpdateTimer.bind(this), 5);
    this.IsBoardPrepared = true;
}

// Utilities
function convertToHex(int) {
    let result = int.toString(16);
    if (result.length === 1) {
        result = "0" + result;
    }
    return result;
}

GameBoard.prototype.TranslateXY = function (x, y) {
    return [
        Math.floor(x / this.CellSize)
        , Math.floor(y / this.CellSize)
    ]
}

GameBoard.prototype.RunCallBackOnAllCells = function (callback) {
    for (let i = 0; i < this.ColumnCount; i++) {
        for (let n = 0; n < this.RowCount; n++) {
            callback([i, n]);
        }
    }
};

GameBoard.prototype.RunCallBackOnAdjacentCells = function (centerX, centerY, callback) {
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            let newX = centerX + xOffset;
            let newY = centerY + yOffset;
            if (newY >= 0 && newY < this.RowCount
                && newX >= 0 && newX < this.ColumnCount
                && !(newX === centerX && newY === centerY)
            ) {
                callback(newX, newY);
            }
        }
    }
}

GameBoard.prototype.GetDangerLevel = function (centerX, centerY) {
    if (this.Cells[centerX][centerY].IsDangerous) {
        return -1;
    }
    let total = 0;
    let self = this;
    this.RunCallBackOnAdjacentCells(centerX, centerY, function (newX, newY) {
        if (self.Cells[newX][newY].IsDangerous) {
            total++;
        }
    })

    return total;
}

GameBoard.prototype.GetCurrentHash = function () {
    return convertToHex(this.MaxMineCount);
}

GameBoard.prototype.GetCurrentPlayInfo = function () {
    let currentHash = this.GetCurrentHash();
    if (this.PlayInfo[currentHash] === null || this.PlayInfo[currentHash] === undefined) {
        this.PlayInfo[currentHash] = new PlayInfo(this._ScoreBoardSize);
        localStorage.setItem('playInfo', JSON.stringify(this.PlayInfo));
    }
    return this.PlayInfo[currentHash];
}

GameBoard.prototype.UpdatePlayInfo = function (label, data) {
    this.GetCurrentPlayInfo()[label] = data;
    localStorage.setItem('playInfo', JSON.stringify(this.PlayInfo));
}

function sortScores(a, b) {
    return (a === null) - (b === null) || +(a > b) || -(a < b);
}

GameBoard.prototype.AddToScoreBoard = function () {
    if (this.Timer === 0) this.Timer++;
    let activeScores = this.GetCurrentPlayInfo().scores;
    let lastSlot = activeScores[this._ScoreBoardSize - 1];
    if (lastSlot === undefined || this.Timer < lastSlot || lastSlot === null) {
        activeScores.pop();
        activeScores.push(this.Timer);
        activeScores.sort(sortScores);
        this._NewScoreRank = activeScores.indexOf(this.Timer) + 1;
        this.UpdatePlayInfo('scores', activeScores);
        this.UpdateScoreBoard();
    }
}

GameBoard.prototype.GatherDataFromStorage = function () {
    let playInfo = localStorage.getItem('playInfo');
    if (playInfo) {
        this.PlayInfo = JSON.parse(playInfo);
    }
    let volume = localStorage.getItem('volume');
    if (volume) {
        this._VolumeStartPosition = Number.parseInt(volume);
    }
    let mineCount = localStorage.getItem('mineCount');
    if (mineCount) {
        this.MaxMineCount = Number.parseInt(mineCount);
    }
}

GameBoard.prototype.Reset = function () {
    if (this.IsGameActive && this.IsBoardPrepared) {
        this.UpdatePlayInfo('losses', this.GetCurrentPlayInfo().losses + 1);
    }
    this.StopAudio();
    this.SetNewBoard();
    this.UpdateScoreBoard();
    this.UpdateWinPercentage();
}

// Timer
function ConvertTimerToString(timeInMS) {
    let timerSeconds = Math.floor(timeInMS / 1000);
    let min = Math.floor(timerSeconds / 60);
    let displayHundredths = Math.round((timeInMS % 1000) / 10);
    let displaySec = timerSeconds % 60;
    let displayMin = min;
    let displayHour = null;
    let result = "";

    if (min > 60) {
        displayHour = Math.floor(min / 60);
        displayMin = min % 60;
    }

    if (displaySec.toString().length < 2) {
        displaySec = "0" + displaySec;
    }

    if (displayHundredths.toString().length === 1) {
        displayHundredths = displayHundredths + "0";
    }
    else if (displayHundredths === 100) {
        displayHundredths = "00";
    }

    if (!!displayHour) {
        result += displayHour + ":";
    }

    result += displayMin + ":" + displaySec + "." + displayHundredths;

    return result;
}

GameBoard.prototype.StopTimer = function () {
    if (!!this._TimerID) {
        clearInterval(this._TimerID);
        this._TimerID = null;
    }
}

GameBoard.prototype.ResetTimer = function () {
    this.StopTimer();
    this.Timer = 0;
    document.getElementById(this.Handles.Timer).innerText = ConvertTimerToString(this.Timer);
}

// Audio
GameBoard.prototype.PlayAudio = function (soundPointer) {
    if (this._ActiveAudioTrack && this._ActiveAudioTrack.isPlaying()) {
        this._ActiveAudioTrack.stop();
    }
    if (!soundPointer) return;
    this._ActiveAudioTrack = soundPointer;
    this._ActiveAudioTrack.setVolume(this._CurrentVolumeLevel);
    this._ActiveAudioTrack.play();
}

GameBoard.prototype.StopAudio = function () {
    if (this._ActiveAudioTrack && this._ActiveAudioTrack.isPlaying()) {
        this._ActiveAudioTrack.stop();
    }
}

GameBoard.prototype.SetVolume = function (newLvl) {
    this._CurrentVolumeLevel = newLvl * this._VolumeScale;
    if (this._ActiveAudioTrack && this._ActiveAudioTrack.isPlaying()) {
        this._ActiveAudioTrack.setVolume(this._CurrentVolumeLevel);
    }
}

// Update Display Functions
GameBoard.prototype.Show = function () {
    let self = this;
    this.RunCallBackOnAllCells(function (coords) {
        self.Cells[coords[0]][coords[1]].Show();
    });

    if (this.IsEndSplashShowing) {
        push();
        rectMode(RADIUS);
        fill(0);
        strokeWeight(5);
        stroke(...this.ActiveEndColor);
        rect(width / 2, height / 2, width, 60);
        rectMode(CORNER);
        noStroke();
        fill(...this.ActiveEndFill);
        textSize(30);
        textAlign(CENTER, CENTER);
        text(this.ActiveEndText, 0, -5, width, height);
        if (this._NewScoreRank > 0) {
            let ordial = "th";
            if (this._NewScoreRank === 3) {
                ordial = 'rd'
            }
            else if (this._NewScoreRank === 2) {
                ordial = 'nd'
            }
            else if (this._NewScoreRank === 1) {
                ordial = 'st'
            }

            textSize(20);
            textAlign(CENTER, CENTER);
            text(`You placed ${this._NewScoreRank + ordial} on the leader board!`, 0, 30, width, height);
        }
        pop();
    }
}

GameBoard.prototype.UpdateFlagCount = function (newVal) {
    if (typeof newVal === "number") {
        this.FlagCount = newVal;
    }
    else if (newVal === false) {
        this.FlagCount--;
    }
    else {
        this.FlagCount++;
    }
    document.getElementById(this.Handles.FlagDisplay).innerText = `${this.FlagCount} / ${this.MaxMineCount}`;
    this.UpdateUnflaggedMinesDisplay();
}

GameBoard.prototype.UpdateUnflaggedMinesDisplay = function () {
    let unflagged = this.MaxMineCount - this.FlagCount;

    document.getElementById(this.Handles.UnflaggedDisplay).innerText = `${unflagged} / ${this.MaxMineCount}`;
}

GameBoard.prototype.UpdateRevealCount = function (newVal) {
    if (typeof newVal === "number") {
        this.RevealCount = newVal;
    }
    else {
        this.RevealCount++;
    }
    document.getElementById(this.Handles.ExposedDisplay).innerText = `${this.RevealCount} / ${(this.CellCount - this.MaxMineCount)}`;
    this.UpdateUnflaggedMinesDisplay();
}

GameBoard.prototype.UpdateTimer = function () {
    this.Timer = new Date().getTime() - this._GameStartTime;
    document.getElementById(this.Handles.Timer).innerText = ConvertTimerToString(this.Timer);
}

GameBoard.prototype.UpdateScoreBoard = function () {
    let ulData = `High Scores for ${this.MaxMineCount} Mine${this.MaxMineCount > 1 ? "s" : ""}`;
    let scores = this.GetCurrentPlayInfo().scores;
    let scorePos = 1;

    if (scores && scores.length > 0) {
        for (let i = 0; i < scores.length; i++) {
            if (scores[i] !== undefined && scores[i] !== null) {
                let scoretext = scores[i] === 1 ? "Instant Win!" : ConvertTimerToString(scores[i]);
                scorePos = i === 0 || scores[i] === scores[i - 1] ? scorePos : i + 1;
                let suffix = NSJ.GrammerHelper.GetOrdinalSuffix(scorePos);
                ulData += `<li><span>${scorePos}${suffix}</span> &bull; ${scoretext}</li>`;
            }
        }
    }
    else {
        ulData += `<li>There are no wins for ${this.MaxMineCount} mines yet.</li>`
    }
    document.getElementById(this.Handles.ScoreBoard).innerHTML = ulData;
}

GameBoard.prototype.UpdateWinPercentage = function () {
    let wins = this.GetCurrentPlayInfo().wins;
    let losses = this.GetCurrentPlayInfo().losses;
    let totalGames = (wins + losses);
    let winPercent = totalGames === 0 ? 0 : (wins / totalGames) * 100;
    document.getElementById(this.Handles.WinPercent).innerText = winPercent.toFixed(2);
}

// GamePlay
GameBoard.prototype.ClickStart = function (mouseX, mouseY, mouseBtn) {
    this._MouseStartLocation = this.TranslateXY(mouseX, mouseY);
}

GameBoard.prototype.ClickEnd = function (mouseX, mouseY, mouseBtn) {
    let self = this;
    if (this.IsGameActive) {
        let clickLocation = this.TranslateXY(mouseX, mouseY);
        if (clickLocation.toString() === this._MouseStartLocation.toString()) {
            function handleClick(coords) {
                let cell = self.Cells[coords[0]][coords[1]];
                if (!cell.IsFlagged) {
                    if (cell.IsDangerous) {
                        cell.Reveal();
                        self.Explode();
                    }
                    else if (!cell.IsRevealed) {
                        cell.Reveal();
                        self.CheckForWin();
                        if (cell.DangerLevel === 0) {
                            self.RunCallBackOnAdjacentCells(...coords, function (newX, newY) {
                                handleClick([newX, newY]);
                            });
                        }
                    }
                }
            }

            if (mouseBtn === LEFT) {
                if (!this.IsBoardPrepared) {
                    this.PrepareBoard(clickLocation);
                }
                handleClick(clickLocation);
            }
            else if (mouseButton === RIGHT) {
                let cell = self.Cells[clickLocation[0]][clickLocation[1]];
                if (!cell.IsRevealed) {
                    cell.ToggleFlag();
                    self.UpdateFlagCount(cell.IsFlagged);
                }
                else { // AoE Click
                    self.RunCallBackOnAdjacentCells(...clickLocation, function (newX, newY) {
                        handleClick([newX, newY]);
                    })
                }

            }
        }
    }
    else {
        this.IsEndSplashShowing = !this.IsEndSplashShowing;
    }
}

GameBoard.prototype.Explode = function () {
    this.PlayAudio(this.Assets.Sounds.Lose);
    this.EndGame(false);
}

GameBoard.prototype.CheckForWin = function () {
    this.UpdateRevealCount();

    if (this.RevealCount + this.MaxMineCount === this.CellCount) {
        this.PlayAudio(this.Assets.Sounds.Win);
        this.EndGame(true);
    }
}

GameBoard.prototype.EndGame = function (wasWin) {
    let self = this;
    this.StopTimer();
    this.RunCallBackOnAllCells(function (cellLocationInfo) {
        self.Cells[cellLocationInfo[0]][cellLocationInfo[1]].Reveal(true, wasWin);
    });
    this.IsGameActive = false;
    this.IsEndSplashShowing = true;
    if (wasWin) {
        this.ActiveEndText = this.WIN_TEXT;
        this.ActiveEndColor = this.WIN_COLOR;
        this.ActiveEndFill = this.WIN_FILL;
        this.AddToScoreBoard();
        this.UpdatePlayInfo('wins', this.GetCurrentPlayInfo().wins + 1);
    }
    else {
        this.ActiveEndText = this.LOSE_TEXT;
        this.ActiveEndColor = this.LOSE_COLOR;
        this.ActiveEndFill = this.LOSE_FILL;
        this.UpdatePlayInfo('losses', this.GetCurrentPlayInfo().losses + 1);
    }
    this.UpdateWinPercentage();
}
//--> End Methods

// Instructions
GameBoard.prototype.Initialize = function () {
    let self = this;
    //set const for reused elements
    const resetBtn = document.getElementById(self.Handles.Reset);
    const vol = document.getElementById(self.Handles.Volume);
    const maxMines = document.getElementById(self.Handles.MaxMineCountOption);
    // Set Events
    resetBtn.onclick = function () {
        self.Reset();
        if (resetBtn.innerHTML == "Apply") {
            resetBtn.innerHTML = "Reset";
        }
    };
    vol.onchange = function () {
        let newVolume = this.value / 100;
        self.SetVolume(newVolume);
        localStorage.setItem('volume', this.value)
    };
    maxMines.onchange = function () {
        let newMax = Number.parseInt(this.value);
        if (newMax && newMax !== self.MaxMineCount) {
            self.MaxMineCount = newMax;
            localStorage.setItem('mineCount', newMax);
            resetBtn.innerHTML = "Apply";
        }
        else {
            resetBtn.innerHTML = "Reset";
        }
    };
    // Load Data
    self.GatherDataFromStorage();
    // Set Data
    maxMines.value = this.MaxMineCount;
    maxMines.onchange();
    vol.value = this._VolumeStartPosition;
    vol.onchange();
    self.SetNewBoard();
    self.UpdateScoreBoard();
    self.UpdateWinPercentage();
}