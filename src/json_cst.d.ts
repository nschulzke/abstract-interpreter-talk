import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface ProgramCstNode extends CstNode {
  name: "program";
  children: ProgramCstChildren;
}

export type ProgramCstChildren = {
  statement?: StatementCstNode[];
};

export interface StatementCstNode extends CstNode {
  name: "statement";
  children: StatementCstChildren;
}

export type StatementCstChildren = {
  variableAssignment?: VariableAssignmentCstNode[];
  sinkAssignment?: SinkAssignmentCstNode[];
};

export interface VariableAssignmentCstNode extends CstNode {
  name: "variableAssignment";
  children: VariableAssignmentCstChildren;
}

export type VariableAssignmentCstChildren = {
  Identifier: IToken[];
  Equal: IToken[];
  expression: ExpressionCstNode[];
};

export interface SinkAssignmentCstNode extends CstNode {
  name: "sinkAssignment";
  children: SinkAssignmentCstChildren;
}

export type SinkAssignmentCstChildren = {
  Identifier: IToken[];
  Colon: IToken[];
  expression: ExpressionCstNode[];
};

export interface ExpressionCstNode extends CstNode {
  name: "expression";
  children: ExpressionCstChildren;
}

export type ExpressionCstChildren = {
  chooseExpression?: ChooseExpressionCstNode[];
  comparisonExpression?: ComparisonExpressionCstNode[];
};

export interface ChooseExpressionCstNode extends CstNode {
  name: "chooseExpression";
  children: ChooseExpressionCstChildren;
}

export type ChooseExpressionCstChildren = {
  whenClause?: WhenClauseCstNode[];
  otherwiseClause: OtherwiseClauseCstNode[];
};

export interface WhenClauseCstNode extends CstNode {
  name: "whenClause";
  children: WhenClauseCstChildren;
}

export type WhenClauseCstChildren = {
  When: IToken[];
  predicate: ExpressionCstNode[];
  consequent: ExpressionCstNode[];
};

export interface OtherwiseClauseCstNode extends CstNode {
  name: "otherwiseClause";
  children: OtherwiseClauseCstChildren;
}

export type OtherwiseClauseCstChildren = {
  Otherwise: IToken[];
  consequent: ExpressionCstNode[];
};

export interface ComparisonExpressionCstNode extends CstNode {
  name: "comparisonExpression";
  children: ComparisonExpressionCstChildren;
}

export type ComparisonExpressionCstChildren = {
  lhs: ArithmeticExpressionCstNode[];
  Less?: IToken[];
  Greater?: IToken[];
  LessEqual?: IToken[];
  GreaterEqual?: IToken[];
  EqualEqual?: IToken[];
  BangEqual?: IToken[];
  rhs?: ArithmeticExpressionCstNode[];
};

export interface ArithmeticExpressionCstNode extends CstNode {
  name: "arithmeticExpression";
  children: ArithmeticExpressionCstChildren;
}

export type ArithmeticExpressionCstChildren = {
  lhs: TermCstNode[];
  Plus?: IToken[];
  Minus?: IToken[];
  rhs?: TermCstNode[];
};

export interface TermCstNode extends CstNode {
  name: "term";
  children: TermCstChildren;
}

export type TermCstChildren = {
  lhs: FactorCstNode[];
  Mult?: IToken[];
  Div?: IToken[];
  Mod?: IToken[];
  rhs?: FactorCstNode[];
};

export interface FactorCstNode extends CstNode {
  name: "factor";
  children: FactorCstChildren;
}

export type FactorCstChildren = {
  parenthesis?: ParenthesisCstNode[];
  booleanLiteral?: BooleanLiteralCstNode[];
  sourceReference?: SourceReferenceCstNode[];
  variableReference?: VariableReferenceCstNode[];
  numberLiteral?: NumberLiteralCstNode[];
};

export interface SourceReferenceCstNode extends CstNode {
  name: "sourceReference";
  children: SourceReferenceCstChildren;
}

export type SourceReferenceCstChildren = {
  This: IToken[];
  Dot: IToken[];
  source: IToken[];
};

export interface VariableReferenceCstNode extends CstNode {
  name: "variableReference";
  children: VariableReferenceCstChildren;
}

export type VariableReferenceCstChildren = {
  variable: IToken[];
};

export interface BooleanLiteralCstNode extends CstNode {
  name: "booleanLiteral";
  children: BooleanLiteralCstChildren;
}

export type BooleanLiteralCstChildren = {
  True?: IToken[];
  False?: IToken[];
};

export interface NumberLiteralCstNode extends CstNode {
  name: "numberLiteral";
  children: NumberLiteralCstChildren;
}

export type NumberLiteralCstChildren = {
  literal: IToken[];
};

export interface ParenthesisCstNode extends CstNode {
  name: "parenthesis";
  children: ParenthesisCstChildren;
}

export type ParenthesisCstChildren = {
  LParen: IToken[];
  expression: ExpressionCstNode[];
  RParen: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  program(children: ProgramCstChildren, param?: IN): OUT;
  statement(children: StatementCstChildren, param?: IN): OUT;
  variableAssignment(children: VariableAssignmentCstChildren, param?: IN): OUT;
  sinkAssignment(children: SinkAssignmentCstChildren, param?: IN): OUT;
  expression(children: ExpressionCstChildren, param?: IN): OUT;
  chooseExpression(children: ChooseExpressionCstChildren, param?: IN): OUT;
  whenClause(children: WhenClauseCstChildren, param?: IN): OUT;
  otherwiseClause(children: OtherwiseClauseCstChildren, param?: IN): OUT;
  comparisonExpression(children: ComparisonExpressionCstChildren, param?: IN): OUT;
  arithmeticExpression(children: ArithmeticExpressionCstChildren, param?: IN): OUT;
  term(children: TermCstChildren, param?: IN): OUT;
  factor(children: FactorCstChildren, param?: IN): OUT;
  sourceReference(children: SourceReferenceCstChildren, param?: IN): OUT;
  variableReference(children: VariableReferenceCstChildren, param?: IN): OUT;
  booleanLiteral(children: BooleanLiteralCstChildren, param?: IN): OUT;
  numberLiteral(children: NumberLiteralCstChildren, param?: IN): OUT;
  parenthesis(children: ParenthesisCstChildren, param?: IN): OUT;
}
