import { Layout } from "@/components/Layout"
import { QuizCreator } from "@/components/QuizCreator"
import { SporcleImport } from "@/components/SporcleImport"

export default function CreatePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <QuizCreator />
        <SporcleImport />
      </div>
    </Layout>
  )
}
