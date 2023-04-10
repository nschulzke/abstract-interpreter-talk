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
} from "../ast";
import {BaseCstVisitor} from "../parser/parser";
import {CstNode} from "chevrotain";
import * as graphviz from "graphviz";

/**
 * Converts a CST to a string in s-expression form
 */
class GraphVizVisitor extends BaseCstVisitor {
    public graph = graphviz.digraph("G");
    private parentStack: graphviz.Node[] = [];
    private currentParent(): graphviz.Node | undefined {
        return this.parentStack[this.parentStack.length - 1];
    }
    private labelStack: (string | undefined)[] = [];
    private currentLabel(): string | undefined {
        const label = this.labelStack[this.labelStack.length - 1];
        this.labelStack[this.labelStack.length - 1] = undefined;
        return label;
    }

    constructor() {
        super();
        this.validateVisitor();
    }

    program(ctx: ProgramCstChildren) {
        if (ctx.statement) {
            // return `(program\n    ${
            //   ctx.statement.map(node => this.visit(node))
            //   .join("\n    ")
            // })`;
            const node = this.graph.addNode("program", {label: "program"});
            this.parentStack.push(node);
            ctx.statement.forEach(node => this.visit(node));
            this.parentStack.pop();
        }
    }

    statement(ctx: StatementCstChildren) {
        if (ctx.variableAssignment) {
            this.visit(ctx.variableAssignment);
        } else if (ctx.sinkAssignment) {
            this.visit(ctx.sinkAssignment);
        }
    }

    private numVariableAssignment = 0;
    variableAssignment(ctx: VariableAssignmentCstChildren) {
        // return `(variableAssignment ${ctx.Identifier[0].image} ${this.visit(ctx.expression)})`;
        this.numVariableAssignment++;
        const node = this.graph.addNode(`variableAssignment ${this.numVariableAssignment}`, {label: "variableAssignment"});
        const identifierNode = this.graph.addNode(`identifier ${ctx.Identifier[0].image}`, {label: ctx.Identifier[0].image});
        this.graph.addEdge(node, identifierNode, {label: "identifier"});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
        this.parentStack.push(node);
        this.labelStack.push("expression");
        this.visit(ctx.expression);
        this.labelStack.pop();
        this.parentStack.pop();
    }

    private numSinkAssignment = 0;
    sinkAssignment(ctx: SinkAssignmentCstChildren) {
        // return `(sinkAssignment ${ctx.Identifier[0].image} ${this.visit(ctx.expression)})`;
        this.numSinkAssignment++;
        const node = this.graph.addNode(`sinkAssignment ${this.numSinkAssignment}`, {label: "sinkAssignment"});
        const identifierNode = this.graph.addNode(`identifier ${ctx.Identifier[0].image}`, {label: ctx.Identifier[0].image});
        this.graph.addEdge(node, identifierNode, {label: "identifier"});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
        this.parentStack.push(node);
        this.labelStack.push("expression");
        this.visit(ctx.expression);
        this.labelStack.pop();
        this.parentStack.pop();
    }

    expression(ctx: ExpressionCstChildren) {
        if (ctx.chooseExpression) {
            this.visit(ctx.chooseExpression);
        } else if (ctx.comparisonExpression) {
            this.visit(ctx.comparisonExpression);
        }
    }

    private numChooseExpression = 0;
    chooseExpression(ctx: ChooseExpressionCstChildren) {
        if (ctx.whenClause) {
            // const whenClauses = ctx.whenClause.map(whenClause => this.visit(whenClause)).join(" ");
            // const otherwiseClause = ctx.otherwiseClause ? ` ${this.visit(ctx.otherwiseClause)}` : "";
            // return `(chooseExpression ${whenClauses}${otherwiseClause})`;
            this.numChooseExpression++;
            const node = this.graph.addNode(`chooseExpression ${this.numChooseExpression}`, {label: "chooseExpression"});
            this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
            this.parentStack.push(node);
            ctx.whenClause.forEach(whenClause => {
                this.labelStack.push("when");
                this.visit(whenClause);
                this.labelStack.pop();
            });
            if (ctx.otherwiseClause) {
                this.labelStack.push("otherwise");
                this.visit(ctx.otherwiseClause);
                this.labelStack.pop();
            }
            this.parentStack.pop();
        }
    }

    private numWhenClause = 0;
    whenClause(ctx: WhenClauseCstChildren) {
        // return `(whenClause ${this.visit(ctx.predicate)} ${this.visit(ctx.consequent)})`;
        this.numWhenClause++;
        const node = this.graph.addNode(`whenClause ${this.numWhenClause}`, {label: "whenClause"});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
        this.parentStack.push(node);
        this.labelStack.push("predicate");
        this.visit(ctx.predicate);
        this.labelStack.pop();
        this.labelStack.push("consequent");
        this.visit(ctx.consequent);
        this.labelStack.pop();
        this.parentStack.pop();
    }

    private numOtherwiseClause = 0;
    otherwiseClause(ctx: OtherwiseClauseCstChildren) {
        // return `(otherwiseClause ${this.visit(ctx.consequent)})`;
        this.numOtherwiseClause++;
        const node = this.graph.addNode(`otherwiseClause ${this.numOtherwiseClause}`, {label: "otherwiseClause"});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
        this.parentStack.push(node);
        this.labelStack.push("consequent");
        this.visit(ctx.consequent);
        this.labelStack.pop();
        this.parentStack.pop();
    }

