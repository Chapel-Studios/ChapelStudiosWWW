'use strict'

var CSTools = CSTools || {};


CSTools.GrammerHelper = {
    GetOrdinalSuffix: (input) => {
        const last = input % 10;
        let result = "th";
        if (last === 1) {
            result = "st";
        }
        else if (last === 2) {
            result = "nd";
        }
        else if (last === 3) {
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
    , ConvertToHexString(int) {
        let result = int.toString(16);
        if (result.length === 1) {
            result = "0" + result;
        }
        return result;
    }
    , GetLastDigit: (rootNumber) => {
        return Number.isInteger(rootNumber)
            ? rootNumber % 10
            : rootNumber.toString().slice(-1);
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
    , _preloadedImages: []
    , PreloadImage: (imgURL) => {
        let img = new Image();
        img.src = imgURL;
        CSTools.HTMLHelper._preloadedImages.push(img);
    }
    , _clickCount: 0
    , DoubleClickHandler: (onSingleClick, onDoubleClick, event) => {
        CSTools.HTMLHelper._clickCount++;
        if (CSTools.HTMLHelper._clickCount >= 2) {
            onDoubleClick(event);
        }
        else {
            setTimeout(function () {
                CSTools.HTMLHelper._clickCount = 0;
            }, 350);
            onSingleClick(event);
        }
    }
    , ButtonActivityHandler: (enabledFunction, event) => {
        if (!event.target.classList.contains("inactive")) {
            enabledFunction(event);
        }
    }
}

CSTools.StorageAssistant = {
    LoadOptions: (optionsArray) => optionsArray.reduce((result, option) => {
        const data = localStorage.getItem(option);
        return data === null
            ? result
            : { ...result, [option]: data }
    }, {})
    , SaveOptions: optionsArray => {
        optionsArray.forEach(([option, data]) => localStorage.setItem(option, data));
    }
}