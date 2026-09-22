import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { build } from "esbuild";
import nodemailer from "nodemailer";

const root = fileURLToPath(new URL("../", import.meta.url));
// Compile the actual handler; isolate mail, environment, logs and timers.
// No dotenv, real credentials, SMTP connection or HTTP request is used.
const compiled = await build({
  absWorkingDir: root,
  entryPoints: ["app/api/contact/route.js"],
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  logLevel: "silent",
  plugins: [{
    name: "offline-contact-mail",
    setup(build) {
      build.onResolve({ filter: /^nodemailer$/ }, () => ({ path: "nodemailer", namespace: "contact-test" }));
      build.onLoad({ filter: /.*/, namespace: "contact-test" }, () => ({ contents: "export default fixture.nodemailer;" }));
    },
  }],
});

const valid = { firstname: "Test", lastname: "Visitor", email: "visitor@example.com", phone: "", service: "", message: "A private project inquiry." };
const request = (body) => new Request("http://localhost/api/contact", { method: "POST", body: JSON.stringify(body) });

function harness(options = {}) {
  const { failure, send } = options;
  const password = Object.hasOwn(options, "password") ? options.password : "test-placeholder";
  const transports = [];
  const messages = [];
  const logs = [];
  const timers = [];
  const fixture = {
    nodemailer: {
      createTransport(options) {
        transports.push(options);
        if (failure === "create") throw new Error("provider error with visitor@example.com and private credential");
        return {
          async sendMail(message) {
            messages.push(message);
            if (failure === "send") throw new Error("provider error with visitor@example.com and private credential");
            return send ? send(message, options) : { messageId: "offline" };
          },
        };
      },
    },
  };
  const compiledModule = { exports: {} };
  new Function("module", "exports", "fixture", "process", "console", "setTimeout", compiled.outputFiles[0].text)(
    compiledModule, compiledModule.exports, fixture,
    { env: { GMAIL_APP_PASSWORD: password } },
    Object.fromEntries(["log", "warn", "error", "info", "debug"].map((level) => [level, (...args) => logs.push(args)])),
    (callback, delay) => { timers.push(delay); callback(); },
  );
  return { POST: compiledModule.exports.POST, transports, messages, logs, timers };
}

async function rejects(body) {
  const h = harness();
  const response = await h.POST(request(body));
  assert.equal(response.status, 400);
  const result = await response.json();
  assert.equal(typeof result.error, "string");
  assert.notEqual(result.success, true);
  assert.deepEqual(h.transports, []);
  assert.deepEqual(h.logs, []);
}

