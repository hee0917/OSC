import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface SafetyAnalysis {
  risks: {
    transport: string;
    lifting: string;
    connection: string;
  };
  koshaSummary: string;
  jsa: {
    step: string;
    hazard: string;
    measure: string;
  }[];
  checklist: string[];
}

export async function analyzeOSCSafety(params: {
  projectType: string;
  equipment: string;
  windSpeed: string;
  environment: string;
}): Promise<SafetyAnalysis> {
  const prompt = `
    당신은 건설 안전 관리 전문가입니다. 다음 OSC(Off-Site Construction) 작업 조건에 대한 안전 분석을 수행하세요.
    
    [작업 조건]
    - 프로젝트 공종: ${params.projectType}
    - 주요 장비: ${params.equipment}
    - 풍속: ${params.windSpeed} m/s
    - 작업 환경: ${params.environment}
    
    [요구사항]
    1. OSC 특화 3대 위험(Transport, Lifting, Connection) 분석
    2. 해당 공정에 맞는 KOSHA Guide 기반 안전보건관리 지침 요약
    3. 단계별 JSA(Job Safety Analysis) 테이블 생성 (작업절차, 유해위험요인, 감소대책)
    4. 현장 즉시 확인용 안전 체크리스트 (5개 항목 이상)
    
    모든 내용은 한국어로 작성하세요.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risks: {
            type: Type.OBJECT,
            properties: {
              transport: { type: Type.STRING },
              lifting: { type: Type.STRING },
              connection: { type: Type.STRING },
            },
            required: ["transport", "lifting", "connection"],
          },
          koshaSummary: { type: Type.STRING },
          jsa: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                hazard: { type: Type.STRING },
                measure: { type: Type.STRING },
              },
              required: ["step", "hazard", "measure"],
            },
          },
          checklist: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["risks", "koshaSummary", "jsa", "checklist"],
      },
    },
  });

  if (!response.text) {
    throw new Error("AI 응답을 생성하지 못했습니다.");
  }

  return JSON.parse(response.text) as SafetyAnalysis;
}
