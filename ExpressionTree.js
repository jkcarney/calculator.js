class NumberNode {
    constructor(lex) {
        this.value = lex.value;
    }
}

class ExpressionNode {
    constructor(lexeme, lhs, rhs) {
        this.operator = lexeme.value;
        this.left = lhs;
        this.right = rhs;
    }
}