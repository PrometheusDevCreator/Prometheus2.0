#!/usr/bin/env node
/**
 * PROMETHEUS TEST TRIGGERS
 * ========================
 *
 * Automated test triggering based on thresholds and events.
 * Per Prometheus Testing Doctrine.
 *
 * Trigger Types:
 * 1. Manual: npm run test:soc
 * 2. Pre-commit: Runs MT-level tests before commits
 * 3. File change threshold: Auto-runs IT after N file changes
 * 4. Time-based: Scheduled SOC checks
 *
 * Usage:
 *   node scripts/test-triggers.js --check-threshold
 *   node scripts/test-triggers.js --pre-commit
 *   node scripts/test-triggers.js --watch
 */

import { spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const CONFIG = {
  // Number of file changes that triggers an automatic IT
  FILE_CHANGE_THRESHOLD: 10,

  // Number of commits that triggers an IT
  COMMIT_THRESHOLD: 5,

  // State file location
  STATE_FILE: join(__dirname, '..', 'test-results', 'trigger-state.json'),

  // Source directories to watch
  WATCH_DIRS: ['src'],

  // File extensions to track
  WATCH_EXTENSIONS: ['.js', '.jsx', '.ts', '.tsx', '.css']
}

// ============================================
// STATE MANAGEMENT
// ============================================
class TriggerState {
  constructor() {
    this.state = this.loadState()
  }

  loadState() {
    try {
      if (existsSync(CONFIG.STATE_FILE)) {
        return JSON.parse(readFileSync(CONFIG.STATE_FILE, 'utf-8'))
      }
    } catch (e) {
      console.log('[Trigger] Could not load state, using defaults')
    }

    return {
      fileChanges: 0,
      commits: 0,
      lastSOC: null,
      lastIT: null,
      lastMT: null,
      history: []
    }
  }

  saveState() {
    const dir = dirname(CONFIG.STATE_FILE)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(CONFIG.STATE_FILE, JSON.stringify(this.state, null, 2))
  }

  incrementFileChanges(count = 1) {
    this.state.fileChanges += count
    this.saveState()
    return this.state.fileChanges
  }

  incrementCommits() {
    this.state.commits++
    this.saveState()
    return this.state.commits
  }

  resetFileChanges() {
    this.state.fileChanges = 0
    this.saveState()
  }

  resetCommits() {
    this.state.commits = 0
    this.saveState()
  }

  recordTestRun(type) {
    const timestamp = new Date().toISOString()
    this.state[`last${type}`] = timestamp
    this.state.history.push({ type, timestamp })

    // Keep only last 50 history entries
    if (this.state.history.length > 50) {
      this.state.history = this.state.history.slice(-50)
    }

    this.saveState()
  }
}

// ============================================
// TEST RUNNERS
// ============================================
async function runCommand(cmd, args, label) {
  return new Promise((resolve) => {
    console.log(`\n[Trigger] Running ${label}...`)

    const proc = spawn(cmd, args, {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    })

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`[Trigger] ${label} PASSED`)
      } else {
        console.log(`[Trigger] ${label} FAILED (exit code: ${code})`)
      }
      resolve(code)
    })

    proc.on('error', (err) => {
      console.error(`[Trigger] ${label} error: ${err.message}`)
      resolve(1)
    })
  })
}

async function runMT(state) {
  console.log('\n════════════════════════════════════')
  console.log('PROMETHEUS MINOR TESTS (MT)')
  console.log('════════════════════════════════════')

  const exitCode = await runCommand('npx', ['vitest', 'run', '--reporter=verbose'], 'Minor Tests')
  state.recordTestRun('MT')
  return exitCode
}

async function runIT(state) {
  console.log('\n════════════════════════════════════')
  console.log('PROMETHEUS IMPLEMENTATION TESTS (IT)')
  console.log('════════════════════════════════════')

  // Run both unit and e2e tests
  const unitCode = await runCommand('npx', ['vitest', 'run', '--coverage'], 'Unit Tests')
  const e2eCode = await runCommand('npx', ['playwright', 'test'], 'E2E Tests')

  state.recordTestRun('IT')
  state.resetFileChanges()
  state.resetCommits()

  return unitCode === 0 && e2eCode === 0 ? 0 : 1
}

async function runSOC(state, full = false) {
  console.log('\n════════════════════════════════════')
  console.log(`PROMETHEUS SYSTEM OPERATOR CHECK (${full ? 'FULL' : 'STANDARD'})`)
  console.log('════════════════════════════════════')

  const args = full ? ['scripts/run-soc.js', '--full'] : ['scripts/run-soc.js']
  const exitCode = await runCommand('node', args, 'SOC')

  state.recordTestRun('SOC')
  state.resetFileChanges()
  state.resetCommits()

  return exitCode
}

