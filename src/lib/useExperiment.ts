import { useState, useEffect } from 'react'
import { experiment, resetVisitorSession, type Variant, type ExperimentTelemetry } from './flagsmith'

export function useExperiment() {
  const [variant, setVariant] = useState<Variant>('control')
  const [telemetry, setTelemetry] = useState<ExperimentTelemetry>(experiment.getTelemetry())

  useEffect(() => {
    let mounted = true
    experiment.init().then(() => {
      experiment.getVariant().then((v) => {
        if (mounted) {
          setVariant(v)
          setTelemetry(experiment.getTelemetry())
        }
      })
    })
    return () => {
      mounted = false
    }
  }, [])

  const recordExposure = () => {
    void experiment.recordExposure().then(() => {
      setTelemetry({ ...experiment.getTelemetry() })
    })
  }

  const recordConversion = () => {
    void experiment.recordConversion().then(() => {
      setTelemetry({ ...experiment.getTelemetry() })
    })
  }

  const resetSession = () => {
    const newId = resetVisitorSession()
    experiment.reidentify(newId)
    experiment.getVariant().then((v) => {
      setVariant(v)
      setTelemetry(experiment.getTelemetry())
    })
  }

  return {
    variant,
    telemetry,
    recordExposure,
    recordConversion,
    resetSession,
  }
}
