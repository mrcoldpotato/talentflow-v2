// src/components/Assessments/QuestionForm.tsx
import React, { useState } from "react";
import { AssessmentQuestion, AssessmentSection } from "../../types";

interface Props {
  question: AssessmentQuestion;
  sections: AssessmentSection[]; // all sections for conditional logic
  onChange: (q: AssessmentQuestion) => void;
  onRemove: () => void;
}

export default function QuestionForm({ question, sections, onChange, onRemove }: Props) {
  const [local, setLocal] = useState<AssessmentQuestion>(question);

  const update = (changes: Partial<AssessmentQuestion>) => {
    const updated = { ...local, ...changes };
    setLocal(updated);
    onChange(updated);
  };

  // Add an option for single/multi questions
  const addOption = () => {
    update({
      options: [...(local.options || []), ""],
    });
  };

  // Update specific option
  const updateOption = (i: number, value: string) => {
    const newOptions = [...(local.options || [])];
    newOptions[i] = value;
    update({ options: newOptions });
  };

  // Remove specific option
  const removeOption = (i: number) => {
    const newOptions = [...(local.options || [])];
    newOptions.splice(i, 1);
    update({ options: newOptions });
  };

  return (
    <div className="border p-3 rounded mb-3 bg-gray-50">
      {/* Question text */}
      <input
        type="text"
        value={local.question}
        onChange={(e) => update({ question: e.target.value })}
        placeholder="Question text"
        className="w-full border p-2 mb-2 rounded"
      />

      {/* Question type */}
      <select
        value={local.type}
        onChange={(e) =>
          update({ type: e.target.value as AssessmentQuestion["type"] })
        }
        className="border p-2 rounded mb-2"
      >
        <option value="short">Short Text</option>
        <option value="long">Long Text</option>
        <option value="single">Single Choice</option>
        <option value="multi">Multi Choice</option>
        <option value="numeric">Numeric</option>
        <option value="file">File Upload</option>
      </select>

      {/* Required */}
      <label className="block mb-2">
        <input
          type="checkbox"
          checked={local.required || false}
          onChange={(e) => update({ required: e.target.checked })}
          className="mr-2"
        />
        Required
      </label>

      {/* Conditional Question */}
      <div className="mb-2">
        <label className="block mb-1 text-sm">Show this question only if:</label>
        <select
          value={local.condition?.questionId || ""}
          onChange={(e) =>
            update({
                condition: e.target.value
                ? { questionId: e.target.value, equals: local.condition?.equals ?? "" }
                : null,
            })
          }
          className="border p-1 rounded mb-1 w-full"
        >
          <option value="">-- Show always --</option>
          {sections.flatMap((sec) =>
            sec.questions
              .filter((q) => q.id !== local.id) // exclude current question
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.question || "Untitled Question"}
                </option>
              ))
          )}
        </select>

        {local.condition && (
          <input
            type="text"
            placeholder="Equals value"
            value={local.condition?.equals ?? ""}
            onChange={(e) =>
                update({
                  condition: local.condition
                    ? { questionId: local.condition.questionId, equals: e.target.value }
                    : { questionId: "", equals: e.target.value }, // fallback if somehow condition is null
                })
            } 
            className="border p-1 rounded w-full"
           />

        )}
      </div>

      {/* Options editor for single/multi */}
      {(local.type === "single" || local.type === "multi") && (
        <div className="mb-2">
          <p className="font-medium mb-1">Options</p>
          {(local.options || []).map((opt, i) => (
            <div key={i} className="flex items-center mb-1">
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 border p-1 rounded mr-2"
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="text-blue-600 text-sm"
          >
            ➕ Add Option
          </button>
        </div>
      )}

      {/* Numeric range */}
      {local.type === "numeric" && (
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={local.numericRange?.min ?? ""}
            onChange={(e) =>
              update({
                numericRange: {
                  ...local.numericRange,
                  min: e.target.value ? Number(e.target.value) : undefined,
                },
              })
            }
            placeholder="Min"
            className="border p-1 rounded flex-1"
          />
          <input
            type="number"
            value={local.numericRange?.max ?? ""}
            onChange={(e) =>
              update({
                numericRange: {
                  ...local.numericRange,
                  max: e.target.value ? Number(e.target.value) : undefined,
                },
              })
            }
            placeholder="Max"
            className="border p-1 rounded flex-1"
          />
        </div>
      )}

      {/* Max length for short/long */}
      {(local.type === "short" || local.type === "long") && (
        <input
          type="number"
          value={local.maxLength ?? ""}
          onChange={(e) =>
            update({
              maxLength: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Max Length"
          className="border p-1 rounded mb-2 w-full"
        />
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 text-sm"
      >
        Remove Question
      </button>
    </div>
  );
}
