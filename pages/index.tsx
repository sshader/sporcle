import { api } from '../convex/_generated/api'
import { useAction, usePaginatedQuery, useQuery } from 'convex/react'
import { useContext, useState } from 'react'
import { Doc, Id } from '../convex/_generated/dataModel'
import { useRouter } from 'next/router'
import React from 'react'
import { SessionContext, useSessionMutation } from '../hooks/sessionClient'

const renderLoading = () => {
  return (
    <ul>
      <li className="Placeholder Placeholder-row"></li>
      <li className="Placeholder Placeholder-row"></li>
    </ul>
  )
}

const PlayerEdit = ({ session }: { session: Doc<'sessions'> }) => {
  const updateSession = useSessionMutation(api.sessions.update)
  const [name, setName] = useState(session.name)
  const [color, setColor] = useState(session.color)

  return (
    <div
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
      }}
    >
      <h1>You: </h1>
      <input
        value={name}
        data-tooltip="Name"
        onChange={async (event) => {
          const newName = event.target.value
          setName(newName)
          await updateSession({ name: newName, color })
        }}
        placeholder="Your name"
      />
      <input
        type="color"
        id="color"
        name="color"
        value={color}
        data-tooltip="Color"
        onChange={async (event) => {
          const newColor = event.target.value as any
          setColor(newColor)
          await updateSession({ name, color: newColor })
        }}
      />
    </div>
  )
}

const GamePicker = () => {
  const { results } = usePaginatedQuery(
    api.game.getPublicGames,
    {},
    {
      initialNumItems: 10,
    }
  )
  const router = useRouter()
  async function handleStartGame(gameId: Id<'game'>) {
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId,
      },
    })
  }

  if (results) {
    const listItems = results.map((r) => {
      return (
        <li
          style={{ display: 'flex', justifyContent: 'space-between' }}
          key={r._id}
        >
          {r.title ?? 'Ongoing game'}
          <button onClick={() => handleStartGame(r._id)}>Join game</button>
        </li>
      )
    })
    return (
      <div>
        <h1>Ongoing games:</h1>
        <ul>{listItems}</ul>
      </div>
    )
  }
  return renderLoading()
}

const QuizPicker = () => {
  const { results } = usePaginatedQuery(
    api.game.getQuizzes,
    {},
    { initialNumItems: 10 }
  )
  const startGame = useSessionMutation(api.game.start)
  const addQuiz = useAction(api.actions.addSporcleQuiz.default)
  const router = useRouter()
  const [quizUrl, setQuizUrl] = useState('')
  async function handleStartGame(quizId: Id<'quiz'>) {
    const gameId = await startGame({ quizId })
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId,
      },
    })
  }

  async function handleQuizImport() {
    setQuizUrl('')
    await addQuiz({ sporcleUrl: quizUrl })
  }

  if (results) {
    const listItems = results.map((r) => {
      return (
        <li
          style={{ display: 'flex', justifyContent: 'space-between' }}
          key={r._id}
        >
          {r.title}
          <button onClick={() => handleStartGame(r._id)}>Start quiz</button>
        </li>
      )
    })
    return (
      <div>
        <h1>Quizzes:</h1>
        <ul>
          {listItems}
          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p>Classic quizzes (just typing) work best</p>
              <input
                value={quizUrl}
                onChange={(event) => setQuizUrl(event.target.value)}
                placeholder="Enter sporcle URL..."
              />
            </div>
            <button disabled={quizUrl.length === 0} onClick={handleQuizImport}>
              Import new quiz
            </button>
          </li>
        </ul>
      </div>
    )
  }
  return renderLoading()
}

export default function App() {
  const sessionId = useContext(SessionContext)
  const session = useQuery(api.sessions.get, { sessionId })
  if (session === undefined || session === null) {
    return renderLoading()
  }
  return (
    <div>
      <PlayerEdit session={session} />
      <GamePicker />
      <QuizPicker />
    </div>
  )
}
