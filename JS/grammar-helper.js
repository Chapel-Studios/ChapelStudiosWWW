'use strict'

var NSJ = NSJ || {};
NSJ.GrammerHelper = {
    GetOrdinalSuffix: (input) => {
        let result = "th";
        if (input === 1) {
            result = "st";
        }
        else if (input === 2) {
            result = "nd";
        }
        else if (input === 3) {
            result = "rd";
        }
        return result
    }
    , IntToOrdinal: (input) => {
        return input + this.GetCordialSuffix(input);
    }
}
