# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

## Hard Gate

Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

## Checklist

Complete these in order:

1. **Explore project context** - check files, docs, recent commits
2. **Offer visual companion** (if topic will involve visual questions)
3. **Ask clarifying questions** - one at a time, understand purpose/constraints/success criteria
4. **Propose 2-3 approaches** - with trade-offs and your recommendation
5. **Present design** - in sections scaled to their complexity, get user approval after each section
6. **Write design doc** - save to docs/superpowers/specs/YYYY-MM-DD-topic-design.md and commit
7. **Spec self-review** - check for placeholders, contradictions, ambiguity, scope
8. **User reviews written spec** - ask user to review before proceeding
9. **Transition to implementation** - invoke writing-plans skill to create implementation plan

## Process

**Understanding the idea:**
- Check current project state first (files, docs, recent commits)
- Assess scope: if request describes multiple independent subsystems, flag immediately
- If too large for a single spec, help decompose into sub-projects
- Ask questions one at a time
- Prefer multiple choice questions when possible
- Only one question per message

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Lead with your recommended option and explain why

**Presenting the design:**
- Present the design once you understand what you're building
- Scale each section to its complexity
- Ask after each section whether it looks right
- Cover: architecture, components, data flow, error handling, testing

**Design for isolation and clarity:**
- Break system into smaller units with one clear purpose
- Each unit should communicate through well-defined interfaces
- Can be understood and tested independently

**Working in existing codebases:**
- Explore current structure before proposing changes
- Follow existing patterns
- Include targeted improvements where existing code has problems
- Don't propose unrelated refactoring

## After the Design

**Documentation:**
- Write validated design to docs/superpowers/specs/YYYY-MM-DD-topic-design.md
- Commit the design document to git

**Spec Self-Review:**
1. Placeholder scan: Any TBD, TODO, incomplete sections? Fix them.
2. Internal consistency: Do sections contradict each other?
3. Scope check: Focused enough for a single implementation plan?
4. Ambiguity check: Could any requirement be interpreted two ways?

Fix any issues inline. No need to re-review.

**User Review Gate:**
Ask the user to review the written spec before proceeding. Wait for response. Only proceed once approved.

**Implementation:**
- Invoke the writing-plans skill to create a detailed implementation plan

## Key Principles

- One question at a time
- Multiple choice preferred
- YAGNI ruthlessly
- Explore alternatives - always propose 2-3 approaches
- Incremental validation
- Be flexible - go back and clarify when needed

## Visual Companion

When upcoming questions will involve visual content, offer once:

"Some of what we're working on might be easier to explain if I can show it to you in a web browser. I can put together mockups, diagrams, comparisons, and other visuals as we go. Want to try it?"

This offer must be its own message. Per-question decision: use browser for visual content (mockups, wireframes, layouts), use terminal for text content (requirements, choices, tradeoffs).
