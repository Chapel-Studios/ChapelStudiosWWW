class MoveOrigin {
    HandleElement;
    ZoneName;
    
    constructor(handleElement) {
        this.HandleElement = handleElement;
        this.ZoneName = NSJ.GetParentID(handleElement);
    }
}

class SolitaireMove {
    //where came from
    Origin;
    // what is moving
    Stack;
    //where it is going
    Desination = {

    }
    //was it successful?
    Result = null;

    constructor (event) {
        this.Stack = event.target.parentElement;
        this.Origin = new MoveOrigin(this.Stack.parentElement);
            // Only reset if actually picking something up in case card gets stuck to pointer
            // ToDo: better work-around: drop stack on origin when point focus(?) lost
        if (this.Origin.ZoneName === "DragBox") {
            return null;
        }
    }
}