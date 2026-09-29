import type {
  Certification,
  Experience,
  Project,
  ResumeData,
  Skill,
} from "../types/portfolio";

/* ---------- formatting helpers ---------- */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || "");
  if (!match) return "";
  return `${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

export function formatRange(exp: Pick<Experience, "startDate" | "endDate" | "current">) {
  const start = formatMonth(exp.startDate);
  const end = exp.current ? "Present" : formatMonth(exp.endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

export function bullets(text: string) {
  return (text || "")
    .split("\n")
    .map((line) => line.replace(/^[\s•\-*–]+/, "").trim())
    .filter(Boolean);
}

export function cleanHost(url: string) {
  return (url || "").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

export function levelLabel(level: number) {
  if (level >= 9) return "Expert";
  if (level >= 7) return "Advanced";
  if (level >= 4) return "Intermediate";
  return "Beginner";
}

/* ---------- empty templates ---------- */

export const emptyExperience = (): Experience => ({
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

export const emptyProject = (): Project => ({
  name: "",
  description: "",
  technologies: "",
  githubUrl: "",
  liveUrl: "",
});

export const emptyCertification = (): Certification => ({
  name: "",
  organization: "",
  year: "",
});

/* ---------- resume strength ---------- */

const ACTION_VERBS = new Set(
  (
    "built developed designed created implemented led managed improved increased reduced " +
    "launched automated optimized delivered analyzed engineered deployed integrated " +
    "organized coordinated established streamlined researched tested migrated mentored " +
    "presented wrote maintained collaborated architected configured refactored achieved " +
    "resolved trained drove owned shipped produced"
  ).split(" ")
);

export type Tip = { level: "high" | "medium" | "low"; text: string };

export type Strength = {
  score: number;
  tips: Tip[];
  checks: { label: string; done: boolean; points: number }[];
};

export function analyzeResume(data: ResumeData, skills: Skill[]): Strength {
  const tips: Tip[] = [];
  const checks: Strength["checks"] = [];

  const add = (label: string, done: boolean, points: number) =>
    checks.push({ label, done, points });

  const hasContact = Boolean(data.phone.trim());
  add("Phone number", hasContact, 5);
  if (!hasContact) {
    tips.push({ level: "medium", text: "Add a phone number so recruiters can reach you quickly." });
  }

  add("Location", Boolean(data.location.trim()), 3);

  const linkCount = [data.linkedinUrl, data.githubUrl, data.websiteUrl].filter((x) => x.trim()).length;
  add("Professional links (LinkedIn / GitHub / website)", linkCount >= 1, 7);
  if (linkCount === 0) {
    tips.push({
      level: "medium",
      text: "Add a LinkedIn or GitHub link in Digital Portfolio – recruiters check them.",
    });
  }

  const headlineOk = data.headline.trim().length >= 10;
  add("Professional headline", headlineOk, 5);
  if (!headlineOk) {
    tips.push({
      level: "medium",
      text: 'Write a headline such as "Final-year CSE student | React & Node.js developer".',
    });
  }

  const summaryLen = data.about.trim().length;
  add("Summary of 120+ characters", summaryLen >= 120, 12);
  if (summaryLen < 20) {
    tips.push({ level: "high", text: "Write a short professional summary (2–3 sentences)." });
  } else if (summaryLen < 120) {
    tips.push({
      level: "medium",
      text: "Your summary is short – mention your focus, top skills and what you are looking for.",
    });
  } else if (summaryLen > 600) {
    tips.push({ level: "low", text: "Trim your summary to under ~600 characters for a cleaner resume." });
  }

  const eduOk = data.education.some((e) => e.institution.trim() && e.degree.trim());
  add("Education", eduOk, 15);
  if (!eduOk) {
    tips.push({ level: "high", text: "Add your education in Digital Portfolio." });
  }

  add("5+ skills", skills.length >= 5, 15);
  if (skills.length === 0) {
    tips.push({ level: "high", text: "Add skills in Skill Assessment – they appear on your resume automatically." });
  } else if (skills.length < 5) {
    tips.push({ level: "medium", text: "List at least 5 relevant skills to pass keyword filters." });
  }

  const exp = data.experience.filter((e) => e.company.trim() || e.position.trim());
  const proj = data.projects.filter((p) => p.name.trim());
  add("Experience or internship", exp.length > 0, 13);
  add("2+ projects", proj.length >= 2, 15);

  if (exp.length === 0 && proj.length === 0) {
    tips.push({
      level: "high",
      text: "Add an internship, part-time role or at least two projects – this is what recruiters read first.",
    });
  } else if (exp.length === 0) {
    tips.push({
      level: "low",
      text: "No experience yet? Add volunteering, freelance work, hackathons or club roles.",
    });
  }
  if (proj.length === 1) {
    tips.push({ level: "medium", text: "Add a second project to show range." });
  }

  add("Certifications", data.certifications.some((c) => c.name.trim()), 10);

  /* bullet quality */
  const allBullets = [
    ...exp.flatMap((e) => bullets(e.description).map((b) => ({ b, where: e.position || e.company }))),
    ...proj.flatMap((p) => bullets(p.description).map((b) => ({ b, where: p.name }))),
  ];

  const noVerb = allBullets.filter(({ b }) => {
    const first = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    return !ACTION_VERBS.has(first);
  });

  if (allBullets.length > 0 && noVerb.length / allBullets.length > 0.4) {
    tips.push({
      level: "medium",
      text: `Start bullets with strong verbs (Built, Led, Improved…). e.g. "${noVerb[0].b.slice(0, 40)}${noVerb[0].b.length > 40 ? "…" : ""}" in ${noVerb[0].where}.`,
    });
  }

  const withNumbers = allBullets.filter(({ b }) => /\d/.test(b)).length;
  if (allBullets.length >= 2 && withNumbers === 0) {
    tips.push({
      level: "medium",
      text: 'Quantify impact where you can – "reduced load time by 40%", "used by 200 students".',
    });
  }

  const longBullet = allBullets.find(({ b }) => b.length > 220);
  if (longBullet) {
    tips.push({ level: "low", text: `A bullet in ${longBullet.where} is very long – keep each to 1–2 lines.` });
  }

  const emptyDesc = [...exp, ...proj].some((x) => !bullets(x.description).length);
  if (emptyDesc) {
    tips.push({ level: "medium", text: "Some entries have no description – add 2–4 bullet points each." });
  }

  const score = Math.min(
    100,
    checks.reduce((sum, c) => sum + (c.done ? c.points : 0), 0)
  );

  const order = { high: 0, medium: 1, low: 2 };
  tips.sort((a, b) => order[a.level] - order[b.level]);

  return { score, tips, checks };
}
