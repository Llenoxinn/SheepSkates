# `agentic.md` — Mandatory Agent Commit & Step Protocol

> [!IMPORTANT]
> **ALL AI AGENTS MUST FOLLOW THIS RULE WITHOUT EXCEPTION:**
> **COMMIT EACH STEP ATOMICALLY — NEVER MAKE BULKY COMMITS.**
> Commit immediately after every single completed, verified step before starting the next step. Never batch multiple features, bug fixes, refactors, or roadmap phases into one large commit.

---

## 1. Core Commit Discipline

1. **One Logical Step = One Commit:** Every commit must represent **one** cohesive unit of work (one bug fix, one extracted module, one unit test suite, one doc update, or one tooling setup). Never mix structural refactors with behavior changes or bug fixes.
2. **No Bulky Commits:** Keep every diff small, focused, and safely revertible (`git revert <sha>`). Aim for **1–5 closely related files** and one single intent per commit. If a task spans multiple concerns, break it into a sequence of micro-commits.
3. **Verify Before You Commit:** Run the relevant fast file-scoped check (`npx tsc --noEmit`, `npx eslint <file>`, targeted `npx vitest run <test>`, or syntax/link check) before committing so every commit leaves the repo in a working state.
4. **Stage Explicitly — Never Blindly:** Run `git status` and `git diff --stat`, then stage explicit paths (`git add <file1> <file2>`). Never use blind `git add -A` when scratch files, logs, or build artifacts may exist. Never commit `.remember/tmp/`, `node_modules/`, `dist/`, or `.env*`.
5. **Local Commits Only Unless Asked:** Commit each step locally as you progress; never run `git push` or rewrite shared history unless the user explicitly asks.

---

## 2. Mandatory Commit Message Format

Every agent commit **must** follow Conventional Commits with an explicit scope and concise reference footer when applicable:

```text
<type>(<scope>): <imperative lowercase summary, <= 72 chars, no trailing period>

<optional body: concise WHY and which invariant/test protects this step, wrapped at 72 chars>

Refs: <BUG-01 | DEBT-01 | PERF-01 | Phase-N | ADR-NNNN>
```

### Allowed `<type>` Values

| Type | When to Use |
| :--- | :--- |
| `feat` | New gameplay mechanic, trick, prop, editor tool, or UI capability |
| `fix` | Bug fix (physics, audio ref-counting, undo state, XSS, visual glitch) |
| `refactor` | Pure code extraction or restructuring with zero behavior/visual change |
| `perf` | Hot-loop allocation removal, geometry reduction, instancing, GPU disposal |
| `test` | Adding or updating Vitest unit/integration or Playwright E2E tests |
| `docs` | Updates to `README.md`, `AGENTS.md`, `agentic.md`, `docs/`, or ADRs |
| `chore` | Tooling setup (`vite`, `tsconfig`, `eslint`, `vitest`), `.gitignore`, config |
| `style` | Formatting/Prettier-only pass with zero logic or AST changes |

### Recommended `<scope>` Values

`sim` · `render` · `audio` · `ui` · `editor` · `physics` · `flock` · `park` · `prototype` · `docs` · `tooling` · `deps`

---

## 3. Concrete Examples (`DO` vs. `DON'T`)

### ✅ DO: Sequence Atomic, Verified Micro-Commits

```bash
# Step 1: Fix undo-grind invariant (BUG-01) and verify
git add index.html
git commit -m "fix(editor): re-initialize grind state when undoing sheep deletion" -m "Refs: BUG-01"

# Step 2: Fix continuous rail hiss ref-counting (BUG-02) and verify
git add index.html
git commit -m "fix(audio): ref-count rail hiss across concurrent grinding sheep" -m "Refs: BUG-02"

# Step 3: Remove hot-loop Vector3 allocations (DEBT-01) and verify
git add index.html
git commit -m "perf(sim): reuse scratch vectors in ride, grindStep, and placeBubble" -m "Refs: DEBT-01"

# Step 4: Add pure unit tests before extracting sheep kinematics
git add tests/sim/tricks.test.ts
git commit -m "test(sim): add deterministic airtime and combo multiplier unit tests" -m "Refs: Phase-1"

# Step 5: Extract pure math module with zero behavior change
git add src/shared/math.ts index.html
git commit -m "refactor(sim): extract pure math and easing helpers into src/shared/math.ts" -m "Refs: Phase-1"
```

### ❌ DON'T: Make Bulky or Vague Commits

```bash
# BAD: Combines tooling + multiple bug fixes + refactoring + docs into one giant diff
git add -A
git commit -m "fix bugs, setup vite, extract modules, and update docs"

# BAD: Vague WIP commit with no scope or step boundary
git commit -m "wip changes"
```

---

## 4. Mandatory Step-by-Step Agent Execution Loop

For every task, repeat this loop strictly per step:

1. **Isolate Step:** Pick the smallest next verifiable step from the plan.
2. **Edit Minimal Files:** Touch only the files required for that single step.
3. **Verify Step:** Run file-scoped checks/tests (or syntax/link checks) and confirm pass.
4. **Inspect & Stage:** Review `git status` / `git diff --stat` and `git add` only that step's files.
5. **Commit Step:** Commit immediately using `<type>(<scope>): <summary>`.
6. **Repeat:** Only then move to the next step.

---

## 5. Related Agent Documentation

- **Engineering Rules & Hot-Loop Guardrails:** [`AGENTS.md`](AGENTS.md)
- **Workflows, Prompts & Pre-PR Checklist:** [`docs/AGENTIC_WORKFLOWS.md`](docs/AGENTIC_WORKFLOWS.md)
- **Bug Ledger & Phased Roadmap:** [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)
- **Project Overview & Controls:** [`README.md`](README.md)