    private numComparisonExpression = 0;
    comparisonExpression(ctx: ComparisonExpressionCstChildren) {
        if (ctx.rhs) {
            const comparisonOp = ctx.Less || ctx.LessEqual || ctx.Greater || ctx.GreaterEqual || ctx.EqualEqual || ctx.BangEqual;
            let node;
            this.numComparisonExpression++;
            if (comparisonOp) {
                // return `(${comparisonOp[0].image} ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
                node = this.graph.addNode(`comparisonExpression ${this.numComparisonExpression}`, {label: comparisonOp[0].image});
            } else {
                // return `(? ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
                node = this.graph.addNode(`comparisonExpression ${this.numComparisonExpression}`, {label: "?"});
            }
            this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
            this.parentStack.push(node);
            this.labelStack.push("lhs");
            this.visit(ctx.lhs);
            this.labelStack.pop();
            this.labelStack.push("rhs");
            this.visit(ctx.rhs);
            this.labelStack.pop();
            this.parentStack.pop();
        } else {
            return this.visit(ctx.lhs);
        }
    }

    private numArithmeticExpression = 0;
    arithmeticExpression(ctx: ArithmeticExpressionCstChildren) {
        if (ctx.rhs) {
            const plusMinus = ctx.Plus || ctx.Minus;
            let node;
            this.numArithmeticExpression++;
            if (plusMinus) {
                // return `(${plusMinus[0].image} ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
                node = this.graph.addNode(`arithmeticExpression ${this.numArithmeticExpression}`, {label: plusMinus[0].image});
            } else {
                // return `(? ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
                node = this.graph.addNode(`arithmeticExpression ${this.numArithmeticExpression}`, {label: "?"});
            }
            this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
            this.parentStack.push(node);
            this.labelStack.push("lhs");
            this.visit(ctx.lhs);
            this.labelStack.pop();
            this.labelStack.push("rhs");
            this.visit(ctx.rhs);
            this.labelStack.pop();
            this.parentStack.pop();
        } else {
            this.visit(ctx.lhs);
        }
    }

    private numTerm = 0;
    term(ctx: TermCstChildren) {
        if (ctx.rhs) {
            const multDiv = ctx.Mult || ctx.Div;
            let node;
            this.numTerm++;
            if (multDiv) {
                // return `(${multDiv[0].image} ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
                node = this.graph.addNode(`term ${this.numTerm}`, {label: multDiv[0].image});
            } else {
                // return `(? ${this.visit(ctx.lhs)} ${this.visit(ctx.rhs)})`;
                node = this.graph.addNode(`term ${this.numTerm}`, {label: "?"});
            }
            this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
            this.parentStack.push(node);
            this.labelStack.push("lhs");
            this.visit(ctx.lhs);
            this.labelStack.pop();
            this.labelStack.push("rhs");
            this.visit(ctx.rhs);
            this.labelStack.pop();
            this.parentStack.pop();
        } else {
            this.visit(ctx.lhs);
        }
    }

    factor(ctx: FactorCstChildren) {
        if (ctx.parenthesis) {
            this.visit(ctx.parenthesis);
        } else if (ctx.numberLiteral) {
            this.visit(ctx.numberLiteral);
        } else if (ctx.booleanLiteral) {
            this.visit(ctx.booleanLiteral);
        } else if (ctx.variableReference) {
            this.visit(ctx.variableReference);
        } else if (ctx.sourceReference) {
            this.visit(ctx.sourceReference);
        }
    }

    parenthesis(ctx: ParenthesisCstChildren) {
        this.visit(ctx.expression);
    }

    private numBooleanLiteral = 0;
    booleanLiteral(ctx: BooleanLiteralCstChildren) {
        const trueFalse = ctx.True || ctx.False;
        // return trueFalse![0].image;
        this.numBooleanLiteral++;
        const node = this.graph.addNode(`booleanLiteral ${this.numBooleanLiteral}`, {label: trueFalse![0].image});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
    }

    private numNumberLiteral = 0;
    numberLiteral(ctx: NumberLiteralCstChildren) {
        // return ctx.literal[0].image;
        this.numNumberLiteral++;
        const node = this.graph.addNode(`numberLiteral ${this.numNumberLiteral}`, {label: ctx.literal[0].image});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
    }

    private numVariableReference = 0;
    variableReference(ctx: VariableReferenceCstChildren) {
        // return ctx.variable[0].image;
        this.numVariableReference++;
        const node = this.graph.addNode(`variableReference ${this.numVariableReference}`, {label: ctx.variable[0].image});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
    }

    private numSourceReference = 0;
    sourceReference(ctx: SourceReferenceCstChildren) {
        // return ctx.source[0].image;
        this.numSourceReference++;
        const node = this.graph.addNode(`sourceReference ${this.numSourceReference}`, {label: ctx.source[0].image});
        this.graph.addEdge(this.currentParent()!, node, {label: this.currentLabel()!});
    }
}

export function outputCstImage(outputFile: string, cst: CstNode) {
    const visitor = new GraphVizVisitor();
    visitor.visit(cst);
    visitor.graph.output("png", outputFile);
}
