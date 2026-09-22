export type SeoDate = Date | string | number | null | undefined;

/** Preserve title meaning; Google may truncate by pixel width or rewrite titles. */
export function getArticleSeoTitle(title: string, slug: string): string {
  if (slug === "securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa") {
    return "Azure Virtual Desktop: Passwordless MFA with Entra ID";
  }
  return title.replace(/\s+/g, " ").trim();
}

/** Omit unverified dates rather than inventing a last-modified timestamp. */
export function sitemapLastModified(
  value: SeoDate,
  now: Date = new Date()
): { lastModified?: Date } {
  if (value == null || value === "") return {};

  if (typeof value === "string") {
    // Accept date-only ISO values or timestamps with an explicit timezone.
    const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
    if (!parts) return {};
    const [, yearText, monthText, dayText, hour, minute, second] = parts;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Date.parse normalizes some impossible dates (such as February 30).
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) return {};
    if (hour !== undefined && (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59)) return {};
  }

  const date = new Date(value instanceof Date ? value.getTime() : value);
  const timestamp = date.getTime();
  if (!Number.isFinite(timestamp) || !Number.isFinite(now.getTime()) || timestamp > now.getTime()) return {};
  if (date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return {};
  return { lastModified: date };
}

/** Serialize structured data safely for embedding inside an HTML script element. */
export function serializeJsonLd(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) throw new TypeError("JSON-LD must be JSON-serializable");
  return json.replace(/[<>&\u2028\u2029]/g, (character) =>
    `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`
  );
}
