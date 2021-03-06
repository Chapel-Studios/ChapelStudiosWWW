﻿class CardBackSelector {
    OGImage;
    currentImage;
    updateCardBack;
    Modal = document.getElementById("Modal-CBS");
    GameBoard = document.getElementById("Gameboard");

    constructor(startingImage, changeCardBackCallback) {
        this.OGImage = startingImage;
        this.currentImage = startingImage;
        this.updateCardBack = changeCardBackCallback;

        this.setInitialBindings();
    }

    setInitialBindings = () => {
        this.Modal.querySelectorAll(".card-options .playing-card").forEach(node => {
            node.onclick = (event) => {
                document.querySelector(".card-options .playing-card.active").classList.remove("active");
                event.target.parentElement.classList.add("active");
                this.currentImage = event.target.parentElement.attributes["option"].value;
            }
        });

        document.getElementById("Accept-CBS").onclick = (event) => {
            this.selectImage();
            this.Close();
        }

        document.getElementById("Cancel-CBS").onclick = (event) => {
            this.Reset();
        }

        document.getElementById("Open-CBS").onclick = (event) => {
            this.Open();
        }

        this.Modal.onclick = (event) => {
            this.Reset();
        }

        this.Modal.querySelector(".exit").onclick = (event) => {
            this.Reset();
        }

        this.Modal.querySelector(".content").onclick = (event) => {
            event.stopPropagation();
        }

        if (!this.Modal.querySelector(".playing-card.active")) {
            this.Modal.querySelector(`.playing-card[option=${this.currentImage}]`).classList.add("active");
        }

    }

    Reset = () => {
        this.resetActiveImage();
        this.Close();
    }

    resetActiveImage = () => {
        this.Modal.querySelector(`.playing-card[option=${this.currentImage}]`).classList.remove("active");
        this.Modal.querySelector(`.playing-card[option=${this.OGImage}]`).classList.add("active");
        this.currentImage = this.OGImage;
    }

    selectImage = () => {
        this.updateCardBack(this.currentImage);
        // ToDo: add this to cookie and DB for registered users
    }

    Open = () => {
        this.OGImage = this.currentImage;
        this.GameBoard.classList.add("bind-position");
        this.Modal.classList.add("open");
    }

    Close = () => {
        this.Modal.classList.remove("open");
        this.GameBoard.classList.remove("bind-position");
        CSTools.StorageAssistant.SaveOptions([["cardBack", this.currentImage]]);
    }
}