test("preserves UI payload, exact success shape and fixed recipient; ignores mail-option injection", async () => {
  const h = harness();
  const response = await h.POST(request({ ...valid, service: "other", otherService: "Technical review", to: "attacker@example.com", bcc: "attacker@example.com", attachments: [{ path: "/not-used" }], html: { path: "/not-used" }, disableFileAccess: false }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(h.messages.length, 1);
  assert.equal(h.messages[0].to, "abhinavyadav8+port@gmail.com");
  assert.equal(h.messages[0].from, '"Portfolio Contact" <abhinavyadav8+port@gmail.com>');
  assert.equal(h.messages[0].replyTo, valid.email);
  assert.equal(h.messages[0].bcc, undefined);
  assert.equal(h.messages[0].attachments, undefined);
  assert.deepEqual(h.logs, []);
});

test("accepts phone-only contact and omitted optional fields", async () => {
  const h = harness();
  const response = await h.POST(request({ firstname: " Test ", phone: "+91 12345 67890", message: " Help\nwith a project " }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(h.messages[0].replyTo, undefined);
  assert.doesNotMatch(h.messages[0].html, /undefined|null/);
});

test("returns 400 for malformed JSON rather than throwing", async () => {
  const h = harness();
  const response = await h.POST(new Request("http://localhost/api/contact", { method: "POST", body: '{"message":' }));
  assert.equal(response.status, 400);
  assert.equal(typeof (await response.json()).error, "string");
  assert.deepEqual(h.transports, []);
  assert.deepEqual(h.logs, []);
});

test("rejects non-object JSON bodies", async () => {
  for (const body of [null, [], "text", 42, true]) await rejects(body);
});

test("rejects non-string types in every supplied form field", async () => {
  for (const field of ["firstname", "lastname", "email", "phone", "service", "message", "otherService"]) {
    for (const value of [null, 123, true, [], {}, { path: "/not-used" }, { href: "https://example.invalid/not-used" }]) {
      await rejects({ ...valid, [field]: value });
    }
  }
});

test("requires nonblank firstname, message and at least one contact method", async () => {
  for (const field of ["firstname", "message"]) {
    for (const value of [undefined, "", " \r\n\t ", "\u0000"]) await rejects({ ...valid, [field]: value });
  }
  await rejects({ ...valid, email: "", phone: "" });
  await rejects({ ...valid, email: "  ", phone: "\t " });
});

test("rejects invalid emails even when a phone is supplied, including control/header injection", async () => {
  for (const email of ["not-an-email", "a@@example.com", "a b@example.com", "a@example.com,evil@example.com", "Name <a@example.com>", "a@example.com\r\nBcc: evil@example.com", "a@example.com\n", "\ra@example.com", "a\u0000@example.com", "a\u0085@example.com", "a\u2028@example.com"]) {
    await rejects({ ...valid, email, phone: "+91 12345 67890" });
  }
});

test("accepts plus-tag email and trims surrounding spaces", async () => {
  const h = harness();
  assert.equal((await h.POST(request({ ...valid, email: " visitor+portfolio@example.com " }))).status, 200);
  assert.equal(h.messages[0].replyTo, "visitor+portfolio@example.com");
});

test("bounds all form strings before trimming", async () => {
  for (const [field, limit] of Object.entries({ firstname: 100, lastname: 100, email: 254, phone: 50, service: 200, message: 5000, otherService: 200 })) {
    await rejects({ ...valid, [field]: "x".repeat(limit + 1) });
    await rejects({ ...valid, [field]: " ".repeat(limit + 1) });
  }
});

test("accepts fields at their documented length limits", async () => {
  const h = harness();
  const response = await h.POST(request({ ...valid, firstname: "x".repeat(100), lastname: "x".repeat(100), phone: "1".repeat(50), service: "x".repeat(200), otherService: "x".repeat(200), message: "x".repeat(5000) }));
  assert.equal(response.status, 200);
});

test("escapes HTML metacharacters in every interpolated field", async () => {
  const h = harness();
  const hostile = `<img src=x onerror='alert("x")'>&`;
  const email = "o'hara&team@example.com";
  assert.equal((await h.POST(request({ firstname: hostile, lastname: hostile, email, phone: hostile, service: hostile, message: hostile }))).status, 200);
  const html = h.messages[0].html;
  assert.equal(html.split("&lt;img src=x onerror=&#39;alert(&quot;x&quot;)&#39;&gt;&amp;").length - 1, 5);
  assert.ok(html.includes("o&#39;hara&amp;team@example.com"));
  assert.doesNotMatch(html, /<img/);
});

test("strips controls from subject without destroying multiline message text", async () => {
  const h = harness();
  assert.equal((await h.POST(request({ ...valid, service: "Consult\r\nBcc:\tother\u0000\u007f\u0085\u2028\u2029", message: "First line\nSecond line\tindented" }))).status, 200);
  assert.doesNotMatch(h.messages[0].subject, /[\p{Cc}\p{Zl}\p{Zp}]/u);
  assert.ok(h.messages[0].html.includes("First line\nSecond line\tindented"));
});

test("requires STARTTLS and disables file/URL resolution in both transport and message", async () => {
  const h = harness();
  await h.POST(request(valid));
  assert.equal(h.transports[0].host, "smtp.gmail.com");
  assert.equal(h.transports[0].port, 587);
  assert.equal(h.transports[0].requireTLS, true);
  assert.notEqual(h.transports[0].tls?.rejectUnauthorized, false);
  for (const options of [h.transports[0], h.messages[0]]) {
    assert.equal(options.disableFileAccess, true);
    assert.equal(options.disableUrlAccess, true);
  }
});

test("missing or blank configuration returns truthful 503 without logging or artificial delay", async () => {
  for (const password of [undefined, "", "   ", null]) {
    const h = harness({ password });
    const response = await h.POST(request(valid));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { success: false, error: "Contact service unavailable. Please try again later." });
    assert.deepEqual(h.transports, []);
    assert.deepEqual(h.logs, []);
    assert.deepEqual(h.timers, []);
  }
});

test("transport creation and provider failures return generic errors without PII logs", async () => {
  for (const failure of ["create", "send"]) {
    const h = harness({ failure });
    const response = await h.POST(request(valid));
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { success: false, error: "Unable to send message. Please try again later." });
    assert.deepEqual(h.logs, []);
  }
});

// Run against the installed Nodemailer (also exercises v10 after the parent
// upgrades it). Only in-memory stream/JSON transports are ever constructed.
for (const mode of ["stream", "json"]) {
  test(`real Nodemailer ${mode} transport serializes the handler message locally`, async () => {
    let output;
    const h = harness({ send: async (message, options) => {
      assert.equal(options.disableFileAccess, true);
      assert.equal(options.disableUrlAccess, true);
      const transport = nodemailer.createTransport({
        ...(mode === "stream" ? { streamTransport: true, buffer: true } : { jsonTransport: true }),
        disableFileAccess: options.disableFileAccess,
        disableUrlAccess: options.disableUrlAccess,
      });
      output = await transport.sendMail(message);
      return output;
    } });
    const response = await h.POST(request({ ...valid, message: "<script>alert('private')</script>&" }));
    assert.equal(response.status, 200);
    assert.deepEqual(output.envelope.to, ["abhinavyadav8+port@gmail.com"]);
    const serialized = output.message.toString();
    assert.doesNotMatch(serialized, /<script>/);
    assert.match(serialized, /&lt;script&gt;/);
  });
}
