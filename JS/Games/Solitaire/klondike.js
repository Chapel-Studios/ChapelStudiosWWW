class KlondikeMove extends SolitaireMove {

    constructor (mouseDownEvent) {
        super(mouseDownEvent);
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
        // CSS Work-Around (ToDo: Fixed in 4!)
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
                lastHand.remove();
            }
        }
        else if (this.Origin.ZoneType === "Stack") {
            let BottomCard = CSTools.HTMLHelper.GetDeepestChild(`#${this.Origin.ZoneName} .playing-card`);
            if (BottomCard.classList.contains("back")) {
                BottomCard.classList.add("show");
                BottomCard.classList.remove("back");
                // CSS Work-Around (ToDo: Fixed in 4!)
                BottomCard.classList.add("bottom-card");
            }
        }
    }
}

class KlondikeMoveList {
    Dragbox;
    Moves;
    CheckForWin;
    __cheatmode__ = false;

    get CurrentMove () {
        if (this.LastMove) {
            return this.LastMove.IsActive ? this.LastMove : null;
        }
        return null;
    }

    get LastMove () {
        if (this.Moves.length > 0) {
            return this.Moves[this.Moves.length - 1];
        }
        return null;
    }

    IsMoveStartValid (mouseEvent) {
        return !((mouseEvent.button !== 0) 
            || (mouseEvent.target.parentElement.classList.contains("back")))
    }
    
    constructor (dragBoxHandle, winCheckCallback) {
        this.Moves = [];
        this.Dragbox = dragBoxHandle;
        this.CheckForWin = winCheckCallback;
        //document.onmousemove = this.UpdateMove;
    }

    StartMove = (mouseEvent) => {
        event.stopPropagation();
        if (!this.IsMoveStartValid(mouseEvent)) return false;

        let currentMove =  this.CurrentMove || new KlondikeMove(mouseEvent);
        let isValid = currentMove.ValidatePickUp();
        if (isValid) {
            this.Moves.push(currentMove);
            this.UpdateMove(mouseEvent);
            currentMove.Start(this.Dragbox);
            // Register Drag Event
            document.onmousemove = this.UpdateMove;
        }
    }

    UpdateMove = (mouseMoveEvent) => {
        let currentMove = this.CurrentMove;
        let x = 0;
        let y = 0;

        if (currentMove) {
            if (currentMove.IsActive) {
                this.Dragbox.hidden = true;
                let target = document.elementFromPoint(event.clientX, event.clientY);
                this.Dragbox.hidden = false;

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
    }

    FinishMove = (mouseUpEvent) => {
        event.stopPropagation();
        let currentMove = this.CurrentMove;
        if (currentMove && currentMove.IsActive) {
            currentMove.Desination = new MoveDestination(currentMove.CurrentDropZone);

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
            }
            document.onmousemove = null;
        }
    }

}

