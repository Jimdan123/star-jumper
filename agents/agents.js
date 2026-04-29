import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'star-jumper', 'src');

// ── provider clients (initialized lazily) ───────────────────────────────────

let _anthropic, _openai, _gemini;

function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}
function getGemini() {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _gemini;
}

// ── provider call wrappers ───────────────────────────────────────────────────

async function callClaude(system, userMessage) {
  const res = await getAnthropic().messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: userMessage }],
  });
  const text = res.content.find(b => b.type === 'text')?.text ?? '';
  return { text, usage: `${res.usage.input_tokens} in / ${res.usage.output_tokens} out` };
}

async function callGPT(system, userMessage) {
  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ],
  });
  const text = res.choices[0]?.message?.content ?? '';
  const u = res.usage;
  return { text, usage: `${u.prompt_tokens} in / ${u.completion_tokens} out` };
}

async function callGemini(system, userMessage) {
  const model = getGemini().getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: system,
  });
  const result = await model.generateContent(userMessage);
  const text = result.response.text();
  const u = result.response.usageMetadata;
  return { text, usage: `${u?.promptTokenCount ?? '?'} in / ${u?.candidatesTokenCount ?? '?'} out` };
}

export const PROVIDERS = {
  claude:  { name: 'Claude (Anthropic)', call: callClaude,  model: 'claude-opus-4-7',      envKey: 'ANTHROPIC_API_KEY' },
  chatgpt: { name: 'ChatGPT (OpenAI)',   call: callGPT,     model: 'gpt-4o',               envKey: 'OPENAI_API_KEY'    },
  gemini:  { name: 'Gemini (Google)',    call: callGemini,  model: 'gemini-2.0-flash',     envKey: 'GEMINI_API_KEY'    },
};

// ── game file context ────────────────────────────────────────────────────────

function loadGameContext() {
  const files = ['levels.js', 'game.js', 'renderer.js', 'physics.js', 'particles.js'];
  return files.map(f => {
    const fp = path.join(SRC, f);
    const content = fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : '(not found)';
    return `=== ${f} ===\n${content}`;
  }).join('\n\n');
}

const GAME_CONTEXT = loadGameContext();

const GAME_SUMMARY = `
Star Jumper is a browser-based canvas platformer (800×500px).
- Physics: gravity 0.52/frame, jump vy=-13.5, max horizontal speed 4.2px/frame
- Player: 24×32px, single jump (jumps<1 check), invincibility frames on hit
- Enemies: patrol platforms, stomping bounces player up (vy=-9), gives 50 points
- Stars: collect all to open exit portal, 10 points each
- 3 levels: Space Station Blues, Jungle Moon, Lava Core
- Vite project in star-jumper/src/, deployed standalone as index.html
`.trim();

// ── agent definitions ────────────────────────────────────────────────────────

export const AGENTS = {
  art: {
    name: 'Art Agent',
    emoji: '🎨',
    provider: 'gemini',
    systemPrompt: `You are the Art Agent for the Star Jumper game development team.
Your specialty: visual design, colors, animations, particle effects, and rendering code.

${GAME_SUMMARY}

You have deep knowledge of the HTML5 Canvas 2D API and the game's renderer.js file.
When asked to make visual changes, output ONLY the specific code changes needed —
exact function bodies or object literals to replace, ready to paste into the source files.
Be concrete: specify file name, what to replace, and the replacement code.
Focus on aesthetics, visual feedback, color palettes, and animation timing.`,
  },

  coding: {
    name: 'Coding Agent',
    emoji: '💻',
    provider: 'claude',
    systemPrompt: `You are the Coding Agent for the Star Jumper game development team.
Your specialty: game logic, physics, mechanics, bug fixes, and JavaScript implementation.

${GAME_SUMMARY}

You have deep knowledge of game.js, physics.js, and particles.js.
When asked to implement features or fix bugs, output ONLY the specific code changes needed —
exact function bodies or snippets to replace, ready to paste into the source files.
Be concrete: specify file name, what to replace, and the replacement code.
Focus on correctness, performance, and clean game mechanics.`,
  },

  design: {
    name: 'Game Design Agent',
    emoji: '🗺️',
    provider: 'chatgpt',
    systemPrompt: `You are the Game Design Agent for the Star Jumper game development team.
Your specialty: level design, difficulty curves, enemy placement, platform layout, and gameplay balance.

${GAME_SUMMARY}

You have deep knowledge of levels.js and how platform coordinates map to the 800×500 canvas.
Platform constraints: max safe jump height ~175px, player needs 50px run-up for long gaps.
When asked to design or tweak levels, output ONLY the specific changes to the LEVELS array in levels.js —
exact object literals ready to paste. Annotate coordinates with brief spatial notes.
Focus on fun, fairness, reachability of all stars, and escalating challenge across levels.`,
  },
};

// ── single agent call ────────────────────────────────────────────────────────

export async function callAgent(agentKey, task, includeFullCode = false) {
  const agent = AGENTS[agentKey];
  if (!agent) throw new Error(`Unknown agent: ${agentKey}`);

  const provider = PROVIDERS[agent.provider];
  const envVal = process.env[provider.envKey];
  if (!envVal) {
    throw new Error(`${provider.name} requires ${provider.envKey} environment variable`);
  }

  const userContent = includeFullCode
    ? `Here is the current game source code for context:\n\n${GAME_CONTEXT}\n\n---\n\nTask: ${task}`
    : `Task: ${task}`;

  const { text, usage } = await provider.call(agent.systemPrompt, userContent);
  return { agent: agent.name, emoji: agent.emoji, provider: provider.name, model: provider.model, text, usage };
}

// ── orchestrator (always Claude — best at coordination) ──────────────────────

const ORCHESTRATOR_SYSTEM = `You are the Orchestrator for a multi-agent Star Jumper game development team.
You coordinate three specialized agents:
- art: visual design, colors, animations, rendering (renderer.js) — powered by Gemini
- coding: game logic, physics, mechanics, bugs (game.js, physics.js) — powered by Claude
- design: level design, difficulty, enemy/star placement (levels.js) — powered by ChatGPT

${GAME_SUMMARY}

Given a task, decide which agents need to work on it and what sub-task each should handle.
Respond with a JSON object:
{
  "plan": "one sentence summary of the approach",
  "tasks": [
    { "agent": "art|coding|design", "task": "specific sub-task for this agent", "needsCode": true|false }
  ]
}
"needsCode" should be true only if the agent needs the full source files to do their job.
Keep tasks focused — each agent should get exactly what it needs to do, nothing more.`;

export async function orchestrate(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Orchestrator requires ANTHROPIC_API_KEY');
  }
  const res = await getAnthropic().messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: ORCHESTRATOR_SYSTEM,
    messages: [{ role: 'user', content: request }],
  });
  const text = res.content.find(b => b.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Orchestrator returned non-JSON: ' + text);
  return JSON.parse(jsonMatch[0]);
}
