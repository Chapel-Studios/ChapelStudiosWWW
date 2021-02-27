'use strict'


class KlondikeGameBoard {
    // Elements
    _handTemplate = document.getElementById("HandTemplate");
    _drawPile = document.getElementById("DrawPile");
    _dragBox = document.getElementById("DragBox");
    _gameboard = document.getElementById("Playfield");
    _suitImageTemplate = document.getElementById("SuitImageTemplate");
    _winScreen = document.getElementById("WinScreen");
    _winRatioDisplay = document.getElementById("WinInfo");
        
    Deck;
    Moves;
    DrawCount;
    AudioController;
    Wins;
    Loses;
    IsActive;

    DealCards = () => {
        // Fill Stacks
        for (let i = 0; i < 7; i++) {
            // Create tier effect
            for (let n = i; n < 7; n++) {
                let card = CSTools.HTMLHelper.GetDeepestChild("#DrawPile .playing-card:not(.empty)");
                // Flip Top Cards
                if (i == n) {
                    card.classList.add("show");
                    // CSS Work-Around (ToDo: Fixed in 4!)
                    card.classList.add("bottom-card");
                }
                CSTools.HTMLHelper.GetDeepestChild(`#Stack${n + 1} .handle`).appendChild(card);
            }
        }
        this.IsActive = true;
    }

    ResetGame = () => {
        this._winScreen.hidden = true;
        this.AudioController.Stop();
        this.Deck.PickUp();
        this.Moves.ClearHistory();
        this.Deck.Shuffle();
        if (this.IsActive) {
            this.UpdateWins(false);
        }
    }

    InitialBindings = () => {
        // Draw Functions
        this._drawPile.querySelector(".drawpile-handle").addEventListener("click", () => {
            if (document.querySelectorAll("#DrawPile .playing-card").length != 53) {
                this.Moves.NewDraw(this.DrawCount);
            }
            else {
                this.DealCards();
            }
        });

        // Menu Functions
        document.getElementById("Reset").addEventListener('click', () => {
            this.ResetGame();
        });

        const mute = document.getElementById("Mute");
        mute.checked = this.AudioController.IsMuted;
        mute.addEventListener('change', () => {
            this.AudioController.Mute(event.target.checked);
        });

        // Win Screen functionality
        this._winScreen.addEventListener('click', () => {
            this._winScreen.hidden = true;
            this.ResetGame();
        })
    }

    CheckForWin = () => {
        if (document.querySelectorAll(".run .playing-card.show").length == 52) {
            // Win is confirmed
            this.Celebrate();
        }
    }

    Celebrate = () => {
        this.IsActive = false;
        this.UpdateWins(true);
        this._winScreen.hidden = false;
        this.AudioController.Play("winSong");
    }

    UpdateCardBack = (cardBack) => {
        this.Deck.SetBackImage(cardBack);
    }

    UpdateWins = (isWin) => {
        if (isWin) {
            this.Wins++;
            localStorage.setItem('klondike-wins', this.Wins);
        }
        else {
            this.Loses++;
            localStorage.setItem('klondike-loses', this.Loses);
        }
        this.UpdateWinsDisplay();
    }

    UpdateWinsDisplay = () => {
        const total = this.Wins + this.Loses;
        this._winRatioDisplay.innerHTML = `${this.Wins}/${total}  |  ${total === 0 ? 0 : parseFloat((this.Wins / total * 100).toFixed(2))}%`;
    }

    constructor(options) {
        this.IsActive = false;
        this.Wins = parseInt(localStorage.getItem('klondike-wins')) || 0;
        this.Loses = parseInt(localStorage.getItem('klondike-loses')) || 0;
        this.DrawCount = options.drawCount;

        this.Moves = new KlondikeMoveList(
            this._dragBox,
            this.CheckForWin,
            this._handTemplate
        );
        this.Deck = new Deck(
            this._drawPile,
            (event) => {
                CSTools.HTMLHelper.DoubleClickHandler(this.Moves.StartMove, this.Moves.DblClickMove, event);
            },
            this.Moves.FinishMove,
            [ ".stack", ".run" ],
            options.cardBack
        );
        this.AudioController = new AudioController(new AudioTrack("winSong", "../../Assets/Audio/ContraStageClear.mp3"));

        this.UpdateWinsDisplay();
        this.InitialBindings();
    }
}
