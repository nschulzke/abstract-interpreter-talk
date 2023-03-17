import {createToken, CstNode, CstParser, Lexer, Rule} from "chevrotain";
import {
    AssignmentCstChildren,
    ExpressionCstChildren,
    FactorCstChildren,
    ParenthesisCstChildren,
    ProgramCstChildren,
    StatementCstChildren,
    TermCstChildren
} from "./json_cst";

const Number = createToken({name: "Number", pattern: /\d+/});
const Identifier = createToken({name: "Identifier", pattern: /[a-zA-Z_]/});

const Plus = createToken({name: "Plus", pattern: /\+/});
const Minus = createToken({name: "Minus", pattern: /-/});
const Mult = createToken({name: "Mult", pattern: /\*/});
const Div = createToken({name: "Div", pattern: /\//});
const Mod = createToken({name: "Mod", pattern: /%/});

const LParen = createToken({name: "LParen", pattern: /\(/});
const RParen = createToken({name: "RParen", pattern: /\)/});

const Arrow = createToken({name: "Arrow", pattern: /=>/});
const LBrace = createToken({name: "LBrace", pattern: /{/});
const RBrace = createToken({name: "RBrace", pattern: /}/});
const Comma = createToken({name: "Comma", pattern: /,/});

const Const = createToken({name: "Const", pattern: /const/});
const Equal = createToken({name: "Equal", pattern: /=/});

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
    Arrow,
    LBrace,
    RBrace,
    Comma,
    Const,
    Equal,
    Identifier,
];

const TinyLexer = new Lexer(allTokens);

class TinyParser extends CstParser {
    public program = this.RULE("program", () => {
        this.MANY(() => this.SUBRULE(this.statement));
    });

    public statement = this.RULE("statement", () => {
        this.SUBRULE(this.assignment);
    });

    public assignment = this.RULE("assignment", () => {
        this.CONSUME(Const);
        this.CONSUME(Identifier);
        this.CONSUME(Equal);
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
            {ALT: () => this.CONSUME(Identifier)},
            {ALT: () => this.CONSUME(Number)},
        ]);
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

const BaseCstVisitor = new TinyParser().getBaseCstVisitorConstructor();

/**
 * Converts a CST to a string in s-expression form
 */
class SExpressionVisitor extends BaseCstVisitor {
    constructor() {
        super();
        this.validateVisitor();
    }

    program(ctx: ProgramCstChildren): string {
        if (ctx.statement) {
            return `(program ${this.visit(ctx.statement)})`;
        } else {
            return "(program)";
        }
    }

    statement(ctx: StatementCstChildren): string {
        if (ctx.assignment) {
            return this.visit(ctx.assignment);
        } else {
            return "(statement)"
        }
    }

    assignment(ctx: AssignmentCstChildren): string {
        return `(assignment ${ctx.Identifier[0].image} ${this.visit(ctx.expression)})`;
    }

    expression(ctx: ExpressionCstChildren): string {
        if (ctx.rhs) {
            const plusMinus = ctx.Plus || ctx.Minus;
            if (plusMinus) {
                return `(${plusMinus[0].image} ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
            } else {
                return `(? ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    term(ctx: TermCstChildren): string {
        if (ctx.rhs) {
            const multDivMod = ctx.Mult || ctx.Div || ctx.Mod;
            if (multDivMod) {
                return `(${multDivMod[0].image} ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
            } else {
                return `(? ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    factor(ctx: FactorCstChildren) {
        if (ctx.parenthesis) {
            return this.visit(ctx.parenthesis);
        } else if (ctx.Identifier) {
            return ctx.Identifier[0].image;
        } else if (ctx.Number) {
            return ctx.Number[0].image;
        }
    }

    parenthesis(ctx: ParenthesisCstChildren) {
        return this.visit(ctx.expression);
    }
}

const parser = new TinyParser()

export const productions: Record<string, Rule> = parser.getGAstProductions()

export function cstToString(cst: CstNode) {
    const visitor = new SExpressionVisitor();
    return visitor.visit(cst);
}

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
