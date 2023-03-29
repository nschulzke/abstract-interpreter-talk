import {AbstractBoolean} from "../src/visitors/abstract_interpreter";
import {expect} from "expect";

describe("AbstractBoolean", () => {
  it("[true] and [false] is [false]", () => {
    const a = new AbstractBoolean([true]);
    const b = new AbstractBoolean([false]);
    expect(a.and(b).values()).toEqual([false]);
  });

  it("[true] or [false] is [true]", () => {
    const a = new AbstractBoolean([true]);
    const b = new AbstractBoolean([false]);
    expect(a.or(b).values()).toEqual([true]);
  });

  it("[true] and [true] is [true]", () => {
    const a = new AbstractBoolean([true]);
    const b = new AbstractBoolean([true]);
    expect(a.and(b).values()).toEqual([true]);
  });

  it("[false] or [false] is [false]", () => {
    const a = new AbstractBoolean([false]);
    const b = new AbstractBoolean([false]);
    expect(a.or(b).values()).toEqual([false]);
  });

  it("[true, false] and [true, false] is [false, true]", () => {
    const a = new AbstractBoolean([true, false]);
    const b = new AbstractBoolean([true, false]);
    expect(a.and(b).values()).toEqual([false, true]);
  });

  it("[true, false] or [true, false] is [true, false]", () => {
    const a = new AbstractBoolean([true, false]);
    const b = new AbstractBoolean([true, false]);
    expect(a.or(b).values()).toEqual([true, false]);
  });
});
