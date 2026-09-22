import nodemailer from "nodemailer";

const FIELD_LIMITS = {
  firstname: 100,
  lastname: 100,
  email: 254,
  phone: 50,
  service: 200,
  otherService: 200,
  message: 5000,
};

const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

function validateFields(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;

  const fields = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = Object.hasOwn(body, field) ? body[field] : "";
    if (typeof value !== "string" || value.length > limit) return null;

    // Reject email controls before trimming: never repair an injected address.
    if (field === "email" && /[\p{Cc}\p{Zl}\p{Zp}]/u.test(value)) return null;
    fields[field] = value.replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, (character) =>
      field === "message" && /[\r\n\t]/.test(character) ? character : " "
    ).trim();
  }

  const { firstname, message, email, phone } = fields;
  if (!firstname || !message || (!email && !phone)) return null;

  if (email) {
    // Accept a single plain mailbox, not display names, lists or mail options.
    const [local, domain, extra] = email.split("@");
    if (
      !local || local.length > 64 || !domain || extra !== undefined ||
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) ||
      local.startsWith(".") || local.endsWith(".") || local.includes("..") ||
      !domain.includes(".") ||
      !domain.split(".").every((label) => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label))
    ) return null;
  }

  return fields;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid contact details" }, { status: 400 });
  }

  const fields = validateFields(body);
  if (!fields) {
    return Response.json({ error: "Invalid contact details" }, { status: 400 });
  }
  const { firstname, lastname, email, phone, service, message } = fields;

  const password = process.env.GMAIL_APP_PASSWORD;
  if (!password?.trim()) {
    return Response.json(
      { success: false, error: "Contact service unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      disableFileAccess: true,
      disableUrlAccess: true,
      auth: {
        user: "abhinavyadav8+port@gmail.com",
        pass: password,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <abhinavyadav8+port@gmail.com>`,
      replyTo: email || undefined,
      to: "abhinavyadav8+port@gmail.com",
      subject: `New Contact Form${service ? `: ${service}` : ""}`,
      disableFileAccess: true,
      disableUrlAccess: true,
      html: `
    <p>Name: ${escapeHtml(firstname)} ${escapeHtml(lastname)}</p>
    <p>Email: ${escapeHtml(email)}</p>
    ${phone ? `<p>Phone: ${escapeHtml(phone)}</p>` : ""}
    ${service ? `<p>Service: ${escapeHtml(service)}</p>` : ""}
    <p>Message: ${escapeHtml(message)}</p>
  `,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch {
    return Response.json(
      { success: false, error: "Unable to send message. Please try again later." },
      { status: 500 }
    );
  }
}
