$EnvKey = "FC3H3z2rADBZJZAiLe8q5A"
$ProjectId = 55323

Write-Host "=== PROVISIONING FLAGSMITH EXPERIMENT: CodeCheck ===" -ForegroundColor Cyan

# 1. Create Feature: code_fix_workflow_mode
Write-Host "Creating feature code_fix_workflow_mode..."
flagsmith feature create code_fix_workflow_mode --value "control" --enabled --project $ProjectId

# 2. Add Variant: guided_fix with explicit key
Write-Host "Adding variant guided_fix..."
flagsmith feature variant add code_fix_workflow_mode --value "guided_fix" --key "guided_fix" --weight 0 --project $ProjectId

# 3. Create Metric: code_fix_applied
Write-Host "Creating metric code_fix_applied..."
$metricJson = @"
{
  "name": "Code Fix Applied",
  "aggregation": "occurrence",
  "direction": "up",
  "definition": {
    "version": 1,
    "event": "code_fix_applied"
  }
}
"@
$metricJson | flagsmith api "api/v1/environments/$EnvKey/experiment-metrics/" --method POST --input -

# 4. Fetch Feature and Metric IDs
$features = flagsmith feature list --project $ProjectId --json | ConvertFrom-Json
$feat = $features | Where-Object { $_.name -eq "code_fix_workflow_mode" }
$featureId = $feat.id
$variantId = $feat.variants[0].id

$metrics = flagsmith api "api/v1/environments/$EnvKey/experiment-metrics/" --json | ConvertFrom-Json
$met = $metrics.results | Where-Object { $_.definition.event -eq "code_fix_applied" }
$metricId = $met.id

Write-Host "Feature ID: $featureId, Variant ID: $variantId, Metric ID: $metricId" -ForegroundColor Green

# 5. Create Experiment
$expJson = @"
{
  "feature": $featureId,
  "name": "Code Quality Guided Fix vs Static Checklist",
  "hypothesis": "Adding one-click copyable config files (guided_fix) increases developer remediation action rate (code_fix_applied) over a static diagnostic checklist (control).",
  "metrics": [
    {
      "metric": $metricId,
      "expected_direction": "increase"
    }
  ],
  "experiment_rollout": {
    "enabled": true,
    "rollout_percentage": 100,
    "feature_state_value": {
      "type": "string",
      "value": "control"
    },
    "multivariate_feature_state_values": [
      {
        "multivariate_feature_option": $variantId,
        "percentage_allocation": 50
      }
    ]
  }
}
"@

$exp = $expJson | flagsmith api "api/v1/environments/$EnvKey/experiments/" --method POST --input - | ConvertFrom-Json
$expId = $exp.id
Write-Host "Created Experiment ID: $expId" -ForegroundColor Green

# 6. Start Experiment
flagsmith api "api/v1/environments/$EnvKey/experiments/$expId/start/" --method POST
Write-Host "Started Experiment ID: $expId" -ForegroundColor Green
