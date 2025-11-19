// Frontend client for endpoint-driven transforms

type FetchOptions = RequestInit & { signal?: AbortSignal };

async function postJson<T>(url: string, body: unknown, options: FetchOptions = {}): Promise<T> {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		...options,
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Transform API ${url} failed: ${res.status} ${text}`);
	}
	return res.json() as Promise<T>;
}

export function resizeObject(
	designId: string,
	objectId: string,
	handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw',
	params: { dx?: number; dy?: number; newWidth?: number; newHeight?: number },
	options?: FetchOptions
) {
	return postJson(`/api/designs/${designId}/transform/resize`, { objectId, handle, ...params }, options);
}











