import { Id } from '../../convex/_generated/dataModel'
import { useQuery, useMutation } from '../../convex/_generated/react'

import { Doc } from '../../convex/_generated/dataModel'
import { ChangeEvent, createRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useSessionMutation } from '../../hooks/sessionClient'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

type GameInfo = {
  game: Doc<'game'>
  obfuscatedAnswers: Set<string>
  charMap: Record<string, string>
  sessionsMap: Map<string, Doc<'sessions'>>
}

const Players = ({ players }: { players: Doc<'sessions'>[] }) => {
  return (
    <div style={{ display: 'flex' }}>
      {players.map((p) => {
        return (
          <div
            key={p._id.id}
            style={{
              display: 'flex',
              padding: 10,
              gap: 5,
              alignItems: 'center',
              margin: '2px',
              cursor: 'default',
              border: `${p.color} solid 5px`,
              borderRadius: '5px',
            }}
          >
            {p.name}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Players players={Array.from(parsedGameInfo.sessionsMap.values())} />
        <GameControls game={parsedGameInfo.game} />
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

const GameControls = ({ game }: { game: Doc<'game'> }) => {
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
            await setPublic(game._id, event.target.checked)
          }}
        />
        <div className="toggle-switch"></div>
      </label>
      <button onClick={() => endGame(game._id)}>Give up</button>
    </div>
  )
}

const Game = ({ gameInfo }: { gameInfo: GameInfo }) => {
  const game = gameInfo.game

  const submitAnswer = useSessionMutation('game:submitAnswer')
  const isPossibleAnswer = (answer: string) => {
    let translated = ''
    for (const c of answer.split('')) {
      translated += gameInfo.charMap[c] ?? c
    }
    return gameInfo.obfuscatedAnswers.has(translated)
  }
  const guessInput = (
    <GuessInput
      isPossibleAnswer={isPossibleAnswer}
      submitAnswer={(text: string) => submitAnswer(game._id, text)}
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
                  border: `${answeredBy.color} solid 5px`,
                  borderRadius: '5px',
                }}
              >
                <span className="tooltiptext">{answeredBy.name}</span>
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
