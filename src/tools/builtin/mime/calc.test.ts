import { describe, expect, it } from "vitest";
import { extensionToMime, mimeToExtensions } from "./calc";

describe("mime calc", () => {
  it("maps extensions to mime types", () => {
    expect(extensionToMime("png")).toBe("image/png");
    expect(extensionToMime(".PDF")).toBe("application/pdf");
  });

  it("maps mime types back to extensions", () => {
    expect(mimeToExtensions("image/jpeg")).toEqual(expect.arrayContaining(["jpg", "jpeg"]));
  });
});
