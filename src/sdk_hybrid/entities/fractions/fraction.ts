import JSBI from "jsbi";
import invariant from "tiny-invariant";

import { BigintIsh, Rounding } from "@/sdk_hybrid/constants";

export class Fraction {
  public readonly numerator: JSBI;
  public readonly denominator: JSBI;

  public constructor(numerator: BigintIsh, denominator: BigintIsh = JSBI.BigInt(1)) {
    this.numerator = JSBI.BigInt(numerator);
    this.denominator = JSBI.BigInt(denominator);
  }

  private static tryParseFraction(fractionish: BigintIsh | Fraction): Fraction {
    if (
      fractionish instanceof JSBI ||
      typeof fractionish === "number" ||
      typeof fractionish === "string"
    )
      return new Fraction(fractionish);

    if ("numerator" in fractionish && "denominator" in fractionish) return fractionish;
    throw new Error("Could not parse fraction");
  }

  // performs floor division
  public get quotient(): JSBI {
    return JSBI.divide(this.numerator, this.denominator);
  }

  // remainder after floor division
  public get remainder(): Fraction {
    return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator);
  }

  public invert(): Fraction {
    return new Fraction(this.denominator, this.numerator);
  }

  public add(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(
      JSBI.add(
        JSBI.multiply(this.numerator, otherParsed.denominator),
        JSBI.multiply(otherParsed.numerator, this.denominator),
      ),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    );
  }

  public subtract(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(
      JSBI.subtract(
        JSBI.multiply(this.numerator, otherParsed.denominator),
        JSBI.multiply(otherParsed.numerator, this.denominator),
      ),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    );
  }

  public lessThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI.lessThan(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    );
  }

  public equalTo(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI.equal(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    );
  }

  public greaterThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI.greaterThan(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    );
  }

  public multiply(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(
      JSBI.multiply(this.numerator, otherParsed.numerator),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    );
  }

  public divide(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(this.denominator, otherParsed.numerator),
    );
  }

  public toSignificant(
    significantDigits: number,
    format: object = { groupSeparator: "" },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    invariant(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`);
    invariant(significantDigits > 0, `${significantDigits} is not positive.`);

    const quotient = +this.numerator.toString() / +this.denominator.toString();
    const factor = 10 ** (significantDigits - Math.floor(Math.log10(quotient)) - 1);
    let roundedQuotient;

    switch (rounding) {
      case Rounding.ROUND_DOWN:
        roundedQuotient = Math.floor(quotient * factor) / factor;
        break;
      case Rounding.ROUND_HALF_UP:
        roundedQuotient = Math.round(quotient * factor) / factor;
        break;
      case Rounding.ROUND_UP:
        roundedQuotient = Math.ceil(quotient * factor) / factor;
        break;
      default:
        roundedQuotient = Math.round(quotient * factor) / factor;
    }

    return roundedQuotient.toLocaleString("en-US", format);
  }

  public toFixed(
    decimalPlaces: number,
    format: object = { groupSeparator: "" },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    invariant(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`);
    invariant(decimalPlaces >= 0, `${decimalPlaces} is negative.`);

    const quotient = +this.numerator.toString() / +this.denominator.toString();
    const factor = 10 ** decimalPlaces;
    let roundedQuotient;

    switch (rounding) {
      case Rounding.ROUND_DOWN:
        roundedQuotient = Math.floor(quotient * factor) / factor;
        break;
      case Rounding.ROUND_HALF_UP:
        roundedQuotient = Math.round(quotient * factor) / factor;
        break;
      case Rounding.ROUND_UP:
        roundedQuotient = Math.ceil(quotient * factor) / factor;
        break;
      default:
        roundedQuotient = Math.round(quotient * factor) / factor;
    }

    return roundedQuotient.toLocaleString("en-US", format);
  }

  /**
   * Helper method for converting any super class back to a fraction
   */
  public get asFraction(): Fraction {
    return new Fraction(this.numerator, this.denominator);
  }
}
