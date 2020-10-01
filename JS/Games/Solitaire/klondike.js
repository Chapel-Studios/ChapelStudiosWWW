'use strict'


class KlondikeGameBoard {
    // Elements
    _handTemplate = document.getElementById("HandTemplate");
    _drawPile = document.getElementById("DrawPile");
    _dragBox = document.getElementById("DragBox");
    _gameboard = document.getElementById("Playfield");
    _suitImageTemplate = document.getElementById("SuitImageTemplate");
    _winScreen = document.getElementById("WinScreen");
        
    Deck;
    Moves;
    DrawCount;
    WinSong;

    _layout = () => {
        function createSection(templateID, newID, addEmpty){
            let template = document.getElementById(templateID);
            let clone = document.importNode(template.content, true);
            if (addEmpty) {
                let empty = document.importNode(document.getElementById("EmptyCard").content, true);
                let divs = clone.querySelectorAll("div");
                divs[divs.length - 1].appendChild(empty);
            }

            let top = clone.querySelector("*");
            top.id = newID;
            top.setAttribute("style", `grid-area: ${newID};`);

            return clone;
        }

        // Create Run Sections
        Deck.GetSuitsList().forEach(suit => {
            let newSection = createSection("RunTemplate", suit.name, true);
            let imgClone =  document.importNode(this._suitImageTemplate.content, true);
            let center = newSection.querySelector(".center");
            let suitAttr = document.createAttribute("suit");
            suitAttr.value = suit.name;
            center.parentElement.setAttributeNode(suitAttr);
            let centerCountAttr = document.createAttribute("count");
            centerCountAttr.value = 1;
            center.setAttributeNode(centerCountAttr);
            center.appendChild(imgClone);
            this._gameboard.appendChild(newSection);
        });

        // Create Stack Sections
        [...Array(8).keys()].slice(1).forEach(i => {
            let newSection = createSection("StackTemplate", `Stack${i}`, true);
            this._gameboard.appendChild(newSection);
        });
    }

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

    }

    ResetGame = () => {
        this.WinSong.load();
        this.Deck.PickUp();
        this.Moves.ClearHistory();
        this.Deck.Shuffle();
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

        document.getElementById("Undo").addEventListener('click', () => {
            this.Moves.UndoLastMove();
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
            //this.ResetGame();
            this.Celebrate();
        }
    }

    Celebrate = () => {
        this._winScreen.hidden = false;
        this.WinSong.play();
    }

    UpdateCardBack = (cardBack) => {
        this.Deck.SetBackImage(cardBack);
    }

    constructor (options) {
        this._layout();
        this.DrawCount = options.drawCount;
        this.Moves = new KlondikeMoveList(
            this._dragBox,
            this.CheckForWin,
            this._handTemplate
        );
        this.Deck = new Deck(
            this._drawPile,
            CSTools.HTMLHelper.DoubleClickHandler.bind(null, this.Moves.StartMove, this.Moves.DblClickMove),
            this.Moves.FinishMove,
            [ ".stack", ".run" ],
            options.cardBack
        );
        this.WinSong = new Audio("../../Assets/Audio/ContraStageClear.mp3");
        this.WinSong.volume = 0.2;
        this.WinSong.load();
        this.InitialBindings();
    }
}