// ============================================
// THRESHOLD CHECKING
// ============================================
function checkThresholds(state) {
  console.log('\n[Trigger] Checking test thresholds...')
  console.log(`  File changes: ${state.state.fileChanges}/${CONFIG.FILE_CHANGE_THRESHOLD}`)
  console.log(`  Commits: ${state.state.commits}/${CONFIG.COMMIT_THRESHOLD}`)

  const needsIT = state.state.fileChanges >= CONFIG.FILE_CHANGE_THRESHOLD ||
                  state.state.commits >= CONFIG.COMMIT_THRESHOLD

  if (needsIT) {
    console.log('\n[Trigger] Threshold reached - IT recommended')
    return 'IT'
  }

  console.log('\n[Trigger] No threshold reached')
  return null
}

// ============================================
// FILE CHANGE DETECTION
// ============================================
function countSourceFiles(dir) {
  let count = 0
  const baseDir = join(__dirname, '..', dir)

  function walk(currentDir) {
    if (!existsSync(currentDir)) return

    const items = readdirSync(currentDir)
    for (const item of items) {
      const fullPath = join(currentDir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath)
      } else if (stat.isFile()) {
        const ext = item.slice(item.lastIndexOf('.'))
        if (CONFIG.WATCH_EXTENSIONS.includes(ext)) {
          count++
        }
      }
    }
  }

  walk(baseDir)
  return count
}

// ============================================
// COMMAND LINE INTERFACE
// ============================================
const args = process.argv.slice(2)
const state = new TriggerState()

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Prometheus Test Triggers

Usage:
  node scripts/test-triggers.js [options]

Options:
  --pre-commit      Run MT before commit (for git hook)
  --check-threshold Check if IT is needed based on changes
  --run-mt          Run Minor Tests
  --run-it          Run Implementation Tests
  --run-soc         Run standard SOC
  --run-soc-full    Run full SOC
  --status          Show current trigger state
  --reset           Reset all counters
  --record-change   Record a file change
  --record-commit   Record a commit

Configuration:
  File change threshold: ${CONFIG.FILE_CHANGE_THRESHOLD}
  Commit threshold: ${CONFIG.COMMIT_THRESHOLD}
`)
    return
  }

  if (args.includes('--status')) {
    console.log('\n[Trigger] Current State:')
    console.log(JSON.stringify(state.state, null, 2))
    return
  }

  if (args.includes('--reset')) {
    state.resetFileChanges()
    state.resetCommits()
    console.log('[Trigger] Counters reset')
    return
  }

  if (args.includes('--record-change')) {
    const newCount = state.incrementFileChanges()
    console.log(`[Trigger] File changes: ${newCount}`)

    // Check if threshold reached
    if (newCount >= CONFIG.FILE_CHANGE_THRESHOLD) {
      console.log('[Trigger] File change threshold reached!')
      console.log('[Trigger] Run "npm run test:it" to execute Implementation Tests')
    }
    return
  }

  if (args.includes('--record-commit')) {
    const newCount = state.incrementCommits()
    console.log(`[Trigger] Commits: ${newCount}`)

    if (newCount >= CONFIG.COMMIT_THRESHOLD) {
      console.log('[Trigger] Commit threshold reached!')
      console.log('[Trigger] Run "npm run test:it" to execute Implementation Tests')
    }
    return
  }

  if (args.includes('--pre-commit')) {
    console.log('[Trigger] Pre-commit hook - running MT...')
    const exitCode = await runMT(state)
    state.incrementCommits()
    process.exit(exitCode)
  }

  if (args.includes('--check-threshold')) {
    const recommendation = checkThresholds(state)
    if (recommendation === 'IT') {
      console.log('\nTo run Implementation Tests: npm run test:it')
    }
    return
  }

  if (args.includes('--run-mt')) {
    const exitCode = await runMT(state)
    process.exit(exitCode)
  }

  if (args.includes('--run-it')) {
    const exitCode = await runIT(state)
    process.exit(exitCode)
  }

  if (args.includes('--run-soc')) {
    const exitCode = await runSOC(state, false)
    process.exit(exitCode)
  }

  if (args.includes('--run-soc-full')) {
    const exitCode = await runSOC(state, true)
    process.exit(exitCode)
  }

  // Default: show status and recommendation
  console.log('\nPrometheus Test Trigger System')
  console.log('==============================')
  checkThresholds(state)
  console.log('\nLast test runs:')
  console.log(`  MT:  ${state.state.lastMT || 'Never'}`)
  console.log(`  IT:  ${state.state.lastIT || 'Never'}`)
  console.log(`  SOC: ${state.state.lastSOC || 'Never'}`)
  console.log('\nRun with --help for options')
}

main().catch(err => {
  console.error('[Trigger] Fatal error:', err)
  process.exit(1)
})
