'use node'
import { api, internal } from '../_generated/api'
import { action } from '../_generated/server'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { ConvexError, v } from 'convex/values'

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

    const titleMatch = text.match(/<title>(.*)<\/title>/)
    if (!titleMatch) {
      console.error("Could not find <title> tag in Sporcle page HTML")
      throw new ConvexError("Could not find quiz title. The page may not be a valid Sporcle quiz.")
    }
    const quizTitle = titleMatch[1]

    const lines = text.split("\n");
    const answersCode = lines.find(l => l.includes("var asta ="))
    if (answersCode === undefined) {
      console.error("Could not find 'var asta =' in Sporcle page HTML. The page may use a different format or not be a classic quiz.")
      throw new ConvexError("Could not find quiz answers. Make sure this is a classic Sporcle quiz (just typing).")
    }

    let parsed
    try {
      parsed = parse(answersCode, {
        sourceType: 'module',
      })
    } catch (e) {
      console.error("Failed to parse answers JavaScript:", e)
      throw new ConvexError("Failed to parse quiz data. The quiz format may have changed.")
    }

    let charMap = ''
    let allAnswers = ''

    traverse(parsed, {
      VariableDeclaration: function (path) {
        for (const n of path.node.declarations)
          if (n.id.type === 'Identifier' && n.id.name === 'asta') {
            charMap = answersCode.slice(n.init!.start!, n.init!.end!)
          } else if (n.id.type === 'Identifier' && n.id.name === 'answers') {
            allAnswers = answersCode.slice(n.init!.start!, n.init!.end!)
          }
      },
    })

    if (!charMap) {
      console.error("Found 'var asta =' line but could not extract the character mapping object via AST parsing")
      throw new ConvexError("Failed to extract character mapping from quiz data.")
    }
    if (!allAnswers) {
      console.error("Found answers line but could not extract 'var answers' array via AST parsing")
      throw new ConvexError("Failed to extract answers from quiz data.")
    }

    console.log(`Importing quiz "${quizTitle}" from ${sporcleUrl}`)

    await runMutation(internal.addSporcleQuiz.internal, {
      sporcleUrl,
      title: quizTitle,
      obfuscatedAnswersStr: allAnswers,
      charMapStr: charMap,
    })
  },
})
