import { Button } from "@/components/ui/button"
import { Speed } from "@/hooks/useReplayEngine"
import { Play, Pause, RotateCcw } from "lucide-react"

const SPEEDS: Speed[] = [1, 2, 4, 8]

export function ReplayControls({
  isPlaying,
  speed,
  progress,
  currentEventIndex,
  totalEvents,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onSetSpeed,
}: {
  isPlaying: boolean
  speed: Speed
  progress: number
  currentEventIndex: number
  totalEvents: number
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSeek: (index: number) => void
  onSetSpeed: (speed: Speed) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={isPlaying ? onPause : onPlay}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onReset}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <div
        className="flex-1 h-2 bg-muted rounded-full cursor-pointer relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const ratio = (e.clientX - rect.left) / rect.width
          onSeek(Math.round(ratio * totalEvents))
        }}
      >
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {currentEventIndex}/{totalEvents}
      </span>

      <div className="flex gap-1">
        {SPEEDS.map((s) => (
          <Button
            key={s}
            variant={speed === s ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onSetSpeed(s)}
          >
            {s}x
          </Button>
        ))}
      </div>
    </div>
  )
}
