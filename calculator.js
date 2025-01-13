const screen = document.querySelector(".cal-screen");
const btnDiv = document.querySelector(".cal-buttons");

activeExpression = []
prevAnswer = null;
operators = new Set(
    [" * ", " / ", " + ", " - ", " ^ "]
);
functions = new Set(
    ["L", "S", "C", "T"]
);


btnDiv.addEventListener("click", function (e) {
    handleClickEvent(e);
    console.log(activeExpression)
});



function handleClickEvent(event) {
    if (event.target.matches(".num-btn")) {
        appendDigit(event.target);
        updateScreen();
    } else if (event.target.matches(".operator")) {
        if (appendOperator(event.target)) {
            updateScreen();
        }
    } else if (event.target.matches(".negative")) {
        handleSubtraction(event.target);
        updateScreen();
    }
}


function appendDigit(element) {
    const digit = element.textContent;
    if (activeExpression.length === 0) {
        activeExpression.push(digit);

    } else {
        const topPeek = activeExpression[activeExpression.length - 1];
        if (topPeek === ")") {
            insertImpliedMultiplication();
            activeExpression.push(digit);
        } else if (operators.has(topPeek) || functions.has(topPeek)) {
            activeExpression.push(digit);
        } else {
            let num = activeExpression.pop()
            num += digit;
            activeExpression.push(num);
        }
    }
}


function appendOperator(element) {
    if (activeExpression.length === 0) {
        return false;
    }
    const symbol = element.dataset.symbol;
    activeExpression.push(symbol);
    return true;
}


function handleSubtraction(element) {
    if (activeExpression.length === 0) {
        activeExpression.push("-");
    } else {
        const topPeek = activeExpression[activeExpression.length - 1];
        if (operators.has(topPeek) || functions.has(topPeek)) {
            activeExpression.push("-");
        } else {
            activeExpression.push(" - ");
        }
    }
}


function insertImpliedMultiplication() {
    activeExpression.push(" * ");
}


function updateScreen() {
    humanReadAble = [];

    for (let i = 0; i < activeExpression.length; i += 1) {
        let current = activeExpression[i];
        if (operators.has(current) || functions.has(current)) {
            current = parseSymbol(current);
        }
        humanReadAble.push(current);
    }

    let readableString;
    if (humanReadAble.length > 0) {
        readableString = humanReadAble.join("");
    } else {
        readableString = "0";
    }
    screen.textContent = readableString;
}


function parseSymbol(symbol) {
    if (symbol === " * ") {
        symbol = "x";
    } else if (symbol.length === 3) {
        symbol = symbol[1]; //might leave spaces with operators 
    } else {
        if (symbol === "L") {
            symbol = "log(";
        } else if (symbol === "S") {
            symbol = "sin(";
        } else if (symbol === "C") {
            symbol = "cos(";
        } else if (symbol === "T") {
            symbol = "tan(";
        }
    }
    return symbol;
}