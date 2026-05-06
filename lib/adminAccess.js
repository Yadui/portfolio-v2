import { headers } from "next/headers";

const DEFAULT_ALLOWED_ADMIN_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
const IP_HEADER_KEYS = [
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "fly-client-ip",
  "x-vercel-forwarded-for",
];

const normalizeIp = (value) => {
  if (!value) {
    return null;
  }

  let normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.includes(",")) {
    normalized = normalized.split(",")[0].trim();
  }

  if (normalized.toLowerCase().startsWith("for=")) {
    normalized = normalized.slice(4).trim();
  }

  normalized = normalized.replace(/^"+|"+$/g, "");

  if (normalized.startsWith("[") && normalized.includes("]")) {
    normalized = normalized.slice(1, normalized.indexOf("]"));
  }

  if (normalized.startsWith("::ffff:")) {
    normalized = normalized.slice(7);
  }

  if (
    normalized.includes(".") &&
    normalized.includes(":") &&
    normalized.indexOf(":") === normalized.lastIndexOf(":")
  ) {
    normalized = normalized.split(":")[0];
  }

  if (!normalized || normalized.toLowerCase() === "unknown") {
    return null;
  }

  return normalized;
};

const parseForwardedHeader = (value) => {
  if (!value) {
    return null;
  }

  const match = value.match(/for=(?:"?\[?)([^;\],"]+)/i);
  return normalizeIp(match?.[1] ?? null);
};

const getAllowedAdminIps = () => {
  const configuredIps = (process.env.ADMIN_ALLOWED_IPS ?? "")
    .split(",")
    .map(normalizeIp)
    .filter(Boolean);

  const allowedIps = configuredIps.length > 0
    ? configuredIps
    : DEFAULT_ALLOWED_ADMIN_IPS.map(normalizeIp).filter(Boolean);

  return new Set(allowedIps);
};

export const getRequestIpFromHeaders = (headerStore) => {
  for (const key of IP_HEADER_KEYS) {
    const headerValue = headerStore.get?.(key);
    const ip = normalizeIp(headerValue);

    if (ip) {
      return ip;
    }
  }

  return parseForwardedHeader(headerStore.get?.("forwarded"));
};

export const isAllowedAdminIp = (ip) => {
  const normalizedIp = normalizeIp(ip);

  if (!normalizedIp) {
    return false;
  }

  return getAllowedAdminIps().has(normalizedIp);
};

export const isRequestFromAllowedAdminIp = (headerStore) =>
  isAllowedAdminIp(getRequestIpFromHeaders(headerStore));

export async function isCurrentRequestFromAllowedAdminIp() {
  const headerStore = await headers();
  return isRequestFromAllowedAdminIp(headerStore);
}