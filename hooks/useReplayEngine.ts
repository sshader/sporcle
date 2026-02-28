import { Doc } from "@/convex/_generated/dataModel"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type ReplayEvent = {
  index: number
  answer: string
  answeredBy: string
  answeredAt: number
}

export type Speed = 1 | 2 | 4 | 8

export function useReplayEngine(
  game: Doc<"game">,
  sessionsMap: Record<string, { session: Doc<"sessions">; score: number }>
) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const replayEvents = useMemo(() => {
    const events: ReplayEvent[] = []
    game.answers.forEach((slot, index) => {
      if (slot !== null && slot.answeredAt != null) {
        events.push({
          index,
          answer: slot.answer,
          answeredBy: slot.answeredBy,
          answeredAt: slot.answeredAt,
        })
      }
    })
    events.sort((a, b) => a.answeredAt - b.answeredAt)
    return events
  }, [game.answers])

  const canReplay = replayEvents.length > 0

  const visibleAnswers = useMemo(() => {
    const result: (typeof game.answers)[number][] = game.answers.map(() => null)
    for (let i = 0; i < currentEventIndex; i++) {
      const event = replayEvents[i]
      result[event.index] = {
        answer: event.answer,
        answeredBy: event.answeredBy as any,
        answeredAt: event.answeredAt,
      }
    }
    return result
  }, [game.answers, replayEvents, currentEventIndex])

  const scoreboard = useMemo(() => {
    const scores: Record<string, number> = {}
    for (let i = 0; i < currentEventIndex; i++) {
      const event = replayEvents[i]
      scores[event.answeredBy] = (scores[event.answeredBy] ?? 0) + 1
    }
    return Object.entries(sessionsMap)
      .map(([id, { session }]) => ({
        session,
        score: scores[id] ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
  }, [currentEventIndex, replayEvents, sessionsMap])

  const scheduleNext = useCallback(() => {
    if (currentEventIndex >= replayEvents.length) {
      setIsPlaying(false)
      return
    }

    const current = replayEvents[currentEventIndex]
    const next = replayEvents[currentEventIndex + 1]

    if (!next) {
      // Last event — just show it and stop
      setCurrentEventIndex((i) => i + 1)
      setIsPlaying(false)
      return
    }

    const gap = next.answeredAt - current.answeredAt
    const MAX_GAP = 30_000
    const cappedGap = gap > MAX_GAP ? 500 : gap
    const delay = Math.max(cappedGap / speed, 50)

    timerRef.current = setTimeout(() => {
      setCurrentEventIndex((i) => i + 1)
    }, delay)
  }, [currentEventIndex, replayEvents, speed])

  useEffect(() => {
    if (!isPlaying) return
    scheduleNext()
    return () => clearTimeout(timerRef.current)
  }, [isPlaying, currentEventIndex, scheduleNext])

  const play = useCallback(() => {
    if (currentEventIndex >= replayEvents.length) {
      setCurrentEventIndex(0)
    }
    setIsPlaying(true)
  }, [currentEventIndex, replayEvents.length])

  const pause = useCallback(() => {
    setIsPlaying(false)
    clearTimeout(timerRef.current)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    clearTimeout(timerRef.current)
    setCurrentEventIndex(0)
  }, [])

  const seekTo = useCallback(
    (eventIndex: number) => {
      const clamped = Math.max(0, Math.min(eventIndex, replayEvents.length))
      setCurrentEventIndex(clamped)
    },
    [replayEvents.length]
  )

  const progress =
    replayEvents.length > 0 ? currentEventIndex / replayEvents.length : 0

  return {
    play,
    pause,
    reset,
    seekTo,
    setSpeed,
    speed,
    isPlaying,
    visibleAnswers,
    scoreboard,
    progress,
    canReplay,
    currentEventIndex,
    totalEvents: replayEvents.length,
  }
}
