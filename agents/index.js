#!/usr/bin/env node
import readline from 'readline';
import { orchestrate, callAgent, AGENTS, PROVIDERS } from './agents.js';

const BANNER = `
╔══════════════════════════════════════════════════════╗
║        STAR JUMPER — Multi-Agent AI System           ║
║  🎨 Art/Gemini · 💻 Coding/Claude · 🗺️ Design/GPT-4o ║
╚══════════════════════════════════════════════════════╝`;

const HELP = `
Commands:
  <task>            — orchestrate task across relevant agents
  art <task>        — Art Agent (Gemini)
  coding <task>     — Coding Agent (Claude)
  design <task>     — Game Design Agent (ChatGPT)
  agents            — show agent/provider assignments
  help              — show this message
  exit / quit       — exit

Required env vars:
  ANTHROPIC_API_KEY   for Claude (Coding Agent + Orchestrator)
  OPENAI_API_KEY      for ChatGPT (Game Design Agent)
  GEMINI_API_KEY      for Gemini (Art Agent)

Examples:
  make the player glow blue when invincible
  coding fix the stomp detection so it feels more forgiving
  design add a fourth level with a crystal cave theme
  art make the exit portal look more dramatic
`;

// ── pretty print ─────────────────────────────────────────────────────────────

function printResult(result) {
  const divider = '─'.repeat(60);
  const providerLabel = `via ${result.provider} (${result.model})`;
  console.log(`\n${result.emoji}  ${result.agent}  [${providerLabel}]`);
  console.log(divider);
  console.log(result.text);
  console.log(divider);
  console.log(`   tokens: ${result.usage}`);
}

function printAgents() {
  console.log('\nAgent assignments:');
  for (const [key, agent] of Object.entries(AGENTS)) {
    const p = PROVIDERS[agent.provider];
    const hasKey = !!process.env[p.envKey];
    const status = hasKey ? '✓' : '✗ (missing ' + p.envKey + ')';
    console.log(`  ${agent.emoji}  ${agent.name.padEnd(20)} → ${p.name} (${p.model})  ${status}`);
  }
}

// ── process a request ────────────────────────────────────────────────────────

async function handleRequest(input) {
  input = input.trim();
  if (!input) return;

  if (input.toLowerCase() === 'agents') {
    printAgents();
    return;
  }

  // Direct agent commands
  const directMatch = input.match(/^(art|coding|design)\s+(.+)/i);
  if (directMatch) {
    const agentKey = directMatch[1].toLowerCase();
    const task = directMatch[2];
    const agent = AGENTS[agentKey];
    console.log(`\n→ ${agent.emoji}  ${agent.name} (${PROVIDERS[agent.provider].name})...`);
    const result = await callAgent(agentKey, task, true);
    printResult(result);
    return;
  }

  // Orchestrated multi-agent (Claude decides routing)
  console.log('\n→ Orchestrating (Claude)...');
  let plan;
  try {
    plan = await orchestrate(input);
  } catch (err) {
    console.error('Orchestrator error:', err.message);
    return;
  }

  console.log(`\n📋 Plan: ${plan.plan}`);
  console.log(`   Agents: ${plan.tasks.map(t => {
    const a = AGENTS[t.agent];
    return `${a.emoji} ${t.agent}`;
  }).join('  +  ')}`);

  for (const subtask of plan.tasks) {
    const agent = AGENTS[subtask.agent];
    console.log(`\n→ ${agent.emoji}  ${agent.name}: ${subtask.task}`);
    const result = await callAgent(subtask.agent, subtask.task, subtask.needsCode);
    printResult(result);
  }
}

// ── interactive REPL ─────────────────────────────────────────────────────────

async function main() {
  // Single-shot mode: node agents/index.js "some task"
  const arg = process.argv.slice(2).join(' ').trim();
  if (arg && arg !== '--interactive') {
    await handleRequest(arg);
    return;
  }

  console.log(BANNER);
  console.log(HELP);
  printAgents();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n> ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const cmd = line.trim().toLowerCase();
    if (cmd === 'exit' || cmd === 'quit') {
      console.log('Bye!');
      rl.close();
      process.exit(0);
    }
    if (cmd === 'help') {
      console.log(HELP);
      rl.prompt();
      return;
    }
    try {
      await handleRequest(line);
    } catch (err) {
      console.error('\nError:', err.message);
    }
    rl.prompt();
  });
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
