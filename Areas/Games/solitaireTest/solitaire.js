'use strict'


class KlondikeGameBoard {
    _handTemplate = document.getElementById("HandTemplate");
    _drawPile = document.querySelector("#DrawPile");
    _dragBox = document.getElementById("DragBox");
    _gameboard = document.getElementById("Playfield");
    _suitImageTemplate = document.getElementById("SuitImageTemplate");
    __cheatmode__ = false;
    // Drag Properties
    _shiftX = 0;
    _shiftY = 0;
    _zone = "";
    _originZone = "";

    _layout() {
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
            center.style.color = suit.isRed ? "red" : "black";
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

    _buildDeck() {
        // Create Deck
        let deck = new Deck();

        // Push cards to DrawPile
        while (deck.Cards.length > 0){
            let card = deck.Cards.pop();
            card.querySelector(".card").classList.add("back");
            NSJ.GetDeepestChild("#DrawPile .handle").appendChild(card);
        }
    }

    DealCards() {
        // Fill Stacks
        for (let i = 0; i < 7; i++) {
            // Create tier effect
            for (let n = i; n < 7; n++) {
                let card = NSJ.GetDeepestChild("#DrawPile .card:not(.empty)");
                // Flip Top Cards
                if (i == n) {
                    card.classList.remove("back");
                    card.classList.add("show");
                    // CSS Work-Around (ToDo: Fixed in 4!)
                    card.classList.add("bottom-card");
                    this._setEvents(card);
                }
                NSJ.GetDeepestChild(`#Stack${n + 1} .handle`).appendChild(card);
            }
        }

    }

    ResetGame() {

        // Clear piles housed in cards
        document.querySelectorAll("#Playfield .stack, #Playfield .run, #DrawPile").forEach(el => {
            if (el) {
                let bottomCard = el.querySelector(".card:not(.empty)")
                if (bottomCard) bottomCard.remove();
            }
        });
        
        // Clear piles housed in cards
        let hand = document.querySelector("#Hands .hand:not(.base)");
        if (hand) hand.remove();

        // Place New Deck
        this._buildDeck();
    }

    _resetDrawPile = () => {
        let cards = document.querySelectorAll("#Hands .card");
        //const pile = document.getElementById("DrawPile");
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

        let hands = document.querySelectorAll("#Hands .hand");
        hands.forEach(hand => {
            if (!hand.classList.contains("base")){
                hand.remove();
            }
        });
    }

    Draw = (count = 3) => {
        let newHandFragment = document.importNode(this._handTemplate.content, true);
        let newHand = newHandFragment.querySelector(".hand");

        for(let i = 0; i < count; i++) {
            let card = NSJ.GetDeepestChild("#DrawPile .card");
        
            if (!card.classList.contains("empty")) {
                card.classList.remove("back");
                card.classList.add("show");
                this._setEvents(card);

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

    _setEvents = (el) => {
        let validateCardRelease = (el) => {
            let result = false;
            let suit = el.getAttribute("suit");
            let val = Number.parseInt(el.getAttribute("card-value"));
            let runEnd = NSJ.GetDeepestChild(`#${this._zone} .card`);
            let endValue = Number.parseInt(runEnd.getAttribute("card-value"));
            // If this._zone matches it is a run
            if (this._zone === suit) 
            {  
                let stackHeight = el.querySelectorAll(".handle").length;
                // BI: Can only push stacks of one to runs
                result = (stackHeight === 1 && endValue === val - 1);
            }
            else if (this._zone.includes("Stack")) {
                let isRed = el.getAttribute("is-red");
                let endIsRed = runEnd.getAttribute("is-red");
                result = ((
                            (endValue === val + 1) && (endIsRed != isRed)
                        ) || (
                            (endValue === 0) && (val === 13)
                        ));
            }
            
            if (!result && this.__cheatmode__) {
                console.log("Cheating is bad! This is for testing!");
                return true;
            }
            
            return result;
        }

        let origin, 
            stack,
            timerStart;

        el.onmousedown = (event) => {
            if (event.button !== 0) return;

            let dif = Date.now() - timerStart;
            let isDoubleClick = false;
            stack = event.target.parentElement;
            // Only reset if actually picking something up in case card gets stuck to pointer
            // ToDo: better work-around: drop stack on origin when point focus(?) lost
            origin = stack.parentElement;
            let newOriginZone = NSJ.GetParentID(origin);
            this._originZone = newOriginZone === "DragBox" ? this._originZone : newOriginZone;

            if (Date.now() - timerStart > 250) {
                timerStart = Date.now();
            }
            // Else this is a double-click event
            else {
                // Do doubleclick stuff
                isDoubleClick = true;
            }

            let elementRect  = stack.getBoundingClientRect();
            this._shiftX = event.clientX - elementRect.left;
            this._shiftY = event.clientY - elementRect.top;
            this._moveDragBox.bind(this)(event);
            this._dragBox.appendChild(stack);
        }

        el.onmouseup = (event) => {
            if (this._dragBox.childNodes.length > 0) {
                if (validateCardRelease(stack)) {
                    // oncomplete
                    let zoneHandle = NSJ.GetDeepestChild(`#${this._zone} .handle`)
                    let stackStartValue = stack.getAttribute("card-value");

                    // CSS Work-Around (ToDo: Fixed in 4!)
                    if (this._zone.includes("Stack")) {
                        stack.classList.remove("bottom-card");

                        if ("13" == stackStartValue) {
                            stack.classList.add("bottom-card");
                        }
                        
                    }

                    zoneHandle.appendChild(stack);
                    if (this._zone == stack.getAttribute("suit") && "13" == stackStartValue) {
                        this._checkForWin();
                    }

                    // callback...
                    if (this._originZone === "Hands") {
                        // do hand stuff
                        let lastHand = NSJ.GetDeepestChild(`#${this._originZone} .hand`);
                        if (lastHand.childNodes.length === 0) {
                            lastHand.remove();
                        }
                    }
                    else if (this._originZone.includes("Stack")) {
                        let endCard = NSJ.GetDeepestChild(`#${this._originZone} .card`);
                        if (endCard.classList.contains("back")) {
                            endCard.classList.add("show");
                            endCard.classList.remove("back");
                            // CSS Work-Around (ToDo: Fixed in 4!)
                            endCard.classList.add("bottom-card");
                            this._setEvents(endCard.querySelector(".handle"));
                        }
                    }
                }
                else {
                    origin.appendChild(stack);
                }
            }
        }
    }
    
    _moveDragBox (event) {
        if (this._dragBox.childNodes.length > 0) {
            this._dragBox.hidden = true;
            let target = document.elementFromPoint(event.clientX, event.clientY);
            if (!target) return;
            this._zone = NSJ.GetParentID(target);
            this._dragBox.hidden = false;

            if (!this._zone) return;

        }

        this._dragBox.style.left = `${event.pageX - this._shiftX}px`;
        this._dragBox.style.top = `${event.pageY - this._shiftY}px`;
    }

    _init() {
        // Draw Functions
        this._drawPile.addEventListener("click", () => {
            if (document.querySelectorAll("#DrawPile .card").length != 53) {
                this.Draw();
            }
            else {
                this.DealCards();
            }
        });

        // Drag Functions
        document.onmousemove = this._moveDragBox.bind(this);

        // Menu Functions
        document.getElementById("Reset").addEventListener('click', () => {
            this.ResetGame();
        });
    }

    _checkForWin() {
        if (document.querySelectorAll(".run .card.show").length == 52) {
            // Win is confirmed
            this.ResetGame();
        }
    }

    constructor (options) {
        this._layout();
        this._buildDeck();
        this._init();
    }
}

const test = new KlondikeGameBoard();
test.__cheatmode__ = true;

test.DealCards();
