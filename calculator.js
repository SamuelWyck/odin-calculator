const screen = document.querySelector(".cal-screen");
const btnDiv = document.querySelector(".cal-buttons");
const degBtn = document.querySelector(".deg-btn");
const radBtn = document.querySelector(".rad-btn");


let degrees = true; 
let activeExpression = [];
let prevAnswer = null;
let operators = new Set(
    [" * ", " / ", " + ", " - ", " ^ "]
);
let functions = new Set(
    ["L", "S", "C", "T"]
);

let shuntingConversion = new ShuntingConversion();
let postFixEval = new PostFixEval();


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
        handleSubtraction();
        updateScreen();
    } else if (event.target.matches(".func")) {
        appendFunction(event.target)
        updateScreen();
    } else if (event.target.matches(".paren")) {
        appendParen(event.target);
        updateScreen();
    } else if (event.target.matches(".del-btn")) {
        popSymbol();
        updateScreen();
    } else if (event.target.matches(".reset-btn")) {
        resetExpression();
        updateScreen();
    } else if (event.target.matches(".prev-answer-btn")) {
        if (appendPrevAnswer()) {
            updateScreen();
        }
    } else if (event.target.matches(".deg-btn")) {
        changeAngleUnits(event.target);
    } else if (event.target.matches(".rad-btn")) {
        changeAngleUnits(event.target);
    } else if (event.target.matches(".equal-btn")) {
        calculateExpression();
    }
}



function calculateExpression() {
    let infixExpression = activeExpression.join("");
    let postFixArray = shuntingConversion.convert(infixExpression);
    
    try {
        let answerArray = postFixEval.evaluate(postFixArray, degrees);
    } catch (err) {
        handleError(err);
    }
}


