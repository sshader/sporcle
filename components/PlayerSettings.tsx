import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PlayerSettings({ session }: { session: Doc<"sessions"> }) {
  const updateSession = useMutation(api.sessions.update)
  const [name, setName] = useState(session.name)
  const [color, setColor] = useState(session.color)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="player-name">Name</Label>
        <Input
          id="player-name"
          value={name}
          onChange={async (event) => {
            const newName = event.target.value
            setName(newName)
            await updateSession({ name: newName, color })
          }}
          placeholder="Your name"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="player-color">Color</Label>
        <input
          type="color"
          id="player-color"
          value={color}
          onChange={async (event) => {
            const newColor = event.target.value
            setColor(newColor)
            await updateSession({ name, color: newColor })
          }}
          className="h-10 w-full cursor-pointer rounded-md border border-input bg-background"
        />
      </div>
    </div>
  )
}
