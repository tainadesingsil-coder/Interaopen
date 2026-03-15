export type TwitchEmbedBuildOptions = {
  channel: string;
  parentHosts: string[];
  autoplay?: boolean;
  muted?: boolean;
};

const HOSTNAME_REGEX =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])$/i;

function normalizeHostnameCandidate(value: string): string | null {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  let candidate = raw;

  try {
    if (candidate.includes("://")) {
      const parsed = new URL(candidate);
      candidate = parsed.hostname.toLowerCase();
    } else {
      candidate = candidate
        .replace(/^[a-z]+:\/\//i, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0]
        .split("@")
        .pop() ?? "";
      candidate = candidate.split(":")[0] ?? "";
    }
  } catch {
    return null;
  }

  candidate = candidate.replace(/^\.+|\.+$/g, "");
  if (!candidate || !HOSTNAME_REGEX.test(candidate)) return null;
  return candidate;
}

function getHostsFromEnvCsv(): string[] {
  const rawCsv = process.env.NEXT_PUBLIC_TWITCH_EMBED_PARENTS ?? "";
  if (!rawCsv.trim()) return [];
  return rawCsv
    .split(",")
    .map((item) => normalizeHostnameCandidate(item))
    .filter((item): item is string => Boolean(item));
}

function getHostFromReferrer(referrer: string): string | null {
  if (!referrer) return null;
  try {
    return normalizeHostnameCandidate(new URL(referrer).hostname);
  } catch {
    return null;
  }
}

export function getTwitchParentHosts(): string[] {
  const uniqueHosts = new Set<string>();
  const pushHost = (value: string | null) => {
    if (!value) return;
    const host = normalizeHostnameCandidate(value);
    if (host) uniqueHosts.add(host);
  };

  if (typeof window !== "undefined") {
    pushHost(window.location.hostname);
    pushHost(window.location.host);
    pushHost(getHostFromReferrer(document.referrer));

    const ancestorOrigins = (
      window.location as Location & { ancestorOrigins?: DOMStringList }
    ).ancestorOrigins;
    if (ancestorOrigins) {
      for (let i = 0; i < ancestorOrigins.length; i += 1) {
        pushHost(ancestorOrigins[i] ?? "");
      }
    }
  }

  for (const hostFromEnv of getHostsFromEnvCsv()) {
    pushHost(hostFromEnv);
  }

  return Array.from(uniqueHosts);
}

export function buildTwitchEmbedUrl({
  channel,
  parentHosts,
  autoplay = true,
  muted = true,
}: TwitchEmbedBuildOptions): string {
  const normalizedChannel = channel.trim().replace(/^@/, "");
  const url = new URL("https://player.twitch.tv/");
  url.searchParams.set("channel", normalizedChannel);
  url.searchParams.set("autoplay", String(autoplay));
  url.searchParams.set("muted", String(muted));

  for (const parent of parentHosts) {
    url.searchParams.append("parent", parent);
  }

  return url.toString();
}

export function rotateHosts(hosts: string[], step: number): string[] {
  if (!hosts.length) return hosts;
  const safeStep = Math.abs(step) % hosts.length;
  if (safeStep === 0) return [...hosts];
  return [...hosts.slice(safeStep), ...hosts.slice(0, safeStep)];
}
