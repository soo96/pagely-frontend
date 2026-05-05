function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function buildHeaders(extra = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    const payload = decodeJwt(token);
    if (payload?.sub) headers['X-User-Id'] = payload.sub;
  }
  return headers;
}

export async function apiFetch(url, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  return fetch(url, {
    ...rest,
    headers: buildHeaders(extraHeaders),
  });
}
