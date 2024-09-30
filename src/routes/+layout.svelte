<script lang="ts">
	import '../app.css';
</script>

<nav class="fixed left-0 top-0 flex h-full w-64 flex-col bg-stone-950 p-6 text-gray-300">
	<h2 class="mb-4 text-sm font-semibold uppercase text-white">Conversations</h2>
	<ul class="flex-1">
		<li class="cursor-pointer py-2 hover:text-white">Topic 1</li>
		<li class="cursor-pointer py-2 hover:text-white">Topic 2</li>
		<li class="cursor-pointer py-2 hover:text-white">Topic 3</li>
		<li class="cursor-pointer py-2 hover:text-white">Topic 4</li>
		<li class="cursor-pointer py-2 hover:text-white">Topic 5</li>
	</ul>
	<div class="mt-auto">
		<button class="flex h-12 w-full items-center justify-center rounded-md bg-gray-800 text-gray-300 hover:bg-gray-600"> ⚙️ Settings </button>
	</div>
</nav>

<div class="absolute inset-0 left-64 h-screen bg-zinc-900 p-4">
	<div class="relative h-full w-full">
		<slot />
	</div>
</div>
