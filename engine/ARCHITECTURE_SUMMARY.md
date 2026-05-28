[Client/Input]
      ↓
[n8n Orchestrator]
      ↓
[Claude Decision Engine]
      ↓
[Workers: validate → compute → substitute]
      ↓
[PostgreSQL Source of Truth]
      ↓
[UI: Coda or Custom Frontend]
      ↓
[Logs & Readiness]
      ↺ (feedback to orchestrator)