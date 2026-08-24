import { Type } from "@google/genai";
import { getGenAI, extractJson, withTimeout } from "./gemini";

export interface ExplainerResponse {
  simpleExplanation: string;
  example: string;
  keyTakeaway: string;
}

export function getFallbackExplanation(question: string, language: "English" | "Hindi"): ExplainerResponse {
  const isHindi = language === "Hindi";
  const lower = question.toLowerCase();

  if (lower.includes("compound") || lower.includes("चक्रवृद्धि") || lower.includes("ब्याज")) {
    return isHindi
      ? {
          simpleExplanation: "चक्रवृद्धि ब्याज (Compound Interest) का मतलब है कि आपको न केवल आपकी मूल राशि पर ब्याज मिलता है, बल्कि जो ब्याज पहले जुड़ चुका है, उस पर भी नया ब्याज मिलता है।",
          example: "जैसे अगर आप ₹100 जमा करते हैं और 10% ब्याज मिलता है, तो पहले साल ₹110 होंगे। अगले साल ब्याज ₹100 पर नहीं, बल्कि ₹110 पर मिलेगा यानी ₹11।",
          keyTakeaway: "जितनी जल्दी आप बचत और निवेश शुरू करेंगे, चक्रवृद्धि ब्याज उतना ही अधिक लाभ देगा।",
        }
      : {
          simpleExplanation: "Compound interest is interest earned on both your initial principal money and on the accumulated interest from previous periods.",
          example: "If you save ₹1,000 at 10% annual interest, you earn ₹100 in year one. In year two, you earn 10% on ₹1,100, which is ₹110, accelerating your growth exponentially.",
          keyTakeaway: "Starting early gives compounding more time to multiply your savings naturally.",
        };
  }

  if (lower.includes("emi") || lower.includes("ईएमआई") || lower.includes("loan") || lower.includes("किस्त")) {
    return isHindi
      ? {
          simpleExplanation: "EMI (Equated Monthly Installment) वह तय मासिक राशि है जो आप किसी बैंक या वित्तीय संस्था को अपना लोन चुकाने के लिए हर महीने देते हैं।",
          example: "जैसे ₹50,000 का फोन खरीदते समय पूरी राशि एक साथ देने के बजाय आप हर महीने ₹5,000 की 10 किस्तें चुकाते हैं।",
          keyTakeaway: "हमेशा सुनिश्चित करें कि आपकी सभी कुल EMI आपके मासिक वेतन के 30-40% से अधिक न हों।",
        }
      : {
          simpleExplanation: "An EMI (Equated Monthly Installment) is a fixed monthly payment made by a borrower to a lender to pay off a loan over a set schedule.",
          example: "Instead of paying ₹60,000 all at once for a vehicle or appliance, you pay ₹5,000 every month for 12 months with agreed interest.",
          keyTakeaway: "Keep your total monthly EMIs well below 35% of your take-home pay to maintain financial peace of mind.",
        };
  }

  if (lower.includes("inflation") || lower.includes("महंगाई") || lower.includes("मुद्रास्फीति")) {
    return isHindi
      ? {
          simpleExplanation: "मुद्रास्फीति (Inflation) का अर्थ है समय के साथ वस्तुओं और सेवाओं की कीमतों में सामान्य वृद्धि, जिससे पैसे की क्रय शक्ति घट जाती है।",
          example: "जो समोसा या दूध का पैकेट 10 साल पहले ₹10 में मिलता था, वह आज ₹25 का मिलता है। इसे ही महंगाई कहते हैं।",
          keyTakeaway: "केवल पैसे को नकद रखने के बजाय ऐसे साधनों में निवेश करें जो महंगाई दर से अधिक रिटर्न देते हों।",
        }
      : {
          simpleExplanation: "Inflation is the gradual increase in the prices of goods and services over time, reducing what your money can buy.",
          example: "If a movie ticket cost ₹100 five years ago and costs ₹200 today, inflation has diminished the purchasing power of that hundred-rupee note.",
          keyTakeaway: "Invest your long-term savings in assets that beat the inflation rate to protect your future purchasing power.",
        };
  }

  if (lower.includes("credit score") || lower.includes("cibil") || lower.includes("क्रेडिट स्कोर")) {
    return isHindi
      ? {
          simpleExplanation: "क्रेडिट स्कोर 300 से 900 के बीच का 3-अंकों का नंबर होता है जो यह दर्शाता है कि आप समय पर लोन और बिल चुकाने में कितने विश्वसनीय हैं।",
          example: "यह स्कूल के रिपोर्ट कार्ड जैसा है। अच्छा स्कोर (750+) होने पर बैंक आपको कम ब्याज दर पर तुरंत लोन देते हैं।",
          keyTakeaway: "क्रेडिट कार्ड बिल और लोन की किस्तें हमेशा समय पर भरें ताकि आपका स्कोर 750 से ऊपर बना रहे।",
        }
      : {
          simpleExplanation: "A credit score (typically between 300 and 900) is a three-digit number summarizing your creditworthiness and repayment history.",
          example: "Think of it as a financial report card. A high score (750+) tells lenders you are reliable, unlocking lower loan interest rates and fast approvals.",
          keyTakeaway: "Pay credit card dues and EMI installments in full on time to maintain a strong 750+ score.",
        };
  }

  return isHindi
    ? {
        simpleExplanation: `"${question}" एक महत्वपूर्ण वित्तीय विषय है जो आपके पैसे के प्रबंधन, बचत और वित्तीय सुरक्षा से सीधे जुड़ा हुआ है।`,
        example: "दैनिक जीवन में जैसे हम अपनी आय और खर्चों का हिसाब रखकर बजट बनाते हैं, वैसे ही सही वित्तीय जानकारी हमें बेहतर निर्णय लेने में मदद करती है।",
        keyTakeaway: "वित्तीय साक्षरता और नियमित बचत की आदतें आपको वित्तीय स्वतंत्रता की ओर ले जाती हैं।",
      }
    : {
        simpleExplanation: `Understanding "${question}" is a key foundation for sound personal financial management and smart long-term decision making.`,
        example: "Much like planning household expenses before shopping, knowing how financial principles work helps you avoid unnecessary costs and make informed choices.",
        keyTakeaway: "Cultivating consistent financial literacy habits empowers you to build durable wealth and security.",
      };
}

