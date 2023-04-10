import {describe} from "mocha";
import {parse} from "../../src/parser/parser";
import {expect} from "expect";
import {abstractInterpret, AbstractNumber} from "../../src/visitors/abstract_interpreter";
import Interval from "interval-arithmetic";
import * as sinon from "sinon";

describe("abstract interpreter", () => {
  it("interprets simple expressions", () => {
    const input = `
      z: this.x
    `;

    const result = abstractInterpret(input, {x: new AbstractNumber(Interval(10, 15))});
    expect(result).toEqual({
      z: new AbstractNumber(Interval(10, 15))
    });
  });

  it("interprets when expressions", () => {
    const input = `
      z: when this.x < 10 0
         when this.x > 10 20
         otherwise 10
    `;

    const result = abstractInterpret(input, {x: new AbstractNumber()});
    expect(result).toEqual({z: new AbstractNumber(Interval(0, 20))});
  });

  it("gives an error for a bad predicate", () => {
    const error = sinon.stub(console, "error");
    const input = `
      z: when this.x < 5 10
         when this.y 10
         otherwise 20
    `;

    const result = abstractInterpret(input, {x: new AbstractNumber(Interval(0, 5))});
    expect(result).toEqual({z: undefined});

    expect(error.calledOnce).toBe(true);
    expect(error.firstCall.args[0]).toBe("When clause predicate `this.y` is not a boolean at 3:15");
    sinon.restore();
  });

  it("gives an error for mismatched types", () => {
    const error = sinon.stub(console, "error");
    const input = `
      z: when this.x < 5 10
         when this.x > 5 true
         otherwise 20
    `;

    const result = abstractInterpret(input, {x: new AbstractNumber(Interval(0, 5))});
    expect(result).toEqual({z: undefined});

    expect(error.calledOnce).toBe(true);
    expect(error.firstCall.args[0]).toBe("When clause consequent `true` has wrong type at 3:26");
  });

  it("warns about an impossible predicate", () => {
    const warn = sinon.stub(console, "warn");
    const input = `
      z: when this.x < 5 10
         when this.x < 0 0
         otherwise 20
    `;

    const result = abstractInterpret(input, {x: new AbstractNumber(Interval(0, 5))});
    expect(result).toEqual({z: new AbstractNumber(Interval(10, 20))});

    expect(warn.calledOnce).toBe(true);
    expect(warn.firstCall.args[0]).toBe("When clause predicate `this.x < 0` will never be true at 3:15");
    warn.restore();
  });

  afterEach(() => {
    sinon.restore();
  });
});
