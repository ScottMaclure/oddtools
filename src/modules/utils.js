const randomArrayItem = (arr) => {
    const idx = Math.floor(Math.random() * arr.length)
    return arr[idx]
}

const roll1d100 = () => randomInteger(1, 100)

const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

export default {
    deepClone,
    randomArrayItem,
    roll1d100
}