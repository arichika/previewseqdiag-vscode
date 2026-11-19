# Security Policy

## Supported Versions

Security fixes are provided for the latest release published on the
Visual Studio Marketplace. Please update to the latest version before
reporting an issue.

| Version          | Supported          |
| ---------------- | ------------------ |
| Latest release   | :white_check_mark: |
| Older releases   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub
issues, discussions, or pull requests.**

Report them privately through GitHub's private vulnerability reporting:

1. Open the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Fill in the form and submit.

Please include as much of the following as you can:

- A description of the issue and its potential impact
- The extension version, VS Code version, and OS
- Step-by-step instructions to reproduce
- A minimal sample file (`.mmd`, `.mermaid`, or `.msc`) that triggers
  the issue, if applicable
- Any suggested fix or mitigation

## Scope

In scope:

- Script execution or HTML injection in the preview webview
- Content Security Policy bypasses in the webview
- Reading or exposing files outside the intended location via the
  `%% import:` directive (e.g., path traversal)
- Unsafe file writes when saving or exporting preview images

Out of scope:

- Vulnerabilities in VS Code itself
- Vulnerabilities in upstream libraries (e.g., Mermaid) that this
  extension does not expose or amplify. Please report those to the
  upstream project. If you believe this extension makes an upstream
  issue exploitable, please report it here as well.

## Response Process

- I will acknowledge your report within 7 days.
- I will investigate, keep you informed of progress, and work with you
  on a fix and a disclosure timeline.
- Once a fix is released, I will publish a GitHub Security Advisory
  and request a CVE where appropriate. Reporters will be credited
  unless they prefer to remain anonymous.

This project is maintained by an individual developer, so response
times may vary. Thank you for helping keep this project and its users
safe.
