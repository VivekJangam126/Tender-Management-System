# TENDER CREATION SYSTEM — FUNCTIONAL SPECIFICATION (CURRENT IMPLEMENTATION)

**Last Updated:** January 5, 2026  
**Status:** FULLY IMPLEMENTED & OPERATIONAL  
**Version:** 1.0 Complete

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [STEP 1: Basic Tender Details](#step-1-basic-tender-details-mandatory-manual)
3. [STEP 2: Content Builder & AI Assistance](#step-2-content-builder--ai-assistance-core-logic)
4. [STEP 3: Final Review & Validation](#step-3-final-review--validation)
5. [STEP 4: Preview & Publish](#step-4-preview--publish)
6. [Global Rules](#global-rules-non-negotiable)
7. [State Management Architecture](#state-management-architecture)
8. [Navigation Control Logic](#navigation-control-logic)
9. [Audit Logging](#audit-logging)


## SYSTEM OVERVIEW

### Core Philosophy
The tender creation process is a **guided, state-driven workflow**, not a free-form form. The system enforces sequencing, validation, and human control at every stage.

### Workflow Sequence (Mandatory)
```
STEP 1: Basic Details (REQUIRED)
  ↓ (if valid)
STEP 2: Content Builder & AI Assistance (REQUIRED)
  ↓ (if valid, AI usage is OPTIONAL)
STEP 3: Final Review (REQUIRED)
  ↓ (only if no blocking issues)
STEP 4: Publish (REQUIRED - final gate)
  ↓
Tender Published (IMMUTABLE)
```

### Key Entities
1. **Tender** (`tenderData`) — Core tender metadata
2. **Sections** (`sections`) — Content containers with governance
3. **AI Suggestions** (`aiSuggestions`) — Advisory only, never applied automatically
4. **Validation State** — Per-step validation tracking with blocking rules

---

## STEP 1: BASIC TENDER DETAILS (MANDATORY, MANUAL)

**Component:** `TenderDetailsForm.jsx`  
**Location:** `src/components/TenderDetailsForm.jsx`

### What Must Happen
- Authority must manually enter core tender metadata
- System must NOT allow progression or AI operation before this step is complete
- No validation bypass
- No AI pre-filling
- Human provides the initial context

### Data Captured

| Field | Type | Required | Rules | Notes |
|-------|------|----------|-------|-------|
| **Tender Title** | String | ✅ Yes | Non-empty | Primary identifier, used across system |
| **Reference ID** | String | ❌ No | Any string | Auto-generated or manual, optional |
| **Description** | String | ✅ Yes | 1+ characters | AI uses this as context for suggestions |
| **Category** | String | ✅ Yes | Must select | Used for clause suggestions, defaults |
| **Submission Deadline** | Date | ✅ Yes | Must be future | System enforced, checked at STEP 4 |
| **Authority Organization** | String | ❌ No | Read-only in draft | Set from session/context |

### Validation Rules

```javascript
// Tender Title
- Non-empty: required
- Trimmed: whitespace removed
- Error: "Tender title is required"

// Description
- Non-empty: required
- Trimmed: whitespace removed
- Error: "Description is required"

// Category
- Must be selected from dropdown
- Cannot be empty string
- Error: "Category selection is required"

// Submission Deadline
- Date input required
- MUST be in future (today or later)
- Checked against system date at validation
- Error (if missing): "Submission deadline is required"
- Error (if past): "Submission deadline must be a future date"
```

### System Rules

1. **Required fields must be validated before proceeding**
   - Validation runs after every field change
   - Parent `TenderCreationPage` checks `step1.isValid` before enabling Next button

2. **Tender can be saved as Draft at this stage**
   - Save Draft button always enabled
   - No validation required for save
   - Draft status preserved in `tenderData.status`

3. **Proceeding to next step is blocked until valid**
   - Next button disabled while `validation.step1.isValid === false`
   - Visual feedback: grayed button
   - Error messages displayed below each field

4. **No AI suggestions, generation, or analysis allowed here**
   - AI features unavailable in STEP 1
   - No pre-filled suggestions
   - Authority input is primary source of truth

### Category Options (Mock)

```javascript
[
  { value: 'construction', label: 'Construction & Infrastructure' },
  { value: 'it-services', label: 'IT Services & Software' },
  { value: 'supply', label: 'Supply & Procurement' },
  { value: 'services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
]
```

### UI Behavior

- **Form layout:** Clear, labeled inputs
- **Validation messages:** Display immediately below field
- **Visual error state:** Red border on invalid field
- **Category dropdown:** Populated with fixed options
- **Date picker:** Browser-native or custom date input
- **Authority field:** Read-only display (not user input)

---

## STEP 2: CONTENT BUILDER & AI ASSISTANCE (ENTERPRISE EDITION)

**Component:** `ContentBuilder.jsx`  
**Location:** `src/components/ContentBuilder.jsx`

### Architecture: Fixed 3-Column Layout

**LEFT PANEL (25%):** Section Navigator  
**CENTER PANEL (50%):** Focused Section Editor  
**RIGHT PANEL (25%):** AI Chat Assistant

This layout is **permanent, non-collapsible**, and optimized for drafting 50-300 page government tenders.

### AI Review Mode Notice
💡 **AI Review Mode is available via the AI Assistant panel. AI provides suggestions only and never auto-applies changes.**

### What Must Happen
Authority creates tender sections using one of three modes:
1. **Manual Section Creation** (full control)
2. **AI Chat-Driven Structure** (conversational proposals)
3. **Hybrid** (mix of both, any time)

AI assistance is **OPTIONAL** and available throughout STEP 2, but **never blocks progression** to STEP 3.

System supports all three modes simultaneously with no restrictions on switching.

### Data Captured (Sections)

Each section maps to `TENDER_SECTION` schema:

```javascript
{
  sectionId: string,        // Unique identifier
  tenderId: string,         // Parent tender ID
  title: string,            // Section name
  sectionType: enum,        // TECHNICAL | FINANCIAL | ELIGIBILITY | OTHER
  content: string,          // Raw section body
  isMandatory: boolean,     // Governance flag
  orderIndex: number,       // Display order (0-based)
}
```

### OPTION A: MANUAL SECTION CREATION

**UI:** "Add Section" button in Section Navigator → Modal form

**Authority defines:**
1. **Section Title** — Display name
2. **Section Type** — dropdown (TECHNICAL, FINANCIAL, ELIGIBILITY, OTHER)
3. **Is Mandatory** — checkbox

**Editing behavior:**
- Authority writes content directly in **Focused Section Editor** (center panel)
- Plain text editor only (optimized for large documents)
- Content autosaved every 2-3 seconds after pause
- Real-time word count and page estimate (~500 words/page)
- Autosave status displayed: "Saved just now", "Saved 15s ago", etc.

**Section Navigator Features:**
- **Drag handle** for reordering (visual grip icon)
- **Section title** with truncation for long names
- **Type badge** (TECH, FIN, ELIG, OTHER) with color coding
- **Mandatory lock icon** 🔒 for protected sections
- **Status indicators:**
  - ❌ **Empty** (no content)
  - ⚠️ **Partial/Needs Review** (< 100 chars)
  - ✅ **Complete** (≥ 100 chars)
- **Word/Page count** (e.g., "245 words • ~1 page")

**Section Management:**
- **Reorder:** Drag & drop sections (updates `orderIndex`)
- **Edit:** Click section → opens in center editor
- **Delete:** Delete button (only visible for non-mandatory sections)
  - **Exception:** Cannot delete if section is marked mandatory
  - Error: "Cannot delete mandatory sections"

### OPTION B: AI CHAT-DRIVEN STRUCTURE CREATION

**Trigger:** User types request in AI Chat (right panel)

**What Authority Types:**
- "Help me structure this tender"
- "Suggest sections"
- "What sections do I need?"

**What AI Returns:**
- Conversational response with **Explanation**
- **Proposed Content** (clearly separated in chat bubble)
- **Proposal Card** with preview and action buttons

**Proposal Format:**
```
[AI Message Bubble]
Based on best practices for government tenders, I recommend 
the following section structure:

[Proposal Card]
┌─────────────────────────────────────┐
│ ⚡ PROPOSED CONTENT                 │
├─────────────────────────────────────┤
│ Explanation:                        │
│ Standard structure for government   │
│ tenders with mandatory compliance   │
│ sections                            │
│                                     │
│ Preview:                            │
│ Will create 4 sections: Eligibility,│
│ Technical, Financial, Submission    │
│                                     │
│ [Apply to Editor] [Discard]        │
└─────────────────────────────────────┘
```

**Governance:**
- AI suggestions stored in `pendingProposal` state
- **NOT** added to real `sections` array until approved
- Clicking **"Apply to Editor"** opens confirmation modal
- No automatic section creation

### Strict AI Constraints

**AI MUST NOT:**
- ❌ Auto-apply any content to editor
- ❌ Generate a complete final document without approval
- ❌ Lock any content
- ❌ Auto-create sections without explicit confirmation
- ❌ Publish the tender
- ❌ Add legal or contractual commitments
- ❌ Modify multiple sections at once
- ❌ Change mandatory flags silently
- ❌ Bypass validation gates

**AI CAN:**
- ✅ Suggest logical structure via chat
- ✅ Recommend section titles
- ✅ Provide draft content with explanations
- ✅ Reference category-specific patterns
- ✅ Propose improvements for selected section
- ✅ Answer questions about tender best practices

### Apply Content Modal (Critical Gate)

When user clicks **"Apply to Editor"** on a proposal:

**Modal displays:**
```
┌──────────────────────────────────────────┐
│ Apply AI Content                         │
├──────────────────────────────────────────┤
│ Choose how to apply this content:        │
│                                          │
│ ○ Replace existing content              │
│   Overwrites current section content    │
│                                          │
│ ○ Append below existing content         │
│   Adds to the end of current content    │
│                                          │
│ ○ Insert at cursor                      │
│   Insert where cursor is positioned     │
│                                          │
│         [Cancel]  [Confirm & Apply]     │
└──────────────────────────────────────────┘
```

**Behavior:**
- User **MUST** select one mode
- Clicking **"Confirm & Apply"** executes the action
- Clicking **"Cancel"** discards the proposal
- No auto-selection or default behavior

### AI Chat Interface (RIGHT PANEL)

**Header:**
```
┌─────────────────────────────────┐
│ 💡 AI Assistant                 │
├─────────────────────────────────┤
│ Category: Construction          │
│ Active Section: Technical Req.  │
│                                 │
│ ⚠️ AI proposals must be         │
│ explicitly approved. Nothing    │
│ auto-applies.                   │
└─────────────────────────────────┘
```

**Chat Input (Context-Aware Placeholder):**
- No sections: `"Ask for structure, sections, or guidance..."`
- Sections exist, none selected: `"Ask for guidance or select a section..."`
- Section selected: `"Ask to draft, improve, or review 'Technical Requirements'..."`

**Chat Message Types:**
1. **User messages** (blue bubble, right-aligned)
2. **AI responses** (gray bubble, left-aligned with AI icon)
3. **Proposal cards** (indigo border, action buttons)

**Proposal Card Components:**
- **Explanation section:** Why AI is suggesting this
- **Preview section:** Short preview of proposed content
- **Action buttons:**
  - `[Apply to Editor]` → Opens Apply Content Modal
  - `[Discard]` → Removes proposal from chat

### Chat-Driven Section Creation

**User types:** "Create a section for project timeline"

**AI responds:**
```
[AI Message]
I can help create a new section. Here's what I propose:

[Proposal Card]
Proposed new section based on your request

Preview:
Project Timeline & Milestones section with 
standard phases

[Create Section & Apply Content] [Discard]
```

**On "Create Section & Apply Content":**
- Opens modal showing section details
- User confirms creation
- Section added to navigator
- Content populated
- Section auto-selected in editor

### Authority Control Over AI Proposals

**Governance:**
1. **Review Generated Sections** — See all proposals in chat before accepting
2. **Explicit Approval** — Authority MUST click "Apply" and confirm mode
3. **Edit Before Accept** — Can manually modify content after applying
4. **Accept Selectively** — Can accept some suggestions, reject others
5. **Full Ownership** — All content becomes authority-owned after apply
6. **Discard Anytime** — Can ignore any AI suggestion

**Implementation:**
- AI proposals stored in `pendingProposal` state
- NOT added to real `sections` array until confirmed
- Apply action logged in audit trail
- No silent auto-apply mechanisms

### Hybrid Usage

**Authority can:**
- Create some sections manually
- Generate AI structure for other sections
- Mix and match freely
- Switch between modes anytime
- Use AI for one section, manual for another

**Example workflow:**
1. Add "Technical Requirements" manually
2. Generate AI suggestions → accept "Financial Bid Format"
3. Manually add "Submission Instructions"
4. Accept AI suggestion for "Eligibility Criteria"

### Validation Rules (STEP 2 Gate)

```javascript
step2: {
  isValid: boolean,
  errors: {
    missingMandatorySections: string[],   // Titles of empty mandatory sections
    emptyMandatoryContent: string[],      // Sections marked mandatory with no content
  }
}
```

**Blocking Conditions:**
1. ❌ No sections exist → `isValid = false`
2. ❌ Mandatory section has empty content → `isValid = false`
3. ❌ Invalid orderIndex on any section → `isValid = false`
4. ✅ At least 1 section with content (if not mandatory) → `isValid = true`
5. ✅ All mandatory sections have content → `isValid = true`

**Next button** disabled until `validation.step2.isValid === true`

**AI Usage Note:** AI assistance is available throughout STEP 2 but is **OPTIONAL** and **NEVER** blocks progression to STEP 3. Authority can use AI for section creation, content drafting, and review, or complete the entire step manually.

---

## STEP 3: FINAL REVIEW & VALIDATION
- Authority can skip all AI assistance
- No validation state gates STEP 3 → STEP 4 transition
- Back button from STEP 4 returns to STEP 3 (not skipped)

---

## STEP 4: FINAL REVIEW & VALIDATION

**Component:** `FinalReviewPanel.jsx`  
**Location:** `src/components/FinalReviewPanel.jsx`

### What Must Happen
Authority explicitly runs a comprehensive integrity check before publishing. System classifies all findings into blocking issues, warnings, and passed checks.

**This is the final quality gate before publication.**

### Validation Checks Performed

The system checks:

| Check | Type | Blocks? | Description |
|-------|------|---------|-------------|
| Tender title provided | Blocking | ✅ Yes | Must exist and be non-empty |
| Tender description provided | Blocking | ✅ Yes | Must exist and be non-empty |
| Tender category selected | Blocking | ✅ Yes | Must have valid category choice |
| Submission deadline set | Blocking | ✅ Yes | Must have valid future date |
| Deadline not past | Blocking | ✅ Yes | Date must be in future at review time |
| At least 1 section exists | Blocking | ✅ Yes | Tender must have content |
| Mandatory sections have content | Blocking | ✅ Yes | Check each mandatory section |
| Section order valid | Blocking | ✅ Yes | No gaps or corruption in orderIndex |
| No duplicate titles | Blocking | ✅ Yes | Section titles must be unique |
| Reference ID provided | Warning | ❌ No | Optional but recommended |
| Financial section exists | Warning | ❌ No | Category-dependent recommendation |
| Technical section exists | Warning | ❌ No | Category-dependent recommendation |
| Eligibility section exists | Warning | ❌ No | Category-dependent recommendation |
| Deadline not too soon | Warning | ❌ No | Alert if < 7 days |
| Section content adequate | Warning | ❌ No | Alert if any section < 100 chars |

### Output Classification

System returns validation state:

```javascript
step4: {
  isValid: boolean,                    // true ONLY if blockingIssues.length === 0
  blockingIssues: string[],           // Must be fixed before publish
  warnings: string[],                 // Recommendations, can be overridden
  passedChecks: string[],             // Successful validations (informational)
  overriddenWarnings: string[]        // Warnings user has overridden
}
```

### 🚫 Blocking Issues (Cannot Override)

**These MUST be resolved to publish:**

1. "Tender title is missing" → Check title not empty
2. "Tender description is missing" → Check description not empty
3. "Tender category is not selected" → Check category dropdown value
4. "Submission deadline is not set" → Check deadline date exists
5. "Submission deadline has already passed" → Check deadline >= today
6. "No tender sections defined" → Check sections.length > 0
7. "Mandatory section(s) have no content" → Check each mandatory section
8. "Section ordering is corrupted" → Validate orderIndex sequence
9. "Duplicate section titles found" → Check section title uniqueness

**UI Treatment:**
- Red left border with ❌ icon
- Clear message: "These issues must be resolved to publish"
- List of all blocking conditions
- Next button disabled (grayed out)
- Authority must go back to fix

### ⚠️ Warnings (Can Override)

**These are recommendations but not blockers:**

1. "No Reference ID provided" → Optional, but good practice
2. "No Financial section found" → Category-specific
3. "No Technical section found" → Category-specific
4. "No Eligibility section found" → Category-specific
5. "Submission deadline is very soon (< 7 days)" → Risk alert
6. "Section(s) have very brief content (< 100 characters)" → Quality concern

**UI Treatment:**
- Yellow left border with ⚠️ icon
- Shows warning text
- Individual override button per warning
- Shows "✓ Override reason provided" when overridden
- Does NOT block Next button (if no blocking issues)

### Override Logic

**For each warning, authority can:**

1. **Accept the warning** — Do nothing, proceed
2. **Override the warning** — Provide reason, proceed

**Override workflow:**

```
Warning displayed
  ↓
Authority clicks "Override"
  ↓
Modal appears: "Why are you overriding this warning?"
  ↓
Authority types reason (min 10 characters)
  ↓
Reason recorded in audit log
  ↓
Warning marked as overridden
  ↓
Can now proceed to STEP 4
```

**Override reason recorded:**
```javascript
[REVIEW AUDIT] Warning overridden
{
  timestamp: ISO_DATE,
  warningText: string,
  overrideReason: string,
  authorityAction: 'OVERRIDE_WARNING',
  tenderId: string,
}
```

### ✅ Passed Checks (Informational)

**Successful validations:**

- "Tender title is provided and valid"
- "Tender description is provided"
- "Tender category is defined"
- "Submission deadline is in the future"
- "Tender has N section(s) defined"
- "All mandatory section(s) have content"

**UI Treatment:**
- Green left border with ✅ icon
- Informational display only
- No actions required
- Confirms tender meets standards

### Navigation Rule

**STEP 4 unlocks ONLY if:**
```javascript
validation.step3.isValid === true 
// AND
validation.step3.blockingIssues.length === 0
```

**Next button behavior:**
- Disabled (grayed) if blocking issues exist
- Enabled if only warnings or no issues
- Click Next → Go to STEP 4

### Read-Only Enforcement

STEP 3 is review-only:
- ❌ No inline editing of tender data
- ❌ No auto-fix buttons to modify content
- ❌ No publish button in STEP 3 itself
- ❌ No navigation bypass of blocking issues
- ✅ Must go back and fix in previous steps

---

## STEP 4: PREVIEW & PUBLISH

**Component:** `PublishStep.jsx`  
**Location:** `src/components/PublishStep.jsx`

### What Must Happen
Authority previews the final tender document in read-only format, then confirms intent to publish. On confirmation, tender becomes immutable and visible to bidders.

**This is the point of no return.**

### Preview Behavior

**Read-only document view:**
- Shows complete tender exactly as bidders will see it
- Includes metadata: title, category, deadline, authority
- All sections displayed with numbering
- Section types shown (Technical, Financial, etc.)
- Mandatory indicators visible
- "Published" or "Draft" badge shown

**No edit controls in preview:**
- ❌ No edit buttons
- ❌ No delete buttons
- ❌ No reorder handles
- ❌ No rich text editor
- ✅ Full read-only text display

**Content order and structure are fixed:**
- Section numbers: 1, 2, 3...
- Order follows `orderIndex` from STEP 2
- No dynamic reordering
- Exactly what bidders receive

### Publish Confirmation Modal

**Critical gate before publication:**

1. **Modal triggered** → Authority clicks "Publish Tender" button
2. **Warning displayed:**
   ```
   🚨 PUBLISH TENDER (IRREVERSIBLE)
   
   Once published, this tender CANNOT be edited, deleted, or unpublished.
   All sections are locked permanently.
   Bidders will immediately see this tender.
   
   This action CANNOT be undone.
   ```
3. **Tender summary shown:**
   - Title
   - Category
   - Submission deadline
   - Section count
   - Authority name
4. **Checkbox required:** "I understand this action is permanent"
5. **Confirm button:** "Confirm Publish" (disabled until checkbox checked)
6. **Cancel option:** Abort and return to preview

### Publish Confirmation Required

- Modal REQUIRES explicit user action (click button)
- Cannot skip with keyboard or tab
- Must read warning
- Must check acknowledgment box
- No auto-publish on page load
- Prevents accidental publication

### Post-Publish State

**On successful publish:**

1. **Tender status changes:** `status: "PUBLISHED"`
2. **Timestamp recorded:** `publishedAt: ISO_TIMESTAMP`
3. **All sections locked:** No future edits possible
4. **Immutable forever:** No undo, rollback, or unpublish
5. **Bidders can see:** Published tender visible in market
6. **Audit logged:** Publication event recorded

**Tender object after publish:**
```javascript
{
  // All STEP 1 data
  title: string,
  description: string,
  category: string,
  submissionDeadline: date,
  
  // System fields
  status: "PUBLISHED",  // Changed from "DRAFT"
  publishedAt: "2026-01-05T10:30:45.123Z",  // New timestamp
  
  // Immutable going forward
  // No further edits allowed
}
```

### Post-Publish Locking

**After publication:**

- Entire workflow becomes read-only
- Cannot navigate back to edit STEP 1, 2, 3, 4
- Cannot edit sections
- Cannot change metadata
- Cannot delete sections
- Cannot reorder sections
- Cannot unpublish or rollback
- Cannot access AI assistance
- Back/Next buttons disabled
- Save Draft button disabled
- UI shows "Published (Immutable)" status

**If changes needed:**
- Authority must create a NEW tender version
- Original tender remains published
- Bidders see original version unless otherwise indicated

### Audit Logging

Publication logged with full context:

```javascript
[PUBLISH AUDIT] Tender published
{
  timestamp: "2026-01-05T10:30:45.123Z",
  tenderId: string,
  tenderTitle: string,
  category: string,
  sectionCount: number,
  submissionDeadline: date,
  actionType: "PUBLISH_TENDER",
  authorityOrganization: string,
  authorityOrganizationId: string,
  irreversible: true,
}
```

### Navigation Rule

- STEP 4 is accessible ONLY from STEP 3
- STEP 4 can only be reached if `validation.step3.isValid === true`
- No backward navigation from STEP 4 to previous steps after publish
- Published tender enters read-only mode

---

## GLOBAL RULES (NON-NEGOTIABLE)

### 1. Human Authority Always Has Final Control

**Principle:**
- AI is assistive, never autonomous
- Every significant decision requires authority approval
- No auto-apply of suggestions
- No auto-generation of final content
- No system-driven state changes without human confirmation

**Implementation:**
- All AI suggestions require explicit accept/reject
- Blocking issues cannot be overridden
- Publishing requires confirmation modal
- Override reasons recorded in audit log

### 2. AI is Assistive, Never Autonomous

**AI Capabilities:**
- Suggests section structure (STEP 2)
- Recommends improvements (STEP 3)
- Flags potential issues (STEP 3)
- References best practices (STEP 3)

**AI Cannot:**
- Auto-modify content
- Auto-generate final document
- Lock sections
- Approve or reject bids
- Publish tender
- Change evaluation criteria
- Override authority decisions

### 3. No Tender Content is Visible to Bidders Before Publish

**Privacy Rule:**
- Draft tenders are internal only
- STEP 1-5 workflow is authority-only
- Bidders cannot see draft, preview, or analysis
- Publication is the only visibility gate

**Implementation:**
- Status field: `DRAFT` or `PUBLISHED`
- Query filters exclude draft tenders from bidder views
- API endpoints check publication status

### 4. All Major Actions Are Auditable

**Audit Scope:**
- STEP 1: Authority creates tender
- STEP 2: Sections created/modified/deleted
- STEP 3: AI suggestions generated/accepted/rejected
- STEP 4: Review completed, warnings overridden
- STEP 5: Tender published (irreversible)

**Audit Entries Include:**
- Timestamp (ISO 8601)
- Entity ID (tenderId, sectionId, suggestionId)
- Action type (CREATE, MODIFY, DELETE, PUBLISH, etc.)
- Authority identifier
- Metadata (reason for override, etc.)
- Immutability flag (if applicable)

**Log Format:**
```javascript
[MODULE AUDIT] Action description
{
  timestamp: ISO_TIMESTAMP,
  entityId: string,
  entityTitle: string,
  actionType: string,
  authorityOrganization: string,
  context: object,
}
```

### 5. System Enforces Sequence: Details → Content → Review → Publish

**Navigation Rules:**
- **STEP 1** must be completed before STEP 2 unlocks
- **STEP 2** must be valid before STEP 3 unlocks
- **STEP 3** is optional but cannot be skipped (always allowed)
- **STEP 4** must have no blocking issues before STEP 5 unlocks
- **STEP 5** is final gate

**Backward navigation:**
- Always allowed: Go back to fix errors
- Exception: Cannot go back after STEP 5 (published)

**Forward navigation:**
- Only if current step is valid
- Special rule STEP 4 → STEP 5: Only if no blocking issues
- Next button disabled if conditions not met

### 6. Tender Can Be Saved at Any Step

**Save Draft:**
- Available at every step
- No validation required
- Preserves current state
- Returns to same step on reload (mock, future: backend)

**Limitations:**
- Cannot save as "PUBLISHED" (only through STEP 5)
- Cannot save with blocking issues in STEP 4 (but can save before STEP 4)

---

## STATE MANAGEMENT ARCHITECTURE

### Centralized Ownership in `TenderCreationPage.jsx`

All workflow state owned by parent component:

```javascript
// Current active step (1-5)
const [currentStep, setCurrentStep] = useState(1);

// Tender metadata
const [tenderData, setTenderData] = useState({
  title: '',
  referenceId: '',
  description: '',
  category: '',
  submissionDeadline: '',
  authorityOrganizationId: 'ORG-AUTH-001',
  authorityOrganizationName: 'Government Authority Office',
  tenderId: null,
  status: 'DRAFT',
  createdAt: null,
  publishedAt: null,
});

// Tender sections
const [sections, setSections] = useState([
  // Each: { sectionId, tenderId, title, sectionType, content, isMandatory, orderIndex }
]);

// AI suggestions
const [aiSuggestions, setAISuggestions] = useState([]);

// Validation per step
const [validation, setValidation] = useState({
  step1: { isValid: false, errors: {...} },
  step2: { isValid: false, errors: {...} },
  step3: { isValid: false, blockingIssues: [], warnings: [], passedChecks: [], overriddenWarnings: [] },
  step4: { isValid: false },
});

// Modals
const [modals, setModals] = useState({
  saveDraft: false,
  exitConfirm: false,
});
```

### State Flow Diagram

```
TenderCreationPage (Parent)
├── tenderData ──→ TenderDetailsForm (STEP 1)
│                  └── setValidation(step1)
│
├── sections ──→ ContentBuilder (STEP 2)
│               └── setValidation(step2)
│               └── AI Assistant (integrated, optional)
│
├── validation.step3 ──→ FinalReviewPanel (STEP 3)
│                       └── setValidation(step3)
│
└── tenderData, sections ──→ PublishStep (STEP 4)
                            └── handlePublish()
```

### Child Components are Presentational

Each child component:
- Receives props from parent
- Updates parent state via callbacks
- Does NOT control navigation
- Does NOT manage workflow state
- Focuses on data entry/display only

---

## NAVIGATION CONTROL LOGIC

### Back Button

**Always allowed** (except at STEP 1 or after publish):

```javascript
const handleBack = () => {
  if (currentStep > 1 && tenderData.status !== 'PUBLISHED') {
    setCurrentStep(currentStep - 1);
  }
};
```

**Use case:**
- Fix errors in previous steps
- Review and adjust decisions
- Return to edit sections

### Next Button

**Conditional on validation:**

```javascript
const isNextDisabled = 
  currentStep === 4 ||                                    // Already at STEP 4
  !validation[stepKey]?.isValid ||                        // Current step not valid
  (currentStep === 3 && validation.step3.blockingIssues.length > 0) ||  // Blocking issues in STEP 3
  tenderData.status === 'PUBLISHED';                      // Already published

const handleNext = () => {
  // Special gate for STEP 3 → STEP 4
  if (currentStep === 3 && validation.step3.blockingIssues.length > 0) {
    return; // Block progression
  }
  
  if (currentStep < 4 && validation[stepKey]?.isValid) {
    setCurrentStep(currentStep + 1);
  }
};
```

**Progression rules:**

| From | To | Requires | Blocks |
|------|-----|----------|--------|
| STEP 1 | STEP 2 | `step1.isValid` | Invalid fields |
| STEP 2 | STEP 3 | `step2.isValid` | No sections or empty mandatory (AI usage optional) |
| STEP 3 | STEP 4 | `blockingIssues.length === 0` | Any blocking issue |
| STEP 4 | — | (End) | (No further progression) |

### Step Indicator Click

**Navigate backward only:**

```javascript
const handleStepClick = (stepNumber) => {
  if (stepNumber < currentStep) {
    setCurrentStep(stepNumber);  // Go back
  }
  // Do nothing if stepNumber >= currentStep
};
```

**Use case:**
- Quick jump to earlier step
- Disable future steps (not yet reached)
- Visual progress indicator

---

## AUDIT LOGGING

### Audit Log Entries

**Format (Mock — future: backend):**

```javascript
[MODULE AUDIT] Action description
{
  timestamp: ISO_8601,
  entityId: string,
  entityTitle: string,
  actionType: string,
  authorityOrganization: string,
  metadata: object,
}
```

### Logged Events

#### STEP 1: Tender Creation
```javascript
[TENDER AUDIT] Tender created
{
  timestamp: "2026-01-05T09:15:30.123Z",
  tenderId: "TENDER-001",
  tenderTitle: "Infrastructure Development Project",
  category: "construction",
  submissionDeadline: "2026-02-05",
  authorityOrganization: "Government Authority Office",
  actionType: "CREATE_TENDER",
}
```

#### STEP 2: Section Management
```javascript
[SECTION AUDIT] Section created
{
  timestamp: ISO,
  sectionId: "SEC-001",
  sectionTitle: "Technical Requirements",
  sectionType: "TECHNICAL",
  isMandatory: true,
  orderIndex: 0,
  authorityOrganization: string,
  actionType: "CREATE_SECTION",
}

[SECTION AUDIT] Section deleted
{
  timestamp: ISO,
  sectionId: "SEC-002",
  sectionTitle: "Old Section",
  authorityOrganization: string,
  actionType: "DELETE_SECTION",
}

[SECTION AUDIT] Section reordered
{
  timestamp: ISO,
  sectionId: "SEC-001",
  oldIndex: 0,
  newIndex: 2,
  authorityOrganization: string,
  actionType: "REORDER_SECTION",
}

[AI AUDIT] Section suggestions requested
{
  timestamp: ISO,
  tenderId: "TENDER-001",
  authorityOrganization: string,
  actionType: "REQUEST_AI_SECTION_SUGGESTIONS",
}
```

#### STEP 3: AI Assistance
```javascript
[AI AUDIT] Suggestion generation requested
{
  timestamp: ISO,
  sectionId: "SEC-001",
  sectionTitle: "Technical Requirements",
  sectionType: "TECHNICAL",
  authorityOrganization: string,
  actionType: "GENERATE_SUGGESTIONS",
}

[AI AUDIT] Suggestion accepted
{
  timestamp: ISO,
  suggestionId: "SUGG-001",
  sectionId: "SEC-001",
  authorityOrganization: string,
  actionType: "ACCEPT_SUGGESTION",
  note: "Authority must manually apply changes",
}

[AI AUDIT] Suggestion rejected
{
  timestamp: ISO,
  suggestionId: "SUGG-002",
  sectionId: "SEC-001",
  authorityOrganization: string,
  actionType: "REJECT_SUGGESTION",
}
```

#### STEP 4: Review & Validation
```javascript
[REVIEW AUDIT] Final review completed
{
  timestamp: ISO,
  tenderId: "TENDER-001",
  tenderTitle: string,
  blockingIssueCount: number,
  warningCount: number,
  passedCheckCount: number,
  authorityOrganization: string,
  actionType: "RUN_FINAL_REVIEW",
}

[REVIEW AUDIT] Warning overridden
{
  timestamp: ISO,
  tenderId: "TENDER-001",
  warningText: "No Financial section found",
  overrideReason: "This is a service tender, no budget section needed",
  authorityOrganization: string,
  actionType: "OVERRIDE_WARNING",
}
```

#### STEP 5: Publication
```javascript
[PUBLISH AUDIT] Tender published
{
  timestamp: "2026-01-05T10:30:45.123Z",
  tenderId: "TENDER-001",
  tenderTitle: "Infrastructure Development Project",
  category: "construction",
  submissionDeadline: "2026-02-05",
  sectionCount: 5,
  authorityOrganization: "Government Authority Office",
  authorityOrganizationId: "ORG-AUTH-001",
  actionType: "PUBLISH_TENDER",
  irreversible: true,
}
```

### Audit Trail Preservation

**Current implementation:**
- Logs written to browser console
- Future: Backend persistence required
- All logs must be immutable once created
- Timestamps in ISO 8601 format
- Cannot be deleted or modified

---

## COMPONENT SUMMARY

| Component | File | Step | Purpose | State Owned |
|-----------|------|------|---------|------------|
| **TenderDetailsForm** | `components/TenderDetailsForm.jsx` | 1 | Tender metadata entry | `tenderData`, `validation.step1` |
| **ContentBuilder** | `components/ContentBuilder.jsx` | 2 | Section management & AI assistance | `sections`, `validation.step2`, AI chat (integrated) |
| **FinalReviewPanel** | `components/FinalReviewPanel.jsx` | 3 | Validation & review | `validation.step3` |
| **PublishStep** | `components/PublishStep.jsx` | 4 | Publication confirmation | `tenderData.status`, `publishedAt` |

---

## IMPLEMENTATION STATUS

✅ **FULLY IMPLEMENTED**

- ✅ STEP 1: TenderDetailsForm with validation
- ✅ STEP 2: ContentBuilder with manual + AI hybrid modes and AI Review Mode
- ✅ STEP 3: FinalReviewPanel with blocking/warnings
- ✅ STEP 4: PublishStep with irreversible confirmation
- ✅ Navigation control with gating
- ✅ Audit logging (mock console)
- ✅ State management (centralized)
- ✅ Validation per step
- ✅ Draft save functionality

### Next Implementation Phase (Future)

- Backend persistence (database)
- Real AI service integration
- Email notifications on publish
- Tender analytics & reporting
- Multi-user collaboration
- Tender versioning
- Bid submission system

---

**Documentation Version:** 1.0  
**Last Updated:** January 5, 2026  
**Document Status:** CURRENT & ACCURATE  
**Maintainer:** Development Team
