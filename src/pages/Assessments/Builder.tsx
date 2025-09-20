// src/pages/Assessments/Builder.tsx
import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Assessment, AssessmentQuestion } from "../../types";
import QuestionForm from "../../components/Assessments/QuestionForm";
import { db } from "../../db/dexie";
import { useParams } from "react-router-dom";

interface Section {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

export default function Builder() {
  const { jobId } = useParams<{ jobId: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({}); // for conditional logic

  // Load existing assessment
  useEffect(() => {
    if (!jobId) return;

    db.assessments.get(jobId).then((saved: Assessment | undefined) => {
      if (saved) {
        setSections(saved.sections);
      } else {
        setSections([]); // start empty if none
      }
    });
  }, [jobId]);

  const addSection = () => {
    setSections([
      ...sections,
      { id: uuid(), title: "Untitled Section", questions: [] },
    ]);
  };

  const updateSectionTitle = (si: number, title: string) => {
    const newSections = [...sections];
    newSections[si].title = title;
    setSections(newSections);
  };

  const addQuestion = (si: number) => {
    const newSections = [...sections];
    newSections[si].questions.push({
      id: uuid(),
      type: "short",
      question: "",
      required: false,
      condition: null,
    });
    setSections(newSections);
  };

  const updateQuestion = (
    si: number,
    qi: number,
    updated: AssessmentQuestion
  ) => {
    const newSections = [...sections];
    newSections[si].questions[qi] = updated;
    setSections(newSections);
  };

  const removeQuestion = (si: number, qi: number) => {
    const newSections = [...sections];
    newSections[si].questions.splice(qi, 1);
    setSections(newSections);
  };

  const saveAssessment = async () => {
    if (!jobId) return;

    const assessment: Assessment = {
      jobId,
      title: `Assessment for ${jobId}`,
      sections,
      updatedAt: new Date().toISOString(),
    };

    await db.assessments.put(assessment);
    alert("✅ Assessment Saved!");
  };

  // Helper to check conditional rendering
  const shouldShowQuestion = (q: AssessmentQuestion) => {
    if (!q.condition) return true;
    const parentAnswer = answers[q.condition.questionId];
    return parentAnswer === q.condition.equals;
  };

  return (
    <div className="p-4 grid grid-cols-2 gap-6">
      {/* LEFT: Builder */}
      <div>
        <h2 className="text-xl text-white font-semibold mb-4">Assessment Builder</h2>

        {sections.map((section, si) => (
          <div
            key={section.id}
            className="border rounded-lg p-4 mb-6 bg-white shadow-sm"
          >
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSectionTitle(si, e.target.value)}
              className="w-full border p-2 mb-4 rounded text-lg font-medium"
              placeholder="Section Title"
            />

            {section.questions.map((q, qi) => (
              <QuestionForm
                key={q.id}
                question={q}
                sections={sections} // pass all sections for conditional options
                onChange={(updated) => updateQuestion(si, qi, updated)}
                onRemove={() => removeQuestion(si, qi)}
              />
            ))}

            <button
              type="button"
              onClick={() => addQuestion(si)}
              className="mt-2 px-3 py-1 border rounded text-sm text-blue-600"
            >
              ➕ Add Question
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          className="px-4 py-2 border rounded bg-white text-blue-600 mr-3"
        >
          ➕ Add Section
        </button>

        <button
          type="button"
          onClick={saveAssessment}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Assessment
        </button>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>

        {sections.length === 0 && (
          <p className="text-gray-500 italic">
            No sections yet. Add one to preview.
          </p>
        )}

        {sections.map((section) => (
          <div key={section.id} className="mb-6">
            <h3 className="text-lg font-medium mb-3">{section.title}</h3>

            {section.questions.map((q) => {
              if (!shouldShowQuestion(q)) return null;

              return (
                <div key={q.id} className="mb-4">
                  <label className="block font-medium mb-1">
                    {q.question}{" "}
                    {q.required && <span className="text-red-500">*</span>}
                  </label>

                  {q.type === "short" && (
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      className="border p-2 rounded w-full"
                      maxLength={q.maxLength}
                    />
                  )}
                  {q.type === "long" && (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      className="border p-2 rounded w-full"
                      maxLength={q.maxLength}
                    />
                  )}
                  {q.type === "single" &&
                    (q.options || []).map((opt, i) => (
                      <label key={i} className="block">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt}
                          onChange={() =>
                            setAnswers({ ...answers, [q.id]: opt })
                          }
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  {q.type === "multi" &&
                    (q.options || []).map((opt, i) => (
                      <label key={i} className="block">
                        <input
                          type="checkbox"
                          checked={Array.isArray(answers[q.id]) && answers[q.id].includes(opt)}
                          onChange={(e) => {
                            const arr = Array.isArray(answers[q.id]) ? [...answers[q.id]] : [];
                            if (e.target.checked) arr.push(opt);
                            else arr.splice(arr.indexOf(opt), 1);
                            setAnswers({ ...answers, [q.id]: arr });
                          }}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  {q.type === "numeric" && (
                    <input
                      type="number"
                      value={answers[q.id] ?? ""}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [q.id]: e.target.value ? Number(e.target.value) : "",
                        })
                      }
                      className="border p-2 rounded w-full"
                      min={q.numericRange?.min}
                      max={q.numericRange?.max}
                    />
                  )}
                  {q.type === "file" && (
                    <input type="file" className="border p-2 rounded w-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
