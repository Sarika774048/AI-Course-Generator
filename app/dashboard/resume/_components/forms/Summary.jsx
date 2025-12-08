"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResumeInfoContext } from "@/app/_context/ResumeInfoContext";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGeminiResponse } from "@/configs/AiResumeModel";
import { Bot, Loader2 } from "lucide-react";
import { db } from "@/configs/db";
import { UserResumes } from "@/configs/schema";
import { eq } from "drizzle-orm";

const Summary = ({ enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [summary, setSummary] = useState();
  const [loading, setLoading] = useState(false);
  const params = useParams();

  useEffect(() => {
    summary && setResumeInfo({ ...resumeInfo, summary: summary });
  }, [summary]);

  const GenerateSummary = async () => {
    setLoading(true);
    const prompt = `Job Title: ${resumeInfo?.jobTitle}. Generate a professional resume summary (4-5 lines) for this role.`;
    const result = await getGeminiResponse(prompt);
    setSummary(result);
    setLoading(false);
  };

  const onSave = async (e) => {
    e.preventDefault();
    enableNext(true);
    await db
      .update(UserResumes)
      .set({ summary: summary })
      .where(eq(UserResumes.resumeId, params.resumeId));
    alert("Summary Saved!");
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 bg-white">
      <div className="flex justify-between items-end">
        <label>Summary</label>
        <Button
          variant="outline"
          onClick={GenerateSummary}
          size="sm"
          className="border-primary text-primary flex gap-2"
        >
          {loading ? <Loader2 className="animate-spin mt-2" /> : <Bot />}{" "}
          Generate from AI
        </Button>
      </div>
      <form className="mt-7" onSubmit={onSave}>
        <Textarea
          className="mt-5 h-32"
          required
          // 👇 FIX: Use || "" to ensure it is never null/undefined
          value={summary || resumeInfo?.summary || ""}
          onChange={(e) => setSummary(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
};

export default Summary;
