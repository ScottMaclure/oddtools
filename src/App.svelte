<script>
	export let appData
	export let ifData

	let selectedIntelligence = {}
	let spellBookOutput = []

	function generateSpellBook() {
		console.log('generateSpellBook, selectedIntelligence:', selectedIntelligence)
	}

</script>

<div class="container">

	<div class="item">

		<header>
			<h1>{appData.title}</h1>
			<p>Misc tools for playing OD&D by way of Iron Falcon.</p>
		</header>

		<main>
			<h2>Extended Spell List</h2>
			
			Intelligence:
			<select bind:value={selectedIntelligence}>
				<option>--- Please select ---</option>
				{#each ifData.abilities.intelligence as option}
					{#if option.levelMin === option.levelMax}
						<option value={option}>{option.levelMax}</option>
					{:else}
						<option value={option}>{option.levelMin}-{option.levelMax}</option>
					{/if}
				{/each}
			</select>

			{#if selectedIntelligence.spellChance > 0}
			<div class="selectedIntelligence">
				Chance={selectedIntelligence.spellChance}%, 
				Min={selectedIntelligence.minNum}, 
				Max={selectedIntelligence.maxNum}, 
				MaxLevel={selectedIntelligence.maxLevel}.
			</div>

			<button on:click={generateSpellBook}>Generate Spellbook</button>

			<pre id="spellBook">{spellBookOutput}</pre>
			{/if}

		</main>

		<footer>
			<small>&copy; 2020 Scott Maclure. MIT License. Version {appData.version}</small>
		</footer>

	</div>

</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.container > .item {
		max-width: 768px;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	main {
		text-align: left;
	}

	@media (min-width: 640px) {
		.container {
			max-width: none;
		}
	}
</style>