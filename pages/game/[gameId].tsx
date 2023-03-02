import { Id } from '../../convex/_generated/dataModel'
import { useQuery } from '../../convex/_generated/react'

import { Document } from '../../convex/_generated/dataModel'
import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/router'
import { useSessionMutation } from '../../hooks/sessionClient'

type GameInfo = {
  game: Document<'game'>
  obfuscatedAnswers: Set<string>
  charMap: Record<string, string>
  sessionsMap: Map<string, Document<'sessions'>>
}

const Players = ({ players }: { players: Document<'sessions'>[] }) => {
  return (
    <div style={{ display: 'flex' }}>
      {players.map((p) => {
        return (
          <div
            style={{
              display: 'flex',
              border: 'black solid 1px',
              padding: 10,
              alignItems: 'center',
            }}
          >
            {p.name}{' '}
            <div
              style={{
                display: 'inline',
                backgroundColor: p.color,
                width: '1em',
                height: '1em',
              }}
            ></div>
          </div>
        )
      })}
    </div>
  )
}

const GameBoundary = () => {
  const router = useRouter()
  const gameIdStr: string = router.query.gameId! as string
  const gameId = new Id('game', gameIdStr)
  const gameInfo = useQuery('game:getGame', gameId)
  if (gameInfo === undefined) {
    return <div>Loading</div>
  }
  const parsedGameInfo: GameInfo = {
    ...gameInfo,
    charMap: JSON.parse(gameInfo.charMap),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Players players={Array.from(parsedGameInfo.sessionsMap.values())} />
      <Game gameInfo={parsedGameInfo}></Game>
    </div>
  )
}

const Game = ({ gameInfo }: { gameInfo: GameInfo }) => {
  const [answerText, setAnswerText] = useState('')
  const submitAnswer = useSessionMutation('game:submitAnswer')
  const game = gameInfo.game

  const isPossibleAnswer = (answer: string) => {
    let translated = ''
    for (const c of answer.split('')) {
      translated += gameInfo.charMap[c] ?? c
    }
    return gameInfo.obfuscatedAnswers.has(translated)
  }

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    setAnswerText(text)
    if (isPossibleAnswer(text)) {
      const wasCorrect = await submitAnswer(game._id, text)
      if (wasCorrect) {
        setAnswerText('')
      }
    }
  }
  const answerBoxes = game.answers.map((value, index) => {
    let content = null
    if (value !== null) {
      const answer = value.answer
      const answeredBy = gameInfo.sessionsMap.get(value.answeredBy.id)
      const color = answeredBy?.color
      content = (
        <div
          data-tooltip={answeredBy?.name}
          style={{ border: `${color} solid 5px` }}
        >
          {answer}
        </div>
      )
    }
    return (
      <div
        key={index.toString()}
        style={{ height: '2em', border: 'black solid 1px', minWidth: 100 }}
      >
        {content}
      </div>
    )
  })
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'column',
          height: '75vh',
        }}
      >
        {answerBoxes}
      </div>
      <input
        value={answerText}
        onChange={handleChange}
        placeholder="Type your guess…"
      />
    </div>
  )
}

export default GameBoundary
