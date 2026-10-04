import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  phoneSchema,
  nameSchema,
  emailSchema,
  enquirySchema,
  searchParamsSchema,
} from "@/lib/validation";

/**
 * Validation is the boundary between the public internet and the database.
 * These check both directions: that honest input gets through unmangled, and
 * that the things a bot or a fuzzer actually sends are rejected.
 */

describe("phoneSchema", () => {
  test("normalises every accepted Indian mobile format to E.164", () => {
    for (const input of [
      "9016506054",
      "+919016506054",
      "919016506054",
      "90165 06054",
      "(901) 650-6054",
      "  9016506054  ",
    ]) {
      const out = phoneSchema.parse(input);
      assert.equal(out, "+919016506054", `"${input}" normalised to ${out}`);
    }
  });

  test("rejects numbers that are not Indian mobiles", () => {
    for (const bad of [
      "1234567890",    // does not start 6-9
      "5016506054",    // landline-style leading digit
      "901650605",     // nine digits
      "90165060544",   // eleven digits
      "abcdefghij",
      "",
      "+1 415 555 0123",
    ]) {
      assert.throws(() => phoneSchema.parse(bad), `"${bad}" was accepted`);
    }
  });
});

describe("nameSchema", () => {
  test("accepts real names including Indian ones with marks", () => {
    for (const ok of ["Om Patel", "Dr. Anjali Rawal", "D'Souza", "Jean-Pierre", "अनिल शर्मा"]) {
      assert.equal(nameSchema.parse(ok), ok.trim());
    }
  });

  test("rejects the payloads bots actually send", () => {
    for (const bad of [
      "https://cheap-loans.example",
      "<script>alert(1)</script>",
      "A",
      "",
      "x".repeat(121),
      "call 9016506054 now",   // digits
    ]) {
      assert.throws(() => nameSchema.parse(bad), `"${bad.slice(0, 30)}" was accepted`);
    }
  });
});

describe("emailSchema", () => {
  test("lowercases and trims", () => {
    assert.equal(emailSchema.parse("  Om.Patel@Example.COM "), "om.patel@example.com");
  });

  test("rejects malformed addresses", () => {
    for (const bad of ["not-an-email", "a@", "@b.com", "a b@c.com", ""]) {
      assert.throws(() => emailSchema.parse(bad), `"${bad}" was accepted`);
    }
  });
});

describe("enquirySchema", () => {
  const valid = { name: "Om Patel", phone: "9016506054" };

  test("accepts the minimum a real enquiry carries", () => {
    const out = enquirySchema.parse(valid);
    assert.equal(out.name, "Om Patel");
    assert.equal(out.phone, "+919016506054");
  });

  test("treats an empty email string as absent rather than invalid", () => {
    // The form posts "" for an untouched optional field; rejecting that would
    // fail honest submissions.
    const out = enquirySchema.parse({ ...valid, email: "" });
    assert.equal(out.email, undefined);
  });

  test("rejects an over-long message", () => {
    assert.throws(() => enquirySchema.parse({ ...valid, message: "x".repeat(2001) }));
  });

  test("rejects a non-uuid propertyId", () => {
    assert.throws(() => enquirySchema.parse({ ...valid, propertyId: "../../etc/passwd" }));
  });

  test("requires name and phone", () => {
    assert.throws(() => enquirySchema.parse({ phone: "9016506054" }));
    assert.throws(() => enquirySchema.parse({ name: "Om Patel" }));
  });
});

describe("searchParamsSchema", () => {
  test("coerces numeric strings from the query string", () => {
    const out = searchParamsSchema.parse({ bhk: "3", min: "5000000", page: "2" });
    assert.equal(out.bhk, 3);
    assert.equal(out.min, 5_000_000);
    assert.equal(out.page, 2);
  });

  test("never throws on hostile input — it falls back", () => {
    // This parses untrusted URL input on a public page. Throwing here would
    // turn a junk query string into a 500.
    const hostile = {
      bhk: "'; drop table properties; --",
      min: "NaN",
      max: "-999999",
      page: "0",
      sort: "../../admin",
      category: "nonsense",
      q: "x".repeat(500),
    };
    const out = searchParamsSchema.parse(hostile);
    assert.equal(out.sort, "relevance");
    assert.equal(out.page, 1);
    assert.equal(out.category, undefined);
    assert.equal(out.bhk, undefined);
  });

  test("defaults are applied when nothing is supplied", () => {
    const out = searchParamsSchema.parse({});
    assert.equal(out.page, 1);
    assert.equal(out.sort, "relevance");
  });
});
