// src/pages/Assessments/Runner.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../db/dexie";
import type { Assessment, AssessmentQuestion } from "../../types";

export default function Runner() {
  const { jobId } = useParams<{ jobId: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!jobId) return;
    db.assessments.get(jobId).then((a) => setAssessment(a || null));
  }, [jobId]);

  const handleChange = (qid: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const shouldShowQuestion = (q: AssessmentQuestion) => {
    if (!q.condition) return true;
    const val = answers[q.condition.questionId];
    return val === q.condition.equals;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    assessment?.sections.forEach((section) =>
      section.questions.forEach((q) => {
        if (!shouldShowQuestion(q)) return;

        const val = answers[q.id];
        if (q.required && (val === undefined || val === "")) {
          newErrors[q.id] = "This question is required";
        }

        if (q.type === "numeric" && val !== undefined && val !== "") {
          if (q.numericRange?.min !== undefined && val < q.numericRange.min)
            newErrors[q.id] = `Minimum value is ${q.numericRange.min}`;
          if (q.numericRange?.max !== undefined && val > q.numericRange.max)
            newErrors[q.id] = `Maximum value is ${q.numericRange.max}`;
        }

        if ((q.type === "short" || q.type === "long") && q.maxLength && val?.length > q.maxLength) {
          newErrors[q.id] = `Max length is ${q.maxLength}`;
        }
      })
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log("Submitted answers:", answers);
    alert("Assessment submitted successfully!");
    // Optional: store locally in IndexedDB for candidate simulation
  };

  if (!assessment) return <div>No assessment found for this job.</div>;

  return (
    <div className="p-4 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">{assessment.title}</h2>

      {assessment.sections.map((section) => (
        <div key={section.id} className="border p-4 rounded space-y-4">
          <h3 className="font-medium text-lg">{section.title}</h3>

          {section.questions.map(
            (q) =>
              shouldShowQuestion(q) && (
                <div key={q.id} className="space-y-1">
                  <label className="block font-medium">
                    {q.question} {q.required && <span className="text-red-500">*</span>}
                  </label>

                  {q.type === "short" && (
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      maxLength={q.maxLength}
                      className={`border p-2 rounded w-full ${errors[q.id] ? "border-red-500" : ""}`}
                    />
                  )}

                  {q.type === "long" && (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      maxLength={q.maxLength}
                      className={`border p-2 rounded w-full ${errors[q.id] ? "border-red-500" : ""}`}
                    />
                  )}

                  {q.type === "numeric" && (
                    <input
                      type="number"
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.valueAsNumber)}
                      min={q.numericRange?.min}
                      max={q.numericRange?.max}
                      className={`border p-2 rounded w-full ${errors[q.id] ? "border-red-500" : ""}`}
                    />
                  )}

                  {q.type === "single" &&
                    (q.options || []).map((opt, i) => (
                      <label key={i} className="block">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => handleChange(q.id, opt)}
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
                          checked={(answers[q.id] || []).includes(opt)}
                          onChange={(e) => {
                            const prev: string[] = answers[q.id] || [];
                            if (e.target.checked) handleChange(q.id, [...prev, opt]);
                            else handleChange(q.id, prev.filter((v) => v !== opt));
                          }}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}

                  {q.type === "file" && (
                    <input
                      type="file"
                      onChange={(e) => handleChange(q.id, e.target.files?.[0] || null)}
                      className="border p-2 rounded w-full"
                    />
                  )}

                  {errors[q.id] && <p className="text-red-500 text-sm">{errors[q.id]}</p>}
                </div>
              )
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Submit Assessment
      </button>
    </div>
  );
}
