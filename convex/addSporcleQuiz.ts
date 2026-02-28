import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { parseExtractedData, translateAnswers } from './parseSporcle'

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
    let data
    try {
      data = parseExtractedData(obfuscatedAnswersStr, charMapStr)
    } catch (e) {
      console.error('Failed to parse extracted quiz data:', e)
      throw new Error('Failed to parse quiz data.')
    }

    const { obfuscatedAnswers, charMap } = data

    // Collect all unique obfuscated answer strings for storage
    const obfuscatedAnswersSet = new Set<string>()
    for (const answerVariants of obfuscatedAnswers) {
      for (const v of answerVariants) {
        obfuscatedAnswersSet.add(v)
      }
    }

    const answers = translateAnswers(obfuscatedAnswers, charMap)
    console.log(`Translated ${answers.length} answers for quiz "${title}"`)

    db.insert('quiz', {
      answers,
      title,
      sporcleUrl,
      obfuscatedAnswers: Array.from(obfuscatedAnswersSet),
      charMap: JSON.stringify(charMap),
    })
  },
})
