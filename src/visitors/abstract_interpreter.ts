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
import Interval from "interval-arithmetic";

export type AbstractTinyValue =
  | AbstractNumber
  | AbstractBoolean
  | undefined;

class AbstractInterpreterVisitor<TSources extends Record<string, AbstractTinyValue>> extends BaseCstVisitor {
    sources: TSources;
    variables: Record<string, AbstractTinyValue> = {};
    sinks: Record<string, AbstractTinyValue> = {};

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

    expression(ctx: ExpressionCstChildren): AbstractTinyValue {
        if (ctx.chooseExpression) {
            return this.visit(ctx.chooseExpression);
        } else if (ctx.comparisonExpression) {
            return this.visit(ctx.comparisonExpression);
        } else {
            return undefined;
        }
    }

    chooseExpression(ctx: ChooseExpressionCstChildren): AbstractTinyValue {
        const whenClauses = ctx.whenClause?.filter((whenClause) =>
            this.visit(whenClause.children.predicate).includes(true)
        );
        const consequents: AbstractTinyValue[] = whenClauses.map((whenClause) =>
            this.visit(whenClause.children.consequent)
        );
        // TODO: Reduce to a single abstract value
        throw Error("Not implemented")
    }

    whenClause(ctx: WhenClauseCstChildren): AbstractTinyValue {
        return this.visit(ctx.consequent);
    }

    otherwiseClause(ctx: OtherwiseClauseCstChildren): AbstractTinyValue {
        return this.visit(ctx.consequent);
    }

    comparisonExpression(ctx: ComparisonExpressionCstChildren): AbstractTinyValue {
        if (ctx.rhs) {
            const comparisonOp = ctx.Less || ctx.LessEqual || ctx.Greater || ctx.GreaterEqual || ctx.EqualEqual || ctx.BangEqual;
            const lhs = this.visit(ctx.lhs);
            const rhs = this.visit(ctx.rhs);
            switch (comparisonOp![0].image) {
                case "<": return lhs.lessThan(rhs);
                case "<=": return lhs.lessThanOrEqual(rhs);
                case ">": return lhs.greaterThan(rhs);
                case ">=": return lhs.greaterThanOrEqual(rhs);
                case "==": return lhs.equal(rhs);
                case "!=": return lhs.notEqual(rhs);
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    arithmeticExpression(ctx: ArithmeticExpressionCstChildren): AbstractTinyValue {
        if (ctx.rhs) {
            const addSub = ctx.Plus || ctx.Minus;
            const lhs = this.visit(ctx.lhs);
            const rhs = this.visit(ctx.rhs);
            if (lhs instanceof AbstractNumber && rhs instanceof AbstractNumber) {
                switch (addSub![0].image) {
                    case "+": return lhs.add(rhs);
                    case "-": return lhs.sub(rhs);
                }
            } else {
                throw new Error("Cannot add or subtract non-numbers");
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    term(ctx: TermCstChildren): AbstractTinyValue {
        if (ctx.rhs) {
            const multDiv = ctx.Mult || ctx.Div;
            const lhs = this.visit(ctx.lhs);
            const rhs = this.visit(ctx.rhs);
            if (lhs instanceof AbstractNumber && rhs instanceof AbstractNumber) {
                switch (multDiv![0].image) {
                    case "*": return lhs.mul(rhs);
                    case "/": return lhs.div(rhs);
                }
            } else {
                throw new Error("Cannot multiply or divide non-numbers");
            }
        } else {
            return this.visit(ctx.lhs);
        }
    }

    factor(ctx: FactorCstChildren): AbstractTinyValue {
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

    parenthesis(ctx: ParenthesisCstChildren): AbstractTinyValue {
        return this.visit(ctx.expression);
    }

    booleanLiteral(ctx: BooleanLiteralCstChildren): AbstractTinyValue {
        return new AbstractBoolean([!!ctx.True]);
    }

    numberLiteral(ctx: NumberLiteralCstChildren): AbstractTinyValue {
        return new AbstractNumber(Interval().singleton(Number(ctx.literal[0].image)));
    }

    variableReference(ctx: VariableReferenceCstChildren): AbstractTinyValue {
        return this.variables[ctx.variable[0].image];
    }

    sourceReference(ctx: SourceReferenceCstChildren): AbstractTinyValue {
        return this.sources[ctx.source[0].image];
    }
}

export function abstractInterpret(cst: CstNode, sources: Record<string, AbstractTinyValue>): Record<string, AbstractTinyValue> {
    const visitor = new AbstractInterpreterVisitor(sources);
    visitor.visit(cst);
    return visitor.sinks;
}

type Interval = typeof Interval;

export class AbstractNumber {
    private readonly interval: Interval

    constructor(interval: Interval = Interval(-Infinity, Infinity)) {
        this.interval = interval;
    }

    add(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.add(this.interval, other.interval));
    }

    sub(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.sub(this.interval, other.interval));
    }

    mul(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.mul(this.interval, other.interval));
    }

    div(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.div(this.interval, other.interval));
    }

    lessThan(other: AbstractNumber): AbstractBoolean {
        if (Interval.lessThan(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.greaterThan(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    greaterThan(other: AbstractNumber): AbstractBoolean {
        if (Interval.greaterThan(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.lessThan(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    lessThanOrEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.lessThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.greaterThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    greaterThanOrEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.greaterThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.lessThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    equal(other: AbstractNumber): AbstractBoolean {
        if (Interval.intervalsOverlap(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    notEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.intervalsOverlap(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    toString() {
        return `[${this.interval.lo},${this.interval.hi}]`;
    }
}

export class AbstractBoolean {
    private readonly values: Set<boolean>;

    constructor(values: boolean[] = [true, false]) {
        this.values = new Set(values);
    }

    and(other: AbstractBoolean): AbstractBoolean {
        const newValues: boolean[] = [];
        if (this.values.has(false) || other.values.has(false)) {
            newValues.push(false);
        }
        if (this.values.has(true) && other.values.has(true)) {
            newValues.push(true);
        }
        return new AbstractBoolean(newValues);
    }

    or(other: AbstractBoolean): AbstractBoolean {
        const newValues: boolean[] = [];
        if (this.values.has(true) || other.values.has(true)) {
            newValues.push(true);
        }
        if (this.values.has(false) && other.values.has(false)) {
            newValues.push(false);
        }
        return new AbstractBoolean(newValues);
    }

    toString() {
        return this.values.has(true) && this.values.has(false) ? "{true,false}" : this.values.has(true) ? "{true}" : "{false}";
    }
}
