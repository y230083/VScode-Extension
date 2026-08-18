import * as vscode from 'vscode';

interface EditRecord {
	line: number;
	timestamp: number;
}

export interface EditStatistics {
	totalEditCount: number;
	insertCount: number;
	deleteCount: number;
	editedLines: number[];
	maxNearbyEditCount: number;
	mostEditedLine: number | null;
}

export class EditTracker {
	private totalEditCount = 0;
	private insertCount = 0;
	private deleteCount = 0;

	private editRecords: EditRecord[] = [];

	private readonly nearbyRange = 2;

	private readonly trackingWindowMs = 30_000;

	recordEdit(
		event: vscode.TextDocumentChangeEvent
	): void {
		const now = Date.now();

		for (const change of event.contentChanges) {
			this.totalEditCount++;

			if (change.text.length > 0) {
				this.insertCount++;
			}

			if (change.rangeLength > 0) {
				this.deleteCount++;
			}

			const line =
				change.range.start.line + 1;

			this.editRecords.push({
				line,
				timestamp: now
			});
		}

		this.removeOldRecords(now);
	}

	getStatistics(): EditStatistics {
		const now = Date.now();

		this.removeOldRecords(now);

		const nearbyResult =
			this.calculateMostEditedArea();

		return {
			totalEditCount:
				this.totalEditCount,

			insertCount:
				this.insertCount,

			deleteCount:
				this.deleteCount,

			editedLines:
				Array.from(
					new Set(
						this.editRecords.map(
							record => record.line
						)
					)
				),

			maxNearbyEditCount:
				nearbyResult.editCount,

			mostEditedLine:
				nearbyResult.centerLine
		};
	}

	private removeOldRecords(
		now: number
	): void {
		this.editRecords =
			this.editRecords.filter(
				record =>
					now - record.timestamp
					<= this.trackingWindowMs
			);
	}

	private calculateMostEditedArea(): {
		editCount: number;
		centerLine: number | null;
	} {
		if (this.editRecords.length === 0) {
			return {
				editCount: 0,
				centerLine: null
			};
		}

		const candidateLines =
			new Set(
				this.editRecords.map(
					record => record.line
				)
			);

		let maxEditCount = 0;
		let mostEditedLine: number | null =
			null;

		for (const centerLine of candidateLines) {
			const nearbyEditCount =
				this.editRecords.filter(
					record =>
						Math.abs(
							record.line
							- centerLine
						) <= this.nearbyRange
				).length;

			if (
				nearbyEditCount
				> maxEditCount
			) {
				maxEditCount =
					nearbyEditCount;

				mostEditedLine =
					centerLine;
			}
		}

		return {
			editCount: maxEditCount,
			centerLine: mostEditedLine
		};
	}

	reset(): void {
		this.totalEditCount = 0;
		this.insertCount = 0;
		this.deleteCount = 0;
		this.editRecords = [];
	}
}