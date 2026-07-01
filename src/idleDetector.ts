export class IdleDetector {
	private lastEditTime: number;

	constructor() {
		this.lastEditTime = Date.now();
	}

	updateEditTime() {
		this.lastEditTime = Date.now();
	}

	getIdleSeconds(): number {
		return (Date.now() - this.lastEditTime) / 1000;
	}

	reset() {
		this.lastEditTime = Date.now();
	}
}