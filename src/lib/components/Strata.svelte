<script lang="ts">
	import { CHAPTERS } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import { cn } from '$lib/utils';

	let { current = 0 }: { current?: number } = $props();
	const layers = [...CHAPTERS].reverse();
</script>

<nav aria-label="Chapters" class="w-full">
	<div class="mb-2 flex items-baseline justify-between">
		<h2 class="font-serif text-lg font-semibold">Your column</h2>
		<span class="text-muted-foreground text-sm">{progress.deposited} of {CHAPTERS.length} deposited</span>
	</div>
	<ol class="strata border-foreground flex flex-col border-l-2 max-lg:flex-row-reverse max-lg:justify-end max-lg:overflow-x-auto max-lg:border-b-2 max-lg:border-l-0 max-lg:pb-0">
		{#each layers as c (c.n)}
			{@const f = progress.fraction(c)}
			<li class="max-lg:shrink-0">
				<a
					href={`#/ch/${c.n}`}
					aria-current={c.n === current ? 'page' : undefined}
					aria-label={`Chapter ${c.n}: ${c.title}, ${Math.round(f * 100)}% done`}
					class="group flex min-h-[37px] items-stretch no-underline! max-lg:min-w-[42px] max-lg:flex-col-reverse max-lg:items-center"
				>
					<span
						aria-hidden="true"
						class={cn(
							'rock lith-' + c.lith,
							'border-foreground -mt-[1.5px] shrink-0 border-[1.5px] border-l-0 transition-[width,height] duration-500 ease-out',
							'max-lg:mt-0 max-lg:-ml-[1.5px] max-lg:w-8! max-lg:border-b-0 max-lg:border-l-[1.5px]',
							f === 1 ? 'is-full' : f > 0 ? 'is-part' : 'bg-card',
							c.n === current && 'ring-malachite ring-2 ring-inset'
						)}
						style={`width:${56 + f * 70}px; --h:${28 + f * 52}px`}
					></span>
					<span class="text-muted-foreground group-hover:text-foreground flex items-center gap-2 pl-3 text-[0.86rem] leading-tight group-aria-[current=page]:text-foreground max-lg:pb-1 max-lg:pl-0">
						<b class={cn('text-foreground min-w-5 font-semibold', c.n === current && 'text-malachite')}>{c.n}</b>
						<span class="max-lg:hidden">{c.short}</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>
	<div class="text-muted-foreground mt-2 flex justify-between text-xs max-lg:hidden">
		<span>Youngest: capstone</span><span>Oldest: the computer</span>
	</div>
	<div class="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
		<span class="flex items-center gap-1.5"><i class="bg-card border-foreground inline-block h-3 w-6 border-[1.5px]"></i>Not started</span>
		<span class="flex items-center gap-1.5"><i class="is-part lith-sand border-foreground inline-block h-3 w-6 border-[1.5px]"></i>In progress</span>
		<span class="flex items-center gap-1.5"><i class="is-full lith-sand border-foreground inline-block h-3 w-6 border-[1.5px]"></i>Deposited</span>
	</div>
</nav>

<style>
	.rock {
		min-height: 37px;
	}
	@media (max-width: 1023px) {
		.rock {
			min-height: 0;
			height: var(--h);
		}
	}
	:global(.is-part) {
		background-color: var(--ochre);
	}
	:global(.is-full) {
		background-color: var(--malachite);
	}
	:global(.is-part.lith-shale),
	:global(.is-full.lith-shale) {
		background-image: repeating-linear-gradient(0deg, transparent 0 5px, rgb(0 0 0 / 0.28) 5px 6px);
	}
	:global(.is-part.lith-sand),
	:global(.is-full.lith-sand) {
		background-image: radial-gradient(rgb(0 0 0 / 0.32) 1px, transparent 1.4px);
		background-size: 6px 6px;
	}
	:global(.is-part.lith-lime),
	:global(.is-full.lith-lime) {
		background-image: repeating-linear-gradient(0deg, transparent 0 8px, rgb(0 0 0 / 0.3) 8px 9.5px), repeating-linear-gradient(90deg, transparent 0 16px, rgb(0 0 0 / 0.3) 16px 17.5px);
	}
	:global(.is-part.lith-cong),
	:global(.is-full.lith-cong) {
		background-image: radial-gradient(circle, transparent 3px, rgb(0 0 0 / 0.3) 3.5px, transparent 4.5px);
		background-size: 13px 11px;
	}
	:global(.is-part.lith-ign),
	:global(.is-full.lith-ign) {
		background-image: repeating-linear-gradient(45deg, transparent 0 7px, rgb(0 0 0 / 0.28) 7px 8.5px), repeating-linear-gradient(-45deg, transparent 0 7px, rgb(0 0 0 / 0.28) 7px 8.5px);
	}
</style>
