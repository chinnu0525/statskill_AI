# Integration Agent Handoff

## Scope
Government learning ecosystem adapters for iGOT and NSSTA/TPAC.

## Contract
Core application code depends on internal interfaces only. MVP uses deterministic mock adapters seeded with representative catalogue records. Real government API credentials/endpoints are configuration concerns and must not be committed.

## Expected operations
- search/filter learning resources
- retrieve course/programme details
- expose competency/topic metadata
- preserve source system and external IDs

## Fallback
If an external service is unavailable, the UI should show catalogue availability status and continue operating against approved local/mock data.
