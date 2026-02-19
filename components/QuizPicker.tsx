import { usePaginatedQuery, useMutation } from "convex/react"
import { useRouter } from "next/router"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useSessionId } from "@/pages/_app"
import { Button } from "@/components/ui/button"

export function QuizPicker() {
  const { results } = usePaginatedQuery(
    api.game.getQuizzes,
    {},
    { initialNumItems: 10 }
  )
  const sessionId = useSessionId()
  const startGame = useMutation(api.game.startGame)
  const router = useRouter()

  async function handleStartGame(quizId: Id<"quiz">) {
    const gameId = await startGame({ quizId, sessionId })
    await router.push({
      pathname: "/game/[gameId]",
      query: { gameId },
    })
  }

  if (!results) {
    return (
      <div className="space-y-2">
        <div className="h-12 rounded-md bg-muted animate-pulse" />
        <div className="h-12 rounded-md bg-muted animate-pulse" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No quizzes available yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      {results.map((r) => (
        <div
          key={r._id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <span className="font-medium">{r.title}</span>
          <Button size="sm" onClick={() => handleStartGame(r._id)}>
            Start quiz
          </Button>
        </div>
      ))}
    </div>
  )
}
