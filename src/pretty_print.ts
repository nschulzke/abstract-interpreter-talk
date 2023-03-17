import {
    AssignmentCstChildren,
    ExpressionCstChildren,
    FactorCstChildren,
    ParenthesisCstChildren,
    ProgramCstChildren,
    StatementCstChildren,
    TermCstChildren
} from "./json_cst";
import {BaseCstVisitor} from "./parser";
import {CstNode} from "chevrotain";

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

export function cstToString(cst: CstNode) {
    const visitor = new SExpressionVisitor();
    return visitor.visit(cst);
}