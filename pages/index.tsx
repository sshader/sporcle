import { Layout } from "@/components/Layout"
import { GamePicker } from "@/components/GamePicker"
import { QuizPicker } from "@/components/QuizPicker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <Layout>
      <Tabs defaultValue="games">
        <TabsList>
          <TabsTrigger value="games">Ongoing Games</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>
        <TabsContent value="games">
          <GamePicker />
        </TabsContent>
        <TabsContent value="quizzes">
          <QuizPicker />
        </TabsContent>
      </Tabs>
    </Layout>
  )
}
