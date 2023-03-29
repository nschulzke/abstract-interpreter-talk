import {AbstractBoolean, AbstractNumber} from "../src/visitors/abstract_interpreter";
import {expect} from "expect";
import Interval from "interval-arithmetic";

describe("AbstractNumber", () => {
  describe("lessThan", () => {
    it('Interval(0, 0) < Interval(10, 10) is [true]', () => {
      const a = new AbstractNumber(Interval(0, 0));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.lessThan(b).values()).toEqual([true]);
    });

    it('Interval(10, 10) < Interval(10, 10) is [false]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.lessThan(b).values()).toEqual([false]);
    });

    it('Interval(10, 10) < Interval(0, 0) is [false]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.lessThan(b).values()).toEqual([false]);
    });

    it('Interval(0, 10) < Interval(10, 10) is [true, false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.lessThan(b).values()).toEqual([true, false]);
    });

    it('Interval(0, 10) < Interval(0, 0) is [false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.lessThan(b).values()).toEqual([false]);
    });

    it('Interval(0, 10) < Interval(3, 7) is [true, false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 10));
      expect(a.lessThan(b).values()).toEqual([true, false]);
    });
  });

  describe("greaterThan", () => {
    it('Interval(0, 0) > Interval(10, 10) is [false]', () => {
      const a = new AbstractNumber(Interval(0, 0));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.greaterThan(b).values()).toEqual([false]);
    });

    it('Interval(10, 10) > Interval(10, 10) is [false]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.greaterThan(b).values()).toEqual([false]);
    });

    it('Interval(10, 10) > Interval(0, 0) is [true]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.greaterThan(b).values()).toEqual([true]);
    });

    it('Interval(0, 10) > Interval(10, 10) is [false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.greaterThan(b).values()).toEqual([false]);
    });

    it('Interval(0, 10) > Interval(0, 0) is [true, false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.greaterThan(b).values()).toEqual([true, false]);
    });

    it('Interval(0, 10) > Interval(3, 7) is [true, false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 10));
      expect(a.greaterThan(b).values()).toEqual([true, false]);
    });
  });

  describe("lessThanOrEqual", () => {
    it('Interval(0, 0) <= Interval(10, 10) is [true]', () => {
      const a = new AbstractNumber(Interval(0, 0));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.lessThanOrEqual(b).values()).toEqual([true]);
    });

    it('Interval(10, 10) <= Interval(10, 10) is [true]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.lessThanOrEqual(b).values()).toEqual([true]);
    });

    it('Interval(10, 10) <= Interval(0, 0) is [false]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.lessThanOrEqual(b).values()).toEqual([false]);
    });

    it('Interval(0, 10) <= Interval(10, 10) is [true]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.lessThanOrEqual(b).values()).toEqual([true]);
    });

    it('Interval(0, 10) <= Interval(0, 0) is [false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.lessThanOrEqual(b).values()).toEqual([false]);
    });

    it('Interval(0, 10) <= Interval(3, 7) is [true, false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 10));
      expect(a.lessThanOrEqual(b).values()).toEqual([true, false]);
    });
  });

  describe("greaterThanOrEqual", () => {
    it('Interval(0, 0) >= Interval(10, 10) is [false]', () => {
      const a = new AbstractNumber(Interval(0, 0));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.greaterThanOrEqual(b).values()).toEqual([false]);
    });

    it('Interval(10, 10) >= Interval(10, 10) is [true]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.greaterThanOrEqual(b).values()).toEqual([true]);
    });

    it('Interval(10, 10) >= Interval(0, 0) is [true]', () => {
      const a = new AbstractNumber(Interval(10, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.greaterThanOrEqual(b).values()).toEqual([true]);
    });

    it('Interval(0, 10) >= Interval(10, 10) is [false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(10, 10));
      expect(a.greaterThanOrEqual(b).values()).toEqual([false]);
    });

    it('Interval(0, 10) >= Interval(0, 0) is [true]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 0));
      expect(a.greaterThanOrEqual(b).values()).toEqual([true]);
    });

    it('Interval(0, 10) >= Interval(3, 7) is [true, false]', () => {
      const a = new AbstractNumber(Interval(0, 10));
      const b = new AbstractNumber(Interval(0, 10));
      expect(a.greaterThanOrEqual(b).values()).toEqual([true, false]);
    });
  });
});
