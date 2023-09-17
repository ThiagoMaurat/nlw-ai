"use client";
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PromptSelect {
  id: string;
  title: string;
  template: string;
}

interface PromptSelectProps {
  onPromptSelected: (template: string) => void;
}

export default function PromptSelect(props: PromptSelectProps) {
  const [prompts, setPrompts] = React.useState<PromptSelect[] | null>(null);

  const { onPromptSelected } = props;

  useEffect(() => {
    fetch(`http://localhost:3333/prompts`)
      .then((res) => res.json())
      .then((data) => setPrompts(data));
  }, []);

  const handlePromptSelected = (promptId: string) => {
    const selectedPrompt = prompts?.find((prompt) => prompt.id === promptId);
    if (!selectedPrompt) {
      return;
    }

    onPromptSelected(selectedPrompt.template);
  };
  console.log(prompts);
  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>

      <SelectContent>
        {prompts &&
          prompts?.length > 0 &&
          prompts?.map((prompt) => (
            <SelectItem key={`select-${prompt.id}`} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
