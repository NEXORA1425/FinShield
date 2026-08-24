import { RiskAnalysisResult, BudgetInputs, BudgetAnalysisResult, ExplainerLanguage, ExplainerResult } from '../types';

export function getClientRiskFallback(userMessage: string): RiskAnalysisResult {
  const lower = userMessage.toLowerCase();
  const indicators: string[] = [];
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (
    lower.includes('block') ||
    lower.includes('deactivat') ||
    lower.includes('suspend') ||
    lower.includes('disconnect') ||
    lower.includes('electricity will be cut')
  ) {
    indicators.push('Artificial urgency and threats of account disconnection or blockage');
    riskLevel = 'HIGH';
  }

  if (
    lower.includes('lottery') ||
    lower.includes('won') ||
    lower.includes('prize') ||
    lower.includes('crore') ||
    lower.includes('lakh') ||
    lower.includes('guaranteed return') ||
    lower.includes('double your money')
  ) {
    indicators.push('Unsolicited claims of high reward, prize money, or unrealistic returns');
    riskLevel = 'HIGH';
  }

  if (
    lower.includes('apk') ||
    lower.includes('download') ||
    lower.includes('app') ||
    lower.includes('install anydesk') ||
    lower.includes('teamviewer') ||
    lower.includes('rustdesk')
  ) {
    indicators.push('Requests to download unauthorized software or third-party APK application');
    riskLevel = 'HIGH';
  }

  if (
    lower.includes('otp') ||
    lower.includes('cvv') ||
    lower.includes('pin') ||
    lower.includes('password') ||
    lower.includes('pan card') ||
    lower.includes('kyc update')
  ) {
    indicators.push('Urgent prompt to disclose sensitive identity or banking credentials');
    riskLevel = 'HIGH';
  }

  if (
    lower.includes('http://') ||
    lower.includes('https://') ||
    lower.includes('bit.ly') ||
    lower.includes('tinyurl') ||
    lower.includes('t.co') ||
    lower.includes('link') ||
    lower.includes('click here')
  ) {
    indicators.push('Contains external link or unverified URL redirect');
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
  }

  if (
    lower.includes('urgent') ||
    lower.includes('immediately') ||
    lower.includes('call now') ||
    lower.includes('within 24 hours') ||
    lower.includes('within 1 hour')
  ) {
    indicators.push('High-pressure psychological time constraint');
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
  }

  if (indicators.length === 0) {
    return {
      riskLevel: 'LOW',
      riskIndicators: [
        'No common phishing keywords or high-urgency threats detected',
        'Language appears consistent with standard informational notices',
      ],
      explanation:
        'The message text does not exhibit prominent high-risk red flags like threats of immediate blockage, lottery promises, or demands for security codes.',
      safetyRecommendations: [
        "Always confirm notifications through your bank's official mobile app or verified branch number.",
        'Never share OTPs, PINs, or banking passwords over phone or text.',
        'Avoid clicking links sent from unknown or unverified senders.',
      ],
    };
  }

  const isHigh = riskLevel === 'HIGH';
  return {
    riskLevel,
    riskIndicators: indicators.slice(0, 4),
    explanation: isHigh
      ? 'This message displays multiple characteristics commonly associated with suspicious financial scams, including artificial urgency and requests for unverified action.'
      : 'This message contains elements requiring caution, such as unverified links or time-sensitive claims.',
    safetyRecommendations: [
      'Do NOT click any links or download any files attached to this message.',
      'Never share OTPs, passwords, UPI PINs, or CVVs with anyone.',
      'Verify the authenticity of this claim by contacting the official institution directly using their known phone number or official app.',
      'Report suspicious messages to your service provider or cyber crime portal.',
    ],
  };
}

