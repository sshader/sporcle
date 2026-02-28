'use node'
import { api, internal } from '../_generated/api'
import { action } from '../_generated/server'
import { ConvexError, v } from 'convex/values'
import { extractFromHtml } from '../extractFromHtml'

export default action({
  args: { sporcleUrl: v.string() },
  handler: async ({ runQuery, runMutation }, { sporcleUrl }) => {
    if (!sporcleUrl.startsWith('https://www.sporcle.com/')) {
      throw new ConvexError("Sporcle link didn't start with https://www.sporcle.com/")
    }
    const exists = await runQuery(api.addSporcleQuiz.doesQuizExist, {
      sporcleUrl,
    })
    if (exists) {
      return
    }
    const response = await fetch(sporcleUrl, {
      // Sporcle's Cloudflare configuration seems to block the request if there's
      // not a user agent
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    })
    if (!response.ok) {
      console.error(`Failed to fetch Sporcle quiz: ${response.status} ${response.statusText}`)
      throw new ConvexError(`Failed to fetch quiz (HTTP ${response.status}). The quiz may not exist or Sporcle may be blocking the request.`)
    }
    const text = await response.text()

    let extracted
    try {
      extracted = extractFromHtml(text)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.error(`Failed to extract quiz data from ${sporcleUrl}: ${message}`)
      throw new ConvexError(`Failed to parse quiz. Make sure this is a classic Sporcle quiz (just typing).`)
    }

    console.log(`Importing quiz "${extracted.title}" from ${sporcleUrl}`)

    await runMutation(internal.addSporcleQuiz.internal, {
      sporcleUrl,
      title: extracted.title,
      obfuscatedAnswersStr: extracted.allAnswersStr,
      charMapStr: extracted.charMapStr,
    })
  },
})
