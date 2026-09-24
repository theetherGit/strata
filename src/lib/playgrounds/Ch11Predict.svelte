<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import MissionList from '$lib/components/MissionList.svelte';
	import PredictCards from '$lib/components/PredictCards.svelte';
	import { CHAPTERS } from '$lib/data/chapters';

	const N = 11;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const cards = [
		{ code: 'print("ab" * 3)', answer: 'ababab', e: 'Multiplying text repeats it. Handy for drawing a line of dashes: "-" * 20.' },
		{ code: 'print(7 // 2)', answer: '3', e: '// is whole-number division; it drops the remainder. Plain 7 / 2 gives 3.5.' },
		{ code: 'rocks = ["basalt", "granite", "shale"]\nprint(rocks[1])', answer: 'granite', e: 'Python counts list positions from 0, so [1] is the second item.' },
		{ code: 'total = 0\nfor n in [1, 2, 3]:\n    total = total + n\nprint(total)', answer: '6', e: 'The indented line runs once for each value: 0+1, then +2, then +3. print is not indented, so it runs once at the end.' },
		{ code: 'silica = 63\nif silica < 63:\n    print("intermediate")\nelse:\n    print("felsic")', answer: 'felsic', e: '63 is not less than 63, so the else branch runs. Boundaries are where most classification bugs hide.' }
	];
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 content-start gap-3">
		<p class="text-muted-foreground text-sm">Write your prediction before revealing. Afterwards, type the code into <code>python</code> on your own computer to see it for yourself.</p>
		<PredictCards {cards} onreveal={(i) => progress.markPlay(N, `c${i + 1}`)} />
	</div>
	<MissionList {chapter} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
