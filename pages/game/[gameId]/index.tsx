import { api } from "@/convex/_generated/api"
import { useQuery, useMutation } from "convex/react"
import { Doc } from "@/convex/_generated/dataModel"
import { ChangeEvent, createRef, useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { TransitionGroup, CSSTransition } from "react-transition-group"
import { Layout } from "@/components/Layout"
import { Players } from "@/components/Players"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type GameInfo = {
  game: Doc<"game">
  obfuscatedAnswers: Set<string>
  charMap: Record<string, string> | null
  sessionsMap: Record<string, { session: Doc<"sessions">; score: number }>
}

function GameControls({
  gameInfo,
  autoScroll,
  setAutoScroll,
}: {
  gameInfo: GameInfo
  autoScroll: boolean
  setAutoScroll: (v: boolean) => void
}) {
  const game = gameInfo.game
  const endGame = useMutation(api.game.endGame)
  const setPublic = useMutation(api.game.setPublic)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          &#x22EE;
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-scroll-toggle" className="cursor-pointer text-sm">
            Auto-scroll
          </Label>
          <Switch
            id="auto-scroll-toggle"
            checked={autoScroll}
            onCheckedChange={setAutoScroll}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="public-toggle" className="cursor-pointer text-sm">
            Public
          </Label>
          <Switch
            id="public-toggle"
            checked={game.isPublic ?? false}
            onCheckedChange={async (checked) => {
              await setPublic({ gameId: game._id, isPublic: checked })
            }}
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => endGame({ gameId: game._id })}
        >
          Give up
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function GuessInput({
  isPossibleAnswer,
  submitAnswer,
}: {
  isPossibleAnswer: (text: string) => boolean
  submitAnswer: (text: string) => Promise<boolean>
}) {
  const [answerText, setAnswerText] = useState("")
  const [beaten, setBeaten] = useState(false)
  const beatenTimeout = useRef<ReturnType<typeof setTimeout>>()
  const { requireAuth } = useRequireAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const handleFocus = () => {
    if (!requireAuth()) {
      inputRef.current?.blur()
    }
  }
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    setAnswerText(text)
    if (isPossibleAnswer(text)) {
      const wasCorrect = await submitAnswer(text)
      if (wasCorrect) {
        setAnswerText("")
        setBeaten(false)
        clearTimeout(beatenTimeout.current)
      } else {
        // Answer was valid but already taken by someone else
        // Don't clear input — let the user keep typing (e.g. "i" -> "i've")
        setBeaten(true)
        clearTimeout(beatenTimeout.current)
        beatenTimeout.current = setTimeout(() => setBeaten(false), 2000)
      }
    } else {
      // Text no longer matches a taken answer, hide the beaten message
      if (beaten) {
        setBeaten(false)
        clearTimeout(beatenTimeout.current)
      }
    }
  }
  return (
    <div className="sticky bottom-0 bg-background border-t pt-3 pb-4">
      <Input
        ref={inputRef}
        value={answerText}
        onFocus={handleFocus}
        onChange={handleChange}
        placeholder="Type your guess..."
        className="text-base"
        autoFocus
      />
      {beaten && (
        <p className="text-sm text-muted-foreground mt-1 animate-fade-in">
          Someone beat you to it!
        </p>
      )}
    </div>
  )
}

