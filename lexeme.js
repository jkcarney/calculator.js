const pi = 3.14159265358979;
const e = 2.71828182845904;

class Lexeme {
    constructor(singleChar) {
        if(isNaN(singleChar)) {
            switch (singleChar) {
                case "+":
                    this.name = "PLUS";
                    this.type = "OPERATOR";
                    this.value = "+";
                    this.precedence = 0;
                    this.association = "LR";
                    break;
                case "-":
                    this.name = "MINUS";
                    this.type = "OPERATOR";
                    this.value = "-";
                    this.precedence = 0;
                    this.association = "LR";
                    break;
                case "*":
                    this.name = "TIMES";
                    this.type = "OPERATOR";
                    this.value = "*";
                    this.precedence = 1;
                    this.association = "LR";
                    break;
                case "/":
                    this.name = "DIVIDES";
                    this.type = "OPERATOR";
                    this.value = "/";
                    this.precedence = 1;
                    this.association = "LR";
                    break;
                case "(":
                    this.name = "LPAREN";
                    this.type = "LPAREN";
                    this.value = "("
                    break;
                case ")":
                    this.name = "RPAREN";
                    this.type = "RPAREN";
                    this.value = ")"
                    break;
                case "^":
                    this.name = "POWER";
                    this.type = "OPERATOR";
                    this.value = "^"
                    this.precedence = 2;
                    this.association = "RL";
                    break;
                case "p":
                    this.name = "PI";
                    this.type = "NUMBER";
                    this.value = pi;
                    break;
                case "e":
                    this.name = "E";
                    this.type = "NUMBER";
                    this.value = e;
                    break;
                default:
                    this.name = "ERROR";
                    this.value = undefined;
            }
        } else {
            this.value = parseFloat(singleChar);
            this.type = "NUMBER";
            this.name = "NUMBER";
        }
    }
}