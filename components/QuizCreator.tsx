import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function QuizCreator() {
  const [title, setTitle] = useState("")
  const [answersText, setAnswersText] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const createQuiz = useMutation(api.game.createQuiz)

  async function handleCreate() {
    if (!title.trim() || !answersText.trim()) return
    setIsCreating(true)
    try {
      const lines = answersText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
      const answers = lines.map((line) => {
        const variants = line.split("/").map((v) => v.trim())
        return [variants[0], ...variants.slice(1), variants[0].toLowerCase()].filter(
          (v, i, arr) => arr.indexOf(v) === i
        )
      })
      await createQuiz({ title: title.trim(), answers })
      setTitle("")
      setAnswersText("")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="quiz-title">Title</Label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quiz-answers">Answers</Label>
          <Textarea
            id="quiz-answers"
            value={answersText}
            onChange={(e) => setAnswersText(e.target.value)}
            placeholder={"One answer per line.\nUse / for alternatives (e.g. New York/NYC)"}
            rows={8}
          />
        </div>
        <Button
          disabled={!title.trim() || !answersText.trim() || isCreating}
          onClick={handleCreate}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create quiz"}
        </Button>
      </CardContent>
    </Card>
  )
}
