'use strict'

function DetermineZoneType(zoneName, suit) {
    if (zoneName === suit) return "Run";
    else if (zoneName.includes("Stack")) return "Stack";
    else return zoneName;
}



class KlondikeMoveOrigin extends MoveOrigin {
    constructor(handleElement) {
        super(handleElement);
        let suit = handleElement.parentElement.getAttribute("suit");
        this.ZoneType = DetermineZoneType(this.ZoneName, suit);
    }
}

class KlondikeMoveDestination extends MoveDestination {

    get TopIsRed() {
        return this.TopSuit === "Hearts" || this.TopSuit === "Diamonds";
    }

    constructor(zoneName) {
        super(zoneName);
        this.ZoneType = DetermineZoneType(this.ZoneName, this.TopSuit);

    }
}

class KlondikeFlipStackCard extends CardFlip {
    constructor(cardToFlip) {
        super(cardToFlip);
        // CSS Work-Around (ToDo: Fixed in 4!)
        this.Card.classList.add("bottom-card");
    }

    Undo = () => {
        super.Undo();
        // CSS Work-Around (ToDo: Fixed in 4!)
        this.Card.classList.remove("bottom-card");
    }
}

class KlondikeDragMove extends DragMove {
    AddBonusMove;

    constructor(mouseDownEvent, addBonusMoveFunction) {
        super(mouseDownEvent, false);
        this.Origin = new KlondikeMoveOrigin(this.Stack.BottomCardElement.parentElement);
        this.AddBonusMove = addBonusMoveFunction;
    }

    ValidatePickUp () {
        if (this.Origin.ZoneType == "Hands") {
            return this.Stack.BottomCardElement.parentElement.lastElementChild === this.Stack.BottomCardElement;
        }
        return super.ValidatePickUp();
    }

    ValidateDrop () {
        // ToDo: update this to allow runs to be dropping in any order
        // If zone matches suit we are dropping in a run
        if (this.Desination.ZoneName === this.Stack.BottomSuit) {
            return (this.Stack.Length === 1 && this.Desination.TopValue === this.Stack.BottomValue - 1);
        }

        if (this.Desination.ZoneType === "Stack") {
            return ((this.Desination.TopValue === this.Stack.BottomValue + 1 && this.Desination.TopIsRed != this.Stack.BottomIsRed)
                    || (this.Desination.TopValue === 0 && this.Stack.BottomValue === 13));
        }

        return super.ValidateDrop();
    }

    Complete () {
        // CSS Work-Around (ToDo: Fixed in CSS4!)
        if (this.Desination.ZoneType === "Stack") {
            if (this.Stack.BottomValue === 13) {
                this.Stack.BottomCardElement.classList.add("bottom-card");
            }
            else {
                this.Stack.BottomCardElement.classList.remove("bottom-card");
            }
        }

        super.Complete();

        if (this.Origin.ZoneType === "Hands") {
            let lastHand = CSTools.HTMLHelper.GetDeepestChild(`#${this.Origin.ZoneName} .hand`);
            if (lastHand.childNodes.length === 0) {
                this.AddBonusMove(new HandleEmptyHand("clear"));
            }
        }
        else if (this.Origin.ZoneType === "Stack") {
            let bottomCard = CSTools.HTMLHelper.GetDeepestChild(`#${this.Origin.ZoneName} .playing-card`);
            if (bottomCard.classList.contains("back")) {
                this.AddBonusMove(new KlondikeFlipStackCard(bottomCard));
            }
        }
    }
}

class KlondikeMoveList extends SolitaireMoveList {

    constructor(dragBoxHandle, winCheckCallback) {
        super(dragBoxHandle, winCheckCallback);
    }

    _newMove = (mouseEvent) => {
        return new KlondikeDragMove(mouseEvent, this.AddBonusMove);
    }

    _CreateDestination = (zoneName) => {
        return new KlondikeMoveDestination(zoneName);
    }
}
