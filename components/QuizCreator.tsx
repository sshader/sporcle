import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type QuizItem = {
  primary: string;
  alternatives: string[];
};

type AiSuggestions = Record<number, string[]>;

// -- Auto-suggest logic --

function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function suggestAlternatives(primary: string): string[] {
  if (!primary.trim()) return [];
  const suggestions: string[] = [];
  const trimmed = primary.trim();

  // "The " prefix
  if (trimmed.toLowerCase().startsWith("the ")) {
    suggestions.push(trimmed.slice(4));
  }

  // Common abbreviations
  const abbrevPairs: [RegExp, string][] = [
    [/\bSaint\b/gi, "St."],
    [/\bSt\.?\b/gi, "Saint"],
    [/\bMount\b/gi, "Mt."],
    [/\bMt\.?\b/gi, "Mount"],
    [/\bUnited States of America\b/gi, "USA"],
    [/\bUnited States\b/gi, "US"],
    [/\bUS\b/g, "United States"],
    [/\bUSA\b/g, "United States of America"],
  ];
  for (const [pattern, replacement] of abbrevPairs) {
    if (pattern.test(trimmed)) {
      const variant = trimmed.replace(pattern, replacement);
      if (variant !== trimmed) suggestions.push(variant);
    }
  }

  // Remove periods from abbreviations (e.g. "U.S.A." -> "USA")
  if (/[A-Z]\./.test(trimmed)) {
    suggestions.push(trimmed.replace(/\./g, ""));
  }
  // Add periods to all-caps abbreviations (e.g. "USA" -> "U.S.A.")
  if (/^[A-Z]{2,}$/.test(trimmed)) {
    suggestions.push(trimmed.split("").join(".") + ".");
  }

  // Accent removal
  const withoutAccents = removeDiacritics(trimmed);
  if (withoutAccents !== trimmed) suggestions.push(withoutAccents);

  // Deduplicate (case-insensitive) and remove primary itself
  const seen = new Set<string>([trimmed.toLowerCase()]);
  return suggestions.filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key) || !s.trim()) return false;
    seen.add(key);
    return true;
  });
}

// -- Parsing helpers for bulk paste <-> build mode --

function parseTextToItems(text: string): QuizItem[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line) => {
      const parts = line.split("/").map((v) => v.trim());
      return {
        primary: parts[0],
        alternatives: parts.slice(1).filter((a) => a.length > 0),
      };
    });
}

function serializeItemsToText(items: QuizItem[]): string {
  return items
    .map((item) =>
      [item.primary, ...item.alternatives].filter(Boolean).join(" / ")
    )
    .join("\n");
}

