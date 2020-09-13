'use strict'

var CSTools = CSTools || {};
CSTools.GrammerHelper = {
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

CSTools.Math = {
    Random: (max, min = 0) => {
        return Math.floor(Math.random() * (max - min) + min);
    }
}

CSTools.HTMLHelper = {
    GetDeepestChild: (selector) => {
        let nodes = document.querySelectorAll(selector);
        if (!nodes.length) return false;
        return nodes[nodes.length - 1];
    }
    , GetParentID: (node) => {
        if (node.id != "") {
            return node.id;
        }
        if (!node.parentElement) return false;
        return CSTools.HTMLHelper.GetParentID(node.parentElement);
    }
}
