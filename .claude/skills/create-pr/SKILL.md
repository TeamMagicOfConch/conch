---
name: create-pr
description: Creates a clean pull request with repository template, accurate summary, and verification notes using GitHub CLI.
---

# Create Pull Request

Use this skill when the user asks to open a PR, draft a PR, or prepare a PR description from current branch changes.

## Goal

Create a PR that is immediately reviewable:

- Clear title focused on purpose
- Structured body following repository template
- Explicit test/build verification notes

## Required Inputs

- Base branch (default: `main`)
- Current working branch (from `git branch --show-current`)
- Scope of changes from `git diff` and `git log`

## Step-by-Step Procedure

1. Inspect branch state
   - `git status`
   - `git branch --show-current`
   - `git log --oneline <base>..HEAD`
   - `git diff --stat <base>...HEAD`

2. Build PR narrative from all branch commits
   - Summarize **why** the change exists (not only what changed)
   - Collect risk and rollback notes
   - Collect verification commands and outcomes

3. Ensure remote branch exists
   - If no upstream: `git push -u origin <branch>`

4. Create PR body using `.github/pull_request_template.md`
   - Fill every section with concrete details
   - Remove sections that are truly not applicable only when they add no value

5. Create PR via GitHub CLI
   - Use heredoc for stable multi-line body

```bash
gh pr create \
  --base <base-branch> \
  --head <current-branch> \
  --title "<type>: <short purpose>" \
  --body "$(cat <<'EOF'
## Summary
- ...

## Why
- ...

## What Changed
- ...

## How to Test
1. ...

## Risks / Rollback
- Risk: ...
- Rollback: ...

## Checklist
- [x] ...
EOF
)"
```

6. Return result
   - Share PR URL
   - Mention base/head branches
   - Mention key verification evidence included in PR body

## Quality Bar

- Title is concise and intention-revealing
- Body covers summary, motivation, changes, test plan, and risk
- Notes include any known limitations or follow-ups
- No secrets or environment files are referenced
