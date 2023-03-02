import { useState, FormEvent } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
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

const PlayerEdit = ({ session }: { session: Document<'sessions'> }) => {
  const updateSession = useSessionMutation('sessions:update')
  const [name, setName] = useState(session.name)
  const [color, setColor] = useState(session.color)

  return (
    <div
      style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}
    >
      <h1>You: </h1>
      <fieldset>
        <input
          value={name}
          onChange={async (event) => {
            const newName = event.target.value
            setName(newName)
            await updateSession({ name: newName, color })
          }}
          placeholder="Your name"
        />
        <label htmlFor="color">
          Color
          <input
            type="color"
            id="color"
            name="color"
            value={color}
            onChange={async (event) => {
              const newColor = event.target.value as any
              setColor(newColor)
              await updateSession({ name, color: newColor })
            }}
          />
        </label>
      </fieldset>
    </div>
  )
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
      <QuizPicker />
    </div>
  )
}
