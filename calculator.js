
document.getElementById("calcButtons").addEventListener("click",function(e) {
    if(e.target && e.target.nodeName == "BUTTON") {
        //console.log(e.target.id);
        if(e.target.id == "clear") {
            clearDisplay();
        } else if(e.target.id == "=") {
            let lexical_array = analyze(document.getElementById("display").textContent);
            let syntax_tree = parseExpr(lexical_array, -1);
            //console.log(syntax_tree);
            let answer = evaluateTree(syntax_tree);
            clearDisplay();
            if(answer != undefined && Number.isFinite(answer)) {
                concatDisplay(answer);
            }
        } else {
            concatDisplay(e.target.id);
        }
    }
});

/*  
 *  clearDisplay: Empties the current display text.
 * 
 * @param none
 */
function clearDisplay() {
    let field = document.getElementById("display");
    field.textContent = "";
}

/*  
 *  concatDisplay: Takes input from calculator button event listener that called 
 *  (charToConcat) then concatenates it to the existing string in the display
 * 
 * @param {charToConcat} A string from the calculator that will be added to the
 * existing display
 */
function concatDisplay (charToConcat) {
    let field = document.getElementById("display");
    field.textContent += charToConcat;
}

/*  
 *  errorOccured: Alerts the user about a potential error with a message.
 *  Clears the display.
 * 
 *  @param {message} The error message passed by the caller
 */
function errorOccured(message) {
    alert("An error occured: " + message);
    clearDisplay();
}

/*  
 *  analyze: Analyzes a string (input) and returns an array of lexemes
 * 
 *  @param {input} the current string stored in the display field
 */
function analyze (input) {
    let lexical_array = [];
    // The for loop goes through input by removing the first char on each iteration.
    // This was the only way I found I could actually parse numbers using .match() even if it seems roundabout
    for(let str = input; str.length > 0; str = str.substring(1)) {
        const nonNumerics = "+-*/^()pe";
        let lex = str.charAt(0);
        if(nonNumerics.includes(lex)) {
            lexical_array.push(new Lexeme(lex));
        } else if(lex == "i") {
            continue;
        } else {
            lex = str.match(/[0-9\.]+/); // match numerics and dots
            try {
                str = str.substring(lex[0].length-1); // substring str by lex.length-1 to stop loop from tossing non numerics
                lexical_array.push(new Lexeme(lex));
            } catch (err) {
                errorOccured(err.name + " during input parsing. You probably put two numbers next to each other without an operator.");
                return;
            }
        }
    }
    //lexical_array.forEach(lexeme => console.log(lexeme.name));
    return lexical_array;
}

/*  
 *  parseExpr: Analyzes an array of lexemes and returns a expression tree
 * 
 *  @param {lexical_array}   An array of lexemes to be parsed
 *         {prev_precedence} The precedence of the last operator 
 */
function parseExpr(lexical_array, prev_precedence) {
    let lhs = nextTerm(lexical_array);
    while (lexical_array.length > 0) {
        let op = peekLexeme(lexical_array);
        let curr_precedence;
        if(op.type == "OPERATOR") {
            curr_precedence = op.precedence;
        } else {
            errorOccured("Invalid syntax. Likely two consecutive numbers without an operator.");
            return;
        }

        if(curr_precedence == undefined || curr_precedence < prev_precedence) {
            break;
        }

        op = popLexeme(lexical_array);

        if(op.association == "LR") { // + - * /
            let rhs = parseExpr(lexical_array, curr_precedence + 1);
            lhs = new ExpressionNode (op, lhs, rhs);
        } else { // ^
            let rhs = parseExpr(lexical_array, curr_precedence);
            lhs = new ExpressionNode (op, lhs, rhs);
        }
    }
    return lhs;
}

/*  
 *  nextTerm: Pops the next lexeme from lex_array and returns a number node.
 *  The next lexeme MUST be a number or LPAREN or else an error will occur.
 * 
 *  
 *  @param {lex_arr} An array of lexemes
 */
function nextTerm(lex_arr) {
    let lex = popLexeme(lex_arr);
    if(lex == undefined) {
        errorOccured("The next lexeme was not defined (probably incomplete expression).");
        return;
    }
    // If the lexeme is a number, return a new NumberNode
    if (lex.type == "NUMBER") {
        return new NumberNode(lex);
    } else if(lex.type == "LPAREN") {
        // Find the index of a RPAREN. 
        let pos = lex_arr.map(function(e) { return e.name;}).indexOf("RPAREN");
        if(pos == -1) { // If we didn't find an RPAREN, its unbalanced. Error.
            errorOccured("Unbalanced parenthesis");
            return;
        } else { // We found an RPAREN, which means it's balanced.
            // Splice the lex_arr from 0 to pos and parse it's expression
            let node = parseExpr(lex_arr.splice(0, pos), -1);
            popLexeme(lex_arr);
            return node;
        }
    } else {
        errorOccured("Lexeme wasn't valid. You may have had multiple consecutive operators.");
        return;
    }
}

/*  
 *  popLexeme: pops the next lexeme from lex_array and returns it.
 * 
 *  @param {lex_arr} An array of lexemes
 */
function popLexeme(lex_arr) {
    return lex_arr.shift();
}

/*  
 *  peekLexeme: returns the first lexeme from the lex_arr without popping it.
 * 
 *  @param {lex_arr} An array of lexemes
 */
function peekLexeme(lex_arr) {
    if(lex_arr.length > 0) {
        return lex_arr[0];
    } else {
        return undefined;
    }
}

/*  
 *  evaluateTree: Recursively solve the expression tree rooted at node
 *  and returns an answer (either an int or a float)
 * 
 *  @param {node} The root of the expression tree to be solved.
 */
function evaluateTree(node) {
    if(node instanceof ExpressionNode) {
        let lhs = evaluateTree(node.left);
        let rhs = evaluateTree(node.right);
        return evaluate(lhs, node.operator, rhs);
    } else if (node instanceof NumberNode) {
        return node.value;
    }
}

/*  
 *  evaluate: Helper function that calculates a single expression.
 *  Valid operators include: +, -, *, /, and ^
 * 
 *  @param {left}     The operand on the left of the expression
 *         {right}    The operand on the right of the expression
 *         {operator} The operator to execute on the two operands
 */
function evaluate(left, operator, right) {
    switch (operator) {
        case "+":
            return left + right;
        case "-":
            return left - right;
        case "*":
            return left * right;
        case "/":
            return left / right;
        case "^":
            return left ** right;
        default: 
            errorOccured("evaulate encountered invalid operator"); 
    }
}