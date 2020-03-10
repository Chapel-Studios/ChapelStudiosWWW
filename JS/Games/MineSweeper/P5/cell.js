
const RED = [255, 0, 0];
const GREY = [127];

function Cell(x, y, w) {
    this.IsFlagged = false;
    this.IsDangerous = false;
    this.Location = {
        X: x
        , Y: y
    };
    this.Width = w;
    this.IsRevealed = false;
    this.DangerLevel = 0;
    this.FlagColour = RED;
    this.MineColour = GREY;
}

Cell.prototype.Show = function () {
    // Shorthands
    const quarterWidth = (0.25 * this.Width);
    const eighthWidth = quarterWidth * 0.5;
    const halfWidth = (0.5 * this.Width);
    const threeQWidth = (0.75 * this.Width);
    // X Shorthands
    const xPlus3E = this.Location.X + quarterWidth + eighthWidth;
    const xPlusHalf = this.Location.X + halfWidth;
    const xPlus3Q = this.Location.X + threeQWidth;
    // Y Shorthands
    const yPlus1Q = this.Location.Y + quarterWidth;
    const yPlus3Q = this.Location.Y + threeQWidth;
    const yPlusHalf = this.Location.Y + halfWidth;
    const yPlus5E = yPlusHalf + eighthWidth;
    const yPlus7E = this.Location.Y + this.Width - eighthWidth;

    stroke(0);
    noFill();
    rect(this.Location.X, this.Location.Y, this.Width, this.Width);

    if (this.IsRevealed) {
        if (this.IsDangerous) {
            fill(...this.MineColour);
            ellipse(xPlusHalf, yPlusHalf, halfWidth);
        }
        else {
            fill(200)
            rect(this.Location.X, this.Location.Y, this.Width, this.Width);
            if (this.DangerLevel > 0) {
                fill(0);
                textAlign(CENTER);
                text(this.DangerLevel, xPlusHalf, yPlus3Q);
            }
        }
    }
    else if (this.IsFlagged) {
        const flagLeft = xPlus3E;
        const flagTop = yPlus1Q;
        const flagBottomY = yPlus5E;
        const tipHeightOffset = (flagBottomY - flagTop) / 2;

        const topPoint = [flagLeft, flagTop];
        const flagBottom = [flagLeft, flagBottomY];
        const flagTip = [xPlus3Q, flagTop + tipHeightOffset];
        const poleBtm = [flagLeft, yPlus7E];

        fill(...this.FlagColour);
        triangle(...topPoint, ...flagBottom, ...flagTip);
        line(...topPoint, ...poleBtm);
    }
}

Cell.prototype.Reveal = function (isGameOver = false, wasWin = false) {
    if (isGameOver) {
        if (this.IsFlagged && !this.IsDangerous) {
            this.FlagColour = GREY;
        }
        if (!this.IsFlagged && this.IsDangerous) {
            this.FlagColour = [38];
            if (wasWin)
                this.IsFlagged = true;
        }
    }

    let shouldReveal = isGameOver
        ? (this.IsDangerous && !this.IsFlagged)
        : !this.IsFlagged;
    if (shouldReveal) {
        if (this.IsDangerous) {
            this.Explode();
        }
        this.IsRevealed = true;
    }
}

Cell.prototype.ToggleFlag = function () {
    if (!this.IsRevealed) {
        this.IsFlagged = !this.IsFlagged;
    }
}

Cell.prototype.Explode = function () {
    this.MineColour = RED;
}