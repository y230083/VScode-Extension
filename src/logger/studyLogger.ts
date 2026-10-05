import * as fs from 'fs';
import * as path from 'path';

export type StudyLogAction =
	| 'detected'
	| 'view-hint'
	| 'ignore-hint';

export interface StudyLogEntry {
	timestamp: string;
	fileName: string;
	reason: string;
	hintLevel?: string;
	idleSeconds?: number;
	editCount?: number;
	changedCharacterCount?: number;
	action: StudyLogAction;
}

export class StudyLogger {
	private logs: StudyLogEntry[] = [];

	private readonly logDirectory: string;
	private readonly csvPath: string;

	constructor(baseDirectory: string) {
		this.logDirectory =
			path.join(
				baseDirectory,
				'study_logs'
			);

		this.csvPath =
			path.join(
				this.logDirectory,
				'events.csv'
			);

		this.initializeLogDirectory();
	}

	private initializeLogDirectory(): void {
		if (
			!fs.existsSync(
				this.logDirectory
			)
		) {
			fs.mkdirSync(
				this.logDirectory,
				{
					recursive: true
				}
			);
		}

		if (
			!fs.existsSync(
				this.csvPath
			)
		) {
			const header = [
				'timestamp',
				'fileName',
				'reason',
				'hintLevel',
				'idleSeconds',
				'editCount',
				'changedCharacterCount',
				'action'
			].join(',');

			fs.writeFileSync(
				this.csvPath,
				header + '\n',
				'utf8'
			);
		}
	}

	log(entry: StudyLogEntry): void {
		this.logs.push(entry);

		console.log(
			'[StudyLog]',
			entry
		);

		this.appendCsv(entry);
	}

	private appendCsv(
		entry: StudyLogEntry
	): void {
		const row = [
			entry.timestamp,
			entry.fileName,
			entry.reason,
			entry.hintLevel ?? '',
			entry.idleSeconds ?? '',
			entry.editCount ?? '',
			entry.changedCharacterCount ?? '',
			entry.action
		]
			.map(value =>
				this.escapeCsv(
					String(value)
				)
			)
			.join(',');

		fs.appendFileSync(
			this.csvPath,
			row + '\n',
			'utf8'
		);
	}

	private escapeCsv(
		value: string
	): string {
		const escaped =
			value.replace(
				/"/g,
				'""'
			);

		return `"${escaped}"`;
	}

	getLogs(): StudyLogEntry[] {
		return [...this.logs];
	}

	clear(): void {
		this.logs = [];
	}

	saveHintToText(
		fileName: string,
		hint: string,
		reason: string,
		hintLevel?: string
	): string {
		const hintsDirectory =
			path.join(
				this.logDirectory,
				'hints'
			);

		if (!fs.existsSync(hintsDirectory)) {
			fs.mkdirSync(
				hintsDirectory,
				{
					recursive: true
				}
			);
		}

		const timestamp =
			new Date()
				.toISOString()
				.replace(/[:.]/g, '-');

		const safeFileName =
			path.basename(fileName)
				.replace(/[^a-zA-Z0-9._-]/g, '_');

		const hintFileName = [
			timestamp,
			safeFileName,
			reason,
			hintLevel ?? 'normal'
		].join('_') + '.txt';

		const hintPath =
			path.join(
				hintsDirectory,
				hintFileName
			);

		fs.writeFileSync(
			hintPath,
			hint,
			'utf8'
		);

		console.log(
			'[StudyLog] ヒントを保存しました:',
			hintPath
		);

		return hintPath;
	}

}