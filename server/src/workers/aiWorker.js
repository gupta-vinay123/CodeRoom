const { Worker } = require('bullmq');
const Groq = require('groq-sdk');
const redis = require('../config/redis');
const { getIO } = require('../socket/index');
const bullmqConnection = require('../config/bullmqRedis');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PROMPTS = {
  hint: (code, problem) => ({
  system: `You are a coding interview assistant reviewing a candidate's code.
Analyze their code and return a structured hint in EXACTLY this format:

Approach
Current: [comma separated list of techniques the candidate is currently using]
Suggested: [comma separated list of better/optimal techniques they should consider]

Key Idea: [one sentence describing the core insight needed to solve this optimally]

Consider: [one specific actionable question that nudges them toward the optimal approach without giving it away]

Rules:
- Never write actual code
- Never reveal the full solution  
- Keep Consider question under 2 sentences
- Be specific to their actual code, not generic`,

  user: `Problem: ${problem || 'Not specified'}\n\nCandidate's current code:\n${code}\n\nGive a structured hint.`,
}),

  review: (code, language) => ({
  system: `You are a senior software engineer conducting a post-interview code review.
Analyze the candidate's code and return a structured review in EXACTLY this format:

## Overall Verdict
[One sentence summary: Hire / Strong Hire / No Hire / Borderline — with one line reason]

## Correctness
[Does it solve the problem correctly? Any edge cases missed? Be specific.]

## Time Complexity
[State the complexity e.g. O(n). Explain why in one sentence.]

## Space Complexity  
[State the complexity e.g. O(n). Explain why in one sentence.]

## Code Quality
[3-5 bullet points on readability, naming, structure, best practices]

## What Was Done Well
[2-3 specific things the candidate did right — be genuine not generic]

## Areas for Improvement
[2-3 specific actionable improvements with brief explanation]

Rules:
- Be concise — each section max 3-4 lines
- No code blocks unless absolutely necessary
- Be direct and honest like a real interviewer
- Reference the actual code, not generic advice`,

  user: `Language: ${language}\n\nCode:\n${code}\n\nProvide a structured post-interview code review.`,
}),

  explain: (code) => ({
    system: `You are a patient coding tutor. Explain what this code does line by line 
in simple terms. Avoid jargon.`,
    user: `Explain this code:\n${code}`,
  }),

  followup: (code, problem) => ({
    system: `You are an experienced technical interviewer. Based on the candidate's code, 
suggest 3 follow-up questions that probe deeper understanding. 
Return as a numbered list only.`,
    user: `Problem: ${problem || 'Not specified'}\n\nCandidate code:\n${code}\n\nSuggest follow-up questions.`,
  }),
};

const worker = new Worker('ai-queue', async (job) => {
  const { type, roomId, code, language, problem, targetUserId } = job.data;

  const promptFn = PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown AI job type: ${type}`);

  const { system, user } = promptFn(code, problem || '', language || '');

  const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile', 
        max_tokens: 1024,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
    });

  const result = response.choices[0].message.content;


  const io = getIO();
  if (targetUserId) {
    const sockets = await io.in(roomId).fetchSockets();
    const target = sockets.find((s) => s.user?.id === targetUserId);
    if (target) target.emit(`ai:${type}`, { result });
  } else {
    io.to(roomId).emit(`ai:${type}`, { result });
  }

  
  if (type === 'review') {
    const Room = require('../models/Room.model');
    await Room.findOneAndUpdate({ roomId }, { codeReview: result });
  }

  return result;
}, { connection: bullmqConnection });

worker.on('failed', (job, err) => {
  console.error(`AI job ${job.id} failed:`, err.message);
  try {
    getIO().to(job.data.roomId).emit('ai:error', { message: 'AI request failed' });
  } catch {}
});

console.log('AI worker started');
module.exports = worker;