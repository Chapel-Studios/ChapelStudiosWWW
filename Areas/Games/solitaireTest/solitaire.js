'use strict'


class KlondikeGameBoard {
    // Elements
    _handTemplate = document.getElementById("HandTemplate");
    _drawPile = document.querySelector("#DrawPile");
    _dragBox = document.getElementById("DragBox");
    _gameboard = document.getElementById("Playfield");
    _suitImageTemplate = document.getElementById("SuitImageTemplate");
    _winScreen = document.getElementById("WinScreen");
        
    Deck;
    Moves;

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
            //center.style.color = suit.isRed ? "red" : "black";
            let suitAttr = document.createAttribute("suit");
            suitAttr.value = suit.name;
            center.parentElement.parentElement.setAttributeNode(suitAttr);
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
                let card = NSJ.GetDeepestChild("#DrawPile .playing-card:not(.empty)");
                // Flip Top Cards
                if (i == n) {
                    card.classList.remove("back");
                    card.classList.add("show");
                    // CSS Work-Around (ToDo: Fixed in 4!)
                    card.classList.add("bottom-card");
                    //this._setEvents(card);
                }
                NSJ.GetDeepestChild(`#Stack${n + 1} .handle`).appendChild(card);
            }
        }

    }

    ResetGame = () => {
        this.Deck.PickUp();
        this.Deck.Shuffle();
    }

    _resetDrawPile = () => {
        let cards = document.querySelectorAll("#Hands .playing-card");
        for (let i = cards.length; i > 0; i-- ){
            let card = cards[i - 1];
            if (!card.classList.contains("empty")) {
                card.classList.add("back");
                card.classList.remove("show");
                card.onmousedown = null;
                card.onmouseup = null;
    
                NSJ.GetDeepestChild("#DrawPile .handle").appendChild(card);
            }
        }

        document.querySelectorAll("#Hands .hand:not(.base)").forEach(hand => {
            hand.remove();
        });
    }

    Draw = (count = 3) => {
        let newHandFragment = document.importNode(this._handTemplate.content, true);
        let newHand = newHandFragment.querySelector(".hand");

        for(let i = 0; i < count; i++) {
            let card = NSJ.GetDeepestChild("#DrawPile .playing-card");
        
            if (!card.classList.contains("empty")) {
                card.classList.remove("back");
                card.classList.add("show");

                newHand.appendChild(card);
            }
            else if (i == 0) {
                this._resetDrawPile();
                i = count;
            }
        }

        if (newHand.children.length > 0) {
            NSJ.GetDeepestChild("#Hands .hand").appendChild(newHandFragment);
        }
    }

    InitialBindings = () => {
        // Draw Functions
        this._drawPile.addEventListener("click", () => {
            if (document.querySelectorAll("#DrawPile .playing-card").length != 53) {
                this.Draw();
            }
            else {
                this.DealCards();
            }
        });
        
        document.onmousemove = this.Moves.UpdateMove;

        // Menu Functions
        document.getElementById("Reset").addEventListener('click', () => {
            this.ResetGame();
        });

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
        let winScreen = document.getElementById("WinScreen");
        winScreen.hidden = false;
    }

    constructor (options) {
        this._layout();
        this.Moves = new KlondikeMoveList(this._dragBox, this.CheckForWin);
        this.Deck = new Deck(this._drawPile, 
                            this.Moves.StartMove, 
                            this.Moves.UpdateMove, 
                            this.Moves.FinishMove,
                            [ ".stack", ".run" ]
        );
        this.InitialBindings();
    }
}

const test = new KlondikeGameBoard();
test.Moves.__cheatmode__ = true;

test.DealCards();
