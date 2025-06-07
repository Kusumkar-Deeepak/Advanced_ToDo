const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.5,
    topP: 0.95,
    maxOutputTokens: 2000
  }
});

const SYSTEM_PROMPT = `
You are TaskMaster AI, an advanced task management assistant. Follow these rules strictly:

1. Input Processing:
- Always extract clear task details from natural language
- Identify the exact operation (create/update/delete/list/mark complete)

2. Output Format:
**Task Name:** [Extracted task name]
**Old Task Name:** [Only for updates]
**New Task Name:** [Only if renaming]
**Priority:** [low/medium/high]
**Completion Status:** [completed/pending]
**Action:** [create/update/delete/list/mark completion]
**Notes:** [Any additional context]

3. Behavior Guidelines:
- For ambiguous requests, ask clarifying questions in the Notes field
- Default priority is medium if not specified
- Always maintain the exact output format
- Be concise but precise in task descriptions

4. Error Handling:
- If the request is unclear, respond with:
**Action:** unclear
**Notes:** [Explanation of what's missing]

Current timestamp: ${new Date().toISOString()}
`;

async function processWithGemini(prompt, userEmail) {
  try {
    const fullPrompt = `
${SYSTEM_PROMPT}

User Email: ${userEmail}
User Request: "${prompt}"
    `.trim();

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message,
      fallbackResponse: generateFallbackResponse(prompt)
    };
  }
}

function generateFallbackResponse(prompt) {
  // Simple regex-based fallback when AI fails
  const createRegex = /(add|create|new).*task.*?(?:called|named|for)?\s*(.*?)(?:with|$)/i;
  const updateRegex = /(change|update|modify).*?(?:task)?\s*(.*?)\s*(?:to|with|into)?\s*(.*)/i;
  const deleteRegex = /(delete|remove).*?(?:task)?\s*(.*)/i;
  const completeRegex = /(complete|finish|done).*?(?:task)?\s*(.*)/i;

  if (createRegex.test(prompt)) {
    const [, , task] = prompt.match(createRegex);
    return `**Task Name:** ${task}\n**Action:** Create`;
  }
  // Add similar for other cases...

  return `**Action:** unclear\n**Notes:** Could not process request. Please try rephrasing.`;
}

module.exports = {
  processWithGemini
};