function Game({ gameInfo, autoScroll }: { gameInfo: GameInfo; autoScroll: boolean }) {
  const game = gameInfo.game
  const submitAnswer = useMutation(api.game.submitAnswer)
  const cellRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const prevAnswersRef = useRef<typeof game.answers>(game.answers)

  const isPossibleAnswer = (answer: string) => {
    const trimmed = answer.trim()
    if (gameInfo.charMap) {
      let translated = ""
      for (const c of trimmed.split("")) {
        translated += gameInfo.charMap[c] ?? c
      }
      return gameInfo.obfuscatedAnswers.has(translated)
    }
    return trimmed.length > 0
  }

  // Detect newly filled cells, scroll to them and highlight
  useEffect(() => {
    const prev = prevAnswersRef.current
    prevAnswersRef.current = game.answers

    const newlyFilled: number[] = []
    for (let i = 0; i < game.answers.length; i++) {
      if (prev[i] === null && game.answers[i] !== null) {
        newlyFilled.push(i)
      }
    }

    if (newlyFilled.length === 0) return

    // Scroll only one newly filled cell into view (the topmost one)
    if (autoScroll) {
      const firstIndex = newlyFilled[0]
      const firstEl = cellRefs.current.get(firstIndex)
      if (firstEl) {
        const rect = firstEl.getBoundingClientRect()
        const targetY = rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2
        window.scrollTo({ top: targetY, behavior: "smooth" })
      }
    }

    // Add highlight class to all newly filled cells
    for (const index of newlyFilled) {
      const el = cellRefs.current.get(index)
      if (el) {
        el.classList.add("cell-highlight")
        setTimeout(() => el.classList.remove("cell-highlight"), 1500)
      }
    }
  }, [game.answers, autoScroll])

  const handleSubmit = useCallback(
    async (text: string) => {
      return submitAnswer({
        gameId: game._id,
        answer: text.trim(),
      })
    },
    [submitAnswer, game._id]
  )

  const setCellRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) {
        cellRefs.current.set(index, el)
      } else {
        cellRefs.current.delete(index)
      }
    },
    []
  )

  return (
    <div>
      <TransitionGroup
        className="grid grid-cols-2 md:grid-cols-3 gap-1"
        component="div"
      >
        {game.answers.map((value, index) => {
          if (value !== null) {
            const answeredBy = gameInfo.sessionsMap[value.answeredBy]!
            const nodeRef = createRef<HTMLDivElement>()
            return (
              <CSSTransition
                key={index}
                nodeRef={nodeRef}
                timeout={500}
                classNames="item"
              >
                <div ref={(el) => {
                  (nodeRef as any).current = el
                  setCellRef(index)(el)
                }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="rounded-md border-l-4 px-2 py-1.5 text-sm cursor-default bg-card"
                        style={{ borderLeftColor: answeredBy.session.color }}
                      >
                        {value.answer}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{answeredBy.session.name}</TooltipContent>
                  </Tooltip>
                </div>
              </CSSTransition>
            )
          } else {
            return (
              <div
                key={index}
                className="rounded-md bg-muted px-2 py-1.5 text-sm min-h-[2em]"
              />
            )
          }
        })}
      </TransitionGroup>
      {!game.finished && (
        <GuessInput
          isPossibleAnswer={isPossibleAnswer}
          submitAnswer={handleSubmit}
        />
      )}
    </div>
  )
}

export default function GameBoundary() {
  const router = useRouter()
  const gameIdStr: string = router.query.gameId! as string
  const gameInfo = useQuery(api.game.getGame, { gameId: gameIdStr })
  const [autoScroll, setAutoScroll] = useState(true)

  if (gameInfo === undefined) {
    return (
      <Layout>
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      </Layout>
    )
  }

  const parsedGameInfo: GameInfo = {
    ...gameInfo,
    obfuscatedAnswers: new Set(gameInfo.obfuscatedAnswers),
    charMap: gameInfo.charMap ? JSON.parse(gameInfo.charMap) : null,
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="sticky top-14 z-40 bg-background border-b -mx-4 px-4 py-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold truncate shrink-0">{gameInfo.title}</h2>
            {gameInfo.sporcleUrl && (
              <a
                href={gameInfo.sporcleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:underline shrink-0"
              >
                Original quiz
              </a>
            )}
            <div className="flex-1 min-w-0">
              <Players
                players={Array.from(Object.values(parsedGameInfo.sessionsMap))}
                total={gameInfo.game.answers.length}
              />
            </div>
            {gameInfo.game.finished && (
              <Link href={`/game/${gameIdStr}/replay`}>
                <Button variant="outline" size="sm">
                  Watch Replay
                </Button>
              </Link>
            )}
            <GameControls
              gameInfo={parsedGameInfo}
              autoScroll={autoScroll}
              setAutoScroll={setAutoScroll}
            />
          </div>
        </div>
        <Game gameInfo={parsedGameInfo} autoScroll={autoScroll} />
      </div>
    </Layout>
  )
}
