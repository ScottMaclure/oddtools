<script>
	import utils from '../modules/utils.js'
	import spellBook from '../modules/spellBook.js'

	export let appData
	export let ifData

	let selectedLevel = ifData.classes.magicUser.levels[0]
	let selectedIntelligence = ifData.abilities.intelligence[4]
	let userSpellBook = utils.deepClone(ifData.classes.magicUser.startingSpellBook)

</script>

<div class="container">

	<div class="item">

		<header>
			<h1>{appData.title}</h1>
			<p>Misc tools for playing OD&D by way of Iron Falcon.</p>
		</header>

		<main>
			<h2>Extended Spell List</h2>

			<fieldset>
				<legend>Configure</legend>
				<div>
					Character Level:
					<select bind:value={selectedLevel} on:change={spellBook.resetSpellBook(userSpellBook)}>
						{#each ifData.classes.magicUser.levels as option}
							<option value={option}>{option.level}</option>
						{/each}
					</select>
				</div>
				
				<div>
					Intelligence:
					<select bind:value={selectedIntelligence}>
						{#each ifData.abilities.intelligence as option}
							{#if option.levelMin === option.levelMax}
								<option value={option}>{option.levelMax}</option>
							{:else}
								<option value={option}>{option.levelMin}-{option.levelMax}</option>
							{/if}
						{/each}
					</select>
					
					<div><small>
						Level={selectedLevel.level}, 
						Experience={selectedLevel.experience}, 
						Chance={selectedIntelligence.spellChance}%, 
						Min={selectedIntelligence.minNum}, 
						Max={selectedIntelligence.maxNum}, 
						MaxLevel={selectedIntelligence.maxLevel}.
					</small></div>
					
				</div>
			</fieldset>

			<button on:click={() => userSpellBook = spellBook.generateSpellBook(selectedLevel, selectedIntelligence, userSpellBook)}>Generate Spellbook</button>

			<fieldset>
				<legend>Level {selectedLevel.level} Magic-User's Spellbook</legend>
				{#each userSpellBook as spellBookLevel}
					{#if spellBookLevel.spells.length > 0}
					<div>Level {spellBookLevel.level}: {spellBookLevel.spells.join(', ')}</div>
					{/if}
				{/each}
			</fieldset>

		</main>

		<footer>
			<small>Text used is &copy; 2014-2016 Chris Gonnerman. For code, see the <a href="{appData.ghRepo}">github repo</a>. Last deployed {appData.version}.</small>
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
		width: 100%;
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

	footer {
		margin-top: 1rem;
	}

	@media (min-width: 640px) {
		.container {
			max-width: none;
		}
	}
</style>