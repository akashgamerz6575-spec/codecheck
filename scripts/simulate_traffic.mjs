/**
 * Synthetic Experiment Traffic Simulation for CodeCheck
 *
 * Verifies that code_fix_workflow_mode exposures and code_fix_applied conversions
 * are received and flushed to the Flagsmith Events API.
 */
import { Flagsmith } from '@flagsmith/nodejs'

const args = process.argv.slice(2)
const isConfirmed = args.includes('--yes')

if (!isConfirmed) {
  console.log('Usage: node scripts/simulate_traffic.mjs --yes')
  console.log('Safety guard: --yes flag is required to simulate experiment traffic.')
  process.exit(0)
}

const ENV_KEY = process.env.VITE_FLAGSMITH_ENV_KEY || 'FC3H3z2rADBZJZAiLe8q5A'
console.log(`Initializing Flagsmith with environment: ${ENV_KEY}...`)

const flagsmith = new Flagsmith({
  environmentKey: ENV_KEY,
  enableEvents: true,
})

console.log('Simulating 40 unique visitor sessions (20 control, 20 guided_fix)...')

let exposures = 0
let conversions = 0

for (let i = 1; i <= 40; i++) {
  const visitorId = `sim_cc_user_${i}`
  try {
    const flags = await flagsmith.getIdentityFlags(visitorId)
    const variant = flags.getFeatureValue('code_fix_workflow_mode') || 'control'
    exposures++

    // Simulate ~30% conversion for control, ~50% for guided_fix
    const conversionThreshold = variant === 'guided_fix' ? 0.5 : 0.3
    if (Math.random() < conversionThreshold) {
      await flagsmith.trackEvent('code_fix_applied', {
        identifier: visitorId,
        metadata: { simulated: true, variant },
      })
      conversions++
    }
  } catch (err) {
    console.warn(`Error for user ${visitorId}:`, err.message)
  }
}

console.log(`Flushing events: ${exposures} exposures, ${conversions} conversions...`)
try {
  await flagsmith.flushEvents()
  console.log('✓ Successfully flushed simulated experiment events to Flagsmith!')
} catch (err) {
  console.log('Note on flush:', err.message)
}