export function getClientBudgetFallback(inputs: BudgetInputs): BudgetAnalysisResult {
  const food = Math.max(0, inputs.expenses.food || 0);
  const transport = Math.max(0, inputs.expenses.transport || 0);
  const bills = Math.max(0, inputs.expenses.bills || 0);
  const shopping = Math.max(0, inputs.expenses.shopping || 0);
  const education = Math.max(0, inputs.expenses.education || 0);
  const other = Math.max(0, inputs.expenses.other || 0);

  const totalExpenses = food + transport + bills + shopping + education + other;
  const income = Math.max(0, inputs.income || 0);
  const remainingBalance = income - totalExpenses;
  const surplusPct = income > 0 ? (remainingBalance / income) * 100 : 0;
  const isSurplus = remainingBalance >= 0;

  // Find highest category
  const categoryMap: { name: string; amount: number }[] = [
    { name: 'Bills & Rent', amount: bills },
    { name: 'Food & Groceries', amount: food },
    { name: 'Shopping & Discretionary', amount: shopping },
    { name: 'Transport & Fuel', amount: transport },
    { name: 'Education & Learning', amount: education },
    { name: 'Other Expenses', amount: other },
  ];
  categoryMap.sort((a, b) => b.amount - a.amount);
  const highest = categoryMap[0] || { name: 'Expenses', amount: 0 };
  const highestPct = totalExpenses > 0 ? ((highest.amount / totalExpenses) * 100).toFixed(1) : '0';

  return {
    summary: isSurplus
      ? `Your monthly income of ₹${income.toLocaleString()} covers your ₹${totalExpenses.toLocaleString()} expenses, creating a monthly surplus of ₹${remainingBalance.toLocaleString()} (${surplusPct.toFixed(1)}% savings rate).`
      : `Your expenses (₹${totalExpenses.toLocaleString()}) currently exceed monthly income (₹${income.toLocaleString()}) by ₹${Math.abs(remainingBalance).toLocaleString()}. Trimming flexible spending will restore balance.`,
    highestSpendingCategory: `${highest.name} (₹${highest.amount.toLocaleString()} - ${highestPct}% of overall expenses)`,
    observations: [
      `Your largest spending driver is ${highest.name}, taking up ${highestPct}% of total outflow.`,
      `You are currently allocating ${surplusPct > 0 ? surplusPct.toFixed(1) : 0}% of net earnings toward savings and reserve funds.`,
      food > 0 ? `Food & dining represents ₹${food.toLocaleString()} (${totalExpenses > 0 ? ((food / totalExpenses) * 100).toFixed(1) : 0}% of expenses).` : 'Discretionary expenses are relatively controlled.',
    ],
    suggestions: [
      isSurplus
        ? 'Aim to route a steady portion of your surplus into an emergency liquidity reserve covering 3 months of basic living costs.'
        : 'Review discretionary subscriptions and non-essential shopping to close the immediate deficit gap.',
      'Track variable day-to-day transactions with weekly checkpoints to stay within your targets.',
      'Explore the 50/30/20 guideline (50% Needs, 30% Wants, 20% Savings) to systematically balance monthly priorities.',
    ],
    remainingMoneyAdvice: isSurplus
      ? `With ₹${remainingBalance.toLocaleString()} left each month, consider keeping ₹${Math.round(remainingBalance * 0.5).toLocaleString()} in a liquid emergency account and investing the rest in low-cost index funds or fixed deposits.`
      : 'Focus on stabilizing your monthly cash flow before taking on discretionary debt or non-essential commitments.',
  };
}

