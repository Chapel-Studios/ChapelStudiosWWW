'use strict'

class Card {
    static _template = document.getElementById("CardTemplate");
    static _suitImageTemplate = document.getElementById("SuitImageTemplate");
    //static _imageBasePath = "/wwwroot/assets/Images/Games/Cards/";
    static _imageBasePath = "/Images/";

    static Create (suit, value) {
        let displayValue = value;
        let centerCount = value;
        // ToDo: change this to dependancy injection...
        let centerImgSrc = this._imageBasePath + `${suit.name}`;

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

        let clone =  document.importNode(this._template.content, true);
        
        let card = clone.querySelector(".card");
        let suitAttr = document.createAttribute("suit");
        suitAttr.value = suit.name;
        card.setAttributeNode(suitAttr);
        let valAttr = document.createAttribute("card-value");
        valAttr.value = value;
        card.setAttributeNode(valAttr);
        let isRedAttr = document.createAttribute("is-red");
        isRedAttr.value = suit.isRed;
        card.setAttributeNode(isRedAttr);

        // Add Corner Images
        clone.querySelectorAll(".top img, .bottom img").forEach((img) => {
            img.src = imgSrc;
        });

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

        let valDivs = clone.querySelectorAll(".value");
        valDivs.forEach(div => {
            div.append(displayValue)
        });
        
        
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
    static Suits = [
        new Suit("Hearts", "", true),
        new Suit("Diamonds", "", true),
        new Suit("Spades", ""),
        new Suit("Clubs", "")
    ];

    Cards = [];

    constructor () {
        let suits = Deck.Suits.slice(0);
        for (let cc = 0; cc < 52; cc++) {
            let cSuitIndex = NSJ.Random(suits.length);
            let cSuit = suits[cSuitIndex];
            let cValIndex = NSJ.Random(cSuit.available.length);

            this.Cards.push(Card.Create(cSuit, cSuit.available[cValIndex]));

            cSuit.available.splice(cValIndex, 1);
            if (cSuit.available.length == 0) {
                suits.splice(cSuitIndex, 1);
            }
        }
    }
}