


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


let shuntingConversion = new ShuntingConversion();

let ex = "C(3.3 + 4) * 5) - 1";

console.log(shuntingConversion.convert(ex));
