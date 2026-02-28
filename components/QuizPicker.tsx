import { usePaginatedQuery, useMutation } from "convex/react"
import { useRouter } from "next/router"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { useRequireAuth } from "@/hooks/useRequireAuth"

export function QuizPicker() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.game.getQuizzes,
    {},
    { initialNumItems: 10 }
  )
  const startGame = useMutation(api.game.startGame)
  const router = useRouter()
  const { requireAuth } = useRequireAuth()

  async function handleStartGame(quizId: Id<"quiz">) {
    requireAuth(async () => {
      const gameId = await startGame({ quizId })
      await router.push({
        pathname: "/game/[gameId]",
        query: { gameId },
      })
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
      {status === "CanLoadMore" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => loadMore(10)}
        >
          Load more
        </Button>
      )}
    </div>
  )
}
