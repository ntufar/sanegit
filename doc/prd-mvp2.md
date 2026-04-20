You've got the core. Now make it indispensable — the thing people can't go back from.

Here are the features that turn sanegit from "nice" to "I install this on every machine":

### **Phase 1 — Make `sg wtf` actually magic (next 2 weeks)**

**1. `sg wtf --learn`**
Remembers your repo's patterns. After 10 runs, it knows:
- "You always conflict with Maria on auth.ts on Fridays"
- "Your tests fail when you touch payments without updating mocks"
- Then warns *before* you push

Store in `.sanegit/memory.json` — no cloud, just local learning.

**2. Conflict forensics**
Don't just say "conflict in auth.ts" — say:
```
Conflict in auth.ts:42
→ Maria renamed verifyToken → verify (PR #881, merged 2h ago)
→ You added verifyTokenV2
→ Fix: I'll rename your call to verify and keep V2 as overload
```
Pull the *why* from git blame + PR titles.

**3. `sg wtf --fix-ci`**
When CI fails, it doesn't just report — it reads the logs, finds the failing test, and suggests the fix:
```
CI failed: payments.test.ts:47
→ Error: Cannot find module 'verifyToken'
→ Fix: import { verify } from './auth' (renamed in main)
Run `sg fix` to apply?
```

### **Phase 2 — Kill the boring parts of git (month 1)**

**4. `sg sync`**
Replaces the 4-command dance:
```bash
# Instead of:
git stash && git checkout main && git pull && git checkout - && git rebase main && git stash pop

# Just:
sg sync
```
Does stash → pull → rebase → unstash → resolve conflicts automatically. One command.

**5. `sg ship`**
Your "I'm done" button:
```bash
sg ship
→ sg check (predict merge)
→ sg fix (if needed)
→ sg push
→ gh pr create (if no PR)
→ Waits for CI
→ Auto-merge when green
```
From commit to merged without touching GitHub.

**6. `sg split`**
You changed 5 files for 3 different reasons. It detects and offers:
```
You made 3 logical changes:
1. fix(payments): handle retries [payments.ts]
2. refactor(auth): extract verify [auth.ts, auth.test.ts]
3. chore: update deps [package.json]

Split into 3 commits? [Y/n]
```
Uses AI to group hunks by intent. Kills "oops I committed everything together."

### **Phase 3 — Team intelligence (month 2)**

**7. `sg who`**
```
$ sg who auth.ts
auth.ts is owned by:
- Maria (73% of commits, last touched 2h ago)
- You (18%)
- Alex (9%)

Maria is currently working on PR #881 touching this file.
Slack her before pushing? [y/N]
```
Prevents the conflicts before they happen.

**8. `sg blame --explain`**
Regular blame shows "Maria changed line 42". This shows:
```
Line 42: verifyToken → verify
→ PR #881: "refactor auth for JWT"
→ Reason: security audit required standard naming
→ Merged 2 days ago by Maria
```
Pulls context from PR description and commit message.

**9. Team merge queue dashboard**
`sg queue --team`
Shows live:
```
Merge queue (3 PRs, est 47 min):
1. Maria #881 auth refactor [you will conflict]
2. Alex #882 db migration [safe]
3. You #883 payments fix [BLOCKED by #881]

Suggestion: Wait for #881, then run `sg wtf`
```

### **Phase 4 — The "wow" features**

**10. `sg time-travel "yesterday"`**
```
$ sg time-travel "before the auth refactor"
→ Checking out main at 2 days ago
→ Creating branch fix/payments-old-auth
```
Natural language git checkout. No more finding commit hashes.

**11. `sg pair`**
For pair programming:
```bash
sg pair start maria
→ Creates shared branch
→ Auto-syncs every 2 min
→ Both see same state
→ `sg pair handoff` to switch driver
```

**12. `sg doctor`**
Deeper than wtf — full repo health check:
- Large files in history
- Slow tests
- Flaky tests (from CI history)
- Unused branches
- Security issues in deps

---

### My recommendation: build in this order

**This week:**
1. Fix the `sg wtf` duplication bug on site
2. Add `sg sync` — it's 20 lines of code, huge value
3. Add conflict forensics to `sg wtf`

**Next week:**
4. `sg split` — this is the feature people tweet about
5. `sg ship` — closes the loop

**The one that goes viral:** `sg split`. Every dev has committed 3 things at once and regretted it. If you can auto-split by intent, that's magic.

Want me to spec out `sg sync` or `sg split` first? I can write the full Cursor prompt with the AI prompts for grouping hunks.