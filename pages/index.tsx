import { useState } from 'react'
import { Doc, Id } from '../convex/_generated/dataModel'
import { useRouter } from 'next/router'
import React from 'react'
import { useSessionMutation, useSessionQuery } from '../hooks/sessionClient'
import { useAction, usePaginatedQuery } from '../convex/_generated/react'

const renderLoading = () => {
  return (
    <ul>
      <li className="Placeholder Placeholder-row"></li>
      <li className="Placeholder Placeholder-row"></li>
    </ul>
  )
}

const PlayerEdit = ({ session }: { session: Doc<'sessions'> }) => {
  const updateSession = useSessionMutation('sessions:update')
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
  const { results } = usePaginatedQuery('game:getPublicGames', {
    initialNumItems: 10,
  })
  const router = useRouter()
  async function handleStartGame(gameId: Id<'game'>) {
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId.id,
      },
    })
  }

  if (results) {
    const listItems = results.map((r) => {
      return (
        <li
          style={{ display: 'flex', justifyContent: 'space-between' }}
          key={r._id.id}
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
  const { results, loadMore, status } = usePaginatedQuery('game:getQuizzes', {
    initialNumItems: 10,
  })
  const startGame = useSessionMutation('game:startGame')
  const addQuiz = useAction('actions/addSporcleQuiz')
  const router = useRouter()
  const [quizUrl, setQuizUrl] = useState('')
  async function handleStartGame(quizId: Id<'quiz'>) {
    const gameId = await startGame(quizId)
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId.id,
      },
    })
  }

  async function handleQuizImport() {
    setQuizUrl('')
    await addQuiz(quizUrl)
  }

  if (results) {
    const listItems = results.map((r) => {
      return (
        <li
          style={{ display: 'flex', justifyContent: 'space-between' }}
          key={r._id.id}
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
  const session = useSessionQuery('sessions:get')
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
