import { api } from '../convex/_generated/api'
import { useAction, usePaginatedQuery, useQuery } from 'convex/react'
import { useState } from 'react'
import { Doc, Id } from '../convex/_generated/dataModel'
import { useRouter } from 'next/router'
import React from 'react'

import { useMutation } from 'convex/react'
import { useSessionId } from '../pages/_app'
const renderLoading = () => {
  return (
    <ul>
      <li className="Placeholder Placeholder-row"></li>
      <li className="Placeholder Placeholder-row"></li>
    </ul>
  )
}

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const PlayerEdit = ({ session }: { session: Doc<'sessions'> }) => {
  const sessionId = useSessionId()
  const updateSession = useMutation(api.sessions.update)
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
          await updateSession({ name, color: newColor, sessionId })
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
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          key={r._id}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span>{r.title ?? 'Ongoing game'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {r.playerSessions.map((p) => (
                <span
                  key={p._id}
                  className="player-chip"
                  style={{
                    backgroundColor: p.color,
                  }}
                  title={p.name}
                >
                  {p.name.slice(0, 2)}
                </span>
              ))}
              {r.lastActiveTime && (
                <span
                  style={{ color: '#6c757d', fontSize: '0.85em', marginLeft: 4 }}
                >
                  {formatRelativeTime(r.lastActiveTime)}
                </span>
              )}
            </div>
          </div>
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

const QuizCreator = () => {
  const [title, setTitle] = useState('')
  const [answersText, setAnswersText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const createQuiz = useMutation(api.game.createQuiz)

  async function handleCreate() {
    if (!title.trim() || !answersText.trim()) return
    setIsCreating(true)
    try {
      const lines = answersText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
      const answers = lines.map((line) => {
        const variants = line.split('/').map((v) => v.trim())
        return [variants[0], ...variants.slice(1), variants[0].toLowerCase()].filter(
          (v, i, arr) => arr.indexOf(v) === i
        )
      })
      await createQuiz({ title: title.trim(), answers })
      setTitle('')
      setAnswersText('')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      <h1>Create a quiz:</h1>
      <div
        style={{
          margin: 8,
          padding: 16,
          borderRadius: 8,
          border: 'solid 1px lightgray',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz title"
        />
        <textarea
          value={answersText}
          onChange={(e) => setAnswersText(e.target.value)}
          placeholder={
            'One answer per line.\nUse / for alternatives (e.g. New York/NYC)'
          }
          rows={8}
          style={{
            padding: '6px 12px',
            border: 'solid 1px rgb(206, 212, 218)',
            borderRadius: 8,
            fontSize: 16,
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
        <button
          disabled={!title.trim() || !answersText.trim() || isCreating}
          onClick={handleCreate}
        >
          {isCreating ? 'Creating...' : 'Create quiz'}
        </button>
      </div>
    </div>
  )
}

const QuizPicker = () => {
  const { results } = usePaginatedQuery(
    api.game.getQuizzes,
    {},
    { initialNumItems: 10 }
  )
  const sessionId = useSessionId()
  const startGame = useMutation(api.game.startGame)
  const addQuiz = useAction(api.actions.addSporcleQuiz.default)
  const router = useRouter()
  const [quizUrl, setQuizUrl] = useState('')
  async function handleStartGame(quizId: Id<'quiz'>) {
    const gameId = await startGame({ quizId, sessionId })
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
  const sessionId = useSessionId()
  console.log('sessionId', sessionId)
  const session = useQuery(
    api.sessions.get,
    sessionId ? { sessionId } : 'skip'
  )
  if (session === undefined || session === null) {
    return renderLoading()
  }
  return (
    <div>
      <PlayerEdit session={session} />
      <GamePicker />
      <QuizCreator />
      <QuizPicker />
    </div>
  )
}
