import assert from "node:assert/strict";
import test from "node:test";

import { assertPublicImageUrl } from "../src/background/safe-url.js";

test("public image URL accepts http and https origins", () => {
  assert.equal(
    assertPublicImageUrl("https://example.com/image.jpg").hostname,
    "example.com"
  );
  assert.equal(
    assertPublicImageUrl("http://cdn.example.com/image.jpg").hostname,
    "cdn.example.com"
  );
});

test("public image URL rejects non-web schemes", () => {
  assert.throws(() => assertPublicImageUrl("file:///tmp/a.png"), /http\/https/);
  assert.throws(() => assertPublicImageUrl("data:image/png;base64,AA=="), /http\/https/);
});

test("public image URL rejects local and private network targets", () => {
  const blocked = [
    "http://localhost/a.png",
    "http://demo.localhost/a.png",
    "http://router.local/a.png",
    "http://printer.lan/a.png",
    "http://device.home.arpa/a.png",
    "http://127.0.0.1/a.png",
    "http://10.0.0.8/a.png",
    "http://172.16.0.8/a.png",
    "http://192.168.1.8/a.png",
    "http://169.254.1.8/a.png",
    "http://[::1]/a.png",
    "http://[fc00::1]/a.png",
    "http://[fe80::1]/a.png",
  ];
  for (const url of blocked) {
    assert.throws(() => assertPublicImageUrl(url), /Private or local/);
  }
});
