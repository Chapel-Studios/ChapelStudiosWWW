class MoveOrigin {
    ZoneName;
    HandleElement;
    ZoneType;

    constructor(handleElement) {
        this.HandleElement = handleElement;
        this.ZoneName = NSJ.GetParentID(handleElement);
        let card = handleElement.parentElement;
        let suit = card.getAttribute("suit");
        if (this.ZoneName === suit) this.ZoneType = "Run";
        else if (this.ZoneName.includes("Stack")) this.ZoneType = "Stack";
        else this.ZoneType = this.ZoneName;
    }
}

class MoveDestination {
    HandleElement;
    TopCardElement;
    TopValue;
    TopSuit;
    ZoneName;
    ZoneType;

    get TopIsRed() {
        return this.TopSuit == "Hearts" || this.TopSuit == "Diamonds";
    }

    constructor(zoneName) {
        this.HandleElement = NSJ.GetDeepestChild(`#${zoneName} .handle`);
        this.ZoneName = zoneName;
        this.TopCardElement = this.HandleElement.parentElement;
        this.TopValue = Number.parseInt(this.TopCardElement.getAttribute("card-value"));
        this.TopSuit = this.TopCardElement.getAttribute("suit");
        if (this.ZoneName === this.TopSuit) this.ZoneType = "Run";
        else if (this.ZoneName.includes("Stack")) this.ZoneType = "Stack";
        else this.ZoneType = this.ZoneName;
        this.HandleElement = this.ZoneType === "Hands"
            ? NSJ.GetDeepestChild(`#${zoneName} .hand`)
            : NSJ.GetDeepestChild(`#${zoneName} .handle`);
    }
}

class HeldStack {
    BottomCardElement;
    BottomValue;
    BottomSuit;

    get BottomIsRed() {
        return this.BottomSuit == "Hearts" || this.BottomSuit == "Diamonds";
    }
    _length = 0;
    get Length () {
        if (this._length == 0) {
            this._length = this.BottomCardElement.querySelectorAll(".handle").length;
        }
        // Use .handle instead of .playing-playing-card to make sure playing-card being grabbed (aka this) is included
        return this._length;
    }

    constructor (bottomCardElement) {
        this.BottomCardElement = bottomCardElement;
        this.BottomSuit = bottomCardElement.getAttribute("suit");
        this.BottomValue = Number.parseInt(bottomCardElement.getAttribute("card-value"));
    }
}

class SolitaireMove {
    Origin;
    OffsetX;
    OffsetY;
    Stack;
    CurrentDropZone;
    Desination;
    Result = null;

    get IsActive() {
        return this.Stack.Length > 0 && this.Result === null;
    }

    constructor (mouseDownEvent) {
        this.Stack = new HeldStack(mouseDownEvent.target.parentElement);
        let elementRect  = this.Stack.BottomCardElement.getBoundingClientRect();
        this.OffsetX = mouseDownEvent.clientX - elementRect.left;
        this.OffsetY = mouseDownEvent.clientY - elementRect.top

        this.Origin = new MoveOrigin(this.Stack.BottomCardElement.parentElement);
    }

    ValidatePickUp () { 
        return !this.Stack.BottomCardElement.classList.contains("back");
    }

    ValidateDrop () { return false; }

    Start(dragBoxHandle) {
        dragBoxHandle.appendChild(this.Stack.BottomCardElement);
    }

    Complete() {
        this.Desination.HandleElement.appendChild(this.Stack.BottomCardElement);
        this.Result = true;
    }

    Undo () {
        this.Origin.HandleElement.appendChild(this.Stack.BottomCardElement);
        this.Result = false;
    }

}
