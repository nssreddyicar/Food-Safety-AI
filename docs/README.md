# Documentation

## Purpose
Architecture documentation, workflow diagrams, API documentation,
and legal/audit notes.

## What This Folder MUST Contain
- Architecture diagrams
- Workflow documentation
- API documentation
- Legal compliance notes
- Onboarding guides

## Structure
```
docs/
├── architecture/        # System architecture
│   ├── overview.md
│   ├── data-flow.md
│   └── diagrams/
├── workflows/           # Business workflows
│   ├── inspection-workflow.md
│   ├── sample-workflow.md
│   └── prosecution-workflow.md
├── api/                 # API documentation
│   ├── endpoints.md
│   └── authentication.md
├── legal/               # Legal & compliance
│   ├── data-retention.md
│   ├── audit-requirements.md
│   └── court-admissibility.md
└── onboarding/          # Developer guides
    ├── getting-started.md
    └── contribution-guide.md
```

## Key Documents
1. **Architecture Overview**: System components and interactions
2. **Data Flow**: How data moves through the system
3. **Workflow Documentation**: Business process flows
4. **Legal Requirements**: Compliance and audit requirements

## Notes
- Keep documentation up to date with code changes
- Use diagrams for complex concepts
- Assume another AI will maintain this system
