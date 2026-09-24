import { CHAPTERS, type Chapter } from './data/chapters';

type ChState = {
	quizBest: number;
	quizPassed: boolean;
	checks: Record<string, boolean>;
	answers: Record<string, string>;
	play: Record<string, boolean>;
};
const KEY = 'neha-strata-v2';

function load(): Record<number, ChState> {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {};
	} catch {
		return {};
	}
}

class Progress {
	data = $state<Record<number, ChState>>(load());
	/** Bumped on a full reset so pages can re-mount. */
	resets = $state(0);

	/** Read-only view, safe to call from templates and deriveds. */
	get(n: number): ChState {
		return this.data[n] ?? { quizBest: 0, quizPassed: false, checks: {}, answers: {}, play: {} };
	}
	ch(n: number): ChState {
		if (!this.data[n]) this.data[n] = { quizBest: 0, quizPassed: false, checks: {}, answers: {}, play: {} };
		return this.data[n];
	}
	save() {
		try {
			localStorage.setItem(KEY, JSON.stringify(this.data));
		} catch {
			/* storage unavailable: progress lasts this visit only */
		}
	}
	setQuiz(n: number, score: number, pass: boolean) {
		const s = this.ch(n);
		s.quizBest = Math.max(s.quizBest, score);
		if (pass) s.quizPassed = true;
		this.save();
	}
	setCheck(n: number, id: string, answer: string, ok: boolean) {
		const s = this.ch(n);
		s.answers[id] = answer;
		s.checks[id] = ok;
		this.save();
	}
	markPlay(n: number, id: string) {
		const s = this.ch(n);
		if (s.play[id]) return;
		s.play[id] = true;
		this.save();
	}
	resetPlay(n: number) {
		this.ch(n).play = {};
		this.save();
	}
	/** A short code that carries progress to another browser. */
	exportCode(): string {
		return 'strata1.' + btoa(unescape(encodeURIComponent(JSON.stringify(this.data))));
	}
	/** Load a code from exportCode(); returns false if it isn't one. Replaces what is here. */
	importCode(code: string): boolean {
		try {
			const t = code.trim();
			if (!t.startsWith('strata1.')) return false;
			const d = JSON.parse(decodeURIComponent(escape(atob(t.slice(8)))));
			if (!d || typeof d !== 'object') return false;
			this.data = d;
			this.save();
			return true;
		} catch {
			return false;
		}
	}
	reset() {
		this.data = {};
		this.resets++;
		this.save();
	}

	quizDone(c: Chapter) {
		return !!this.data[c.n]?.quizPassed;
	}
	labDone(c: Chapter) {
		return c.lab.checks.every((k) => this.data[c.n]?.checks[k.id]);
	}
	playDone(c: Chapter) {
		return !c.play || c.play.missions.every((m) => this.data[c.n]?.play[m.id]);
	}
	playCount(c: Chapter) {
		return c.play ? c.play.missions.filter((m) => this.data[c.n]?.play[m.id]).length : 0;
	}
	/** 0..1 share of the chapter's parts completed. */
	fraction(c: Chapter) {
		const s = this.data[c.n];
		const lab = c.lab.checks.filter((k) => s?.checks[k.id]).length / c.lab.checks.length;
		const parts = [s?.quizPassed ? 1 : 0, lab, ...(c.play ? [this.playCount(c) / c.play.missions.length] : [])];
		return parts.reduce((a, b) => a + b, 0) / parts.length;
	}
	get deposited() {
		return CHAPTERS.filter((c) => this.fraction(c) === 1).length;
	}
}

export const progress = new Progress();
