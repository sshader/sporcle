import { Doc } from "@/convex/_generated/dataModel"

export function ReplayRace({
  scoreboard,
  totalAnswers,
}: {
  scoreboard: { session: Doc<"sessions">; score: number }[]
  totalAnswers: number
}) {
  // Filter to players who have answered at least one
  const activePlayers = scoreboard.filter((p) => p.score > 0)
  const maxScore = Math.max(1, ...activePlayers.map((p) => p.score))

  if (activePlayers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Waiting for answers...
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activePlayers.map((p, rank) => (
        <div
          key={p.session._id}
          className="flex items-center gap-2"
          style={{
            transform: `translateY(0)`,
            transition: "transform 0.3s ease",
          }}
        >
          <span
            className="text-xs font-medium w-20 truncate text-right"
            style={{ color: p.session.color }}
          >
            {p.session.name}
          </span>
          <div className="flex-1 h-6 bg-muted rounded relative overflow-hidden">
            <div
              className="h-full rounded transition-[width] duration-300 ease-out"
              style={{
                width: `${(p.score / totalAnswers) * 100}%`,
                backgroundColor: p.session.color,
                minWidth: p.score > 0 ? "2rem" : 0,
              }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
              {p.score}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
