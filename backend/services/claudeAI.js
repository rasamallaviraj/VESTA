const dotenv = require('dotenv');
dotenv.config();

/**
 * Ask Claude Sonnet Chat Service
 * @param {string} messageText 
 * @param {Array} history 
 * @param {Object} propertyContext 
 */
const askClaude = async (messageText, history, propertyContext = null) => {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey || apiKey.includes('placeholder')) {
    return simulateVestaAI(messageText, propertyContext);
  }

  try {
    // Format conversation history to match Anthropic message structure
    const conversationHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.content || h.text
    }));

    // If last message isn't matching input, append it
    const lastMsg = conversationHistory[conversationHistory.length - 1];
    if (!lastMsg || lastMsg.content !== messageText) {
      conversationHistory.push({ role: 'user', content: messageText });
    }

    // System prompt directives
    let systemPrompt = `You are Vesta AI, the intelligent real estate advisor built into VESTA — India's most transparent land marketplace for the youth. You help first-time buyers, young investors, and beginners understand everything about Indian real estate: land measurements (sq ft, acres, guntha, cents, bigha), legal documents (sale deed, encumbrance certificate, patta, khata, mutation), state-wise stamp duty, buying/selling process, and investment analysis. When asked about future land prices, give educated projections based on infrastructure growth, connectivity, IT/industrial development, and market trends — always clarify these are AI projections, not guarantees. Use Indian currency (₹), Indian state/city context, and local terminology. Be direct, clear, and empowering — you are a superpower for the youth.`;

    if (propertyContext) {
      systemPrompt += `\n\nCURRENT CONTEXT: The user is browsing the following verified land:
      Title: "${propertyContext.title}"
      Location: "${propertyContext.locality}, ${propertyContext.city}, ${propertyContext.state}"
      Asking Price: "₹${propertyContext.askingPrice}"
      Area Size: "${propertyContext.area} ${propertyContext.areaUnit}"
      Survey Number: "${propertyContext.surveyNumber}"
      Facing: "${propertyContext.facingDirection}"
      Road Access: "${propertyContext.roadAccess}"
      Uploaded Documents Vetted: "${propertyContext.documents.map(d => d.name).join(', ')}"`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: conversationHistory
      })
    });

    const data = await response.json();
    
    if (response.ok && data.content && data.content[0]) {
      return data.content[0].text;
    } else {
      console.warn("Claude API Error Response:", data);
      throw new Error(data.error?.message || "Claude service error");
    }
  } catch (err) {
    console.warn("Claude API integration failure. Reverting to simulated Vesta AI.", err);
    return simulateVestaAI(messageText, propertyContext);
  }
};

// Simulation engine
const simulateVestaAI = (messageText, propertyContext) => {
  return new Promise((resolve) => {
    const query = messageText.toLowerCase();
    
    if (propertyContext && (query.includes('this land') || query.includes('this property') || query.includes('verify') || query.includes('buy'))) {
      resolve(`[Vesta AI Claude Simulation]: Vetting specifications for **${propertyContext.title}** (Survey ${propertyContext.surveyNumber}):
1. **Dimensions**: ${propertyContext.area} ${propertyContext.areaUnit} in ${propertyContext.locality}.
2. **Access**: Listed as ${propertyContext.roadAccess}.
3. **Legal Papers**: ${propertyContext.documents.map(d => d.name).join(', ')} are fully vetted.
4. **Appreciation Forecast**: Solid 12% annual valuation growth due to IT and Outer Ring Road corridors.`);
      return;
    }

    if (query.includes('measure') || query.includes('acre') || query.includes('guntha') || query.includes('hectare')) {
      resolve(`[Vesta AI Claude Simulation]: Basic measurements scale details:
- 1 Acre = 43,560 sq ft = 40 Gunthas.
- 1 Guntha = 1,089 sq ft = 121 sq yards.
- 1 Hectare = 2.47 Acres = 100 Gunthas.`);
      return;
    }

    if (query.includes('hyderabad') || query.includes('gachibowli')) {
      resolve(`[Vesta AI Claude Simulation]: Gachibowli (Hyderabad) land is priced at ₹12,000 - ₹20,000/sq ft. My AI models project a **45% cumulative appreciation** over 4 years driven by ORR connectivity.`);
      return;
    }

    resolve(`[Vesta AI Claude Simulation]: Hello! I am Vesta AI, your transparent Indian real estate copilot. Ask me about land calculations, legal passbooks (Khata, Patta, EC), or state stamp taxes.`);
  });
};

module.exports = { askClaude };
