import { GoogleGenAI, Type } from '@google/genai';
import { config } from './config';
import { SessionTrack } from '../src/types';

export type CfpAiResult = {
  clarityScore: number;
  overallRating: 'Strong Accept' | 'Accept' | 'Needs Revision' | 'Reject';
  strengths: string[];
  improvements: string[];
  suggestedTrack: SessionTrack;
};

export type CfpAiOutcome =
  | { status: 'ok'; analysis: CfpAiResult }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

export async function analyzeCfpProposal(input: {
  title: string;
  abstract: string;
  targetTrack?: string;
  level?: string;
  conferenceName?: string;
}): Promise<CfpAiOutcome> {
  if (!config.geminiApiKey) {
    return { status: 'unavailable' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const conference = input.conferenceName || 'Smart Hybrid Conference (Rwanda Convention Bureau)';
    const prompt = `You are a Conference Committee Reviewer for ${conference}. Review this Call For Papers (CFP) proposal and provide structured JSON analysis.
Title: ${input.title}
Abstract: ${input.abstract}
Target Track: ${input.targetTrack || 'General'}
Target Level: ${input.level || 'All Levels'}

Evaluate clarity, relevance to Rwanda/Africa tech and events context where applicable, and engagement potential. Return JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarityScore: { type: Type.NUMBER, description: 'Score between 0 and 100' },
            overallRating: {
              type: Type.STRING,
              description: 'Strong Accept | Accept | Needs Revision | Reject',
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedTrack: { type: Type.STRING, description: 'Best matching track name' },
          },
          required: ['clarityScore', 'overallRating', 'strengths', 'improvements', 'suggestedTrack'],
        },
      },
    });

    if (!response.text) {
      return { status: 'error', message: 'Empty model response' };
    }

    const parsed = JSON.parse(response.text.trim());
    return {
      status: 'ok',
      analysis: {
        clarityScore: Number(parsed.clarityScore),
        overallRating: parsed.overallRating,
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        suggestedTrack: parsed.suggestedTrack || input.targetTrack || 'Web Development',
      },
    };
  } catch (err: any) {
    console.error('CFP AI review failed:', err?.message || err);
    return { status: 'error', message: err?.message || 'AI review failed' };
  }
}
