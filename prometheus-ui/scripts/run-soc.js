#!/usr/bin/env node
/**
 * PROMETHEUS SYSTEM OPERATOR CHECK (SOC) RUNNER
 * ==============================================
 *
 * Implements the Prometheus Testing Doctrine for SOC-level verification.
 *
 * Usage:
 *   npm run test:soc          - Run standard SOC
 *   npm run test:soc:full     - Run full exhaustive SOC
 *   node scripts/run-soc.js --full --report
 *
 * SOC Scope (per Testing Doctrine):
 *   - UI & Interaction: Every button, toggle, dropdown exercised
 *   - State & Logic: Cross-page navigation, profile switching, persistence
 *   - Data Integrity: No silent data loss, no orphaned state
 *   - Behaviour Under Misuse: Rapid clicking, incomplete configs
 */

import { spawn } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const isFullSOC = args.includes('--full')
const generateReport = args.includes('--report') || true // Always generate report

const SOC_CONFIG = {
  standard: {
    name: 'Standard SOC',
    vitestArgs: ['run', '--reporter=verbose'],
    playwrightArgs: ['test', '--reporter=list,json'],
    timeout: 300000 // 5 minutes
  },
  full: {
    name: 'Full Exhaustive SOC',
    vitestArgs: ['run', '--reporter=verbose', '--coverage'],
    playwrightArgs: ['test', '--reporter=list,json,html', '--retries=1'],
    timeout: 600000 // 10 minutes
  }
}

const config = isFullSOC ? SOC_CONFIG.full : SOC_CONFIG.standard

class SOCRunner {
  constructor() {
    this.startTime = new Date()
    this.results = {
      socType: config.name,
      startTime: this.startTime.toISOString(),
      endTime: null,
      duration: null,
      unitTests: { passed: 0, failed: 0, skipped: 0, errors: [] },
      e2eTests: { passed: 0, failed: 0, skipped: 0, errors: [] },
      coverage: null,
      overallStatus: 'PENDING',
      failures: [],
      knownIssues: []
    }
  }

  log(message, type = 'info') {
    const prefix = {
      info: '\x1b[36m[SOC]\x1b[0m',
      success: '\x1b[32m[SOC ✓]\x1b[0m',
      error: '\x1b[31m[SOC ✗]\x1b[0m',
      warning: '\x1b[33m[SOC ⚠]\x1b[0m'
    }
    console.log(`${prefix[type] || prefix.info} ${message}`)
  }

  async runCommand(cmd, args, label) {
    return new Promise((resolve) => {
      this.log(`Running ${label}...`)

      const proc = spawn(cmd, args, {
        cwd: join(__dirname, '..'),
        stdio: 'inherit',
        shell: true
      })

      proc.on('close', (code) => {
        if (code === 0) {
          this.log(`${label} completed successfully`, 'success')
        } else {
          this.log(`${label} completed with errors (exit code: ${code})`, 'error')
        }
        resolve(code)
      })

      proc.on('error', (err) => {
        this.log(`${label} failed to start: ${err.message}`, 'error')
        resolve(1)
      })
    })
  }

  async runUnitTests() {
    this.log('═══════════════════════════════════════')
    this.log('PHASE 1: Unit & Component Tests (Vitest)')
    this.log('═══════════════════════════════════════')

    const exitCode = await this.runCommand('npx', ['vitest', ...config.vitestArgs], 'Vitest')

    if (exitCode !== 0) {
      this.results.unitTests.failed++
      this.results.failures.push({
        phase: 'Unit Tests',
        message: `Vitest exited with code ${exitCode}`
      })
    } else {
      this.results.unitTests.passed++
    }

    return exitCode
  }

  async runE2ETests() {
    this.log('═══════════════════════════════════════')
    this.log('PHASE 2: E2E Tests (Playwright)')
    this.log('═══════════════════════════════════════')

    const exitCode = await this.runCommand('npx', ['playwright', ...config.playwrightArgs], 'Playwright')

    if (exitCode !== 0) {
      this.results.e2eTests.failed++
      this.results.failures.push({
        phase: 'E2E Tests',
        message: `Playwright exited with code ${exitCode}`
      })
    } else {
      this.results.e2eTests.passed++
    }

    return exitCode
  }

