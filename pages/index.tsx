import { Layout } from "@/components/Layout"
import { GamePicker } from "@/components/GamePicker"
import { QuizPicker } from "@/components/QuizPicker"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  return (
    <Layout>
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Ongoing Games</h2>
          <GamePicker />
        </section>
        <Separator />
        <section>
          <h2 className="text-xl font-semibold mb-3">Quizzes</h2>
          <QuizPicker />
        </section>
      </div>
    </Layout>
  )
}
