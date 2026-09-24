<script lang="ts">
	import type { Shell, Line } from '$lib/sim/shell';
	import { cn } from '$lib/utils';
	import { tick as nextTick } from 'svelte';

	let {
		shell,
		onrun,
		greeting = 'Practice terminal. Type help to see the commands it knows.',
		class: className = ''
	}: { shell: Shell; onrun?: (cmd: string, out: Line[]) => void; greeting?: string; class?: string } = $props();

	let lines = $state<Line[]>([]);
	let input = $state('');
	let prompt = $state('');
	let hIndex = -1;
	let scroller: HTMLDivElement;
	let inputEl: HTMLInputElement;

	$effect(() => {
		shell;
		lines = [{ kind: 'out', text: greeting }];
		prompt = shell.prompt();
	});

	async function submit() {
		const cmd = input;
		input = '';
		hIndex = -1;
		const out = shell.run(cmd);
		if (out.some((l) => l.text === '__clear__')) lines = [];
		else lines = [...lines, ...out];
		prompt = shell.prompt();
		onrun?.(cmd.trim(), out.slice(1));
		await nextTick();
		scroller.scrollTop = scroller.scrollHeight;
	}
	function key(e: KeyboardEvent) {
		const h = shell.history;
		if (e.key === 'Enter') {
			e.preventDefault();
			submit();
		} else if (e.key === 'ArrowUp') {
			if (!h.length) return;
			e.preventDefault();
			hIndex = hIndex < 0 ? h.length - 1 : Math.max(0, hIndex - 1);
			input = h[hIndex];
		} else if (e.key === 'ArrowDown') {
			if (hIndex < 0) return;
			e.preventDefault();
			hIndex = hIndex + 1;
			if (hIndex >= h.length) {
				hIndex = -1;
				input = '';
			} else input = h[hIndex];
		} else if (e.key === 'Tab') {
			e.preventDefault();
			input = shell.complete(input);
		} else if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			lines = [];
		} else if (e.key === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
			e.preventDefault();
			lines = [...lines, { kind: 'cmd', text: input + '^C', prompt }];
			input = '';
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class={cn('term flex min-h-[340px] flex-col overflow-hidden rounded-lg border-[1.5px] border-[#0b2a4a] shadow-sm', className)}
	onclick={() => {
		if (!window.getSelection()?.toString()) inputEl.focus();
	}}
>
	<div class="flex items-center gap-2 border-b border-white/10 bg-[#0b2a4a] px-3 py-1.5 text-xs text-white/75">
		<span class="flex gap-1.5" aria-hidden="true"><i class="size-2.5 rounded-full bg-white/25"></i><i class="size-2.5 rounded-full bg-white/25"></i><i class="size-2.5 rounded-full bg-white/25"></i></span>
		<span>Windows PowerShell (practice)</span>
	</div>
	<div bind:this={scroller} class="flex-1 overflow-y-auto px-3 py-2.5 font-mono text-[0.82rem] leading-[1.5] text-[#e6edf3]" role="log" aria-live="polite" aria-label="Terminal output">
		{#each lines as l, i (i)}
			{#if l.kind === 'cmd'}
				<div class="whitespace-pre-wrap [overflow-wrap:anywhere]"><span class="text-[#8ee3b9]">{l.prompt}</span> {l.text}</div>
			{:else}
				<div class={cn('whitespace-pre-wrap [overflow-wrap:anywhere]', l.kind === 'err' && 'text-[#ff9b8a]', l.kind === 'ok' && 'text-[#8ee3b9]')}>{l.text || ' '}</div>
			{/if}
		{/each}
		<div class="flex items-baseline gap-2">
			<label for="term-input" class="max-w-[70%] shrink-0 [overflow-wrap:anywhere] text-[#8ee3b9]">{prompt}</label>
			<input
				id="term-input"
				bind:this={inputEl}
				bind:value={input}
				onkeydown={key}
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck={false}
				data-gramm="false"
				data-gramm_editor="false"
				data-enable-grammarly="false"
				data-lpignore="true"
				data-1p-ignore
				class="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[#e6edf3] caret-[#8ee3b9] outline-none"
			/>
		</div>
	</div>
</div>

<style>
	.term {
		background: #012456;
	}
</style>