function changeAngleUnits(element) {
    const btnType = element.dataset.type;
    if (btnType === "rad" && degrees) {
        degrees = false;
        radBtn.classList.toggle("active-btn");
        degBtn.classList.toggle("active-btn");
    } else if (btnType === "deg" && !degrees) {
        degrees = true;
        radBtn.classList.toggle("active-btn");
        degBtn.classList.toggle("active-btn");
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
        } else if (operators.has(topPeek) || functions.has(topPeek) || topPeek === "(") {
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


function handleSubtraction() {
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


function appendFunction(element) {
    const functionSymbol = element.dataset.symbol;
    const topPeek = activeExpression[activeExpression.length - 1];

    if (activeExpression.length === 0) {
        activeExpression.push(functionSymbol);
        return;
    }
    if (topPeek === ")" || (!operators.has(topPeek) && !functions.has(topPeek))) {
        insertImpliedMultiplication();
    }
    activeExpression.push(functionSymbol);
}


function appendParen(element) {
    const parenSymbol = element.dataset.symbol;
    if (parenSymbol === "(") {
        if (activeExpression.length === 0) {
            activeExpression.push(parenSymbol);
            return;
        }
        const topPeek = activeExpression[activeExpression.length - 1];
        if (topPeek !== "(" && !operators.has(topPeek) && !functions.has(topPeek)) {
            insertImpliedMultiplication();
        }
        activeExpression.push(parenSymbol);
    } else {
        activeExpression.push(parenSymbol);
    }
}


function popSymbol() {
    if (activeExpression.length === 0) {
        return;
    }

    let topSymbol = activeExpression.pop();
    if (!operators.has(topSymbol) && topSymbol.length > 1) {
        topSymbol = topSymbol.slice(0, topSymbol.length - 1);
        if (topSymbol.length > 0) {
            activeExpression.push(topSymbol);
        }
    }
}


function resetExpression() {
    activeExpression = [];
}


function appendPrevAnswer() {
    if (prevAnswer === null) {
        return false;
    }
    const topPeek = activeExpression[activeExpression.length - 1];
    if (topPeek !== "(" && !operators.has(topPeek) && !functions.has(topPeek)) {
        insertImpliedMultiplication();
    }
    activeExpression.push(String(prevAnswer));
    return true;
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




function ShuntingConversion() {
    this.operatorPrecedence = {
        "+": [1, true],
        "-": [1, true],
        "*": [2, true],
        "/": [2, true],
        "^": [3, false]
    };

    this.functions = new Set(
        ["L", "S", "C", "T"]
    );



    this.convert = function(expression) {
        let operatorStack = [];
        let postFix = [];
        let currentOperand = [];

        let pointer = 0;

        while (pointer < expression.length) {
            currentSymbol = expression[pointer];

            if (currentSymbol !== " " && currentSymbol !== "(" && currentSymbol !== ")" && !this.functions.has(currentSymbol)) {
                currentOperand.push(currentSymbol);
                pointer += 1;

            } else {
                if (currentOperand.length > 0) {
                    postFix.push(currentOperand.join(""));
                    currentOperand = [];
                }

                let isOperator = currentSymbol !== "(" && currentSymbol !== ")" && !this.functions.has(currentSymbol);

                if (isOperator) {
                    pointer += 1;
                    currentSymbol = expression[pointer];
                }

                this.handleOperator(currentSymbol, operatorStack, postFix);

                if (isOperator) {
                    pointer += 2;
                } else {
                    pointer += 1;
                }
            }
        }

        if (currentOperand.length > 0) {
            postFix.push(currentOperand.join(""));
        }
        while (operatorStack.length > 0) {
            let operator = operatorStack.pop();
            postFix.push(operator);
        }
        return postFix;  
    }


    this.handleOperator = function(currentSymbol, operatorStack, postFix) {
        if (currentSymbol == "(" || currentSymbol == ")" || this.functions.has(currentSymbol)) {
            this.handleParensAndFunctions(currentSymbol, operatorStack, postFix);
            return;
        }

        while (true) {
            if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] === "(" || this.functions.has(operatorStack[operatorStack.length - 1])) {
                operatorStack.push(currentSymbol);
                break;
            }

            let topOperator = operatorStack[operatorStack.length - 1];

            let currentOpPrecedence = this.operatorPrecedence[currentSymbol][0];
            let topOpPrecedence = this.operatorPrecedence[topOperator][0];

            if (currentOpPrecedence > topOpPrecedence) {
                operatorStack.push(currentSymbol);
                break;

            } else if (currentOpPrecedence < topOpPrecedence) {
                operatorStack.pop();
                postFix.push(topOperator);

            } else {
                
                let currentIsLeftAssociative = this.operatorPrecedence[currentSymbol][1];

                if (currentIsLeftAssociative) {
                    operatorStack.pop();
                    postFix.push(topOperator);
                } else {
                    operatorStack.push(currentSymbol);
                    break;
                }
            }
        }
    }


    this.handleParensAndFunctions = function(currentSymbol, operatorStack, postFix) {
        if (currentSymbol === "(" || this.functions.has(currentSymbol)) {
            operatorStack.push(currentSymbol);

        } else {

            while (true) {
                let operator = operatorStack.pop();

                if (operator === "(") {
                    break;
                } else if (this.functions.has(operator)) {
                    postFix.push(operator);
                    break;
                }
                postFix.push(operator);
            }
        }
    }
}  



function PostFixEval() {
    this.operators = new Set(
        ["+", "-", "*", "/", "^"]
    );

    this.functions = new Set(
        ["L", "S", "C", "T"]
    );

    this.degrees = true;



    this.evaluate = function(expression, degrees=true) {
        this.degrees = degrees;
        let operandStack = [];
        const expressionSize = expression.length;
        let pointer = 0;

        while (pointer < expressionSize) {
            let currentElement = expression[pointer];

            if (this.operators.has(currentElement)) {
                this.evalOperation(currentElement, operandStack);

            } else if (this.functions.has(currentElement)) {
                this.evalFunction(currentElement, operandStack);

            } else {
                operandStack.push(currentElement);
            }
            pointer += 1;
        }

        return operandStack;
    }


    this.evalFunction = function(functionSymbol, operandStack) {
        if (functionSymbol === "L") {
            this.handleLog(operandStack);
        } else if (functionSymbol === "S") {
            this.handleSine(operandStack);
        } else if (functionSymbol === "C") {
            this.handleCosine(operandStack);
        } else if (functionSymbol === "T") {
            this.handleTangent(operandStack);
        }
    }


    this.toRadians = function(angle) {
        return angle * (Math.PI / 180);
    }


    this.handleCosine = function(operandStack) {
        let angle = Number(operandStack.pop());
        if (this.degrees) {
            angle = this.toRadians(angle);
        }
        let result = Math.cos(angle);
        operandStack.push(result);
    }


    this.handleLog = function(operandStack) {
        let operand = Number(operandStack.pop());
        let result = Math.log10(operand);
        operandStack.push(result);
    }


    this.handleSine = function(operandStack) {
        let angle = Number(operandStack.pop());
        if (this.degrees) {
            angle = this.toRadians(angle);
        }
        let result = Math.sin(angle);
        operandStack.push(result);
    }


    this.handleTangent = function(operandStack) {
        let angle = Number(operandStack.pop());
        if (this.degrees) {
            angle = this.toRadians(angle);
        }
        let result = Math.tan(angle);
        operandStack.push(result);
    }


    this.evalOperation = function(operator, operandStack) {
        if (operator === "+") {
            this.handleAddition(operandStack);
        } else if (operator === "-") {
            this.handleSubtraction(operandStack);
        } else if (operator === "*") {
            this.handleMultiplication(operandStack);
        } else if (operator === "/") {
            this.handleDivision(operandStack);
        } else if (operator === "^") {
            this.handleExponent(operandStack);
        }
    }


    this.handleAddition = function(operandStack) {
        let rightSide = Number(operandStack.pop());
        let leftSide = Number(operandStack.pop());

        let result = leftSide + rightSide;
        operandStack.push(result);
    }


    this.handleSubtraction = function(operandStack) {
        let rightSide = Number(operandStack.pop());
        let leftSide = Number(operandStack.pop());

        let result = leftSide - rightSide;
        operandStack.push(result);
    }


    this.handleMultiplication = function(operandStack) {
        let rightSide = Number(operandStack.pop());
        let leftSide = Number(operandStack.pop());

        let result = leftSide * rightSide;
        operandStack.push(result);
    }


    this.handleDivision = function(operandStack) {
        let rightSide = Number(operandStack.pop());
        let leftSide = Number(operandStack.pop());

        let result = leftSide / rightSide;
        operandStack.push(result);
    }


    this.handleExponent = function(operandStack) {
        let rightSide = Number(operandStack.pop());
        let leftSide = Number(operandStack.pop());

        let result = Math.pow(leftSide, rightSide);
        operandStack.push(result);
    }
}