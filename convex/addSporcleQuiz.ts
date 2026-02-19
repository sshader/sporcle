import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'

const deobfuscate = (
  text: string,
  reverseMapping: Record<string, string>
): string => {
  let result = ''
  for (const char of text.split('')) {
    if (char in reverseMapping) {
      result += reverseMapping[char]
    } else {
      result += char
    }
  }
  return result
}

// Answers are an array of arrays: each inner array contains the accepted
// obfuscated answer variants for one question. Each variant string may also
// contain '/' separating sub-variants.
const translateAnswers = (
  rawAnswers: string[][],
  charMapping: Record<string, string>
) => {
  const reverseMapping: Record<string, string> = {}
  for (const char in charMapping) {
    reverseMapping[charMapping[char]] = char
  }

  const translatedAnswers: Array<Array<string>> = []
  for (const answerVariants of rawAnswers) {
    const allVariants: string[] = []
    for (const variant of answerVariants) {
      const translated = deobfuscate(variant, reverseMapping)
      // Each variant string may contain '/' for sub-variants
      for (const subVariant of translated.split('/')) {
        if (subVariant && !allVariants.includes(subVariant)) {
          allVariants.push(subVariant)
        }
      }
    }
    translatedAnswers.push(allVariants)
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
    let charMap: Record<string, string>
    try {
      charMap = JSON.parse(charMapStr)
    } catch (e) {
      console.error("Failed to parse charMap JSON:", charMapStr.slice(0, 200))
      throw new Error("Failed to parse character mapping.")
    }

    let obfuscatedAnswers: string[][]
    try {
      const cleaned = obfuscatedAnswersStr.replaceAll('\\', '')
      obfuscatedAnswers = JSON.parse(cleaned)
    } catch (e) {
      console.error("Failed to parse obfuscated answers JSON:", obfuscatedAnswersStr.slice(0, 200))
      throw new Error("Failed to parse obfuscated answers.")
    }

    if (!Array.isArray(obfuscatedAnswers) || obfuscatedAnswers.length === 0) {
      console.error("Obfuscated answers is not a non-empty array:", typeof obfuscatedAnswers)
      throw new Error("Quiz has no answers.")
    }

    // Collect all unique obfuscated answer strings for storage
    const obfuscatedAnswersSet = new Set<string>()
    for (const answerVariants of obfuscatedAnswers) {
      if (Array.isArray(answerVariants)) {
        for (const v of answerVariants) {
          obfuscatedAnswersSet.add(v)
        }
      } else {
        // Handle legacy flat string format (variant1/variant2)
        for (const v of String(answerVariants).split('/')) {
          obfuscatedAnswersSet.add(v)
        }
      }
    }

    // Normalize: ensure each answer is an array of variants
    const normalizedAnswers: string[][] = obfuscatedAnswers.map((a) =>
      Array.isArray(a) ? a : [String(a)]
    )

    const answers = translateAnswers(normalizedAnswers, charMap)
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
