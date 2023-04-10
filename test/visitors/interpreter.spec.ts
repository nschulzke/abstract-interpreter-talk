import {describe} from "mocha";
import {interpret} from "../../src/visitors/interpreter";
import {expect} from "expect";

describe("interpreter", () => {
  it("interprets simple expressions", () => {
    const input = `
      z: this.x
    `;

    const result = interpret(input, {x: 10});
    expect(result).toEqual({
      z: 10
    });

    const result2 = interpret(input, {x: 15});
    expect(result2).toEqual({
      z: 15
    });
  });

  it("interprets when expressions", () => {
    const input = `
      z: when this.x < 10 0
         when this.x > 10 20
         otherwise 10
    `;

    const result5 = interpret(input, {x: 5});
    expect(result5).toEqual({z: 0});

    const result15 = interpret(input, {x: 15});
    expect(result15).toEqual({z: 20});

    const result10 = interpret(input, {x: 10});
    expect(result10).toEqual({z: 10});
  });
});
