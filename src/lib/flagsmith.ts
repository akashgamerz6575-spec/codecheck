import flagsmith from '@flagsmith/flagsmith'

export type Variant = 'control' | 'guided_fix'

export interface ExperimentTelemetry {
  visitorId: string
  variant: Variant
  inExperiment: boolean
  exposureRecorded: boolean
  conversionRecorded: boolean
  exposureTimestamp?: string
  conversionTimestamp?: string
  flagsmithConnected: boolean
}

const VISITOR_ID_KEY = 'codecheck_visitor_id'
const ENV_KEY = import.meta.env.VITE_FLAGSMITH_ENV_KEY || ''

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'cc_ssr_mock'
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = `cc_${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

export function resetVisitorSession(): string {
  if (typeof window === 'undefined') return 'cc_ssr_mock'
  const newId = `cc_${crypto.randomUUID().slice(0, 8)}`
  localStorage.setItem(VISITOR_ID_KEY, newId)
  return newId
}

export class CodeCheckExperiment {
  private client = flagsmith
  private initialized = false
  private currentVisitorId = getOrCreateVisitorId()
  private exposureSent = false
  private conversionSent = false
  private exposureTime?: string
  private conversionTime?: string
  private currentVariant: Variant = 'control'

  public async init(): Promise<void> {
    if (this.initialized) return

    if (!ENV_KEY) {
      console.warn('VITE_FLAGSMITH_ENV_KEY missing, defaulting to control fallback.')
      this.initialized = true
      return
    }

    try {
      await this.client.init({
        environmentID: ENV_KEY,
        enableEvents: true,
        identity: this.currentVisitorId,
      })
      this.initialized = true
    } catch (err) {
      console.error('Flagsmith init failed:', err)
      this.initialized = true
    }
  }

  public async getVariant(): Promise<Variant> {
    // Check dev override: ?preview_variant=control or ?preview_variant=guided_fix
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('preview_variant')
      if (param === 'control' || param === 'guided_fix') {
        this.currentVariant = param
        return param
      }
    }

    if (!ENV_KEY) return 'control'

    try {
      await this.client.identify(this.currentVisitorId)
      const flag = this.client.getExperimentFlag('code_fix_workflow_mode')
      const value = flag?.value
      this.currentVariant = value === 'guided_fix' ? 'guided_fix' : 'control'
      return this.currentVariant
    } catch {
      return 'control'
    }
  }

  public async recordExposure(): Promise<void> {
    if (this.exposureSent) return
    this.exposureSent = true
    this.exposureTime = new Date().toLocaleTimeString()

    if (ENV_KEY) {
      try {
        await this.client.flushEvents()
      } catch (err) {
        console.warn('Flush exposure error:', err)
      }
    }
  }

  public async recordConversion(): Promise<void> {
    if (this.conversionSent) return
    this.conversionSent = true
    this.conversionTime = new Date().toLocaleTimeString()

    if (ENV_KEY) {
      try {
        await this.client.trackEvent('code_fix_applied')
        await this.client.flushEvents()
      } catch (err) {
        console.warn('Track conversion error:', err)
      }
    }
  }

  public getTelemetry(): ExperimentTelemetry {
    return {
      visitorId: this.currentVisitorId,
      variant: this.currentVariant,
      inExperiment: Boolean(ENV_KEY),
      exposureRecorded: this.exposureSent,
      conversionRecorded: this.conversionSent,
      exposureTimestamp: this.exposureTime,
      conversionTimestamp: this.conversionTime,
      flagsmithConnected: Boolean(ENV_KEY),
    }
  }

  public reidentify(newId: string): void {
    this.currentVisitorId = newId
    this.exposureSent = false
    this.conversionSent = false
    this.exposureTime = undefined
    this.conversionTime = undefined
    if (ENV_KEY) {
      void this.client.identify(newId)
    }
  }
}

export const experiment = new CodeCheckExperiment()
