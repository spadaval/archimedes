<script lang="ts">
    import { marked } from 'marked';
	import type { Query } from '../types';
	import { generateThoughtProcess, getFinalAnswer, regenerateThoughtProcess } from '$lib/generate';
	import { RefreshCcw, Copy, Trash } from 'lucide-svelte';
	let { query }: {query: Query} = $props();
</script>

<div class="border-2 shadow-sm border-zinc-400 rounded-lg p-2">

    <div class="text-sm uppercase text-zinc-400">Thoughts</div>
    {#if query.thoughts.length === 0}
        <div class="text-zinc-400">Thinking...</div>
    {:else}
        {#each query.thoughts as thought, idx}
            <p class="prose prose-stone prose-invert">{@html marked(thought)}</p>
            {#if idx < query.thoughts.length - 1}
                <br />
            {/if}
        {/each}
    {/if}

    {#if !query.response}
        <div class="mt-4 flex w-full flex-row items-center justify-end gap-5 stroke-zinc-400 text-center text-zinc-400">
            <button onclick={() => generateThoughtProcess(query)}>Refine</button>
            <button onclick={() => getFinalAnswer(query)}>Finalize</button>
            <button onclick={() => regenerateThoughtProcess(query)}>
                <RefreshCcw class="h-4 w-4" />
            </button>
            <button onclick={() => navigator.clipboard.writeText(query.thoughts[query.thoughts.length - 1])}>
                <Copy class="h-4 w-4" />
            </button>
        </div>
    {:else}
        <div class="mt-4 rounded-3xl border-t-2 border-zinc-700 p-4 text-white">{query.response}</div>
        <div class="mt-4 flex w-full flex-row items-center justify-end gap-5 stroke-zinc-400 text-center text-zinc-400">
            <button onclick={() => (query.response = null)}>
                <Trash class="h-4 w-4" />
            </button>
            <button onclick={() => regenerateThoughtProcess(query)}>
                <RefreshCcw class="h-4 w-4" />
            </button>
            <Copy class="h-4 w-4" onclick={() => navigator.clipboard.writeText(query.response!)} />
        </div>
    {/if}
</div>


<style>
    * {
	overflow-anchor: none !important;
	scroll-snap-stop: normal !important;
	overscroll-behavior: unset !important;
	scroll-behavior: unset !important;
}

</style>