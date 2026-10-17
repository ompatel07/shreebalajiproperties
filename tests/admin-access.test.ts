import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { adminEmails, isAdminEmail, safeNext } from "@/lib/admin-access";

describe("admin allow-list", () => {
  const ONE = "ayushjha5309@gmail.com";

  test("admits only the listed email, case- and space-insensitively", () => {
    assert.equal(isAdminEmail("ayushjha5309@gmail.com", ONE), true);
    assert.equal(isAdminEmail("  AyushJha5309@Gmail.com ", ONE), true);
    assert.equal(isAdminEmail("someone@gmail.com", ONE), false);
    assert.equal(isAdminEmail("ayushjha5309@gmail.com.evil.com", ONE), false);
    assert.equal(isAdminEmail("", ONE), false);
    assert.equal(isAdminEmail(null, ONE), false);
  });

  test("fails closed when ADMIN_EMAILS is empty or unset", () => {
    assert.deepEqual(adminEmails(""), []);
    assert.deepEqual(adminEmails(" , ,"), []);
    assert.equal(isAdminEmail(ONE, ""), false);
    assert.equal(isAdminEmail(ONE, " , "), false);
  });
});

describe("post-login redirect", () => {
  test("keeps studio paths", () => {
    for (const p of ["/studio", "/studio/listings", "/studio/listings/abc-123", "/studio/leads?status=new"]) {
      assert.equal(safeNext(p), p);
    }
  });

  test("refuses anything that could leave the site or the studio", () => {
    for (const bad of [
      "//evil.com", "/\\evil.com", "/studio//evil.com", "https://evil.com", "http:/evil.com",
      "/studio/%2F%2Fevil.com", "/studio\\..\\x", "/", "/property/x", "/studiox", "javascript:alert(1)",
      "/studio/\nSet-Cookie:x", "", null, undefined, "/studio/" + "a".repeat(400),
    ]) {
      assert.equal(safeNext(bad as string), "/studio", String(bad));
    }
  });
});
