'use strict'


class KlondikeGameBoard {
    _handTemplate = document.getElementById("HandTemplate");
    _drawPile = document.querySelector("#DrawPile");
    _dragBox = document.getElementById("DragBox");
    _gameboard = document.getElementById("Playfield");
    _deck;
    // Drag Properties
    _shiftX = 0;
    _shiftY = 0;
    _zone = "";

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
        Deck.Suits.forEach(suit => {
            let newSection = createSection("RunTemplate", suit.name, true);
            let center = newSection.querySelector(".center");
            center.append(suit.name);
            center.style.color = suit.isRed ? "red" : "black";
            this._gameboard.appendChild(newSection);
        });

        // Create Stack Sections
        [...Array(8).keys()].slice(1).forEach(i => {
            let newSection = createSection("StackTemplate", `Stack${i}`, true);
            this._gameboard.appendChild(newSection);
        });
    }

    _dealCards() {
        // Fill Stacks
        for (let i = 0; i < 7; i++) {
            for (let n = i; n < 7; n++) {
                let card = this._deck.Cards.pop();
                if (i == n) {
                    card.querySelector(".card").classList.add("show");
                }
                else {
                    card.querySelector(".card").classList.add("back");
                }
                NSJ.GetDeepestChild(`#Stack${n + 1} .handle`).appendChild(card);
            }
        }

        // Create Deck
        while (this._deck.Cards.length > 0){
            let card = this._deck.Cards.pop();
            card.querySelector(".card").classList.add("back");
            NSJ.GetDeepestChild("#DrawPile .handle").appendChild(card);
        }
    }

    _resetDeck = () => {
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
                this._resetDeck();
                i = count;
            }
        }

        if (newHand.children.length > 0) {
            NSJ.GetDeepestChild("#Hands .hand").appendChild(newHandFragment);
        }
    }

    _setEvents = (el) => {
        let validateCardRelease = (el) => {
            let suit = el.getAttribute("suit");
            let val = Number.parseInt(el.getAttribute("card-value"));
            let runEnd = NSJ.GetDeepestChild(`#${this._zone} .card`);
            let endValue = Number.parseInt(runEnd.getAttribute("card-value"));
            // If this._zone matches it is a run
            if (this._zone === suit) 
            {  
                let stackHeight = el.querySelectorAll(".handle").length;
                // BI: Can only push stacks of one to runs
                return (stackHeight === 1 && endValue === val - 1);
            }
            else if (this._zone.includes("Stack")) {
                let isRed = el.getAttribute("is-red");
                let endIsRed = runEnd.getAttribute("is-red");
                return ((
                            (endValue === val + 1) && (endIsRed != isRed)
                        ) || (
                            (endValue === 0) && (val === 13)
                        ));
            }
            return false;
        }

        let origin, 
            stack,
            originZone = "",
            timerStart = Date.now();

        el.onmousedown = (event) => {
            if (event.button !== 1) return;

            let dif = Date.now() - timerStart;
            let isDoubleClick = false;
            stack = event.target.parentElement;
            // Only reset if actually picking something up in case card gets stuck to pointer
            // ToDo: better work-around: drop stack on origin when point focus(?) lost
            origin = stack.parentElement;
            let newOriginZone = NSJ.GetParentID(origin);
            originZone = newOriginZone === "DragBox" ? originZone : newOriginZone;

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
                    NSJ.GetDeepestChild(`#${this._zone} .handle`).appendChild(stack);
                    if (originZone === "Hands") {
                        // do hand stuff
                        let lastHand = NSJ.GetDeepestChild(`#${originZone} .hand`);
                        if (lastHand.childNodes.length === 0) {
                            lastHand.remove();
                        }
                    }
                    else if (originZone.includes("Stack")) {
                        let endCard = NSJ.GetDeepestChild(`#${originZone} .card`);
                        if (endCard.classList.contains("back")) {
                            endCard.classList.add("show");
                            endCard.classList.remove("back");
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
            this.Draw();
        });

        // Drag Functions
        document.onmousemove = this._moveDragBox.bind(this);

        // ToDo: Move this to part of deal function
        document.querySelectorAll(".card.show .handle").forEach(card => {
            this._setEvents(card);
        });
    }

    constructor (options) {
        this._deck = new Deck();
        this._layout();
        this._init();
    }
}

const test = new KlondikeGameBoard();

//test.init();