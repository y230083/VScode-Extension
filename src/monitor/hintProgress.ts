import { HintLevel } from '../llm/types';

export class HintProgress {
	private level: HintLevel = 'light';

	getLevel(): HintLevel {
		return this.level;
	}

	getRequiredIdleSeconds(): number {
		switch (this.level) {
			case 'light':
				return 10;

			case 'medium':
				return 20;

			case 'strong':
				return 30;
		}
	}

	advance(): void {
		switch (this.level) {
			case 'light':
				this.level = 'medium';
				break;

			case 'medium':
				this.level = 'strong';
				break;

			case 'strong':
				break;
		}
	}

	reset(): void {
		this.level = 'light';
	}
}