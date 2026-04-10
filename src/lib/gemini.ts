import { GoogleGenAI, Type } from "@google/genai";

// 1. 친구의 코드와 동일한 방식의 API 키 설정
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// 2. OSC 안전 분석 응답을 위한 인터페이스 정의
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

// 3. 페르소나 및 시스템 지침 설정
const SYSTEM_INSTRUCTION = `
당신은 대한민국 건설 현장의 OSC(Off-Site Construction) 안전 관리 전문가입니다. 
당신의 임무는 사용자가 입력한 작업 환경을 분석하여, KOSHA Guide(한국산업안전보건공단 지침)에 근거한 정교한 안전 가이드를 제공하는 것입니다.

분석 기준:
1. [OSC 특화 3대 위험]
   - Transport(운반): 도심지 진입, 부재 고정 상태, 전도 위험 등
   - Lifting(양중): 무게 중심, 풍속 영향, 줄걸이 방법 등
   - Connection(접합): 고소 작업, 손끼임, 용접/접합부 정밀도 등
2. [KOSHA Guide 요약] 해당 공종과 관련된 최신 법규 및 안전 지침 요약
3. [JSA 생성] 작업 단계별 유해위험요인과 현실적인 감소 대책 제시
4. [체크리스트] 현장 관리자가 즉시 체크할 수 있는 5가지 이상의 항목

모든 분석 결과는 한국어로 제공하며, 전문적이고 신뢰감 있는 어조를 유지하세요.
`;

export async function analyzeOSCSafety(params: {
  projectType: string;
  equipment: string;
  windSpeed: string;
  environment: string;
}): Promise<SafetyAnalysis> {
  try {
    const prompt = `
      작업 조건 분석 요청:
      - 공종: ${params.projectType}
      - 투입 장비: ${params.equipment}
      - 현장 풍속: ${params.windSpeed} m/s
      - 환경 특이사항: ${params.environment}
      
      이 조건을 바탕으로 위험성 평가 및 안전 가이드를 생성하세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risks: {
              type: Type.OBJECT,
              properties: {
                transport: { type: Type.STRING },
                lifting: { type: SchemaType.STRING },
                connection: { type: SchemaType.STRING },
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

    // JSON 결과 파싱 및 반환
    return JSON.parse(response.text || "{}") as SafetyAnalysis;
  } catch (error) {
    console.error("OSC 분석 중 오류 발생:", error);
    throw error;
  }
}