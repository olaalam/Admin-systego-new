// src/api/pleskApi.js
import axios from "axios";

export const PLESK_API_KEY = "874c8d25-abd4-884d-0251-86e006eb3dc6";
export const PLESK_DIRECT_URL = "https://62.84.185.153:8443";
export const PLESK_PROXY_URL = "/plesk-proxy";

/**
 * Extracts a clean hostname / domain from an input URL or environment variable.
 * e.g. "https://salesbcknd.systego.net/api" -> "salesbcknd.systego.net"
 *      "https://api-sdfaf.systego.net" -> "api-sdfaf.systego.net"
 */
export function extractDomain(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    rawUrl = import.meta.env.VITE_API_BASE_URL || "salesbcknd.systego.net";
  }
  const trimmed = rawUrl.trim();
  try {
    const formatted =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    const parsed = new URL(formatted);
    return parsed.hostname;
  } catch (e) {
    return trimmed.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
  }
}

/**
 * Derives the frontend subdomain / www-root from the backend domain.
 * Rule:
 * 1) If backend starts with "api-": "api-sdfaf.systego.net" -> "sdfaf.systego.net"
 * 2) If backend contains "bcknd": "salesbcknd.systego.net" -> "sales.systego.net"
 * 3) If browser hostname is a client subdomain (e.g. "xyz.systego.net"), can be used if backend is generic.
 */
export function deriveFrontendDomain(backendDomain) {
  if (!backendDomain) return "";
  let domain = backendDomain.trim();

  // If starts with "api-" -> remove "api-"
  if (/^api-/i.test(domain)) {
    return domain.replace(/^api-/i, "");
  }

  // If contains "bcknd" -> replace "bcknd." with "."
  if (/bcknd\./i.test(domain)) {
    return domain.replace(/bcknd\./i, ".");
  }

  // If backend is generic "bcknd.systego.net" and current browser has a client subdomain
  if (typeof window !== "undefined" && window.location?.hostname) {
    const currentHost = window.location.hostname;
    const parts = currentHost.split(".");
    if (
      parts.length > 2 &&
      parts[0] !== "www" &&
      parts[0] !== "systego" &&
      parts[0] !== "localhost"
    ) {
      return currentHost;
    }
  }

  return domain;
}

/**
 * Executes a POST request to Plesk API with automatic fallback between proxy and direct URL.
 */
async function callPleskEndpoint(endpointPath, body) {
  // If in Vite dev environment, try proxy first to bypass any self-signed cert blocks
  const isDev = import.meta.env.DEV;
  const urlsToTry = isDev
    ? [`${PLESK_PROXY_URL}${endpointPath}`, `${PLESK_DIRECT_URL}${endpointPath}`]
    : [`${PLESK_DIRECT_URL}${endpointPath}`, `${PLESK_PROXY_URL}${endpointPath}`];

  let lastError = null;

  for (const url of urlsToTry) {
    try {
      const response = await axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": PLESK_API_KEY,
        },
        timeout: 15000,
      });
      return response.data;
    } catch (err) {
      lastError = err;
      console.warn(`Plesk API call to ${url} failed, attempting next fallback if available:`, err?.message);
    }
  }

  throw lastError;
}

/**
 * Fetches subscription information for a domain.
 * @param {string} domain Domain name, e.g. "salesbcknd.systego.net"
 */
export async function getSubscriptionInfo(domain) {
  const targetDomain = domain || extractDomain();
  const body = {
    params: ["--info", targetDomain],
  };

  const data = await callPleskEndpoint("/api/v2/cli/subscription/call", body);
  return data;
}

/**
 * Creates or links a site/domain to a webspace with specified www-root.
 * @param {object} options
 * @param {string} options.clientDomain e.g. "client-domain.com"
 * @param {string} options.webspaceName e.g. "systego.net"
 * @param {string} options.wwwRoot e.g. "Sales.systego.net" or "sdfaf.systego.net"
 */
export async function createSiteMapping({
  clientDomain,
  webspaceName = "systego.net",
  wwwRoot,
}) {
  if (!clientDomain) {
    throw new Error("Client domain is required");
  }
  if (!wwwRoot) {
    throw new Error("WWW-Root (Frontend Subdomain) is required");
  }

  const cleanClientDomain = clientDomain.trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  const cleanWebspace = (webspaceName || "systego.net").trim();
  const cleanWwwRoot = wwwRoot.trim();

  const body = {
    params: [
      "--create",
      cleanClientDomain,
      "-webspace-name",
      cleanWebspace,
      "-hosting",
      "true",
      "-www-root",
      cleanWwwRoot,
    ],
  };

  const data = await callPleskEndpoint("/api/v2/cli/site/call", body);
  return data;
}

/**
 * Parses Plesk subscription stdout into structured information.
 */
export function parseSubscriptionStdout(stdout) {
  if (!stdout || typeof stdout !== "string") {
    return null;
  }

  const result = {
    general: {},
    hosting: {},
    wwwRoot: "",
    wwwRootFolder: "",
    subscriptionInfo: "",
    raw: stdout,
  };

  const lines = stdout.split(/\r?\n/);
  let currentSection = "general";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("General")) {
      currentSection = "general";
      continue;
    }
    if (line.startsWith("Hosting")) {
      currentSection = "hosting";
      continue;
    }
    if (line.startsWith("Subscription Information")) {
      currentSection = "subscription";
      continue;
    }

    if (line.includes("--WWW-Root--:")) {
      const match = line.match(/--WWW-Root--:\s*(.+)/);
      if (match) {
        result.wwwRoot = match[1].trim();
        const segments = result.wwwRoot.split("/").filter(Boolean);
        result.wwwRootFolder = segments[segments.length - 1] || "";
      }
      continue;
    }

    if (line.startsWith("SUCCESS:") || line.startsWith("=======")) {
      continue;
    }

    if (currentSection === "subscription") {
      result.subscriptionInfo += (result.subscriptionInfo ? "\n" : "") + line;
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key) {
        if (currentSection === "general") {
          result.general[key] = val;
        } else if (currentSection === "hosting") {
          result.hosting[key] = val;
        }
      }
    }
  }

  return result;
}
