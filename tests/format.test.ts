import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  formatPrice,
  formatPriceRange,
  formatCompact,
  formatArea,
  formatBhk,
  groupIndian,
  pricePerSqft,
  slugify,
} from "@/lib/format";
import { budgetBands } from "@/config/site";

/**
 * Indian money formatting, which is where this codebase has already shipped
 * its worst bug: `trimZeros` stripped trailing zeros from integers as well as
 * fractions, so "50" became "5" and every round price rendered an order of
 * magnitude low — a ₹50 Lakh flat priced at ₹5 Lakh.
 *
 * The round-number cases below exist specifically so that cannot come back.
 */

describe("formatPrice", () => {
  test("renders round lakh figures at full value", () => {
    // The regression. Each of these lost a digit under the old trimZeros.
    assert.equal(formatPrice(5_000_000), "₹50 Lakh");
    assert.equal(formatPrice(8_000_000), "₹80 Lakh");
    assert.equal(formatPrice(1_000_000), "₹10 Lakh");
    assert.equal(formatPrice(100_000_000), "₹10 Cr");
  });

  test("renders crore figures", () => {
    assert.equal(formatPrice(10_000_000), "₹1 Cr");
    assert.equal(formatPrice(12_500_000), "₹1.25 Cr");
    assert.equal(formatPrice(20_000_000), "₹2 Cr");
  });

  test("falls back to grouped rupees below a lakh", () => {
    assert.equal(formatPrice(45_000), "₹45,000");
  });

  test("treats missing and non-positive values as price on request", () => {
    assert.equal(formatPrice(null), "Price on request");
    assert.equal(formatPrice(undefined), "Price on request");
    assert.equal(formatPrice(0), "Price on request");
    assert.equal(formatPrice(-1), "Price on request");
    assert.equal(formatPrice(Number.NaN), "Price on request");
  });

  test("never emits a trailing decimal point or a bare zero fraction", () => {
    for (let n = 100_000; n <= 200_000_000; n += 1_337_000) {
      const out = formatPrice(n);
      assert.ok(!/\.\s/.test(out) && !out.endsWith("."), `malformed: ${out}`);
      assert.ok(!/\.0+( |$)/.test(out), `untrimmed zero fraction: ${out}`);
    }
  });
});

describe("budget bands agree with their own labels", () => {
  // A chip that says "₹50 – 75 Lakh" but filters on a different number is the
  // kind of mismatch a buyer notices and an engineer never does.
  for (const band of budgetBands) {
    test(band.slug, () => {
      if (band.max === null) {
        assert.ok(
          band.label.includes(formatPrice(band.min).replace("₹", "")),
          `"${band.label}" does not contain ${formatPrice(band.min)}`,
        );
        return;
      }
      const rendered = formatPriceRange(band.min, band.max);
      // Compare on digits alone: the label may share a unit ("₹50 – 75 Lakh")
      // where the formatter spells both out.
      const digits = (s: string) => s.replace(/[^\d]/g, "");
      assert.equal(
        digits(rendered),
        digits(band.label),
        `band "${band.label}" formats as "${rendered}"`,
      );
    });
  }
});

describe("other formatters", () => {
  test("groupIndian uses 2-2-3 digit grouping", () => {
    assert.equal(groupIndian(4_500_000), "45,00,000");
    assert.equal(groupIndian(1_000), "1,000");
    assert.equal(groupIndian(100), "100");
  });

  test("formatCompact shortens without losing magnitude", () => {
    assert.equal(formatCompact(10_000_000), "1Cr");
    assert.equal(formatCompact(5_000_000), "50L");
    assert.equal(formatCompact(50_000), "50K");
  });

  test("formatArea and formatBhk handle nulls", () => {
    assert.equal(typeof formatArea(1200), "string");
    assert.equal(typeof formatArea(null), "string");
    assert.equal(typeof formatBhk(null), "string");
    assert.ok(formatBhk(3).includes("3"));
  });

  test("pricePerSqft guards divide-by-zero", () => {
    assert.equal(typeof pricePerSqft(10_000_000, 0), "string");
    assert.equal(typeof pricePerSqft(null, 1000), "string");
    assert.ok(pricePerSqft(10_000_000, 1000).includes("10,000"));
  });

  test("slugify produces URL-safe output", () => {
    assert.equal(slugify("3 BHK in Shela, Ahmedabad"), "3-bhk-in-shela-ahmedabad");
    assert.equal(slugify("  Multiple   Spaces  "), "multiple-spaces");
    assert.ok(!/[^a-z0-9-]/.test(slugify("Jodhpur — Satellite (West)")));
  });
});
