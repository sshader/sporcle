import { Layout } from "@/components/Layout"
import { QuizCreator } from "@/components/QuizCreator"
import { SporcleImport } from "@/components/SporcleImport"
import { Authenticated, Unauthenticated } from "convex/react"
import { SignIn } from "@/components/SignIn"

export default function CreatePage() {
  return (
    <Layout>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <div className="space-y-6">
          <QuizCreator />
          <SporcleImport />
        </div>
      </Authenticated>
    </Layout>
  )
}