export async function explainFinanceWithGemini(
  question: string,
  language: "English" | "Hindi"
): Promise<ExplainerResponse> {
  const isHindi = language === "Hindi";
  const ai = getGenAI();

  const systemInstruction = `You are FinShield's Financial Educator, dedicated to making financial concepts simple, intuitive, and accessible for everyone.

CORE PRINCIPLES:
1. Explain the requested concept in simple, accessible, jargon-free terms that a beginner or student can easily understand.
2. Use a relatable, real-world everyday scenario or analogy (e.g., daily grocery market, pocket money, smartphone purchases, tea stall, family budget, festival savings).
3. Do NOT provide speculative trading advice, stock tips, or personalized investment recommendations.
4. Keep the tone friendly, clear, respectful, and empowering.
5. If the language requested is Hindi ('Hindi'), formulate the entire response in fluent, natural conversational Hindi in Devanagari script (सरल और समझने में आसान हिंदी), using relatable Indian daily life examples (जैसे गुल्लक, किराना स्टोर, बैंक बचत खाता, मोबाइल रिचार्ज).`;

  const prompt = `Please explain the following financial question or concept: "${question}" in ${isHindi ? "Hindi (हिंदी भाषा)" : "English"}.`;

  try {
    const aiCall = ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleExplanation: {
              type: Type.STRING,
              description: isHindi
                ? "सरल, स्पष्ट और बिना किसी जटिल तकनीकी शब्दों के 2-3 वाक्यों में व्याख्या"
                : "A clear, simple 2-3 sentence explanation with zero unnecessary jargon",
            },
            example: {
              type: Type.STRING,
              description: isHindi
                ? "दैनिक जीवन का एक व्यावहारिक और रोचक उदाहरण या रूपक"
                : "A concrete, relatable real-world analogy or daily life scenario",
            },
            keyTakeaway: {
              type: Type.STRING,
              description: isHindi
                ? "मुख्य सीख या याद रखने योग्य महत्वपूर्ण बिंदु (1-2 वाक्य)"
                : "A 1-2 sentence core practical takeaway for the user to remember",
            },
          },
          required: ["simpleExplanation", "example", "keyTakeaway"],
        },
      },
    });

    const response = await withTimeout(
      aiCall,
      35000,
      "The financial explainer service is taking longer than expected. Please try again."
    );

    const responseText = response.text?.trim() || "";
    const parsedData = extractJson<Partial<ExplainerResponse>>(responseText);

    if (!parsedData) {
      return getFallbackExplanation(question, language);
    }

    return {
      simpleExplanation: parsedData.simpleExplanation && typeof parsedData.simpleExplanation === "string"
        ? parsedData.simpleExplanation.trim()
        : (isHindi ? "इस अवधारणा को समझना आपकी वित्तीय सुरक्षा और बचत के लिए अत्यंत महत्वपूर्ण है।" : "Understanding this concept helps you make smarter everyday financial decisions."),
      example: parsedData.example && typeof parsedData.example === "string"
        ? parsedData.example.trim()
        : (isHindi ? "उदाहरण के लिए, जैसे हर महीने गुल्लक में थोड़ा-थोड़ा पैसा जोड़ना।" : "For example, setting aside a small predictable portion of your monthly income builds compounding momentum over time."),
      keyTakeaway: parsedData.keyTakeaway && typeof parsedData.keyTakeaway === "string"
        ? parsedData.keyTakeaway.trim()
        : (isHindi ? "वित्तीय समझदारी और नियमित आदतें आपको सुरक्षित बनाती हैं।" : "Financial clarity and small consistent habits build lasting security."),
    };
  } catch (err: any) {
    console.warn("Gemini explainer fell back to curated educational knowledge base:", err?.message || err);
    return getFallbackExplanation(question, language);
  }
}
