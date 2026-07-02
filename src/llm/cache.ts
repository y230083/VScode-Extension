const hintCache = new Map<string, string>();

export function createCacheKey(
	language: string,
	errorMessage: string,
	code: string
): string {
	return `${language}::${errorMessage}::${code}`;
}

export function getCachedHint(key: string): string | undefined {
	return hintCache.get(key);
}

export function saveHintToCache(key: string, hint: string): void {
	hintCache.set(key, hint);
}