export function deobfuscate(
  text: string,
  reverseMapping: Record<string, string>
): string {
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

export function buildReverseMapping(
  charMapping: Record<string, string>
): Record<string, string> {
  const reverseMapping: Record<string, string> = {}
  for (const char in charMapping) {
    reverseMapping[charMapping[char]] = char
  }
  return reverseMapping
}

// Answers are an array of arrays: each inner array contains the accepted
// obfuscated answer variants for one question. Each variant string may also
// contain '/' separating sub-variants.
export function translateAnswers(
  rawAnswers: string[][],
  charMapping: Record<string, string>
): string[][] {
  const reverseMapping = buildReverseMapping(charMapping)

  const translatedAnswers: Array<Array<string>> = []
  for (const answerVariants of rawAnswers) {
    const allVariants: string[] = []
    for (const variant of answerVariants) {
      const translated = deobfuscate(variant, reverseMapping)
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

// Parse the raw extracted strings into typed data
export function parseExtractedData(
  allAnswersStr: string,
  charMapStr: string
): { obfuscatedAnswers: string[][]; charMap: Record<string, string> } {
  const charMap: Record<string, string> = JSON.parse(charMapStr)

  const cleaned = allAnswersStr.replaceAll('\\', '')
  const parsed = JSON.parse(cleaned)

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Answers is not a non-empty array')
  }

  // Normalize: ensure each answer is an array of variants
  const obfuscatedAnswers: string[][] = parsed.map((a: unknown) =>
    Array.isArray(a) ? a : [String(a)]
  )

  return { obfuscatedAnswers, charMap }
}
