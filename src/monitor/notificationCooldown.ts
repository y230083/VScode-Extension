export class NotificationCooldown {
	private lastNotificationTime = 0;
	private lastNotificationKey = '';

	constructor(
		private readonly cooldownMs: number
	) {}

	canNotify(currentKey: string): boolean {
		// 前回と違うエラーなら、すぐ通知してよい
		if (currentKey !== this.lastNotificationKey) {
			return true;
		}

		const elapsedTime =
			Date.now() - this.lastNotificationTime;

		return elapsedTime >= this.cooldownMs;
	}

	update(currentKey: string): void {
		this.lastNotificationKey = currentKey;
		this.lastNotificationTime = Date.now();
	}
}