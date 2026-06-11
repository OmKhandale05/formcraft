import type { FormField, FormSchema } from "@/types/form";

const baseTheme = {
  accentColor: "#2563eb",
  radius: "rounded" as const,
  mode: "light" as const
};

const initialUpdatedAt = "2026-06-10T00:00:00.000Z";

export type TemplateSchema = FormSchema & {
  category: string;
  summary: string;
  badge: string;
  gradient: string;
  highlights: string[];
};

const divider = (id: string, step: number): FormField => ({ id, type: "divider", label: "Divider", step });

export const templates: TemplateSchema[] = [
  {
    id: "template-contact",
    name: "Contact Intake",
    title: "Talk to our team",
    description: "Route qualified inbound requests with contact details, priority, budget and campaign attribution.",
    category: "Support",
    badge: "Client ops",
    summary: "A polished inbound contact flow with hidden UTM capture and priority routing.",
    gradient: "from-[#3157d5] via-[#0f766e] to-[#111418]",
    highlights: ["Hidden UTM", "Priority dropdown", "Budget slider"],
    updatedAt: initialUpdatedAt,
    theme: { ...baseTheme, accentColor: "#3157d5" },
    fields: [
      { id: "contact_intro", type: "section", label: "Contact details", helperText: "Step 1 · Qualify the requester", step: 1 },
      { id: "full_name", type: "text", label: "Full name", placeholder: "Alex Morgan", required: true, step: 1 },
      { id: "work_email", type: "email", label: "Work email", placeholder: "alex@company.com", required: true, step: 1 },
      { id: "phone", type: "phone", label: "Phone number", placeholder: "98765 43210", required: false, step: 1, settings: { countryCode: "+91" } },
      { id: "company", type: "text", label: "Company", placeholder: "Acme Labs", required: false, step: 1 },
      { id: "utm_source", type: "hidden", label: "UTM source", required: false, step: 1, settings: { hiddenValue: "utm_source=portfolio" } },
      divider("contact_divider", 2),
      { id: "request_type", type: "dropdown", label: "What do you need?", required: true, options: ["Product demo", "Partnership", "Support", "Press"], step: 2 },
      { id: "budget_range", type: "slider", label: "Estimated monthly budget", required: false, step: 2, settings: { sliderMin: 500, sliderMax: 25000, sliderStep: 500 } },
      { id: "message", type: "richtext", label: "Project notes", placeholder: "Share goals, timeline and context", required: true, step: 2 }
    ]
  },
  {
    id: "template-job",
    name: "Talent Pipeline",
    title: "Apply for this role",
    description: "Collect candidate details, resume uploads, portfolio links and signed application consent.",
    category: "Hiring",
    badge: "Recruiting",
    summary: "A modern hiring form with resume restrictions, availability range and signature consent.",
    gradient: "from-[#0f766e] via-[#14b8a6] to-[#334155]",
    highlights: ["Resume upload", "Availability range", "Signature consent"],
    updatedAt: initialUpdatedAt,
    theme: { ...baseTheme, accentColor: "#0f766e" },
    fields: [
      { id: "candidate_intro", type: "section", label: "Candidate profile", helperText: "Step 1 · Basic details", step: 1 },
      { id: "candidate_name", type: "text", label: "Candidate name", placeholder: "Taylor Kim", required: true, step: 1 },
      { id: "candidate_email", type: "email", label: "Email", placeholder: "taylor@example.com", required: true, step: 1 },
      { id: "candidate_phone", type: "phone", label: "Phone", required: false, step: 1, settings: { countryCode: "+1" } },
      { id: "role", type: "dropdown", label: "Role", required: true, options: ["Frontend Engineer", "Product Designer", "Product Manager", "Founding Engineer"], step: 1 },
      { id: "seniority", type: "radio", label: "Experience level", required: true, options: ["Junior", "Mid-level", "Senior", "Lead"], step: 1 },
      divider("job_divider", 2),
      { id: "portfolio", type: "text", label: "Portfolio or LinkedIn", placeholder: "https://", required: false, step: 2 },
      { id: "resume", type: "file", label: "Resume", helperText: "PDF only. Max 5MB.", required: false, step: 2, settings: { acceptedFileTypes: ".pdf", maxFileSizeMb: 5 } },
      { id: "availability", type: "daterange", label: "Interview availability", required: true, step: 2 },
      { id: "consent_signature", type: "signature", label: "Application consent signature", required: true, step: 2 }
    ]
  },
  {
    id: "template-event",
    name: "Event Registration",
    title: "Reserve your seat",
    description: "Register guests for workshops, launches and paid community events with dietary and payment fields.",
    category: "Events",
    badge: "Paid event",
    summary: "A multi-step event form with date range, attendee details and payment amount.",
    gradient: "from-[#d97706] via-[#ef4444] to-[#7c2d12]",
    highlights: ["Date range", "Payment field", "Dietary notes"],
    updatedAt: initialUpdatedAt,
    theme: { ...baseTheme, accentColor: "#d97706" },
    fields: [
      { id: "event_intro", type: "section", label: "Guest information", helperText: "Step 1 · Who is attending?", step: 1 },
      { id: "guest_name", type: "text", label: "Guest name", required: true, step: 1 },
      { id: "event_email", type: "email", label: "Email", required: true, step: 1 },
      { id: "event_dates", type: "daterange", label: "Preferred event window", required: true, step: 1 },
      { id: "attendees", type: "number", label: "Number of attendees", required: true, step: 1, validation: { min: 1, max: 10 } },
      divider("event_divider", 2),
      { id: "interests", type: "checkbox", label: "Tracks of interest", required: false, options: ["Product", "Design", "Growth", "AI"], step: 2 },
      { id: "dietary", type: "textarea", label: "Dietary or accessibility notes", placeholder: "Optional notes", required: false, step: 2 },
      { id: "ticket_amount", type: "payment", label: "Ticket amount", required: true, step: 2, settings: { currency: "USD" } }
    ]
  },
  {
    id: "template-feedback",
    name: "Product Feedback",
    title: "Tell us what to improve",
    description: "Capture post-launch feedback with ratings, matrix scoring and rich qualitative notes.",
    category: "Product",
    badge: "Research",
    summary: "A research-ready survey with star ratings, matrix scoring and follow-up consent.",
    gradient: "from-[#7c3aed] via-[#db2777] to-[#111827]",
    highlights: ["Star rating", "Matrix scoring", "Rich notes"],
    updatedAt: initialUpdatedAt,
    theme: { ...baseTheme, accentColor: "#7c3aed" },
    fields: [
      { id: "feedback_intro", type: "section", label: "Experience score", helperText: "Step 1 · Rate the release", step: 1 },
      { id: "satisfaction", type: "rating", label: "Overall experience", required: true, step: 1, settings: { ratingStyle: "stars", ratingScale: 5 } },
      { id: "feature_matrix", type: "matrix", label: "Feature quality", required: false, step: 1, settings: { matrixRows: ["Ease of use", "Visual design", "Performance", "Reliability"], matrixColumns: ["Poor", "Okay", "Great"] } },
      { id: "favorite", type: "richtext", label: "What worked well?", placeholder: "Use bullets or quotes if helpful", required: false, step: 2 },
      { id: "improve", type: "richtext", label: "What should we improve?", placeholder: "Share specific moments or blockers", required: true, step: 2 },
      { id: "followup", type: "email", label: "Email for follow-up", required: false, step: 2 }
    ]
  },
  {
    id: "template-lead",
    name: "Lead Qualification",
    title: "Get a tailored product demo",
    description: "Qualify prospects by team size, rollout urgency, budget and purchase intent.",
    category: "Sales",
    badge: "Revenue",
    summary: "A polished B2B lead form with budget slider, urgency, hidden campaign metadata and payment intent.",
    gradient: "from-[#db2777] via-[#f97316] to-[#111418]",
    highlights: ["Budget slider", "Campaign metadata", "Buying timeline"],
    updatedAt: initialUpdatedAt,
    theme: { ...baseTheme, accentColor: "#db2777" },
    fields: [
      { id: "lead_intro", type: "section", label: "Lead profile", helperText: "Step 1 · Company fit", step: 1 },
      { id: "lead_name", type: "text", label: "Name", required: true, step: 1 },
      { id: "lead_email", type: "email", label: "Business email", required: true, step: 1 },
      { id: "team_size", type: "dropdown", label: "Team size", required: true, options: ["1-10", "11-50", "51-200", "200+"], step: 1 },
      { id: "campaign", type: "hidden", label: "Campaign", required: false, step: 1, settings: { hiddenValue: "campaign=portfolio_demo" } },
      divider("lead_divider", 2),
      { id: "monthly_budget", type: "slider", label: "Monthly budget", required: true, step: 2, settings: { sliderMin: 1000, sliderMax: 50000, sliderStep: 1000 } },
      { id: "timeline", type: "dropdown", label: "Buying timeline", required: true, options: ["This week", "This month", "This quarter", "Just researching"], step: 2 },
      { id: "intent", type: "rating", label: "Purchase intent", required: true, step: 2, settings: { ratingStyle: "emoji", ratingScale: 5 } },
      { id: "notes", type: "richtext", label: "What problem are you solving?", placeholder: "Describe the workflow, team and desired outcome", required: false, step: 2 }
    ]
  }
];

export const defaultForm: FormSchema = {
  id: "formcraft-demo",
  name: "Untitled form",
  title: "New customer intake",
  description: "Collect the details your team needs to qualify and respond quickly.",
  updatedAt: initialUpdatedAt,
  theme: baseTheme,
  fields: [
    { id: "intro", type: "section", label: "Contact details", helperText: "Step 1", step: 1 },
    { id: "full_name", type: "text", label: "Full name", placeholder: "Taylor Kim", required: true, step: 1 },
    { id: "work_email", type: "email", label: "Work email", placeholder: "taylor@company.com", required: true, step: 1 },
    { id: "project_type", type: "dropdown", label: "Project type", required: true, options: ["Website", "Internal tool", "Mobile app"], step: 1 },
    { id: "line", type: "divider", label: "Divider", step: 1 },
    { id: "scope", type: "richtext", label: "What are you trying to build?", placeholder: "Describe the goal, timeline and constraints", required: true, step: 2 }
  ]
};
