import type { FormSchema } from "@/types/form";

const theme = {
  accentColor: "#2563eb",
  radius: "rounded" as const,
  mode: "light" as const
};

export const templates: Array<FormSchema & { category: string; summary: string }> = [
  {
    id: "template-contact",
    name: "Contact Form",
    title: "Contact our team",
    description: "Capture qualified inbound messages from prospects and partners.",
    category: "Support",
    summary: "Name, email, company, message and priority routing.",
    updatedAt: new Date().toISOString(),
    theme,
    fields: [
      { id: "name", type: "text", label: "Full name", placeholder: "Alex Morgan", required: true, step: 1 },
      { id: "email", type: "email", label: "Work email", placeholder: "alex@company.com", required: true, step: 1 },
      { id: "company", type: "text", label: "Company", placeholder: "Acme Inc.", required: false, step: 1 },
      { id: "message", type: "textarea", label: "How can we help?", placeholder: "Share a few details", required: true, step: 1 }
    ]
  },
  {
    id: "template-job",
    name: "Job Application",
    title: "Apply for this role",
    description: "Collect applicant details, links, experience and resume uploads.",
    category: "Hiring",
    summary: "Candidate profile with role, portfolio and resume placeholder.",
    updatedAt: new Date().toISOString(),
    theme: { ...theme, accentColor: "#0f766e" },
    fields: [
      { id: "candidate", type: "text", label: "Candidate name", required: true, step: 1 },
      { id: "candidate_email", type: "email", label: "Email", required: true, step: 1 },
      { id: "role", type: "dropdown", label: "Role", required: true, options: ["Frontend Engineer", "Product Designer", "Product Manager"], step: 1 },
      { id: "portfolio", type: "text", label: "Portfolio or LinkedIn", required: false, step: 2 },
      { id: "resume", type: "file", label: "Resume", helperText: "Upload UI placeholder for portfolio demo.", required: false, step: 2 }
    ]
  },
  {
    id: "template-event",
    name: "Event Registration",
    title: "Reserve your seat",
    description: "Manage registrations for workshops, launches and community events.",
    category: "Events",
    summary: "Guest info, date preference, attendee count and interests.",
    updatedAt: new Date().toISOString(),
    theme: { ...theme, accentColor: "#d97706" },
    fields: [
      { id: "guest", type: "text", label: "Guest name", required: true, step: 1 },
      { id: "event_email", type: "email", label: "Email", required: true, step: 1 },
      { id: "date", type: "date", label: "Preferred date", required: true, step: 1 },
      { id: "attendees", type: "number", label: "Number of attendees", required: true, step: 1, validation: { min: 1, max: 10 } },
      { id: "interests", type: "checkbox", label: "Topics of interest", required: false, step: 2, options: ["Product", "Design", "Growth"] }
    ]
  },
  {
    id: "template-feedback",
    name: "Feedback Survey",
    title: "Tell us what to improve",
    description: "Gather structured product feedback after a feature release.",
    category: "Product",
    summary: "Satisfaction, feature feedback and follow-up permission.",
    updatedAt: new Date().toISOString(),
    theme: { ...theme, accentColor: "#7c3aed" },
    fields: [
      { id: "satisfaction", type: "radio", label: "How was your experience?", required: true, options: ["Excellent", "Good", "Needs work"], step: 1 },
      { id: "favorite", type: "textarea", label: "What worked well?", required: false, step: 1 },
      { id: "improve", type: "textarea", label: "What should we improve?", required: true, step: 1 },
      { id: "followup", type: "email", label: "Email for follow-up", required: false, step: 1 }
    ]
  },
  {
    id: "template-lead",
    name: "Lead Generation",
    title: "Get a tailored product demo",
    description: "Qualify prospects by team size, budget and urgency.",
    category: "Sales",
    summary: "B2B lead capture with budget and timeline questions.",
    updatedAt: new Date().toISOString(),
    theme: { ...theme, accentColor: "#db2777" },
    fields: [
      { id: "lead_name", type: "text", label: "Name", required: true, step: 1 },
      { id: "lead_email", type: "email", label: "Business email", required: true, step: 1 },
      { id: "team_size", type: "dropdown", label: "Team size", required: true, options: ["1-10", "11-50", "51-200", "200+"], step: 1 },
      { id: "budget", type: "radio", label: "Monthly budget", required: true, options: ["Under $500", "$500-$2k", "$2k+"], step: 2 },
      { id: "timeline", type: "dropdown", label: "Timeline", required: true, options: ["This week", "This month", "This quarter"], step: 2 }
    ]
  }
];

export const defaultForm: FormSchema = {
  id: "formcraft-demo",
  name: "Untitled form",
  title: "New customer intake",
  description: "Collect the details your team needs to qualify and respond quickly.",
  updatedAt: new Date().toISOString(),
  theme,
  fields: [
    { id: "intro", type: "section", label: "Contact details", helperText: "Step 1", step: 1 },
    { id: "full_name", type: "text", label: "Full name", placeholder: "Taylor Kim", required: true, step: 1 },
    { id: "work_email", type: "email", label: "Work email", placeholder: "taylor@company.com", required: true, step: 1 },
    { id: "project_type", type: "dropdown", label: "Project type", required: true, options: ["Website", "Internal tool", "Mobile app"], step: 1 },
    { id: "line", type: "divider", label: "Divider", step: 1 },
    { id: "scope", type: "textarea", label: "What are you trying to build?", placeholder: "Describe the goal, timeline and constraints", required: true, step: 2 }
  ]
};
