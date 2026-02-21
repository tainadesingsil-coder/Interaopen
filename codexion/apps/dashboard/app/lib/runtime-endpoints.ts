const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function isLocalRuntimeHost() {
  if (typeof window === 'undefined') {
    return false;
  }
  return LOCAL_HOSTS.has(window.location.hostname);
}

export function getRuntimeEdgeApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_EDGE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  return isLocalRuntimeHost() ? 'http://localhost:8787' : '';
}

export function getRuntimeEdgeWsUrl() {
  const envUrl = process.env.NEXT_PUBLIC_EDGE_WS_URL;
  if (envUrl) {
    return envUrl;
  }
  return isLocalRuntimeHost() ? 'ws://localhost:8787/ws' : '';
}

export function getRuntimeMiddlewareApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_MIDDLEWARE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  return isLocalRuntimeHost() ? 'http://localhost:8081' : '';
}
