import {createToken, CstNode, CstParser, Lexer, Rule} from "chevrotain";

const Number = createToken({name: "Number", pattern: /\d+/});
const Identifier = createToken({name: "Identifier", pattern: /[a-zA-Z_]+/});

const Plus = createToken({name: "Plus", pattern: /\+/});
const Minus = createToken({name: "Minus", pattern: /-/});
const Mult = createToken({name: "Mult", pattern: /\*/});
const Div = createToken({name: "Div", pattern: /\//});

const LParen = createToken({name: "LParen", pattern: /\(/});
const RParen = createToken({name: "RParen", pattern: /\)/});

const BangEqual = createToken({name: "BangEqual", pattern: /!=/});
const LessEqual = createToken({name: "LessEqual", pattern: /<=/});
const GreaterEqual = createToken({name: "GreaterEqual", pattern: />=/});
const EqualEqual = createToken({name: "EqualEqual", pattern: /==/});
const Less = createToken({name: "Less", pattern: /</});
const Greater = createToken({name: "Greater", pattern: />/});

const Equal = createToken({name: "Equal", pattern: /=/});
const Colon = createToken({name: "Colon", pattern: /:/});
const Dot = createToken({name: "Dot", pattern: /\./});

const True = createToken({name: "True", pattern: /true/});
const False = createToken({name: "False", pattern: /false/});
const This = createToken({name: "This", pattern: /this/});
const When = createToken({name: "When", pattern: /when/});
const Otherwise = createToken({name: "Otherwise", pattern: /otherwise/});

const Whitespace = createToken({
    name: "Whitespace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

const allTokens = [
    Whitespace,
    Number,
    Plus,
    Minus,
    Mult,
    Div,
    LParen,
    RParen,
    BangEqual,
    LessEqual,
    GreaterEqual,
    EqualEqual,
    Less,
    Greater,
    Equal,
    Colon,
    Dot,
    True,
    False,
    This,
    When,
    Otherwise,
    Identifier,
];

const TinyLexer = new Lexer(allTokens);

class TinyParser extends CstParser {
    public program = this.RULE("program", () => {
        this.MANY(() => this.SUBRULE(this.statement));
    });

    public statement = this.RULE("statement", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.variableAssignment)},
            {ALT: () => this.SUBRULE(this.sinkAssignment)},
        ]);
    });

    public variableAssignment = this.RULE("variableAssignment", () => {
        this.CONSUME(Identifier);
        this.CONSUME(Equal);
        this.SUBRULE(this.expression);
    });

    public sinkAssignment = this.RULE("sinkAssignment", () => {
        this.CONSUME(Identifier);
        this.CONSUME(Colon);
        this.SUBRULE(this.expression);
    });

    public expression = this.RULE("expression", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.chooseExpression)},
            {ALT: () => this.SUBRULE(this.comparisonExpression)},
        ]);
    });

    public chooseExpression = this.RULE("chooseExpression", () => {
        this.SUBRULE(this.whenClause)
        this.MANY(() => {
            this.SUBRULE2(this.whenClause);
        });
        this.SUBRULE(this.otherwiseClause);
    });

    public whenClause = this.RULE("whenClause", () => {
        this.CONSUME(When);
        this.SUBRULE(this.expression, {LABEL: "predicate"});
        this.SUBRULE2(this.expression, {LABEL: "consequent"});
    });

    public otherwiseClause = this.RULE("otherwiseClause", () => {
        this.CONSUME(Otherwise);
        this.SUBRULE(this.expression, {LABEL: "consequent"});
    });

    public comparisonExpression = this.RULE("comparisonExpression", () => {
        this.SUBRULE(this.arithmeticExpression, {LABEL: "lhs"});
        this.MANY(() => {
            this.OR([
                {ALT: () => this.CONSUME(Less)},
                {ALT: () => this.CONSUME(Greater)},
                {ALT: () => this.CONSUME(LessEqual)},
                {ALT: () => this.CONSUME(GreaterEqual)},
                {ALT: () => this.CONSUME(EqualEqual)},
                {ALT: () => this.CONSUME(BangEqual)},
            ]);
            this.SUBRULE2(this.arithmeticExpression, {LABEL: "rhs"});
        });
    });

    public arithmeticExpression = this.RULE("arithmeticExpression", () => {
        this.SUBRULE(this.term, {LABEL: "lhs"});
        this.MANY(() => {
            this.OR([
                {ALT: () => this.CONSUME(Plus)},
                {ALT: () => this.CONSUME(Minus)},
            ]);
            this.SUBRULE2(this.term, {LABEL: "rhs"});
        });
    });

    public term = this.RULE("term", () => {
        this.SUBRULE(this.factor, {LABEL: "lhs"});
        this.MANY(() => {
            this.OR([
                {ALT: () => this.CONSUME(Mult)},
                {ALT: () => this.CONSUME(Div)},
            ]);
            this.SUBRULE2(this.factor, {LABEL: "rhs"});
        });
    });

    public factor = this.RULE("factor", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.parenthesis)},
            {ALT: () => this.SUBRULE(this.booleanLiteral)},
            {ALT: () => this.SUBRULE(this.sourceReference)},
            {ALT: () => this.SUBRULE(this.variableReference)},
            {ALT: () => this.SUBRULE(this.numberLiteral)},
        ]);
    });

    public sourceReference = this.RULE("sourceReference", () => {
        this.CONSUME(This);
        this.CONSUME(Dot);
        this.CONSUME(Identifier, {LABEL: "source"});
    });

    public variableReference = this.RULE("variableReference", () => {
        this.CONSUME(Identifier, {LABEL: "variable"});
    });

    public booleanLiteral = this.RULE("booleanLiteral", () => {
        this.OR([
            {ALT: () => this.CONSUME(True)},
            {ALT: () => this.CONSUME(False)},
        ]);
    });

    public numberLiteral = this.RULE("numberLiteral", () => {
        this.CONSUME(Number, {LABEL: "literal"});
    });

    public parenthesis = this.RULE("parenthesis", () => {
        this.CONSUME(LParen);
        this.SUBRULE(this.expression);
        this.CONSUME(RParen);
    });

    constructor() {
        super(allTokens);
        this.performSelfAnalysis();
    }
}

export const BaseCstVisitor = new TinyParser().getBaseCstVisitorConstructor();

const parser = new TinyParser()

export const productions: Record<string, Rule> = parser.getGAstProductions()

export function parse(input: string): CstNode {
    const lexingResult = TinyLexer.tokenize(input);
    parser.reset();
    parser.input = lexingResult.tokens;
    const cst = parser.program();

    if (parser.errors.length > 0) {
        console.log("Parse errors: ", parser.errors);
    }
    return cst;
}
