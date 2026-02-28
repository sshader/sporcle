import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Layout } from "@/components/Layout"
import { Players } from "@/components/Players"
import { ReplayControls } from "@/components/ReplayControls"
import { ReplayRace } from "@/components/ReplayRace"
import { useReplayEngine } from "@/hooks/useReplayEngine"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function ReplayGrid({
  answers,
  sessionsMap,
}: {
  answers: (null | { answer: string; answeredBy: string; answeredAt?: number })[]
  sessionsMap: Record<string, { session: Doc<"sessions">; score: number }>
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
      {answers.map((value, index) => {
        if (value !== null) {
          const answeredBy = sessionsMap[value.answeredBy]
          if (!answeredBy) return null
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className="rounded-md border-l-4 px-2 py-1.5 text-sm cursor-default bg-card animate-fade-in"
                  style={{ borderLeftColor: answeredBy.session.color }}
                >
                  {value.answer}
                </div>
              </TooltipTrigger>
              <TooltipContent>{answeredBy.session.name}</TooltipContent>
            </Tooltip>
          )
        }
        return (
          <div
            key={index}
            className="rounded-md bg-muted px-2 py-1.5 text-sm min-h-[2em]"
          />
        )
      })}
    </div>
  )
}

function ReplayContent({
  game,
  sessionsMap,
  title,
}: {
  game: Doc<"game">
  sessionsMap: Record<string, { session: Doc<"sessions">; score: number }>
  title: string
}) {
  const router = useRouter()
  const gameIdStr = router.query.gameId as string
  const replay = useReplayEngine(game, sessionsMap)

  if (!replay.canReplay) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          Replay unavailable — this game has no timestamp data.
        </p>
        <Link href={`/game/${gameIdStr}`}>
          <Button variant="outline">Back to game</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-40 bg-background border-b -mx-4 px-4 py-2 space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold truncate shrink-0">{title}</h2>
          <span className="text-sm text-muted-foreground shrink-0">Replay</span>
          <div className="flex-1 min-w-0">
            <Players
              players={replay.scoreboard}
              total={game.answers.length}
              replayMode
            />
          </div>
          <Link href={`/game/${gameIdStr}`}>
            <Button variant="ghost" size="sm">
              Back
            </Button>
          </Link>
        </div>
        <ReplayControls
          isPlaying={replay.isPlaying}
          speed={replay.speed}
          progress={replay.progress}
          currentEventIndex={replay.currentEventIndex}
          totalEvents={replay.totalEvents}
          onPlay={replay.play}
          onPause={replay.pause}
          onReset={replay.reset}
          onSeek={replay.seekTo}
          onSetSpeed={replay.setSpeed}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <ReplayGrid answers={replay.visibleAnswers} sessionsMap={sessionsMap} />
        <div className="lg:sticky lg:top-40 lg:self-start">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Score Race</h3>
          <ReplayRace
            scoreboard={replay.scoreboard}
            totalAnswers={game.answers.length}
          />
        </div>
      </div>
    </div>
  )
}

export default function ReplayPage() {
  const router = useRouter()
  const gameIdStr = router.query.gameId as string
  const gameInfo = useQuery(
    api.game.getGame,
    gameIdStr ? { gameId: gameIdStr } : "skip"
  )

  if (gameInfo === undefined) {
    return (
      <Layout>
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      </Layout>
    )
  }

  if (!gameInfo.game.finished) {
    router.replace(`/game/${gameIdStr}`)
    return null
  }

  return (
    <Layout>
      <ReplayContent
        game={gameInfo.game}
        sessionsMap={gameInfo.sessionsMap}
        title={gameInfo.title}
      />
    </Layout>
  )
}
