import {
    VariableAssignmentCstChildren,
    SinkAssignmentCstChildren,
    ExpressionCstChildren,
    FactorCstChildren,
    ParenthesisCstChildren,
    ProgramCstChildren,
    StatementCstChildren,
    TermCstChildren,
    BooleanLiteralCstChildren,
    NumberLiteralCstChildren,
    VariableReferenceCstChildren,
    SourceReferenceCstChildren,
    ArithmeticExpressionCstChildren,
    ComparisonExpressionCstChildren,
    ChooseExpressionCstChildren, WhenClauseCstChildren, OtherwiseClauseCstChildren
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
        if (ctx.variableAssignment) {
            return this.visit(ctx.variableAssignment);
        } else if (ctx.sinkAssignment) {
            return this.visit(ctx.sinkAssignment);
        } else {
            return "(statement)"
        }
    }

    variableAssignment(ctx: VariableAssignmentCstChildren): string {
        return `(variableAssignment ${ctx.Identifier[0].image} ${this.visit(ctx.expression)})`;
    }

    sinkAssignment(ctx: SinkAssignmentCstChildren): string {
        return `(sinkAssignment ${ctx.Identifier[0].image} ${this.visit(ctx.expression)})`;
    }

    expression(ctx: ExpressionCstChildren): string {
        if (ctx.chooseExpression) {
            return this.visit(ctx.chooseExpression);
        } else if (ctx.comparisonExpression) {
            return this.visit(ctx.comparisonExpression);
        } else {
            return "(expression)";
        }
    }

    chooseExpression(ctx: ChooseExpressionCstChildren): string {
        if (ctx.whenClause) {
            const whenClauses = ctx.whenClause.map(whenClause => this.visit(whenClause)).join(" ");
            const otherwiseClause = ctx.otherwiseClause ? ` ${this.visit(ctx.otherwiseClause)}` : "";
            return `(chooseExpression ${whenClauses}${otherwiseClause})`;
        } else {
            return "(chooseExpression)";
        }
    }

    whenClause(ctx: WhenClauseCstChildren): string {
        return `(whenClause ${this.visit(ctx.predicate)} ${this.visit(ctx.consequent)})`;
    }

    otherwiseClause(ctx: OtherwiseClauseCstChildren): string {
        return `(otherwiseClause ${this.visit(ctx.consequent)})`;
    }

    comparisonExpression(ctx: ComparisonExpressionCstChildren): string {
        if (ctx.rhs) {
            const comparisonOp = ctx.Less || ctx.LessEqual || ctx.Greater || ctx.GreaterEqual || ctx.EqualEqual || ctx.BangEqual;
            if (comparisonOp) {
                return `(${comparisonOp[0].image} ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
            } else {
                return `(? ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    arithmeticExpression(ctx: ArithmeticExpressionCstChildren): string {
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

    factor(ctx: FactorCstChildren): string {
        if (ctx.parenthesis) {
            return this.visit(ctx.parenthesis);
        } else if (ctx.numberLiteral) {
            return this.visit(ctx.numberLiteral);
        } else if (ctx.booleanLiteral) {
            return this.visit(ctx.booleanLiteral);
        } else if (ctx.variableReference) {
            return this.visit(ctx.variableReference);
        } else if (ctx.sourceReference) {
            return this.visit(ctx.sourceReference);
        } else {
            return "(factor)";
        }
    }

    parenthesis(ctx: ParenthesisCstChildren): string {
        return this.visit(ctx.expression);
    }

    booleanLiteral(ctx: BooleanLiteralCstChildren): string {
        const trueFalse = ctx.True || ctx.False;
        return trueFalse![0].image;
    }

    numberLiteral(ctx: NumberLiteralCstChildren): string {
        return ctx.literal[0].image;
    }

    variableReference(ctx: VariableReferenceCstChildren): string {
        return ctx.variable[0].image;
    }

    sourceReference(ctx: SourceReferenceCstChildren): string {
        return ctx.source[0].image;
    }
}

export function cstToString(cst: CstNode) {
    const visitor = new SExpressionVisitor();
    return visitor.visit(cst);
}