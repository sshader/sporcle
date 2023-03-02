import { mutation, query } from './_generated/server'

const translateAnswers = (
  rawAnswers: string[],
  charMapping: Record<string, string>
) => {
  const reverseMapping: Record<string, string> = {}
  for (const char in charMapping) {
    reverseMapping[charMapping[char]] = char
  }

  const translatedAnswers: Array<Set<string>> = []
  for (const answer of rawAnswers) {
    let translatedAnswer = ''
    for (const char of answer.split('')) {
      if (char in reverseMapping) {
        translatedAnswer += reverseMapping[char]
      } else {
        translatedAnswer += char
      }
    }
    const answers = new Set(translatedAnswer.split('/'))
    translatedAnswers.push(answers)
  }
  return translatedAnswers
}

export const doesQuizExist = query(async ({ db }, sporcleUrl: string) => {
  const existingQuiz = await db
    .query('quiz')
    .filter((q) => q.eq(q.field('sporcleUrl'), sporcleUrl))
    .unique()
  return existingQuiz !== null
})

export default mutation(
  (
    { db },
    sporcleUrl: string,
    title: string,
    obfustacedAnswersStr: string,
    charMapStr: string
  ) => {
    const charMap = JSON.parse(charMapStr)
    // "foo\\'bar" -> "foo\'bar" because something got double escaped
    const x = obfustacedAnswersStr.replaceAll('\\', '')
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
      obfuscatedAnswers: obfuscatedAnswersSet,
      charMap: JSON.stringify(charMap),
    })
  }
)
