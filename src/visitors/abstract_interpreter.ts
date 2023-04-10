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
import {BaseCstVisitor, parse} from "../parser/parser";
import {CstNode} from "chevrotain";
import Interval from "interval-arithmetic";

export type AbstractTinyValue =
  | AbstractNumber
  | AbstractBoolean
  | undefined;

class AbstractInterpreterVisitor<TSources extends Record<string, AbstractTinyValue>> extends BaseCstVisitor {
    variables: Record<string, AbstractTinyValue> = {};
    sinks: Record<string, AbstractTinyValue> = {};

    constructor(private sources: TSources, private input: string) {
        super();
        this.validateVisitor();
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
        const predicates = ctx.whenClause.map((whenClause) =>
            this.visit(whenClause.children.predicate) as AbstractTinyValue
        );

        // Check that all when clause predicates are of boolean type
        const nonBooleanWhenClauses = ctx.whenClause.filter((whenClause, index) =>
            !(predicates[index] instanceof AbstractBoolean)
        );
        if (nonBooleanWhenClauses.length) {
            for (const clause of nonBooleanWhenClauses) {
                const predicate = clause.children.predicate[0];
                const text = this.input.slice(predicate.location!.startOffset!, predicate.location!.endOffset! + 1);
                console.error(`When clause predicate \`${text}\` is not a boolean at ${predicate.location?.startLine}:${predicate.location?.startColumn}`);
            }
            return undefined;
        }

        // Check that all when clause predicates are possible
        const impossibleWhenClauses = ctx.whenClause.filter((whenClause, index) =>
            !(predicates[index] as AbstractBoolean).includes(true)
        );
        if (impossibleWhenClauses.length) {
            for (let impossibleWhenClause of impossibleWhenClauses) {
                const predicate = impossibleWhenClause.children.predicate[0];
                const text = this.input.slice(predicate.location!.startOffset!, predicate.location!.endOffset! + 1);
                console.warn(`When clause predicate \`${text}\` will never be true at ${predicate.location?.startLine}:${predicate.location?.startColumn}`)
            }
        }

        const consequents: AbstractTinyValue[] = ctx.whenClause.map((whenClause) =>
            this.visit(whenClause.children.consequent)
        );
        consequents.push(this.visit(ctx.otherwiseClause[0]));

        const consequentClasses = consequents.map((consequent) => consequent?.constructor);
        const mismatchedWhenClauses = ctx.whenClause.filter((whenClause, index) =>
            consequentClasses[index] !== consequentClasses[0]
        );
        if (mismatchedWhenClauses.length) {
            for (const clause of mismatchedWhenClauses) {
                const consequent = clause.children.consequent[0];
                const text = this.input.slice(consequent.location!.startOffset!, consequent.location!.endOffset! + 1);
                console.error(`When clause consequent \`${text}\` has wrong type at ${consequent.location?.startLine}:${consequent.location?.startColumn}`);
            }
            return undefined;
        }

        const possibleConsequents = consequents.filter((consequent, index) =>
            index >= ctx.whenClause.length || (predicates[index] as AbstractBoolean).includes(true)
        );
        // If we get here, we know all the consequents are of the same type.
        return possibleConsequents.reduce((a, b) => a?.union(b as any));
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

export function abstractInterpret(input: string, sources: Record<string, AbstractTinyValue>): Record<string, AbstractTinyValue> {
    const cst = parse(input);
    const visitor = new AbstractInterpreterVisitor(sources, input);
    visitor.visit(cst);
    return visitor.sinks;
}

type Interval = typeof Interval;

export class AbstractNumber {
    private readonly _interval: Interval

    constructor(interval: Interval = Interval(-Infinity, Infinity)) {
        this._interval = interval;
    }

    add(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.add(this._interval, other._interval));
    }

    sub(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.sub(this._interval, other._interval));
    }

    mul(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.mul(this._interval, other._interval));
    }

    div(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.div(this._interval, other._interval));
    }

    lessThan(other: AbstractNumber): AbstractBoolean {
        if (Interval.lessThan(this._interval, other._interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.greaterEqualThan(this._interval, other._interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    greaterThan(other: AbstractNumber): AbstractBoolean {
        if (Interval.greaterThan(this._interval, other._interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.lessEqualThan(this._interval, other._interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    lessThanOrEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.lessEqualThan(this._interval, other._interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.greaterEqualThan(this._interval, other._interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    greaterThanOrEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.greaterEqualThan(this._interval, other._interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.lessEqualThan(this._interval, other._interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    equal(other: AbstractNumber): AbstractBoolean {
        if (Interval.intervalsOverlap(this._interval, other._interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    notEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.intervalsOverlap(this._interval, other._interval)) {
            return new AbstractBoolean([true]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    union(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.hull(this._interval, other._interval));
    }

    interval(): Interval {
        return this._interval;
    }

    toString() {
        return `[${this._interval.lo},${this._interval.hi}]`;
    }
}

export class AbstractBoolean {
    private readonly _values: Set<boolean>;

    constructor(values: boolean[] = [true, false]) {
        this._values = new Set(values);
    }

    and(other: AbstractBoolean): AbstractBoolean {
        const newValues: boolean[] = [];
        if (this._values.has(false) || other._values.has(false)) {
            newValues.push(false);
        }
        if (this._values.has(true) && other._values.has(true)) {
            newValues.push(true);
        }
        return new AbstractBoolean(newValues);
    }

    or(other: AbstractBoolean): AbstractBoolean {
        const newValues: boolean[] = [];
        if (this._values.has(true) || other._values.has(true)) {
            newValues.push(true);
        }
        if (this._values.has(false) && other._values.has(false)) {
            newValues.push(false);
        }
        return new AbstractBoolean(newValues);
    }

    union(other: AbstractBoolean): AbstractBoolean {
        return new AbstractBoolean([...this._values, ...other._values]);
    }

    includes(bool: boolean): boolean {
        return this._values.has(bool);
    }

    values(): boolean[] {
        return [...this._values];
    }

    toString() {
        return this._values.has(true) && this._values.has(false) ? "{true,false}" : this._values.has(true) ? "{true}" : "{false}";
    }
}
