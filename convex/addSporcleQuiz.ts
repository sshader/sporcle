import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'

export const translateAnswers = (
  rawAnswers: string[],
  charMapping: Record<string, string>
) => {
  const reverseMapping: Record<string, string> = {}
  for (const char in charMapping) {
    reverseMapping[charMapping[char]] = char
  }

  const translatedAnswers: Array<Array<string>> = []
  for (const answer of rawAnswers) {
    let translatedAnswer = ''
    for (const char of answer.split('')) {
      if (char in reverseMapping) {
        translatedAnswer += reverseMapping[char]
      } else {
        translatedAnswer += char
      }
    }
    const answers = translatedAnswer.split('/')
    translatedAnswers.push(answers)
  }
  return translatedAnswers
}

export const doesQuizExist = query({
  args: {
    sporcleUrl: v.string(),
  },
  handler: async ({ db }, { sporcleUrl }) => {
    const existingQuiz = await db
      .query('quiz')
      .filter((q) => q.eq(q.field('sporcleUrl'), sporcleUrl))
      .unique()
    return existingQuiz !== null
  },
})

export const internal = internalMutation({
  args: {
    sporcleUrl: v.string(),
    title: v.string(),
    obfuscatedAnswersStr: v.string(),
    charMapStr: v.string(),
  },
  handler: (
    { db },
    { sporcleUrl, title, obfuscatedAnswersStr, charMapStr }
  ) => {
    const charMap = JSON.parse(charMapStr)
    // "foo\\'bar" -> "foo\'bar" because something got double escaped
    const x = obfuscatedAnswersStr.replaceAll('\\', '')
    const obfuscatedAnswers = JSON.parse(x)
    const obfuscatedAnswersSet = new Set<string>()
    for (const a of obfuscatedAnswers) {
      for (const v of a.split('/')) {
        obfuscatedAnswersSet.add(v)
      }
    }
    const answers = translateAnswers(obfuscatedAnswers, charMap)
    db.insert('quiz', {
      answers,
      title,
      sporcleUrl,
      obfuscatedAnswers: Array.from(obfuscatedAnswersSet),
      charMap: JSON.stringify(charMap),
    })
  },
})
