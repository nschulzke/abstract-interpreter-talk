import {
    ArithmeticExpressionCstChildren,
    BooleanLiteralCstChildren,
    ChooseExpressionCstChildren,
    ComparisonExpressionCstChildren,
    ExpressionCstChildren,
    FactorCstChildren,
    NumberLiteralCstChildren,
    OtherwiseClauseCstChildren,
    ParenthesisCstChildren,
    ProgramCstChildren,
    SinkAssignmentCstChildren,
    SourceReferenceCstChildren,
    StatementCstChildren,
    TermCstChildren,
    VariableAssignmentCstChildren,
    VariableReferenceCstChildren,
    WhenClauseCstChildren
} from "../ast";
import {BaseCstVisitor} from "../parser/parser";
import {CstNode} from "chevrotain";

export type TinyValue =
  | boolean
  | number
  | undefined;

class InterpreterVisitor<TSources extends Record<string, TinyValue>> extends BaseCstVisitor {
    sources: TSources;
    variables: Record<string, TinyValue> = {};
    sinks: Record<string, TinyValue> = {};

    constructor(sources: TSources) {
        super();
        this.validateVisitor();
        this.sources = sources;
    }

    program(ctx: ProgramCstChildren) {
        ctx.statement?.forEach((statement) => {
            this.visit(statement);
        });
    }

    statement(ctx: StatementCstChildren) {
        if (ctx.variableAssignment) {
            this.visit(ctx.variableAssignment);
        } else if (ctx.sinkAssignment) {
            this.visit(ctx.sinkAssignment);
        }
    }

    variableAssignment(ctx: VariableAssignmentCstChildren) {
        this.variables[ctx.Identifier[0].image] = this.visit(ctx.expression);
    }

    sinkAssignment(ctx: SinkAssignmentCstChildren) {
        this.sinks[ctx.Identifier[0].image] = this.visit(ctx.expression);
    }

    expression(ctx: ExpressionCstChildren): TinyValue {
        if (ctx.chooseExpression) {
            return this.visit(ctx.chooseExpression);
        } else if (ctx.comparisonExpression) {
            return this.visit(ctx.comparisonExpression);
        } else {
            return undefined;
        }
    }

    chooseExpression(ctx: ChooseExpressionCstChildren): TinyValue {
        const whenClause = ctx.whenClause?.find((whenClause) =>
            this.visit(whenClause.children.predicate)
        );
        if (whenClause) {
            return this.visit(whenClause);
        } else {
            return this.visit(ctx.otherwiseClause);
        }
    }

    whenClause(ctx: WhenClauseCstChildren): TinyValue {
        return this.visit(ctx.consequent);
    }

    otherwiseClause(ctx: OtherwiseClauseCstChildren): TinyValue {
        return this.visit(ctx.consequent);
    }

    comparisonExpression(ctx: ComparisonExpressionCstChildren): TinyValue {
        if (ctx.rhs) {
            const comparisonOp = ctx.Less || ctx.LessEqual || ctx.Greater || ctx.GreaterEqual || ctx.EqualEqual || ctx.BangEqual;
            const lhs = this.visit(ctx.lhs);
            const rhs = this.visit(ctx.rhs);
            switch (comparisonOp![0].image) {
                case "<": return lhs < rhs;
                case "<=": return lhs <= rhs;
                case ">": return lhs > rhs;
                case ">=": return lhs >= rhs;
                case "==": return lhs === rhs;
                case "!=": return lhs !== rhs;
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    arithmeticExpression(ctx: ArithmeticExpressionCstChildren): TinyValue {
        if (ctx.rhs) {
            const addSub = ctx.Plus || ctx.Minus;
            const lhs = this.visit(ctx.lhs);
            const rhs = this.visit(ctx.rhs);
            if (typeof lhs != 'number' || typeof rhs != 'number')
                throw new Error("Cannot perform arithmetic on non-numbers");
            switch (addSub![0].image) {
                case "+": return lhs + rhs;
                case "-": return lhs - rhs;
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    term(ctx: TermCstChildren): TinyValue {
        if (ctx.rhs) {
            const multDiv = ctx.Mult || ctx.Div;
            const lhs = this.visit(ctx.lhs);
            const rhs = this.visit(ctx.rhs);
            if (typeof lhs != 'number' || typeof rhs != 'number')
                throw new Error("Cannot perform arithmetic on non-numbers");
            switch (multDiv![0].image) {
                case "*": return lhs * rhs;
                case "/": return lhs / rhs;
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    factor(ctx: FactorCstChildren): TinyValue {
        if (ctx.parenthesis) {
            return this.visit(ctx.parenthesis);
        } else if (ctx.booleanLiteral) {
            return this.visit(ctx.booleanLiteral);
        } else if (ctx.numberLiteral) {
            return this.visit(ctx.numberLiteral);
        } else if (ctx.variableReference) {
            return this.visit(ctx.variableReference);
        } else if (ctx.sourceReference) {
            return this.visit(ctx.sourceReference);
        } else {
            return undefined;
        }
    }

    parenthesis(ctx: ParenthesisCstChildren): TinyValue {
        return this.visit(ctx.expression);
    }

    booleanLiteral(ctx: BooleanLiteralCstChildren): TinyValue {
        return !!ctx.True;
    }

    numberLiteral(ctx: NumberLiteralCstChildren): TinyValue {
        return Number(ctx.literal[0].image);
    }

    variableReference(ctx: VariableReferenceCstChildren): TinyValue {
        return this.variables[ctx.variable[0].image];
    }

    sourceReference(ctx: SourceReferenceCstChildren): TinyValue {
        return this.sources[ctx.source[0].image];
    }
}

export function interpret(cst: CstNode, sources: Record<string, TinyValue>): Record<string, TinyValue> {
    const visitor = new InterpreterVisitor(sources);
    visitor.visit(cst);
    return visitor.sinks;
}
