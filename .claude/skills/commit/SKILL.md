---
name: commit-msg
description: Generate a conventional commit message based on current git diff
---

Run `git diff HEAD` and `git status` to see all staged and unstaged changes, then analyze the intent and generate a commit message.

**Rules:**
- Format: `type(scope): description`
- Types (pick the best fit): `feat` / `fix` / `refactor` / `docs` / `test`
- Scope: the module or file area most affected (e.g. `home`, `auth`, `clothes`, `gemini`)
- Description: one concise English sentence, lowercase, no period at end
- If multiple scopes are involved, pick the primary one

**Output only the commit message string** — no explanation, no markdown fences, no extra text.

Example output:
```
fix(home): fetch user preferences from db instead of jwt payload
```
