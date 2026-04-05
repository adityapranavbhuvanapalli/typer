export const words = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
]

export const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', '|', ';', ':', ',', '.', '/', '<', '>', '?']

export function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)]
}

export function generateEasy(wordCount = 30) {
  // strictly lower case, no punctuation
  return Array.from({ length: wordCount }, () => getRandomWord()).join(' ')
}

export function generateMedium(wordCount = 40) {
  // All cases, regular punctuation (comma, fullstop), and numbers
  let sentence = []
  for (let i = 0; i < wordCount; i++) {
    let word = ""
    
    // 10% chance to generate a random number instead of a word
    if (Math.random() > 0.9) {
      word = Math.floor(Math.random() * 1000).toString()
    } else {
      word = getRandomWord()
      // 20% chance to capitalize
      if (Math.random() > 0.8) word = word.charAt(0).toUpperCase() + word.slice(1)
    }

    // 10% chance to add comma
    if (Math.random() > 0.9 && i < wordCount - 1) word += ','
    sentence.push(word)
  }
  return sentence.join(' ') + '.'
}

export function generateHard(wordCount = 40) {
  // random words, all types of special characters, and numbers
  let sentence = []
  for (let i = 0; i < wordCount; i++) {
    let word = ""
    
    // 15% chance to generate a random number
    if (Math.random() > 0.85) {
      word = Math.floor(Math.random() * 10000).toString()
    } else {
      word = getRandomWord()
      if (Math.random() > 0.5) word = word.charAt(0).toUpperCase() + word.slice(1)
      
      // inject random special char
      if (Math.random() > 0.7) {
        word += specialChars[Math.floor(Math.random() * specialChars.length)]
      }
    }
    sentence.push(word)
  }
  return sentence.join(' ')
}

export function generateSuperHard(wordCount = 40) {
  // mix random english words with pure random characters and numbers
  let sentence = []
  for (let i = 0; i < wordCount; i++) {
    const roll = Math.random()
    
    if (roll > 0.8) {
      // 20% chance for a random number
      sentence.push(Math.floor(Math.random() * 100000).toString())
    } else if (roll > 0.6) {
      // pure random letters
      const randomLen = Math.floor(Math.random() * 5) + 3
      let randomWord = ''
      for(let k=0; k<randomLen; k++) {
        randomWord += String.fromCharCode(97 + Math.floor(Math.random() * 26))
      }
      sentence.push(randomWord)
    } else {
      let word = getRandomWord()
      if (Math.random() > 0.5) word = word.charAt(0).toUpperCase() + word.slice(1)
      if (Math.random() > 0.7) {
        word += specialChars[Math.floor(Math.random() * specialChars.length)]
      }
      sentence.push(word)
    }
  }
  return sentence.join(' ')
}
