'use strict'

class Card {
    static _template = document.getElementById("CardTemplate");
    static _suitImageTemplate = document.getElementById("SuitImageTemplate");
    static _imageBasePath = "../assets/Images/Games/Cards/";
    

    static Create(suit, value, startMove, finishMove, backImage) {
        let displayValue = value;
        let centerCount = value;
        // ToDo: change this to dependancy injection...
        let centerImgSrc = this._imageBasePath + `${suit.name}`;

        // Handle face card variables
        if (value == 1) displayValue = "A";
        else if (value == 11) {
            displayValue = "J";
            centerCount = 1;
            centerImgSrc = centerImgSrc + `_Jack.png`;
        }
        else if (value == 12) {
            displayValue = "Q";
            centerCount = 1;
            centerImgSrc = centerImgSrc + `_Queen.png`;
        }
        else if (value == 13) {
            displayValue = "K";
            centerCount = 1;
            centerImgSrc = centerImgSrc + `_King.png`;
        }

        // Create Card
        let clone =  document.importNode(this._template.content, true);
        let card = clone.querySelector(".playing-card");

        // Add card back image class
        card.querySelector(".back").classList.add(backImage);
        
        // Set Attributes
        let suitAttr = document.createAttribute("suit");
        suitAttr.value = suit.name;
        card.setAttributeNode(suitAttr);
        let valAttr = document.createAttribute("card-value");
        valAttr.value = value;
        card.setAttributeNode(valAttr);
        let isRedAttr = document.createAttribute("is-red");
        isRedAttr.value = suit.isRed;
        card.setAttributeNode(isRedAttr);

        // Add Center Images
        [...Array(centerCount)].forEach(i => {
            let imgClone =  document.importNode(this._suitImageTemplate.content, true);
            let img = imgClone.querySelector("*");
            let center = clone.querySelector(".center");
            if (centerCount === 1 && value != 1) {
                img.style.backgroundImage = `url(${centerImgSrc})`;
                center.classList.add("face");
            }
            let centerCountAttr = document.createAttribute("count");
            centerCountAttr.value = centerCount;
            center.setAttributeNode(centerCountAttr);
            center.appendChild(imgClone);
        });

        // Add Corner Values
        let valDivs = clone.querySelectorAll(".value");
        valDivs.forEach(div => {
            div.append(displayValue)
        });
        
        // Set Events
        let handle = card.querySelector(".handle");
        handle.onmousedown = startMove;
        handle.onmouseup = finishMove;
        
        return clone;
    }
}

class Suit {
    constructor(name, img, isRed = false) {
        this.name = name;
        this.img = img;
        this.available = [...Array(14).keys()].slice(1);
        this.isRed = isRed;
    }
}

class Deck {
    static GetSuitsList() { 
        return [
            new Suit("Hearts", "", true),
            new Suit("Diamonds", "", true),
            new Suit("Spades", ""),
            new Suit("Clubs", "")
        ];
    }
    PlacementHandle;
    PlacementHandleId;
    Cards = [];
    CleanUpZones;
    CardBackImage;

    constructor(placementHandle, startMove, finishMove, cleanUpZones, backImage) {
        this.CardBackImage = backImage;
        this.PlacementHandleID = placementHandle.id;
        this.PlacementHandle = placementHandle;
        this.CleanUpZones = cleanUpZones;
        let suits = Deck.GetSuitsList();
        // Create cards in random order
        
        suits.forEach(suit => {
            suit.available.forEach(cardValue => {
                this.Cards.push(Card.Create(suit, cardValue, startMove, finishMove, backImage));
            });
        });

        this.Shuffle();
    }

    GetCards = () => {
        let query = "";
        this.CleanUpZones.forEach(zone => {
            query += `#Playfield ${zone} .playing-card:not(.empty), `
        });
        query += "#DrawPile .playing-card:not(.empty), ";
        query += "#Hands .playing-card:not(.empty)";
        return document.querySelectorAll(query);
    }

    PickUp = () => {
        // Clear cards from the playfield
        let cards = this.GetCards();
        // Have to go in reverse order to ensure elements are removed from the Dom Correctly
        for (let i = cards.length - 1; i > -1; i--) {
            let card = cards[i];
            card.classList.remove("show");
            card.classList.remove("bottom-card");
            this.Cards.push(card);
            card.remove();
        }

        // Clear any empty hands
        let hand = document.querySelector("#Hands .hand:not(.base)");
        if (hand) hand.remove();
    }

    Shuffle = () => {
        // Rebuild playing deck
        for (let cardCount = 0; cardCount < 52; cardCount++) {
            let cardIndex = CSTools.Math.Random(this.Cards.length);
            let card = this.Cards.splice(cardIndex, 1)[0];
            CSTools.HTMLHelper.GetDeepestChild(`#${this.PlacementHandleID} .handle`).appendChild(card);
        }
    }

    SetBackImage = (imgName) => {
        const cards = this.GetCards();
        cards.forEach(card => {
            let back = card.querySelector(".back");
            back.classList.remove(this.CardBackImage);
            back.classList.add(imgName);
        });
        this.CardBackImage = imgName;
    }
}
