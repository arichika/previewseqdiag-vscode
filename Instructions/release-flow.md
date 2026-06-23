# Standard Release Flow Instructions

Use this file when you want Codex to run the standard release flow for this repository.

## How To Instruct Codex

Use one of these prompts at the start of a new task.

Short form:

```text
Read and follow Instructions/release-flow.md.
Run the standard release flow for version 0.7.2.
```

Full form:

```text
Read and follow Instructions/release-flow.md.
Run the standard release flow for version 0.7.2.

Before starting, check whether there are unrelated local changes, existing tags or releases, pending extra work, or anything that should stop the release flow.
If extra work is found, stop before merge and report what needs a decision.
If no extra work is found, continue through PR merge, tag creation, GitHub Release creation, VSIX upload, and local cleanup.
```

If the release includes extra work beyond routine version, dependency, documentation, and package updates, describe that extra work in the initial prompt. The release notes and GitHub Release body should include that extra work.

## Scope

This workflow is intended for routine releases of the VS Code extension.

The normal release scope includes:

- update the package version
- confirm Mermaid is on the latest published npm version
- update vulnerable npm packages
- update `CHANGELOG.md`
- update `README.md`
- run validation
- generate a VSIX file
- prune obsolete root-level VSIX files when the release moves to a new main version line
- include the VSIX file in the release commit with `git add -f`
- open a PR
- merge the PR when no extra work remains
- tag `main`
- create a GitHub Release
- attach the VSIX file
- clean up the local release branch

## Inputs

The user must provide:

- release version, for example `0.7.2`

Optional user inputs:

- branch name
- specific extra work to include in the release
- preferred merge method
- whether the PR should remain draft instead of being merged

If not specified, use:

- branch: `codex/release-{VERSION}`
- tag: `v{VERSION}`
- VSIX file: `previewseqdiag-vscode-{VERSION}.vsix`
- PR title: `[codex] Release {VERSION}`
- commit message: `Release {VERSION}`
- merge method: merge commit

## Preflight

Before making changes, inspect:

- current branch
- current HEAD
- working tree status
- untracked files
- local changes
- remote tracking status
- differences from `origin/main`
- existing local tag `v{VERSION}`
- existing remote tag `v{VERSION}`
- existing GitHub Release `v{VERSION}`
- existing root-level VSIX files matching `previewseqdiag-vscode-*.vsix`
- whether the current branch appears to contain unrelated work
- whether the requested release includes extra work beyond the normal release scope

Stop before making release changes if any of these are true:

- the working tree contains unrelated changes
- the release branch or tag already exists in a conflicting state
- GitHub Release `v{VERSION}` already exists
- `origin/main` cannot be fetched
- the repository is not connected to the expected GitHub remote
- GitHub CLI is unavailable or not authenticated
- the requested extra work is unclear

If the current branch is `main` and preflight is clean, create and switch to the release branch.
If the user has already created a branch for the work, use that branch after confirming it is based on current `origin/main`.

## Release Work

Perform the release changes:

1. Update `package.json` and `package-lock.json` to `{VERSION}`.
2. Check the latest Mermaid version in npm.
3. If Mermaid is outdated, update it to the latest compatible version.
4. Run npm vulnerability remediation without forced major upgrades unless the user explicitly approves them.
5. Update `CHANGELOG.md` with a `{VERSION}` section.
6. Update `README.md` release notes and feature summary for `{VERSION}`.
7. Generate or refresh build output as required by the repository.

Use the existing repository style for changelog and README entries.
Do not invent unrelated release notes.
If extra work was included in the release, include it in both `CHANGELOG.md` and the GitHub Release body.

## Validation

Run these checks before creating the VSIX:

```text
npm audit
npm test
npm run package
```

If a check fails, stop and report the failure unless the fix is clearly within the requested release scope.

## VSIX Packaging

Generate the VSIX file:

```text
vsce package --out previewseqdiag-vscode-{VERSION}.vsix
```

Confirm the VSIX file exists and has the expected versioned name.

## VSIX Retention Rule

