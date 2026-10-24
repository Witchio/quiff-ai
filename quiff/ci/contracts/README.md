# Quiff attribution contracts

These schemas define the boundary between the local pipeline and the Codex investigation.

- [`failure-input.schema.json`](failure-input.schema.json) describes the failed Kane run and the QA Git context. The raw Kane output is a separate artifact referenced by `failure.log_artifact`; this avoids baking a Kane-specific log format into the contract.
- [`attribution-result.schema.json`](attribution-result.schema.json) describes Codex's evidence-backed conclusion. An inconclusive result has `attribution: null` and `confidence: "none"`.

Both schemas use JSON Schema Draft 2020-12 and version their payloads with `schema_version: "1.0"`. `last_passing_commit_sha` is optional context: when available, it bounds the changes introduced since the last known passing QA run. `tested_commit_sha` is required so the investigation always knows which code was tested.

An attributed result requires a person, ticket, and pull request. The commit SHA is included when the evidence isolates a likely introducing commit; it is `null` when the issue appears to span multiple commits or cannot be pinned to one. The result identifies a person only when the evidence ties them to the likely defect-introducing change and its ticket. It is not a judgment of fault. Evidence entries should point to source records and summarize the factual connection; they should not include private chain-of-thought.
