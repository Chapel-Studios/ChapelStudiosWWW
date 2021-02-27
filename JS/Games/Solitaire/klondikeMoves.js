'use strict'


function DetermineZoneType(zoneName, suit) {
    if (zoneName === suit) return "Run";
    else if (zoneName.includes("Stack")) return "Stack";
    else return zoneName;
}

function DetermineZoneTypeByOrigin(moveOrigin) {
    return DetermineZoneType(moveOrigin.ZoneName, moveOrigin.HandleElement.parentElement.getAttribute("suit"))
}

function HandleOriginPostComplete(move) {
    if (move.Origin.ZoneType === "Hands") {
        let lastHand = CSTools.HTMLHelper.GetDeepestChild(`#${move.Origin.ZoneName} .hand`);
        if (!lastHand.querySelector(".playing-card")) {
            move.AddBonusMove(new HandleEmptyHand("clear"));
        }
    }
    else if (move.Origin.ZoneType === "Stack") {
        let bottomCard = CSTools.HTMLHelper.GetDeepestChild(`#${move.Origin.ZoneName} .playing-card`);
        if (!(bottomCard.classList.contains("show")
            || bottomCard.classList.contains("empty"))
        ) {
            move.AddBonusMove(new KlondikeFlipStackCard(bottomCard));
        }
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
        this.Flip();
        // CSS Work-Around (ToDo: Fixed in 4!)
        this.Card.classList.remove("bottom-card");
    }
}

class KlondikeFillRunMove extends FillRunMove {
    AddBonusMove;

    constructor(mouseDblClickEvent, addBonusMoveFunction) {
        super(mouseDblClickEvent);
        this.Origin.ZoneType = DetermineZoneTypeByOrigin(this.Origin);
        this.AddBonusMove = addBonusMoveFunction;
    }

    Complete = () => {
        super.Complete();
        HandleOriginPostComplete(this);
    }
}

class KlondikeDragMove extends DragMove {
    AddBonusMove;

    constructor(mouseDownEvent, addBonusMoveFunction) {
        super(mouseDownEvent);
        this.Origin.ZoneType = DetermineZoneTypeByOrigin(this.Origin);
        this.AddBonusMove = addBonusMoveFunction;
    }

    ValidatePickUp () {
        if (this.Origin.ZoneType == "Hands") {
            return this.Stack.BottomCardElement.parentElement.lastElementChild === this.Stack.BottomCardElement;
        }
        return super.ValidatePickUp();
    }

    ValidateDrop () {
        if (this.Destination.ZoneName === this.Origin.ZoneName) return false;
        // ToDo: update this to allow runs to be dropping in any order
        // If zone matches suit we are dropping in a run
        if (this.Destination.ZoneName === this.Stack.BottomSuit) {
            return (this.Stack.Length === 1 && this.Destination.TopValue === this.Stack.BottomValue - 1);
        }

        if (this.Destination.ZoneType === "Stack") {
            return ((this.Destination.TopValue === this.Stack.BottomValue + 1 && this.Destination.TopIsRed != this.Stack.BottomIsRed)
                    || (this.Destination.TopValue === 0 && this.Stack.BottomValue === 13));
        }

        return super.ValidateDrop();
    }

    Complete () {
        // CSS Work-Around (ToDo: Fixed in CSS4!)
        if (this.Destination.ZoneType === "Stack") {
            if (this.Stack.BottomValue === 13) {
                this.Stack.BottomCardElement.classList.add("bottom-card");
            }
            else {
                this.Stack.BottomCardElement.classList.remove("bottom-card");
            }
        }

        super.Complete();
        HandleOriginPostComplete(this);
    }
}

class KlondikeMoveList extends SolitaireMoveList {

    constructor(dragBoxHandle, winCheckCallback) {
        super(dragBoxHandle, winCheckCallback);
    }

    _newMove = (mouseEvent) => {
        return new KlondikeDragMove(mouseEvent, this.AddMove);
    }

    _CreateDestination = (zoneName) => {
        return new KlondikeMoveDestination(zoneName);
    }

    DblClickMove = (mouseDblClickEvent) => {
        mouseDblClickEvent.stopPropagation();
        if (!this.IsMoveStartValid(mouseDblClickEvent)) return false;

        let move = new KlondikeFillRunMove(mouseDblClickEvent, this.AddMove);
        move.Destination = this._CreateDestination(move.Stack.BottomSuit);

        let isValid = move.Validate();
        if (!isValid && this.__cheatmode__) {
            console.log("Cheating is bad! This is for testing!");
            isValid = true;
        }
        if (isValid) {
            move.Complete();
            this.AddMove(move);
            this.CheckForWin();
        }
    }
}
