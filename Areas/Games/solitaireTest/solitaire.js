'use strict'


class KlondikeGameBoard {
    _handTemplate = document.getElementById("HandTemplate");
    _drawPile = document.querySelector("#DrawPile");
    _dragBox = document.getElementById("DragBox");
    _gameboard = document.getElementById("Gameboard");
    _deck;

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
        })

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





        }

    }



    _init() {
        // Draw Functions
        this._drawPile.addEventListener("click", () => {
            this.Draw();
        });

        // Drag Functions
        let shiftX = 0, 
            shiftY = 0,
            zone = "";
        function moveDragBox (event) {

            if (this._dragBox.childNodes.length > 0) {
                this._dragBox.hidden = true;
                let target = document.elementFromPoint(event.clientX, event.clientY);
                if (!target) return;
                zone = NSJ.GetParentID(target);
                this._dragBox.hidden = false;

                if (!zone) return;

            }

            this._dragBox.style.left = `${event.pageX - shiftX}px`;
            this._dragBox.style.top = `${event.pageY - shiftY}px`;
        }

        let setEvents = (el) => {
            let origin, stack;

            el.onmousedown = (event) => {
                let elementRect  = el.getBoundingClientRect();
                shiftX = event.clientX - elementRect.left;
                shiftY = event.clientY - elementRect.top;
                moveDragBox.bind(this)(event);
                stack = event.target.parentElement;
                origin = stack.parentElement;
                this._dragBox.appendChild(stack);
            }

            el.onmouseup = (event) => {
                if (this._dragBox.childNodes.length > 0) {
                    if (validateCardRelease(stack)) {
                        NSJ.GetDeepestChild(`#${zone} .handle`).appendChild(stack);
                    }
                    else {
                        origin.appendChild(stack);
                    }
                }
            }
        }

        let validateCardRelease = (el) => {
            let suit = el.getAttribute("suit");
            let val = el.getAttribute("card-value");
            let stackHeight = el.querySelectorAll(".handle").length;
            // if Zone matches is in correct run, can only push stacks of one
            if (zone === suit && stackHeight === 1) {
                let runEnd = NSJ.GetDeepestChild(`#${zone} .card`);
                let endValue = Number.parseInt(runEnd.getAttribute("card-value"));
                if (endValue === val - 1)
                {
                    return true;
                }
            }
            return false;
        }

        document.onmousemove = moveDragBox.bind(this);

        document.querySelectorAll(".card.show .handle").forEach(card => {
            setEvents(card);
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