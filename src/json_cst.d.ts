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
  assignment: AssignmentCstNode[];
};

export interface AssignmentCstNode extends CstNode {
  name: "assignment";
  children: AssignmentCstChildren;
}

export type AssignmentCstChildren = {
  Const: IToken[];
  Identifier: IToken[];
  Equal: IToken[];
  expression: ExpressionCstNode[];
};

export interface ExpressionCstNode extends CstNode {
  name: "expression";
  children: ExpressionCstChildren;
}

export type ExpressionCstChildren = {
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
  Identifier?: IToken[];
  Number?: IToken[];
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
  assignment(children: AssignmentCstChildren, param?: IN): OUT;
  expression(children: ExpressionCstChildren, param?: IN): OUT;
  term(children: TermCstChildren, param?: IN): OUT;
  factor(children: FactorCstChildren, param?: IN): OUT;
  parenthesis(children: ParenthesisCstChildren, param?: IN): OUT;
}
