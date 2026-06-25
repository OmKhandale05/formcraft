# FormCraft

A polished no-code form builder for visually designing, previewing, validating, saving, and exporting production-style forms.

FormCraft is built as a portfolio-grade SaaS product experience. It is not just a static UI mockup: the app uses a typed form schema, drag-and-drop builder interactions, local persistence, schema-driven rendering, validation, templates, submissions, version history, logic rules, and export flows.

## Why This Project Exists

Most portfolio form builders stop at "add a text field." FormCraft goes deeper. It demonstrates the kind of frontend product work that appears in real internal tools, workflow builders, survey platforms, CRMs, and startup SaaS dashboards:

- complex drag-and-drop UX
- schema-first data modeling
- reusable field rendering
- form validation logic
- local workflow persistence
- submission review operations
- advanced field configuration
- polished UI states, dialogs, toasts, and responsive layouts

## Product Walkthrough

### Builder

The builder is the main workspace where users compose a form visually.

- Drag fields from the left sidebar into the canvas
- Reorder fields directly inside the canvas
- Multi-select fields with Shift+click
- Duplicate or delete fields
- Edit field labels, placeholders, helper text, required state, options, validation, layout, and advanced settings
- Resize the builder panels
- Edit form title and description from the canvas details control
- Save local version snapshots
- Import and export form definitions

### Preview

The preview page renders the actual form from the current schema.

- Desktop and mobile preview modes
- React Hook Form powered submission handling
- Zod validation for required and typed fields
- Success state after submission
- Local mock submission capture
- JSON schema and embed snippet are available through focused copy dialogs

### Submissions

The submissions page works like a lightweight response operations dashboard.

- Search and filter submitted responses
- Filter by status: new, flagged, reviewed, archived
- View response details in a drawer
- Add internal notes
- Mark reviewed, flag, unflag, or archive responses
- Bulk update selected submissions
- Export CSV and JSON
- Download captured signatures when available
- Bottom-right action toasts for review, flag, unflag, and archive actions

### Templates

Templates help users start from realistic form workflows instead of a blank canvas.

- Contact form
- Job application
- Event registration
- Feedback survey
- Lead generation
- Template preview and setup flow
- Save current form as a reusable local template

### Settings

The settings area works as the control center for the form.

- Edit title, name, and description
- Tune typography, spacing, colors, borders, focus styles, and animation presets
- Configure conditional logic rules
- View form health and readiness signals
- Save and restore local version history
- Delete version snapshots with themed confirmation toasts

## Field Types

FormCraft includes common fields and advanced product-style fields:

- Text input
- Email input
- Phone input with country flag and dial code
- Textarea
- Number input
- Dropdown
- Radio group
- Checkbox group
- Date picker
- Date range
- File upload placeholder
- Rating
- Signature
- Slider
- Rich text
- Matrix / grid
- Hidden field
- Payment field with currency support
- Formula output
- Section title
- Divider

## Advanced Highlights

- **Schema-driven rendering**: one form schema powers the builder, preview, export, and submissions.
- **Version history**: users can save restore points locally, up to a 20-version limit.
- **Logic builder**: conditional rules can show, hide, require, or make fields optional.
- **Formula field**: supports simple calculation workflows between existing fields.
- **Matrix field controls**: row and column management, alternate row styling, input type selection, and grid color settings.
- **Theme system**: style presets, font choices, field radius, border width, focus styling, motion, and dark/light preview behavior.
- **Local-first persistence**: forms, submissions, templates, metadata, and versions are stored in the browser.
- **Product feedback details**: custom dialogs, copy states, action toasts, empty states, and loading states.

## Tech Stack

- **Next.js** for the app framework
- **TypeScript** for type-safe schema and component logic
- **TailwindCSS** for styling
- **dnd-kit** for drag-and-drop interactions
- **Zustand** for local app state and persistence
- **React Hook Form** for preview form submission handling
- **Zod** for validation schema logic
- **Framer Motion** for subtle UI motion
- **lucide-react** for icons
- **localStorage** for local persistence

## Project Structure

```text
src/
  app/
    builder/        Builder workspace
    preview/        Live form preview and code dialogs
    settings/       Theme, logic, health, and version history
    submissions/    Response review dashboard
    templates/      Template gallery and setup flow
    signin/         Product-style sign-in screen
  components/
    builder/        Builder-specific panels and controls
    ui/             Reusable UI primitives
    form-renderer   Schema-driven form renderer
  lib/
    appearance      Theme presets and style helpers
    exporters       JSON, HTML, React, Zod, and TypeScript exports
    field-catalog   Field definitions
    formula         Formula evaluation helpers
    logic           Conditional logic helpers
    templates       Built-in templates
  store/
    form-store      Zustand store and local persistence
  types/
    form            Typed form schema, field, submission, and version models
```

## Screenshots

Add screenshots or GIFs here after capturing the running app:

- Builder workspace
- Field settings panel
- Preview form
- JSON / embed copy dialog
- Submissions dashboard
- Template setup modal
- Settings appearance controls
- Version history

Suggested folder:

```text
docs/screenshots/
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Local Persistence

FormCraft is local-first. It stores workspace data in the browser so the project can work without a backend:

- current form schema
- mock submissions
- submission review metadata
- saved templates
- version history
- theme/settings changes

Clearing browser storage will reset the local workspace.

## Portfolio Value

FormCraft is designed to show frontend and UI/UX product capability in one project:

- building an app with a real workflow, not just a landing page
- translating complex product requirements into usable UI
- handling schema design and state management
- creating reusable renderer architecture
- designing polished dashboards, modals, toasts, empty states, and responsive layouts
- thinking like a product engineer, not only a component builder

## Possible Next Improvements

- Backend persistence and authentication
- Team workspaces
- Published public form links
- Real file uploads
- Stripe integration for payment fields
- More analytics for submissions
- Shareable template marketplace
- Undo / redo stack for builder edits

