import { Id } from '../../convex/_generated/dataModel'
import { useQuery, useMutation } from '../../convex/_generated/react'

import { Doc } from '../../convex/_generated/dataModel'
import { ChangeEvent, createRef, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useSessionMutation, SessionContext } from '../../hooks/sessionClient'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

type GameInfo = {
  game: Doc<'game'>
  obfuscatedAnswers: Set<string>
  charMap: Record<string, string>
  sessionsMap: Map<string, { session: Doc<'sessions'>; score: number }>
}

const Players = ({
  players,
  total,
}: {
  players: { session: Doc<'sessions'>; score: number }[]
  total: number
}) => {
  const sessionId = useContext(SessionContext)!
  const currentPlayerIndex = players.findIndex((p) =>
    p.session._id.equals(sessionId)
  )
  if (currentPlayerIndex === -1) {
    return null
  }

  const currentPlayer = players[currentPlayerIndex]
  players[currentPlayerIndex] = players[0]
  players[0] = currentPlayer
  return (
    <div style={{ display: 'flex' }}>
      {players.map((p) => {
        return (
          <div
            key={p.session._id.id}
            style={{
              display: 'flex',
              padding: 10,
              gap: 5,
              alignItems: 'center',
              margin: '2px',
              cursor: 'default',
              border: `${p.session.color} solid 5px`,
              borderRadius: '5px',
            }}
          >
            <div className="tooltip">
              {p.session.name}
              <span className="tooltiptext">
                Score: {p.score} / {total} (
                {Math.floor((p.score / total) * 100).toString()}%)
              </span>
            </div>
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
  const gameInfo = useQuery('game:getGame', { gameId })
  if (gameInfo === undefined) {
    return <div>Loading</div>
  }
  const parsedGameInfo: GameInfo = {
    ...gameInfo,
    charMap: JSON.parse(gameInfo.charMap),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <h2>{gameInfo.title}</h2>
        <span>
          (
          <a href={gameInfo.sporcleUrl} target="_blank">
            Original quiz
          </a>
          )
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Players
          players={Array.from(parsedGameInfo.sessionsMap.values())}
          total={gameInfo.game.answers.length}
        />
        <GameControls gameInfo={parsedGameInfo} />
      </div>
      <Game gameInfo={parsedGameInfo}></Game>
    </div>
  )
}

const GuessInput = ({
  isPossibleAnswer,
  submitAnswer,
}: {
  isPossibleAnswer: (text: string) => boolean
  submitAnswer: (text: string) => Promise<boolean>
}) => {
  const [answerText, setAnswerText] = useState('')
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    setAnswerText(text)
    if (isPossibleAnswer(text)) {
      const wasCorrect = await submitAnswer(text)
      if (wasCorrect) {
        setAnswerText('')
      }
    }
  }
  return (
    <input
      value={answerText}
      onChange={handleChange}
      placeholder="Type your guess…"
    />
  )
}

const GameControls = ({ gameInfo }: { gameInfo: GameInfo }) => {
  const game = gameInfo.game
  const endGame = useMutation('game:endGame')
  const setPublic = useMutation('game:setPublic')
  return (
    <div
      style={{
        display: 'flex',
        gap: 5,
        alignContent: 'center',
      }}
    >
      <label
        className="toggle"
        style={{ display: 'flex', gap: 5, alignItems: 'center' }}
      >
        <div className="toggle-label">Make public?</div>
        <input
          className="toggle-checkbox"
          type="checkbox"
          checked={game.isPublic ?? false}
          onChange={async (event) => {
            await setPublic({
              gameId: game._id,
              isPublic: event.target.checked,
            })
          }}
        />
        <div className="toggle-switch"></div>
      </label>
      <button onClick={() => endGame({ gameId: game._id })}>Give up</button>
    </div>
  )
}

const Game = ({ gameInfo }: { gameInfo: GameInfo }) => {
  const game = gameInfo.game

  const submitAnswer = useSessionMutation('game:submitAnswer')
  const isPossibleAnswer = (answer: string) => {
    const trimmed = answer.trim()
    let translated = ''
    for (const c of trimmed.split('')) {
      translated += gameInfo.charMap[c] ?? c
    }
    return gameInfo.obfuscatedAnswers.has(translated)
  }
  const guessInput = (
    <GuessInput
      isPossibleAnswer={isPossibleAnswer}
      submitAnswer={(text: string) =>
        submitAnswer({ gameId: game._id, answer: text.trim() })
      }
    />
  )

  const answerBoxes = (
    <TransitionGroup
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'column',
        height: '75vh',
      }}
    >
      {game.answers.map((value, index) => {
        if (value !== null) {
          const answeredBy = gameInfo.sessionsMap.get(value.answeredBy.id)!
          const nodeRef = createRef<HTMLDivElement>()
          return (
            <CSSTransition
              key={index}
              nodeRef={nodeRef}
              timeout={500}
              classNames="item"
            >
              <div
                ref={nodeRef}
                className="tooltip"
                style={{
                  margin: '2px',
                  cursor: 'default',
                  border: `${answeredBy.session.color} solid 5px`,
                  borderRadius: '5px',
                }}
              >
                <span className="tooltiptext">{answeredBy.session.name}</span>
                {value.answer}
              </div>
            </CSSTransition>
          )
        } else {
          return (
            <div
              key={index}
              style={{
                height: '2em',
                margin: '2px',
                border: 'black solid 1px',
                minWidth: 100,
              }}
            ></div>
          )
        }
      })}
    </TransitionGroup>
  )

  return (
    <div>
      {answerBoxes}
      {game.finished ? null : guessInput}
    </div>
  )
}

export default GameBoundary
