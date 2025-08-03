import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface PollCreatorProps {
  onPollChange: (poll: { question: string; options: string[] } | null) => void;
}

const MAX_OPTIONS = 6;

export const PollCreator: React.FC<PollCreatorProps> = ({ onPollChange }) => {
  const [includePoll, setIncludePoll] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const handleTogglePoll = () => {
    const newIncludePoll = !includePoll;
    setIncludePoll(newIncludePoll);
    
    if (!newIncludePoll) {
      setQuestion("");
      setOptions(["", ""]);
      onPollChange(null);
    } else {
      updatePoll();
    }
  };

  const updatePoll = () => {
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (question.trim() && validOptions.length >= 2) {
      onPollChange({ question: question.trim(), options: validOptions });
    } else {
      onPollChange(null);
    }
  };

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    if (includePoll) {
      setTimeout(updatePoll, 0);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    if (includePoll) {
      setTimeout(updatePoll, 0);
    }
  };

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (includePoll) {
        setTimeout(updatePoll, 0);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="include-poll"
          checked={includePoll}
          onChange={handleTogglePoll}
          className="rounded border-input"
        />
        <Label htmlFor="include-poll" className="text-sm font-medium">
          Incluir encuesta
        </Label>
      </div>

      {includePoll && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Crear Encuesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="poll-question">Pregunta</Label>
              <Input
                id="poll-question"
                value={question}
                onChange={(e) => handleQuestionChange(e.target.value)}
                placeholder="¿Cuál es tu pregunta?"
                className="mt-1"
              />
            </div>

            <div className="space-y-3">
              <Label>Opciones (mínimo 2, máximo {MAX_OPTIONS})</Label>
              {options.map((option, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {options.length < MAX_OPTIONS && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar opción
                </Button>
              )}
            </div>

            {question.trim() && options.filter(opt => opt.trim()).length >= 2 && (
              <div className="text-sm text-muted-foreground">
                ✓ Encuesta lista para publicar
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};