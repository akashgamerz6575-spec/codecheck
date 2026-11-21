# Flagsmith Experimentation Details

## Experiment Configuration

- **Project ID:** `55323` (Name: `ShipCheck`)
- **Environment Key:** `FC3H3z2rADBZJZAiLe8q5A` (Production)
- **Feature Name:** `code_fix_workflow_mode` (ID: `299186`)
- **Default Value:** `control`
- **Variant:** `guided_fix` (ID: `36229`, Key: `guided_fix`)
- **Metric Name:** `Code Fix Applied` (ID: `317`, Event: `code_fix_applied`, Direction: `increase`)
- **Experiment ID:** `370` (*Status: Running*)
- **Traffic Allocation:** 100% rollout, 50% `control` / 50% `guided_fix`

## Hypothesis

Presenting one-click copyable configuration files (`guided_fix`) next to failing quality checks increases the rate of developer remediation actions (`code_fix_applied`) compared to a static diagnostic audit report (`control`).

## Event Flow

1. **Visitor Identification:** `flagsmith.identify(visitorId)` sets the anonymous visitor identifier.
2. **Exposure:** Recorded when scan results are rendered and evaluated with `flagsmith.getExperimentFlag('code_fix_workflow_mode')`.
3. **Conversion:** Triggered when the user copies any configuration snippet or the full audit report.
4. **Flush:** `flagsmith.flushEvents()` ensures event data reaches Flagsmith immediately.
