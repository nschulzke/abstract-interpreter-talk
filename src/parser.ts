import {createToken, CstNode, CstParser, Lexer, Rule} from "chevrotain";

const Number = createToken({name: "Number", pattern: /\d+/});
const Identifier = createToken({name: "Identifier", pattern: /[a-zA-Z_]+/});

const Plus = createToken({name: "Plus", pattern: /\+/});
const Minus = createToken({name: "Minus", pattern: /-/});
const Mult = createToken({name: "Mult", pattern: /\*/});
const Div = createToken({name: "Div", pattern: /\//});
const Mod = createToken({name: "Mod", pattern: /%/});

const LParen = createToken({name: "LParen", pattern: /\(/});
const RParen = createToken({name: "RParen", pattern: /\)/});

const Equal = createToken({name: "Equal", pattern: /=/});
const Colon = createToken({name: "Colon", pattern: /:/});
const Dot = createToken({name: "Dot", pattern: /\./});
const Semi = createToken({name: "Semi", pattern: /;/});

const True = createToken({name: "True", pattern: /true/});
const False = createToken({name: "False", pattern: /false/});
const This = createToken({name: "This", pattern: /this/});

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
    Mod,
    LParen,
    RParen,
    Equal,
    Colon,
    Dot,
    Semi,
    True,
    False,
    This,
    Identifier,
];

const TinyLexer = new Lexer(allTokens);

class TinyParser extends CstParser {
    public program = this.RULE("program", () => {
        this.MANY(() => this.SUBRULE(this.statement));
    });

    public statement = this.RULE("statement", () => {
        this.MANY(() => {
            this.OR([
                {ALT: () => this.SUBRULE(this.variableAssignment)},
                {ALT: () => this.SUBRULE(this.sinkAssignment)},
            ]);
            this.CONSUME(Semi);
        })
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
                {ALT: () => this.CONSUME(Mod)},
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
