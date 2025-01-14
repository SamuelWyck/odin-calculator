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





let shuntingConversion = new ShuntingConversion();
let postFixEval = new PostFixEval();

let ex = "C(3.3 + 4) * 5) - 1";

let result = shuntingConversion.convert(ex);

console.log(result);

console.log(postFixEval.evaluate(result));


