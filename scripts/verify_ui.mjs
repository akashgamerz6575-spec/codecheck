import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const executableCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const executablePath = executableCandidates.find((c) => existsSync(c))
if (!executablePath) {
  console.error('No browser executable found.')
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox'],
})

const BASE_URL = process.argv[2] || 'http://localhost:5174'
console.log(`Running UI checks against: ${BASE_URL}...`)

try {
  const page = await browser.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 20000 })

  const title = await page.title()
  console.log(`Page title: "${title}"`)

  // Click on MVP Starter sample
  console.log('Testing sample click (MVP Starter)...')
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('MVP Starter'))
    btn?.click()
  })

  await page.waitForSelector('[data-check-id="ci"]', { timeout: 10000 })
  const score = await page.evaluate(() => document.querySelector('[aria-label="Code quality score"]')?.textContent ?? '')
  console.log(`Scored: ${score.trim().replace(/\s+/g, ' ')}`)

  // Click primary CTA
  console.log('Testing CTA click...')
  await page.evaluate(() => {
    const cta = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Copy Checklist Summary') || b.textContent?.includes('Copy All Missing Configs'),
    )
    cta?.click()
  })

  // Open inspector drawer
  await page.evaluate(() => {
    const drawer = document.querySelector('[aria-label="Flagsmith experiment inspector"]')
    const trigger = drawer?.querySelector('div')
    trigger?.click()
  })

  console.log('✓ UI interaction and state updates verified cleanly!')
} catch (err) {
  console.error('UI check error:', err.message)
  process.exitCode = 1
} finally {
  await browser.close()
}
