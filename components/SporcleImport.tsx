import { useState } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SporcleImport() {
  const [quizUrl, setQuizUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const addQuiz = useAction(api.actions.addSporcleQuiz.default)

  async function handleImport() {
    if (!quizUrl.trim()) return
    setIsImporting(true)
    try {
      await addQuiz({ sporcleUrl: quizUrl })
      setQuizUrl("")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Sporcle</CardTitle>
        <CardDescription>Classic quizzes (just typing) work best</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input
          value={quizUrl}
          onChange={(e) => setQuizUrl(e.target.value)}
          placeholder="Enter Sporcle URL..."
          className="flex-1"
        />
        <Button
          disabled={!quizUrl.trim() || isImporting}
          onClick={handleImport}
        >
          {isImporting ? "Importing..." : "Import"}
        </Button>
      </CardContent>
    </Card>
  )
}