  generateReport() {
    const endTime = new Date()
    this.results.endTime = endTime.toISOString()
    this.results.duration = `${((endTime - this.startTime) / 1000).toFixed(1)}s`

    // Determine overall status
    const hasFailures = this.results.failures.length > 0
    this.results.overallStatus = hasFailures ? 'FAILED' : 'PASSED'

    // Ensure test-results directory exists
    const reportDir = join(__dirname, '..', 'test-results')
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true })
    }

    // Generate timestamp for filename
    const timestamp = this.startTime.toISOString().replace(/[:.]/g, '-').slice(0, 19)

    // JSON Report
    const jsonPath = join(reportDir, `soc-report-${timestamp}.json`)
    writeFileSync(jsonPath, JSON.stringify(this.results, null, 2))

    // Text Report (SOC Report per Testing Doctrine)
    const textReport = this.generateTextReport()
    const textPath = join(reportDir, `soc-report-${timestamp}.txt`)
    writeFileSync(textPath, textReport)

    // Also write latest report
    writeFileSync(join(reportDir, 'soc-report-latest.json'), JSON.stringify(this.results, null, 2))
    writeFileSync(join(reportDir, 'soc-report-latest.txt'), textReport)

    this.log(`Reports generated: ${jsonPath}`)
    return this.results
  }

  generateTextReport() {
    const divider = '═'.repeat(60)
    const thinDivider = '─'.repeat(60)

    return `
${divider}
PROMETHEUS SYSTEM OPERATOR CHECK (SOC) REPORT
${divider}

SOC Type:      ${this.results.socType}
Start Time:    ${this.results.startTime}
End Time:      ${this.results.endTime}
Duration:      ${this.results.duration}

${thinDivider}
OVERALL STATUS: ${this.results.overallStatus === 'PASSED' ? '✓ PASSED' : '✗ FAILED'}
${thinDivider}

SCOPE OF CHECKS PERFORMED
${thinDivider}
• Unit Tests (Vitest)
  - Component rendering validation
  - State management logic
  - Data transformation functions
  - Event handler behavior

• E2E Tests (Playwright)
  - Page navigation flows
  - Button and interaction testing
  - Form input validation
  - Cross-page state persistence
  - Visual element verification
  - Data entry points
  - Color and styling validation

${thinDivider}
FAILURES DETECTED
${thinDivider}
${this.results.failures.length === 0
  ? 'None'
  : this.results.failures.map((f, i) => `${i + 1}. [${f.phase}] ${f.message}`).join('\n')}

${thinDivider}
FIXES APPLIED
${thinDivider}
N/A - Automated test run (no fixes applied during SOC)

${thinDivider}
KNOWN REMAINING ISSUES
${thinDivider}
${this.results.knownIssues.length === 0
  ? 'None identified during this SOC'
  : this.results.knownIssues.join('\n')}

${divider}
END OF SOC REPORT
${divider}
Generated by Prometheus Testing Framework
Per Prometheus Testing Doctrine v1.0
`
  }

  printSummary() {
    console.log('')
    this.log('═══════════════════════════════════════')
    this.log('SOC SUMMARY')
    this.log('═══════════════════════════════════════')

    if (this.results.overallStatus === 'PASSED') {
      this.log(`Status: PASSED ✓`, 'success')
    } else {
      this.log(`Status: FAILED ✗`, 'error')
      this.results.failures.forEach(f => {
        this.log(`  - [${f.phase}] ${f.message}`, 'error')
      })
    }

    this.log(`Duration: ${this.results.duration}`)
    this.log('Reports saved to: test-results/')
    console.log('')
  }

  async run() {
    console.log('')
    this.log('═══════════════════════════════════════')
    this.log(`PROMETHEUS ${config.name.toUpperCase()}`)
    this.log('Per Prometheus Testing Doctrine')
    this.log('═══════════════════════════════════════')
    console.log('')

    // Run test phases
    await this.runUnitTests()
    await this.runE2ETests()

    // Generate report
    if (generateReport) {
      this.generateReport()
    }

    // Print summary
    this.printSummary()

    // Exit with appropriate code
    process.exit(this.results.overallStatus === 'PASSED' ? 0 : 1)
  }
}

// Run SOC
const soc = new SOCRunner()
soc.run().catch(err => {
  console.error('SOC Runner failed:', err)
  process.exit(1)
})
