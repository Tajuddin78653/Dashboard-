export function saveToken(token: string): void {
  localStorage.setItem('tradedash_token', token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tradedash_token');
}

export function removeToken(): void {
  localStorage.removeItem('tradedash_token');
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp as number) * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getUser(): { id: string; email: string; name: string; role: string } | null {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])) as { id: string; email: string; name: string; role: string };
  } catch {
    return null;
  }
}