Apply this rule only to root-level repository files named `previewseqdiag-vscode-X.Y.Z.vsix`.
Do not delete or modify GitHub Release assets that were already uploaded for older releases.

In this workflow:

- "main version line" means `major.minor`, for example `0.7` in `0.7.1`
- "subversion" means the patch version, for example `1` in `0.7.1`
- "final subversion" means the highest patch version found for that `major.minor` line

After generating `previewseqdiag-vscode-{VERSION}.vsix`, determine whether `{VERSION}` moves the project to a new main version line compared with the latest existing release version before this release.

If `{VERSION}` stays on the same main version line, do not prune old VSIX files as part of this rule.

If `{VERSION}` moves to a new main version line, prune older main version lines as follows:

1. Group root-level VSIX files by their `major.minor` version line.
2. Consider only version lines older than the new `{VERSION}` main version line.
3. For each older version line, keep only the VSIX file with the highest patch version.
4. Delete the other VSIX files in that older version line.
5. Stage those deletions as part of the release commit.

Example: when releasing `0.8.0`, the `0.7` line is older than the new `0.8` line.
If the repository has `previewseqdiag-vscode-0.7.0.vsix`, `previewseqdiag-vscode-0.7.1.vsix`, and `previewseqdiag-vscode-0.7.2.vsix`, keep only `previewseqdiag-vscode-0.7.2.vsix` and delete the other `0.7.x` VSIX files.

Stop before deleting files if:

- any VSIX file name does not match the expected `previewseqdiag-vscode-X.Y.Z.vsix` pattern
- versions include prerelease or build metadata
- two files appear to represent the same version
- the cleanup would remove the only VSIX file for a version line
- the cleanup result is unclear or unexpectedly large

## Commit And PR

Stage only intended release files.

Always force-add the VSIX file because `*.vsix` is ignored:

```text
git add -f previewseqdiag-vscode-{VERSION}.vsix
```

Commit the release changes:

```text
git commit -m "Release {VERSION}"
```

Push the branch and create a draft PR.

The PR body should include:

- what changed
- why it changed
- dependency and vulnerability updates
- obsolete VSIX file pruning, when applicable
- VSIX artifact name
- validation commands and results

## Pre-Merge Gate

Before marking the PR ready or merging it, inspect:

- final diff
- PR state
- mergeability
- status checks
- whether any requested extra work remains
- whether any unrelated changes are present
- whether the release notes correctly cover all included work
- whether VSIX pruning was required and correctly staged

Stop before merge if any of these are true:

- the PR is not mergeable
- required checks fail
- the PR contains unrelated work
- the user mentioned extra work that has not been completed
- release notes do not match the actual changes
- obsolete VSIX pruning was required but not completed or not reflected in the release notes
- there is any decision that needs user approval

If no extra work remains and the PR is clean:

1. Mark the PR ready for review.
2. Merge the PR into `main`.

## Tag And GitHub Release

After the PR is merged:

1. Fetch latest `origin/main` and tags.
2. Switch the local checkout to `main`.
3. Update local `main` to match `origin/main`.
4. Confirm `HEAD` is the merged release commit or merge commit.
5. Create tag `v{VERSION}` on the current `main` HEAD.
6. Push tag `v{VERSION}`.
7. Create GitHub Release `v{VERSION}`.
8. Use the `CHANGELOG.md` section for `{VERSION}` as the release body.
9. Attach `previewseqdiag-vscode-{VERSION}.vsix`.
10. Mark the release as latest unless the user says otherwise.

Before creating the tag or release, stop if:

- tag `v{VERSION}` already exists locally or remotely
- GitHub Release `v{VERSION}` already exists
- local `main` is not aligned with `origin/main`
- the VSIX file is missing

## Cleanup

After the GitHub Release is created:

1. Keep the local checkout on `main`.
2. Delete the local release branch if it has been merged.
3. Confirm the local working tree is clean.
4. Report the result.

The final report should include:

- branch used
- commit hash
- PR URL
- merge commit hash
- tag name
- GitHub Release URL
- VSIX asset URL
- validation commands and results
- any remaining local or remote cleanup that was intentionally not performed
