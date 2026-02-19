import { useState } from "react"
import { useAction } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SporcleImport() {
  const [quizUrl, setQuizUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addQuiz = useAction(api.actions.addSporcleQuiz.default)

  async function handleImport() {
    if (!quizUrl.trim()) return
    setIsImporting(true)
    setError(null)
    try {
      await addQuiz({ sporcleUrl: quizUrl })
      setQuizUrl("")
    } catch (e) {
      if (e instanceof ConvexError) {
        setError(e.data as string)
      } else {
        setError("Something went wrong importing the quiz. Please try again.")
      }
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
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={quizUrl}
            onChange={(e) => { setQuizUrl(e.target.value); setError(null) }}
            placeholder="Enter Sporcle URL..."
            className="flex-1"
          />
          <Button
            disabled={!quizUrl.trim() || isImporting}
            onClick={handleImport}
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