export function QuizCreator() {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<QuizItem[]>([
    { primary: "", alternatives: [] },
  ]);
  const [mode, setMode] = useState<"build" | "bulk">("build");
  const [bulkText, setBulkText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [addingAltIndex, setAddingAltIndex] = useState<number | null>(null);
  const [newAltText, setNewAltText] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions>({});
  const [isChecking, setIsChecking] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const createQuiz = useMutation(api.game.createQuiz);
  const checkQuiz = useAction(api.actions.checkQuiz.checkQuiz);
  const generateQuiz = useAction(api.actions.generateQuiz.generateQuiz);

  function updateItem(index: number, updates: Partial<QuizItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    // Shift AI suggestions
    setAiSuggestions((prev) => {
      const next: AiSuggestions = {};
      for (const [key, val] of Object.entries(prev)) {
        const k = Number(key);
        if (k < index) next[k] = val;
        else if (k > index) next[k - 1] = val;
      }
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { primary: "", alternatives: [] }]);
  }

  function acceptSuggestion(index: number, alt: string) {
    updateItem(index, {
      alternatives: [...items[index].alternatives, alt],
    });
  }

  function removeAlternative(itemIndex: number, altIndex: number) {
    updateItem(itemIndex, {
      alternatives: items[itemIndex].alternatives.filter(
        (_, i) => i !== altIndex
      ),
    });
  }

  function acceptAiSuggestion(itemIndex: number, alt: string) {
    acceptSuggestion(itemIndex, alt);
    setAiSuggestions((prev) => ({
      ...prev,
      [itemIndex]: (prev[itemIndex] || []).filter((s) => s !== alt),
    }));
  }

  function dismissAiSuggestion(itemIndex: number, alt: string) {
    setAiSuggestions((prev) => ({
      ...prev,
      [itemIndex]: (prev[itemIndex] || []).filter((s) => s !== alt),
    }));
  }

  function switchMode(newMode: "build" | "bulk") {
    if (newMode === mode) return;
    if (newMode === "bulk") {
      setBulkText(serializeItemsToText(items));
    } else {
      const parsed = parseTextToItems(bulkText);
      setItems(parsed.length > 0 ? parsed : [{ primary: "", alternatives: [] }]);
      setAiSuggestions({});
    }
    setMode(newMode);
  }

  async function handleCheckWithAI() {
    const nonEmpty = items.filter((item) => item.primary.trim());
    if (nonEmpty.length === 0) return;
    setIsChecking(true);
    try {
      const result = await checkQuiz({
        title: title.trim() || "Untitled Quiz",
        items: items
          .filter((item) => item.primary.trim())
          .map((item) => ({
            primary: item.primary.trim(),
            alternatives: item.alternatives,
          })),
      });
      const newSuggestions: AiSuggestions = {};
      for (const entry of result) {
        const existing = new Set(
          [items[entry.itemIndex]?.primary, ...(items[entry.itemIndex]?.alternatives || [])].map(s => s.toLowerCase())
        );
        const filtered = entry.suggestedAlternatives.filter(
          (a: string) => !existing.has(a.toLowerCase())
        );
        if (filtered.length > 0) {
          newSuggestions[entry.itemIndex] = filtered;
        }
      }
      setAiSuggestions(newSuggestions);
    } catch (e) {
      console.error("AI check failed:", e);
    } finally {
      setIsChecking(false);
    }
  }

  async function handleGenerate() {
    if (!generatePrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateQuiz({ prompt: generatePrompt.trim() });
      setTitle(result.title);
      setItems(
        result.items.length > 0
          ? result.items
          : [{ primary: "", alternatives: [] }]
      );
      setAiSuggestions({});
      setMode("build");
      setGeneratePrompt("");
    } catch (e) {
      console.error("AI generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCreate() {
    const finalItems =
      mode === "build" ? items : parseTextToItems(bulkText);
    const nonEmpty = finalItems.filter((item) => item.primary.trim());
    if (!title.trim() || nonEmpty.length === 0) return;
    setIsCreating(true);
    try {
      const answers = nonEmpty.map((item) => {
        const all = [item.primary.trim(), ...item.alternatives];
        return [...new Set(all)];
      });
      await createQuiz({ title: title.trim(), answers });
      setTitle("");
      setItems([{ primary: "", alternatives: [] }]);
      setBulkText("");
      setAiSuggestions({});
    } finally {
      setIsCreating(false);
    }
  }

  const hasContent =
    mode === "build"
      ? items.some((item) => item.primary.trim())
      : bulkText.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Generate */}
        <div className="space-y-1.5">
          <Label htmlFor="generate-prompt">Generate with AI</Label>
          <div className="flex gap-2">
            <Input
              id="generate-prompt"
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder='Describe a quiz (e.g. "50 US state capitals")'
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
              disabled={isGenerating}
            />
            <Button
              variant="outline"
              disabled={!generatePrompt.trim() || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quiz-title">Title</Label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
          />
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 rounded-md bg-muted p-1">
          <button
            type="button"
            className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "build"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => switchMode("build")}
          >
            Build
          </button>
          <button
            type="button"
            className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "bulk"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => switchMode("bulk")}
          >
            Bulk paste
          </button>
        </div>

        {mode === "bulk" ? (
          <div className="space-y-1.5">
            <Label htmlFor="quiz-answers">Answers</Label>
            <Textarea
              id="quiz-answers"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={
                "One answer per line.\nUse / for alternatives (e.g. New York / NYC)"
              }
              rows={8}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <Label>Answers</Label>
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-md border p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">
                    {index + 1}.
                  </span>
                  <Input
                    value={item.primary}
                    onChange={(e) =>
                      updateItem(index, { primary: e.target.value })
                    }
                    placeholder="Answer"
                    className="flex-1"
                  />
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeItem(index)}
                    >
                      <span className="sr-only">Remove</span>
                      &times;
                    </Button>
                  )}
                </div>

                {/* Accepted alternatives */}
                {item.alternatives.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-8">
                    {item.alternatives.map((alt, altIdx) => (
                      <Badge
                        key={altIdx}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeAlternative(index, altIdx)}
                      >
                        {alt} &times;
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Auto-suggested alternatives */}
                {item.primary.trim() && (() => {
                  const accepted = new Set(
                    [item.primary, ...item.alternatives].map(s => s.toLowerCase())
                  );
                  const suggestions = suggestAlternatives(
                    item.primary
                  ).filter((s) => !accepted.has(s.toLowerCase()));
                  if (suggestions.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-1 ml-8">
                      {suggestions.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="cursor-pointer border-dashed text-muted-foreground hover:text-foreground hover:border-solid"
                          onClick={() => acceptSuggestion(index, s)}
                        >
                          + {s}
                        </Badge>
                      ))}
                    </div>
                  );
                })()}

                {/* AI suggestions */}
                {(aiSuggestions[index] || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-8">
                    {aiSuggestions[index].map((s) => (
                      <span key={s} className="inline-flex items-center gap-0.5">
                        <Badge
                          variant="outline"
                          className="cursor-pointer border-dashed border-violet-400 text-violet-600 hover:border-solid hover:bg-violet-50"
                          onClick={() => acceptAiSuggestion(index, s)}
                        >
                          &#10024; {s}
                        </Badge>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-foreground px-0.5"
                          onClick={() => dismissAiSuggestion(index, s)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add custom alternative */}
                {addingAltIndex === index ? (
                  <div className="flex items-center gap-1 ml-8">
                    <Input
                      value={newAltText}
                      onChange={(e) => setNewAltText(e.target.value)}
                      placeholder="Alternative..."
                      className="h-7 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newAltText.trim()) {
                          acceptSuggestion(index, newAltText.trim());
                          setNewAltText("");
                        } else if (e.key === "Escape") {
                          setAddingAltIndex(null);
                          setNewAltText("");
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (newAltText.trim()) {
                          acceptSuggestion(index, newAltText.trim());
                          setNewAltText("");
                        }
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setAddingAltIndex(null);
                        setNewAltText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  item.primary.trim() && (
                    <button
                      type="button"
                      className="ml-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setAddingAltIndex(index);
                        setNewAltText("");
                      }}
                    >
                      + Add alternative
                    </button>
                  )
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addItem}
            >
              + Add item
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {mode === "build" && (
            <Button
              variant="outline"
              disabled={!hasContent || isChecking}
              onClick={handleCheckWithAI}
              className="flex-1"
            >
              {isChecking ? "Checking..." : "\u2728 Check with AI"}
            </Button>
          )}
          <Button
            disabled={!title.trim() || !hasContent || isCreating}
            onClick={handleCreate}
            className="flex-1"
          >
            {isCreating ? "Creating..." : "Create quiz"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
