'use node'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

export function extractFromHtml(html: string): {
  title: string
  answersCode: string
  charMapStr: string
  allAnswersStr: string
} {
  const titleMatch = html.match(/<title>(.*)<\/title>/)
  if (!titleMatch) {
    throw new Error('Could not find <title> tag in page HTML')
  }
  const title = titleMatch[1]

  const lines = html.split('\n')
  const answersCode = lines.find((l) => l.includes('var asta ='))
  if (answersCode === undefined) {
    throw new Error("Could not find 'var asta =' in page HTML")
  }

  const parsed = parse(answersCode, { sourceType: 'module' })

  let charMapStr = ''
  let allAnswersStr = ''

  traverse(parsed, {
    VariableDeclaration: function (path) {
      for (const n of path.node.declarations) {
        if (n.id.type === 'Identifier' && n.id.name === 'asta') {
          charMapStr = answersCode.slice(n.init!.start!, n.init!.end!)
        } else if (n.id.type === 'Identifier' && n.id.name === 'answers') {
          allAnswersStr = answersCode.slice(n.init!.start!, n.init!.end!)
        }
      }
    },
  })

  if (!charMapStr) {
    throw new Error(
      "Could not extract 'var asta' character mapping via AST parsing"
    )
  }
  if (!allAnswersStr) {
    throw new Error("Could not extract 'var answers' array via AST parsing")
  }

  return { title, answersCode, charMapStr, allAnswersStr }
}
