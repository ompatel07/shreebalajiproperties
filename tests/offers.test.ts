import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { furnitureOffer, hasFurnitureOffer } from "@/config/offers";
import { propertyTypes } from "@/config/site";

/**
 * The furniture offer is for flats only. A villa, plot or office showing a
 * "Free furniture" tag would be a promise the client never made.
 */
describe("free furniture offer", () => {
  test("every flat-type listing qualifies", () => {
    for (const t of ["flats", "duplex-flats", "penthouses"]) {
      assert.equal(hasFurnitureOffer(t), true, t);
    }
  });

  test("nothing that is not a flat qualifies", () => {
    for (const t of ["villas", "bungalows", "tenements", "weekend-villas", "offices", "shops", "showrooms", "warehouses", "plots", "farmland", "", null, undefined]) {
      assert.equal(hasFurnitureOffer(t), false, String(t));
    }
  });

  test("every qualifying type is a real residential property type", () => {
    const residential = new Set(propertyTypes.filter((p) => p.category === "residential").map((p) => p.slug as string));
    for (const t of furnitureOffer.propertyTypes) assert.ok(residential.has(t), t);
  });
});
