import ifData from '../data/if.json'
import utils from './utils.js'

const resetSpellBook = (spellBook) => {
    //console.log('resetSpellBook called')
    spellBook = utils.deepClone(ifData.classes.magicUser.startingSpellBook)
}

const generateSpellBook = (selectedLevel, selectedIntelligence, spellBook) => {
    
    // Reset the spellbook
    resetSpellBook(spellBook)
    console.log('generateSpellBook, selectedIntelligence:', selectedIntelligence)

    // Go through each class level up to the "maxSpellLevel", which is the highgest memorizable spell level.
    for (let i = 0; i < selectedLevel.maxSpellLevel; i++) {

        //console.log('Generating spells for level:', i+1)
        
        let currentSpells = spellBook[i].spells
        let spellsAvailable = utils.deepClone(ifData.classes.magicUser.spells[i])

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
            if (utils.roll1d100() <= selectedIntelligence.spellChance) {
                currentSpells.push(newSpell)
            }
            // Remove this item regardless of spellChance, as per IF p.134
            spellsAvailable = spellsAvailable.filter(item => item !== newSpell)
            moreSpells = true
            continue
        }
    }

}

const getUniqueSpell = (currentSpells, spellsAvailable) => {
    let keepGoing = true
    while (keepGoing) {
        let newSpell = utils.randomArrayItem(spellsAvailable)
        if (!currentSpells.includes(newSpell)) {
            keepGoing = false
            return newSpell
        }
    }
}

// TODO Move to utils module?



export default {
    resetSpellBook,
    generateSpellBook
}