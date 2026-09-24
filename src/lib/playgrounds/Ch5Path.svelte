<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { cn } from '$lib/utils';
	import { Search, Folder, CircleCheck, CircleX, ShoppingBag } from '@lucide/svelte';

	const N = 5;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	let installed = $state(true);
	let ticked = $state(false);
	let aliases = $state(true);
	let cmd = $state('python');
	let pointer = $state(-1);
	let result = $state<null | { kind: 'found' | 'store' | 'none'; text: string }>(null);
	let running = $state(false);

	type F = { path: string; files: string[]; tag?: string };
	const folders = $derived<F[]>([
		{ path: 'C:\\Windows\\system32', files: ['cmd.exe', 'notepad.exe', 'where.exe'] },
		{ path: 'C:\\Windows', files: ['explorer.exe', 'notepad.exe'] },
		{ path: 'C:\\Program Files\\Git\\cmd', files: ['git.exe'] },
		...(installed && ticked
			? [
					{ path: 'C:\\Users\\Neha\\AppData\\Local\\Programs\\Python\\Python312', files: ['python.exe'], tag: 'added by the Python installer' },
					{ path: 'C:\\Users\\Neha\\AppData\\Local\\Programs\\Python\\Python312\\Scripts', files: ['pip.exe'], tag: 'added by the Python installer' }
				]
			: []),
		{ path: 'C:\\Users\\Neha\\AppData\\Local\\Microsoft\\WindowsApps', files: aliases ? ['python.exe (shortcut to the Store)', 'winget.exe'] : ['winget.exe'] }
	]);

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
	async function search() {
		const name = cmd.trim().toLowerCase().split(/\s+/)[0];
		if (!name || running) return;
		running = true;
		result = null;
		const exe = name.endsWith('.exe') ? name : name + '.exe';
		for (let i = 0; i < folders.length; i++) {
			pointer = i;
			await sleep(520);
			const hit = folders[i].files.find((f) => f.toLowerCase().startsWith(exe));
			if (hit) {
				if (hit.includes('Store')) {
					result = { kind: 'store', text: 'The shell found a python.exe shortcut in WindowsApps and ran it. It opens the Microsoft Store instead of Python.' };
					progress.markPlay(N, 'store');
				} else {
					result = { kind: 'found', text: `Found ${hit} in ${folders[i].path}. ${name === 'python' ? 'Python 3.12.6 starts.' : 'The program starts.'}` };
					if (name === 'python') progress.markPlay(N, 'found');
				}
				running = false;
				return;
			}
		}
		pointer = folders.length;
		result = { kind: 'none', text: `${name} : The term '${name}' is not recognized as the name of a cmdlet, function, script file, or operable program.` };
		if (name === 'python') progress.markPlay(N, 'none');
		running = false;
	}
	$effect(() => {
		installed;
		ticked;
		aliases;
		pointer = -1;
		result = null;
	});
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<Card.Root>
		<Card.Header>
			<Card.Title>The search, folder by folder</Card.Title>
			<Card.Description>The PATH is an ordered list of folders. When you type a command, the shell looks in each folder in turn and runs the first match it finds.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-5">
			<fieldset class="bg-muted/60 grid gap-2 rounded-lg p-3">
				<legend class="sr-only">Computer settings</legend>
				<label class="flex items-center gap-2.5 text-sm"><input type="checkbox" bind:checked={installed} class="accent-malachite size-4" /> Python is installed</label>
				<label class={cn('flex items-center gap-2.5 text-sm', !installed && 'opacity-50')}><input type="checkbox" bind:checked={ticked} disabled={!installed} class="accent-malachite size-4" /> <span>The installer’s <strong>“Add python.exe to PATH”</strong> box was ticked</span></label>
				<label class="flex items-center gap-2.5 text-sm"><input type="checkbox" bind:checked={aliases} class="accent-malachite size-4" /> <span>Windows <strong>app execution aliases</strong> are switched on (the default)</span></label>
			</fieldset>
			<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); search(); }}>
				<Input bind:value={cmd} aria-label="Command to type" class="max-w-52" />
				<Button type="submit" disabled={running}><Search /> Press Enter</Button>
			</form>
			<ol class="grid gap-2">
				{#each folders as f, i (f.path)}
					<li
						class={cn(
							'bg-card rounded-lg border-[1.5px] p-2.5 transition-colors',
							pointer === i && running && 'border-lapis bg-lapis/10',
							pointer === i && !running && result?.kind === 'found' && 'border-malachite bg-malachite-soft',
							pointer === i && !running && result?.kind === 'store' && 'border-ochre bg-ochre-soft',
							pointer > i && 'opacity-60'
						)}
					>
						<div class="flex items-center gap-2 font-mono text-[0.8rem] break-all"><span class="text-muted-foreground w-4 shrink-0 font-sans text-xs">{i + 1}</span><Folder class="size-4 shrink-0" />{f.path}</div>
						<div class="mt-1 flex flex-wrap gap-1.5 pl-6">
							{#each f.files as x}<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{x}</span>{/each}
							{#if f.tag}<span class="text-malachite text-xs">{f.tag}</span>{/if}
						</div>
					</li>
				{/each}
			</ol>
			{#if result}
				<div
					aria-live="polite"
					class={cn('flex items-start gap-2 rounded-lg border-[1.5px] p-3 text-sm', result.kind === 'found' && 'border-malachite bg-malachite-soft', result.kind === 'store' && 'border-ochre bg-ochre-soft', result.kind === 'none' && 'border-hematite bg-hematite-soft font-mono')}
				>
					{#if result.kind === 'found'}<CircleCheck class="text-malachite mt-0.5 size-4 shrink-0" />{:else if result.kind === 'store'}<ShoppingBag class="text-ochre mt-0.5 size-4 shrink-0" />{:else}<CircleX class="text-hematite mt-0.5 size-4 shrink-0" />{/if}
					<span>{result.text}</span>
				</div>
			{/if}
			<p class="text-muted-foreground text-sm">Order matters: the installer puts Python’s folders ahead of WindowsApps, so ticking the box also beats the Store shortcut. Also try <code>git</code>, <code>notepad</code> and <code>pip</code>.</p>
		</Card.Content>
	</Card.Root>
	<MissionList {chapter} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