export function getClientExplainerFallback(question: string, language: ExplainerLanguage): ExplainerResult {
  const isHindi = language === 'hi';
  const lower = question.toLowerCase();

  if (lower.includes('compound') || lower.includes('चक्रवृद्धि') || lower.includes('ब्याज')) {
    return isHindi
      ? {
          simpleExplanation: 'चक्रवृद्धि ब्याज (Compound Interest) का मतलब है कि आपको न केवल आपकी मूल राशि पर ब्याज मिलता है, बल्कि जो ब्याज पहले जुड़ चुका है, उस पर भी नया ब्याज मिलता है।',
          example: 'जैसे अगर आप ₹100 जमा करते हैं और 10% ब्याज मिलता है, तो पहले साल ₹110 होंगे। अगले साल ब्याज ₹100 पर नहीं, बल्कि ₹110 पर मिलेगा यानी ₹11।',
          keyTakeaway: 'जितनी जल्दी आप बचत और निवेश शुरू करेंगे, चक्रवृद्धि ब्याज उतना ही अधिक लाभ देगा।',
        }
      : {
          simpleExplanation: 'Compound interest is interest earned on both your initial principal money and on the accumulated interest from previous periods.',
          example: 'If you save ₹1,000 at 10% annual interest, you earn ₹100 in year one. In year two, you earn 10% on ₹1,100, which is ₹110, accelerating your growth exponentially.',
          keyTakeaway: 'Starting early gives compounding more time to multiply your savings naturally.',
        };
  }

  if (lower.includes('emi') || lower.includes('ईएमआई') || lower.includes('loan') || lower.includes('किस्त')) {
    return isHindi
      ? {
          simpleExplanation: 'EMI (Equated Monthly Installment) वह तय मासिक राशि है जो आप किसी बैंक या वित्तीय संस्था को अपना लोन चुकाने के लिए हर महीने देते हैं।',
          example: 'जैसे ₹50,000 का फोन खरीदते समय पूरी राशि एक साथ देने के बजाय आप हर महीने ₹5,000 की 10 किस्तें चुकाते हैं।',
          keyTakeaway: 'हमेशा सुनिश्चित करें कि आपकी सभी कुल EMI आपके मासिक वेतन के 30-40% से अधिक न हों।',
        }
      : {
          simpleExplanation: 'An EMI (Equated Monthly Installment) is a fixed monthly payment made by a borrower to a lender to pay off a loan over a set schedule.',
          example: 'Instead of paying ₹60,000 all at once for a vehicle or appliance, you pay ₹5,000 every month for 12 months with agreed interest.',
          keyTakeaway: 'Keep your total monthly EMIs well below 35% of your take-home pay to maintain financial peace of mind.',
        };
  }

  if (lower.includes('inflation') || lower.includes('महंगाई') || lower.includes('मुद्रास्फीति')) {
    return isHindi
      ? {
          simpleExplanation: 'मुद्रास्फीति (Inflation) का अर्थ है समय के साथ वस्तुओं और सेवाओं की कीमतों में सामान्य वृद्धि, जिससे पैसे की क्रय शक्ति घट जाती है।',
          example: 'जो समोसा या दूध का पैकेट 10 साल पहले ₹10 में मिलता था, वह आज ₹25 का मिलता है। इसे ही महंगाई कहते हैं।',
          keyTakeaway: 'केवल पैसे को नकद रखने के बजाय ऐसे साधनों में निवेश करें जो महंगाई दर से अधिक रिटर्न देते हों।',
        }
      : {
          simpleExplanation: 'Inflation is the gradual increase in the prices of goods and services over time, reducing what your money can buy.',
          example: 'If a movie ticket cost ₹100 five years ago and costs ₹200 today, inflation has diminished the purchasing power of that hundred-rupee note.',
          keyTakeaway: 'Invest your long-term savings in assets that beat the inflation rate to protect your future purchasing power.',
        };
  }

  if (lower.includes('credit score') || lower.includes('cibil') || lower.includes('क्रेडिट स्कोर')) {
    return isHindi
      ? {
          simpleExplanation: 'क्रेडिट स्कोर 300 से 900 के बीच का 3-अंकों का नंबर होता है जो यह दर्शाता है कि आप समय पर लोन और बिल चुकाने में कितने विश्वसनीय हैं।',
          example: 'यह स्कूल के रिपोर्ट कार्ड जैसा है। अच्छा स्कोर (750+) होने पर बैंक आपको कम ब्याज दर पर तुरंत लोन देते हैं।',
          keyTakeaway: 'क्रेडिट कार्ड बिल और लोन की किस्तें हमेशा समय पर भरें ताकि आपका स्कोर 750 से ऊपर बना रहे।',
        }
      : {
          simpleExplanation: 'A credit score (typically between 300 and 900) is a three-digit number summarizing your creditworthiness and repayment history.',
          example: 'Think of it as a financial report card. A high score (750+) tells lenders you are reliable, unlocking lower loan interest rates and fast approvals.',
          keyTakeaway: 'Pay credit card dues and EMI installments in full on time to maintain a strong 750+ score.',
        };
  }

  return isHindi
    ? {
        simpleExplanation: `"${question}" एक महत्वपूर्ण वित्तीय विषय है जो आपके पैसे के प्रबंधन, बचत और वित्तीय सुरक्षा से सीधे जुड़ा हुआ है।`,
        example: 'दैनिक जीवन में जैसे हम अपनी आय और खर्चों का हिसाब रखकर बजट बनाते हैं, वैसे ही सही वित्तीय जानकारी हमें बेहतर निर्णय लेने में मदद करती है।',
        keyTakeaway: 'वित्तीय साक्षरता और नियमित बचत की आदतें आपको वित्तीय स्वतंत्रता की ओर ले जाती हैं।',
      }
    : {
        simpleExplanation: `Understanding "${question}" is a key foundation for sound personal financial management and smart long-term decision making.`,
        example: 'Much like planning household expenses before shopping, knowing how financial principles work helps you avoid unnecessary costs and make informed choices.',
        keyTakeaway: 'Cultivating consistent financial literacy habits empowers you to build durable wealth and security.',
      };
}
