'use node';
import { api } from "../_generated/api";
import { action } from '../_generated/server';
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { v } from 'convex/values'

export default action({
  args: { sporcleUrl: v.string() },
  handler: async ({ runQuery, runMutation }, { sporcleUrl }) => {
    if (!sporcleUrl.startsWith('https://www.sporcle.com/')) {
      throw new Error("Sporcle link didn't start with https://www.sporcle.com/")
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
      headers: { 'User-Agent': 'curl/7.54.1' },
    })
    const text = await response.text()
    const gameIdMatch = text.match(/Sporcle\.gameData\.gameID = ([0-9]+);/)
    const sporcleGameId = gameIdMatch![1]
    const quizTitle = text.match(/<title>(.*)<\/title>/)![1]
    const x = await fetch(
      `https://www.sporcle.com/games/jsanswers.php?g=${sporcleGameId}`,
      {
        headers: { 'User-Agent': 'curl/7.54.1' },
      }
    )
    const answersCode = await x.text()

    const parsed = parse(answersCode, {
      sourceType: 'module',
    })

    let charMap = '{}'
    let allAnswers = '[]'

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

    await runMutation(api.addSporcleQuiz.internal, {
      sporcleUrl,
      title: quizTitle,
      obfuscatedAnswersStr: allAnswers,
      charMapStr: charMap,
    })
  },
})
