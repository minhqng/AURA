---
phase: 5
title: Validation Release Docs
status: in-progress
priority: P1
effort: 2-3d
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Validation Release Docs

## Context Links

- README: `README.md`
- Docs dir: `docs/`
- GitHub metadata: `.github/CODEOWNERS`
- Test tooling from Phase 1.
- Research brief standards/sources.

## Overview

Prove the SOTA claim with repeatable checks and documentation. Add release docs, privacy docs, architecture docs, changelog, roadmap, test matrix, and manual validation protocol.

## Key Insights

- `docs/` is empty; project lacks architecture, privacy, roadmap, changelog.
- Chrome Web Store/public demo needs privacy and permission disclosure.
- Accessibility cannot be validated by static checks only; manual keyboard/screen-reader scenarios are required.

## Requirements

- Functional: repository has clear setup, development, test, and release instructions.
- Functional: docs explain AI privacy, permissions, and limitations.
- Functional: validation checklist covers Chrome/Edge, popup, content script, AI, and accessibility workflows.
- Non-functional: reports concise; unresolved questions at end.
- Non-functional: no secret or dotenv committed.

## Architecture

Docs should become the project memory:

```text
docs/
  project-overview-pdr.md
  code-standards.md
  codebase-summary.md
  design-guidelines.md
  deployment-guide.md
  system-architecture.md
  development-roadmap.md
  project-changelog.md
  privacy-policy.md
```

Keep generated plans in `plans/`; evergreen docs in `docs/`.

## Related Code Files

- Modify: `README.md`
- Create/modify: `docs/project-overview-pdr.md`
- Create/modify: `docs/code-standards.md`
- Create/modify: `docs/codebase-summary.md`
- Create/modify: `docs/design-guidelines.md`
- Create/modify: `docs/deployment-guide.md`
- Create/modify: `docs/system-architecture.md`
- Create/modify: `docs/development-roadmap.md`
- Create/modify: `docs/project-changelog.md`
- Create/modify: `docs/privacy-policy.md`
- Modify: `.gitignore` only if new generated artifacts require it.

## Implementation Steps

1. Run full automated checks from Phase 1.
2. Load extension in Chrome/Edge and complete smoke checklist.
3. Test popup keyboard flow: tab order, focus visible, labels, status updates.
4. Test content script on representative pages: article, ecommerce, image gallery, SPA-like dynamic page.
5. Test AI with consent off/on, missing API key, success, failure, cache clear.
6. Write/update docs listed above.
7. Update README to match current install/use/test flow.
8. Document permissions and privacy policy in user-facing language.
9. Prepare release checklist and known limitations.

## Todo List

- [x] Automated tests pass.
- [ ] Manual browser smoke pass.
- [ ] Keyboard/screen-reader checklist pass.
- [x] Privacy and permission docs complete.
- [x] Roadmap/changelog updated.
- [x] README accurate.

## Success Criteria

- [x] `README.md` describes real current features and setup.
- [x] `docs/privacy-policy.md` explains AI data handling and permissions.
- [x] `docs/system-architecture.md` maps popup/content/background/storage flow.
- [x] `docs/development-roadmap.md` marks implemented phases accurately.
- [x] `docs/project-changelog.md` lists feature/fix changes by date.
- [x] Automated test results and manual validation gaps are documented.

## Risk Assessment

Risk: docs claim more than implementation delivers. Mitigation: docs must be written after validation and list limitations.

Risk: test pipeline is too heavy for vanilla extension. Mitigation: keep automated tests focused; rely on manual checklist for browser/store-specific behavior.

## Security Considerations

- Check git status for secrets before any commit.
- Ensure privacy docs match actual data flow.
- Ensure API key remains in ignored `src/config.js`.

## Next Steps

After this phase, run code review and decide whether to package for demo, Chrome Web Store review, or research evaluation.
