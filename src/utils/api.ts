const API_BASE = import.meta.env.VITE_API_BASE || '';

export function isApiEnabled(): boolean {
  return !!API_BASE;
}

export async function saveRecord(
  input: Record<string, unknown>,
  summary: Record<string, unknown>,
  label?: string
): Promise<{ id: string; url: string } | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, summary, label }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, url: `${window.location.origin}/s/${data.id}` };
  } catch {
    return null;
  }
}

export async function loadRecord(
  id: string
): Promise<{ input: Record<string, unknown>; summary: Record<string, unknown>; label?: string } | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/save/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { input: data.input, summary: data.summary, label: data.label };
  } catch {
    return null;
  }
}

export async function submitFeedback(content: string, contact?: string): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/api/v1/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, contact }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
