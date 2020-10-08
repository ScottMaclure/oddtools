<script>
	export let appData
	export let ifData

	let selectedLevel = ifData.classes.magicUser.levels[0]
	let selectedIntelligence = ifData.abilities.intelligence[4]
	let spellBook = deepClone(ifData.classes.magicUser.startingSpellBook)

	function resetSpellBook() {
		//console.log('resetSpellBook called')
		spellBook = deepClone(ifData.classes.magicUser.startingSpellBook)
	}
	
	function generateSpellBook() {
		
		// Reset the spellbook
		resetSpellBook()
		//console.log('generateSpellBook, selectedIntelligence:', selectedIntelligence)

		// Go through each class level up to the "maxSpellLevel", which is the highgest memorizable spell level.
		for (let i = 0; i < selectedLevel.maxSpellLevel; i++) {

			//console.log('Generating spells for level:', i+1)
			
			let currentSpells = spellBook[i].spells
			let spellsAvailable = deepClone(ifData.classes.magicUser.spells[i])

			if (i == 0) {
				// FIXME Read Magic is already in the list... so filter it out for generation.
				spellsAvailable = spellsAvailable.filter(item => item !== "Read Magic")
			}

			//console.log('currentSpells:', currentSpells)
			//console.log('spellsAvailable:', spellsAvailable)

			let moreSpells = true
			while (moreSpells) {
				// 0) Did we run out of spellsAvailable for this level?
				if (spellsAvailable.length === 0) {
					moreSpells = false
					continue
				}
				
				// 1) Too many spells already?
				if (currentSpells.length >= selectedIntelligence.maxNum) {
					moreSpells = false
					continue
				}
				
				// 2) Too few spells? Add a new one immediately.
				if (currentSpells.length < selectedIntelligence.minNum) {
					let newSpell = getUniqueSpell(currentSpells, spellsAvailable)
					currentSpells.push(newSpell)
					// Remove this spell from the list
					spellsAvailable = spellsAvailable.filter(item => item !== newSpell)
					moreSpells = true
					continue
				}
				
				// 3) Inbetween min and max? Roll to add another spell
				// TODO Confirm this logic with IF - random or sequential?
				// i.e. "stopping when all have been checked or the Max # number has been reached"
				let newSpell = getUniqueSpell(currentSpells, spellsAvailable)
				if (roll1d100() <= selectedIntelligence.spellChance) {
					currentSpells.push(newSpell)
				}
				// Remove this item regardless of spellChance, as per IF p.134
				spellsAvailable = spellsAvailable.filter(item => item !== newSpell)
				moreSpells = true
				continue
			}
		}

	}

	function getUniqueSpell(currentSpells, spellsAvailable) {
		let keepGoing = true
		while (keepGoing) {
			let newSpell = randomArrayItem(spellsAvailable)
			if (!currentSpells.includes(newSpell)) {
				keepGoing = false
				return newSpell
			}
		}
	}

	function randomArrayItem(arr) {
		const idx = Math.floor(Math.random() * arr.length)
		return arr[idx]
	}

	function roll1d100() {
		return randomInteger(1, 100)
	}

	function randomInteger(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function deepClone(obj) {
		return JSON.parse(JSON.stringify(obj))
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

			<fieldset>
				<legend>Configure</legend>
				<div>
					Character Level:
					<select bind:value={selectedLevel} on:change={resetSpellBook}>
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

			<button on:click={generateSpellBook}>Generate Spellbook</button>

			<fieldset id="spellBook">
				<legend>Level {selectedLevel.level} Magic-User's Spellbook</legend>
				{#each spellBook as spellBookLevel}
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