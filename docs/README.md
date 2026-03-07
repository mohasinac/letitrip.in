# LetItRip Documentation

## Core Docs

| File                                           | Purpose                                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [GUIDE.md](./GUIDE.md)                         | Complete code inventory — every function, hook, component, constant, schema, repository, API endpoint |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)     | Canonical patterns and code snippets                                                                  |
| [APPLICATION_GRAPH.md](./APPLICATION_GRAPH.md) | Full application page/component/hook/API dependency map                                               |
| [AUTH.md](./AUTH.md)                           | Authentication architecture, session model, OAuth popup bridge                                        |
| [RBAC.md](./RBAC.md)                           | Role-based access control — roles, config, protection patterns                                        |
| [PAYMENT.md](./PAYMENT.md)                     | Razorpay integration, order flow, RTDB bridge                                                         |
| [ERROR_HANDLING.md](./ERROR_HANDLING.md)       | Error architecture, logging, error pages                                                              |
| [SECURITY.md](./SECURITY.md)                   | Security practices, OWASP compliance                                                                  |
| [STYLING_GUIDE.md](./STYLING_GUIDE.md)         | Styling standards, THEME_CONSTANTS usage                                                              |
| [BULK_ACTIONS.md](./BULK_ACTIONS.md)           | Bulk action API specification                                                                         |
| [CHANGELOG.md](./CHANGELOG.md)                 | Version history (March 2026 onward)                                                                   |
| [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md) | Archived history (v1.0.0 – v1.2.0, January–February 2026)                                             |

## Related Root Files

| File                                                                  | Purpose                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------- |
| [README.md](../README.md)                                             | Application overview, stack, architecture, setup, scripts |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                                 | Contribution workflow                                     |
| [.github/copilot-instructions.md](../.github/copilot-instructions.md) | Mandatory coding rules and architecture constraints       |

## Notes

- When adding documentation prefer extending an existing core doc rather than creating a new standalone file.
- Historical session/phase/status/report files were intentionally removed to keep docs concise.
