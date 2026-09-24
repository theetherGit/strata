<script lang="ts">
	import type { Shell, Py } from '$lib/sim/shell';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	let { shell, tick = 0 }: { shell: Shell; tick?: number } = $props();
	type Row = { key: string; label: string; py: Py; python: boolean; pip: boolean; venv: boolean; active: boolean };
	const rows = $derived.by((): Row[] => {
		tick;
		const out: Row[] = [];
		for (const [k, py] of Object.entries(shell.pythons))
			out.push({ key: k, label: `${py.label}`, py, python: !shell.activeVenv && shell.pythonCmd === k, pip: !shell.activeVenv && shell.pipCmd === k, venv: false, active: false });
		for (const [k, py] of shell.venvs)
			out.push({ key: k, label: `.venv (from ${py.label})`, py, python: shell.activeVenv === k, pip: shell.activeVenv === k, venv: true, active: shell.activeVenv === k });
		return out;
	});
	const hues = ['#2c4c8c', '#1f7a5c', '#a8741f', '#7a3e8c', '#a23b2c', '#3d6b6b'];
	const hue = (s: string) => hues[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length];
</script>

<div class="bg-card rounded-lg border-[1.5px] p-3">
	<h3 class="mb-2 font-serif text-lg font-semibold">Package shelves</h3>
	<div class="grid gap-3">
		{#each rows as r (r.key)}
			<div class={cn('rounded-lg border-[1.5px] p-2.5', r.venv && 'border-dashed', (r.python || r.pip) && 'border-foreground')}>
				<div class="mb-1 text-sm font-semibold">{r.label}</div>
				<div class="text-muted-foreground mb-2 font-mono text-[0.7rem] break-all">{r.py.home}</div>
				<div class="mb-2 flex flex-wrap gap-1">
					{#if r.python}<Badge variant="malachite">python runs this</Badge>{/if}
					{#if r.pip}<Badge variant="ochre">pip installs here</Badge>{/if}
				</div>
				<div class="flex min-h-14 items-end gap-[3px] border-b-[3px] border-[#6b5a45] pb-0.5" aria-label={`Packages: ${[...r.py.packages.keys()].join(', ')}`}>
					{#each [...r.py.packages.keys()].sort() as p (p)}
						<span class="animate-in fade-in slide-in-from-bottom-2 flex h-14 w-4 items-center justify-center rounded-t-sm text-[0.55rem] font-semibold text-white [writing-mode:vertical-rl]" style={`background:${hue(p)}`} title={p}>{p.slice(0, 9)}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
