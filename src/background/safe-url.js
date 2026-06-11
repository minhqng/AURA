const LOCAL_HOSTS = new Set(["localhost"]);
const LOCAL_SUFFIXES = [".localhost", ".local", ".lan", ".localdomain", ".home.arpa"];

function ipv4Parts(hostname) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return null;
  const parts = hostname.split(".").map(Number);
  return parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)
    ? parts
    : null;
}

function isPrivateIpv4(parts) {
  const [first, second] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host.includes(":")) return false;
  return (
    host === "::1" ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.includes(":ffff:") ||
    host.startsWith("fe80:")
  );
}

function isBlockedHostname(hostname) {
  const host = hostname.toLowerCase();
  const parts = ipv4Parts(host);
  return (
    LOCAL_HOSTS.has(host) ||
    LOCAL_SUFFIXES.some((suffix) => host.endsWith(suffix)) ||
    (parts ? isPrivateIpv4(parts) : isPrivateIpv6(host))
  );
}

export function assertPublicImageUrl(imageUrl) {
  const url = new URL(imageUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http/https image URLs are supported.");
  }
  if (isBlockedHostname(url.hostname)) {
    throw new Error("Private or local network image URLs are not allowed.");
  }
  return url;
}
