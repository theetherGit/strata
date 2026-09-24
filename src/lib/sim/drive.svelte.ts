import { Shell, shellFromJSON } from './shell';

const key = (n: number) => `neha-strata-drive-${n}`;

/** Load a chapter's saved pretend drive, or null. */
export function loadDrive(n: number): Shell | null {
	try {
		const raw = localStorage.getItem(key(n));
		return raw ? shellFromJSON(JSON.parse(raw)) : null;
	} catch {
		return null;
	}
}
export function saveDrive(n: number, shell: Shell) {
	try {
		localStorage.setItem(key(n), JSON.stringify(shell));
	} catch {
		/* storage full or unavailable: the drive lasts this visit only */
	}
}
export function clearDrive(n: number) {
	try {
		localStorage.removeItem(key(n));
	} catch {
		/* ignore */
	}
}
