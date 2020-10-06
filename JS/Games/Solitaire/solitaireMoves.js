'use strict'

class MoveOrigin {
    ZoneName;
    HandleElement;
    ZoneType;

    constructor(handleElement) {
        this.HandleElement = handleElement;
        this.ZoneName = CSTools.HTMLHelper.GetParentID(handleElement);
        this.ZoneType = this.ZoneName;
    }
}

class MoveDestination {
    HandleElement;
    TopCardElement;
    TopValue;
    TopSuit;
    ZoneName;
    ZoneType;

    constructor(zoneName) {
        this.HandleElement = CSTools.HTMLHelper.GetDeepestChild(`#${zoneName} .handle`);
        this.ZoneName = zoneName;
        this.TopCardElement = this.HandleElement.parentElement;
        this.TopValue = Number.parseInt(this.TopCardElement.getAttribute("card-value"));
        this.TopSuit = this.TopCardElement.getAttribute("suit");
        
        this.ZoneType = this.ZoneName;
        
        this.HandleElement = this.ZoneType === "Hands"
            ? CSTools.HTMLHelper.GetDeepestChild(`#${zoneName} .hand`)
            : CSTools.HTMLHelper.GetDeepestChild(`#${zoneName} .handle`);
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

class Move {
    Origin;
    Stack;
    Destination;

    get IsActive() {
        return this.Stack.Length > 0 && this.Result === null;
    }

    constructor() {
    }
}

class ManualMove extends Move {
    constructor(event) {
        super();
        this.Stack = new HeldStack(event.target.parentElement);
        this.Origin = new MoveOrigin(this.Stack.BottomCardElement.parentElement);
    }

    Complete() {
        this.Destination.HandleElement.appendChild(this.Stack.BottomCardElement);
        this.Result = true;
    }

    Undo() {
        this.Origin.HandleElement.appendChild(this.Stack.BottomCardElement);
        this.Result = false;
    }
}

class DragMove extends ManualMove {
    OffsetX;
    OffsetY;
    CurrentDropZone;
    Result = null;
    IsBonusMove = false;

    constructor(mouseDownEvent) {
        super(mouseDownEvent);

        let elementRect = this.Stack.BottomCardElement.getBoundingClientRect();
        this.OffsetX = mouseDownEvent.clientX - elementRect.left;
        this.OffsetY = mouseDownEvent.clientY - elementRect.top;

    }

    ValidatePickUp() {
        return this.Stack.BottomCardElement.classList.contains("show");
    }

    ValidateDrop() { return false; }

    Start(dragBoxHandle) {
        dragBoxHandle.appendChild(this.Stack.BottomCardElement);
    }

}

class SimpleMove extends Move {
    get IsActive() {
        return false;
    }

    constructor(stack, origin, destination) {
        super();
        this.Stack = stack;
        this.Origin = origin;
        this.Destination = destination;
        this.OriginZoneName = CSTools.HTMLHelper.GetParentID(this.Origin);
    }

    Execute = () => {
        this.Destination.appendChild(this.Stack);
    }

    Undo = () => {
        if (this.OriginZoneName === "Hands") {
            CSTools.HTMLHelper.GetDeepestChild("#Hands .hand").appendChild(this.Stack);
        }
        else {
            // ToDo: maybe remove if there isn't a usecase? Catch-all is nice though....
            CSTools.HTMLHelper.GetDeepestChild(`#${this.OriginZoneName} .handle`).appendChild(this.Stack);
        }
    }
}

class FillRunMove extends ManualMove {
    constructor(mouseDblClickEvent) {
        super(mouseDblClickEvent);
    }

    Validate = () => {
        return this.Destination.TopValue === this.Stack.BottomValue - 1
            && this.Destination.TopSuit === this.Stack.BottomSuit;
    }
}

class FreeMove extends SimpleMove {
    IsBonusMove = true;

    constructor(stack, origin, destination) {
        super(stack, origin, destination);

        this.Execute();
    }
}

class BonusMove {
    IsBonusMove = true;

    get IsActive() {
        return false;
    }
}

class BonusStopper extends BonusMove {
    constructor() {
        super();
        this.IsBonusMove = false;
    }

    Undo = () => {
    }
}

class ResetDrawPile extends BonusMove {
    constructor(addBonusMoveFunction) {
        super();

        addBonusMoveFunction(new BonusStopper());
        let hands = document.querySelectorAll("#Hands .hand:not(.base)");
        for (let i = hands.length; i > 0; i--) {
            let hand = hands[i - 1];
            let cards = hand.querySelectorAll(".playing-card");

            for (let x = cards.length; x > 0; x--) {
                let card = cards[x - 1];

                addBonusMoveFunction(new CardFlip(card));
                addBonusMoveFunction(new FreeMove(card, hand, CSTools.HTMLHelper.GetDeepestChild("#DrawPile .handle")));
            }

            addBonusMoveFunction(new HandleEmptyHand("clear"));
        }
    }

    Undo = () => {
        // No Undo needed as this is a wrapper for other bonus moves that all have their own undo function
    }
}

class DrawMove extends BonusMove {

    constructor(count = 1, addToMoveListFunction, undoLastMoveFunction) {
        super();

        addToMoveListFunction(new BonusStopper());
        addToMoveListFunction(new HandleEmptyHand("create"));

        let newHand = CSTools.HTMLHelper.GetDeepestChild("#Hands .hand");
        let resetNeeded = false;

        for (let i = 0; i < count; i++) {
            let card = CSTools.HTMLHelper.GetDeepestChild("#DrawPile .playing-card");


            if (!card.classList.contains("empty")) {
                addToMoveListFunction(new CardFlip(card));
                addToMoveListFunction(new FreeMove(card, card.parentElement, newHand));
            }
            else if (i == 0) {
                resetNeeded = true;

                i = count;
            }
        }

        if (newHand.children.length === 0) {
            undoLastMoveFunction();
        }

        if (resetNeeded) {
            addToMoveListFunction(new ResetDrawPile(addToMoveListFunction));
        }
    }

    Undo = () => {
        // No Undo needed as this is a wrapper for other bonus moves that all have their own undo function
    }
}

class HandleEmptyHand extends BonusMove {
    static HandFragment = document.getElementById("HandTemplate").content;

    constructor(mode) {
        super();
        if (mode === "clear") {
            this.Execute = HandleEmptyHand.RemoveHand;
            this.Undo = () => {
                HandleEmptyHand.CreateHand();
            }
        }
        else if (mode === "create") {
            this.Execute = HandleEmptyHand.CreateHand;
            this.Undo = () => {
                HandleEmptyHand.RemoveHand();
            }
        }

        this.Execute();
    }

    Undo() { }
    Execute() { }

    static CreateHand() {
        const node = document.importNode(HandleEmptyHand.HandFragment, true);
        CSTools.HTMLHelper.GetDeepestChild("#Hands .hand").appendChild(node);
        
    }

    static RemoveHand() {
        CSTools.HTMLHelper.GetDeepestChild("#Hands .hand").remove();
    }
}

class CardFlip extends BonusMove {
    Card;

    constructor(cardToFlip) {
        super();
        this.Card = cardToFlip;
        this.Flip();
    }

    Flip = () => {
        if (this.Card.classList.contains("show")) {
            this.Card.classList.remove("show");
        }
        else {
            this.Card.classList.add("show");
        }
    }

    Undo = () => {
        this.Flip();
    }
}

class SolitaireMoveList {
    Dragbox;
    Moves;
    _isUndoEnabled = true;
    CheckForWin;
    __cheatmode__ = false;
    ButtonElement = document.getElementById("Undo");
    GameBoard = document.getElementById("Gameboard");

    get CurrentMove() {
        if (this.LastMove) {
            return this.LastMove.IsActive ? this.LastMove : null;
        }
        return null;
    }

    get LastMove() {
        if (this.Moves.length > 0) {
            return this.Moves[this.Moves.length - 1];
        }
        return null;
    }

    _handleUndoEnablement() {
        if (this.Moves.length === 0
            && this._isUndoEnabled
        ) {
            this._isUndoEnabled = false;
            this.ButtonElement.classList.add("inactive");
        }
        else if (this.Moves.length > 0
            && !this._isUndoEnabled
        ) {
            this._isUndoEnabled = true;
            this.ButtonElement.classList.remove("inactive");
        }
    }

    constructor(dragBoxHandle, winCheckCallback) {
        this.Dragbox = dragBoxHandle;
        this.CheckForWin = winCheckCallback;

        this.Moves = [];
        this._handleUndoEnablement();
        this.ButtonElement.addEventListener('click', (event) => {
            CSTools.HTMLHelper.ButtonActivityHandler(this.UndoLastMove, event)
        });
    }

    IsMoveStartValid(mouseEvent) {
        return mouseEvent.button === 0;
    }

    _newMove = (mouseEvent) => {
        return new SolitaireMove(mouseEvent);
    }

    _CreateDestination = (zoneName) => {
        return new MoveDestination(zoneName);
    }

    StartMove = (mouseEvent) => {
        mouseEvent.stopPropagation();
        if (!this.IsMoveStartValid(mouseEvent)) return false;

        let currentMove = this.CurrentMove || this._newMove(mouseEvent);
        if (currentMove.ValidatePickUp()) {
            this.AddMove(currentMove);
            this.UpdateMove(mouseEvent);
            currentMove.Start(this.Dragbox);
            // Register Drag Event
            this.GameBoard.onmousemove = this.UpdateMove;
        }
    }

    UpdateMove = (mouseMoveEvent) => {
        mouseMoveEvent.stopPropagation();
        let currentMove = this.CurrentMove;
        if (!currentMove) return;
        let x = 0;
        let y = 0;

        if (currentMove) {
            //console.log("currentMove exists");
            if (currentMove.IsActive) {
                //console.log("currentMove isActive");
                this.Dragbox.hidden = true;
                //console.log("dragbox hidden");

                let target = document.elementFromPoint(event.clientX, event.clientY);
                this.Dragbox.hidden = false;
                //console.log("dragbox shown");

                // ToDo: We should probably update this to verify the target includes the gameboard for edge cases
                currentMove.CurrentDropZone = CSTools.HTMLHelper.GetParentID(target)

                // If there is no target we are off the gameboard
                if (!currentMove.CurrentDropZone) {
                    currentMove.Undo();
                };
            }

            x = currentMove.OffsetX;
            y = currentMove.OffsetY;
        }
        else {
            let lastMove = this.LastMove;
            if (lastMove) {
                x = lastMove.OffsetX;
                y = lastMove.OffsetY;
            }
        }

        this.Dragbox.style.left = `${mouseMoveEvent.pageX - x}px`;
        this.Dragbox.style.top = `${mouseMoveEvent.pageY - y}px`;

        //console.log("End:", this.Dragbox.style.left, this.Dragbox.style.top);
    }

    FinishMove = (mouseUpEvent) => {
        mouseUpEvent.stopPropagation();
        let currentMove = this.CurrentMove;
        if (currentMove && currentMove.IsActive) {
            currentMove.Destination = this._CreateDestination(currentMove.CurrentDropZone);

            let isValid = currentMove.ValidateDrop();
            if (!isValid && this.__cheatmode__) {
                console.log("Cheating is bad! This is for testing!");
                isValid = true;
            }

            if (isValid) {
                currentMove.Complete();
                this.CheckForWin();
            }
            else {
                currentMove.Undo();
                this.Moves.pop();
            }
        }
        this.GameBoard.onmousemove = null;
    }

    UndoLastMove = () => {
        const lastMove = this.LastMove;
        if (lastMove) {
            const lastWasBonus = lastMove.IsBonusMove;
            if (lastMove) {
                //console.log(`${lastMove.constructor.name} Undone`);
                lastMove.Undo();
                this.RemoveMove();
            }
            if (lastWasBonus) this.UndoLastMove();
        }
    }

    RemoveMove = () => {
        this.Moves.pop();
        this._handleUndoEnablement();
    }

    AddMove = (newMove) => {
        this.Moves.push(newMove);
        this._handleUndoEnablement();
    }

    NewDraw = (drawCount) => {
        this.AddMove(new DrawMove(drawCount, this.AddMove, this.UndoLastMove))
    }

    ClearHistory() {
        this.Moves = [];
        this._handleUndoEnablement();
    }

    Deal = () => {

    }
}
