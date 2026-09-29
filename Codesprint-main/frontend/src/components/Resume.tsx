import { useEffect, useMemo, useState } from "react";

import type {
  Certification,
  Experience,
  Project,
  ResumeData,
  ResumeTemplate,
  Skill,
} from "../types/portfolio";

import { getPortfolio, updateResume } from "../services/profileService";

import {
  analyzeResume,
  bullets,
  cleanHost,
  emptyCertification,
  emptyExperience,
  emptyProject,
  formatRange,
  levelLabel,
} from "../lib/resume";

type Props = {
  skills: Skill[];
  onGoToPortfolio?: () => void;
};

const ACCENTS = ["#2563eb", "#0f766e", "#7c3aed", "#be123c", "#c2410c", "#0f172a"];

const TEMPLATES: { id: ResumeTemplate; label: string; hint: string }[] = [
  { id: "modern", label: "Modern", hint: "Accent colour, clean sans-serif" },
  { id: "classic", label: "Classic", hint: "Serif, ATS-friendly" },
  { id: "compact", label: "Compact", hint: "Fits more on one page" },
];

const emptyResume: ResumeData = {
  name: "",
  email: "",
  phone: "",
  headline: "",
  location: "",
  about: "",
  githubUrl: "",
  linkedinUrl: "",
  websiteUrl: "",
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  template: "modern",
  accent: "#2563eb",
};

const inputCls = "border rounded-lg p-3";

/* ------------------------------------------------------------------ */
/* Live preview                                                        */
/* ------------------------------------------------------------------ */

function ResumePreview({ data, skills }: { data: ResumeData; skills: Skill[] }) {
  const { template, accent } = data;
  const classic = template === "classic";
  const compact = template === "compact";

  const sortedSkills = [...skills].sort((a, b) => b.level - a.level);

  const contact = [
    data.email,
    data.phone,
    data.location,
    data.linkedinUrl && cleanHost(data.linkedinUrl),
    data.githubUrl && cleanHost(data.githubUrl),
    data.websiteUrl && cleanHost(data.websiteUrl),
  ].filter(Boolean) as string[];

  const heading = (text: string) => (
    <h3
      className={`font-bold uppercase tracking-wider ${compact ? "text-[11px] mt-3 mb-1" : "text-xs mt-5 mb-2"} pb-1`}
      style={{
        color: classic ? "#111827" : accent,
        borderBottom: `${classic ? 1 : 2}px solid ${classic ? "#111827" : accent}`,
      }}
    >
      {text}
    </h3>
  );

  const bulletList = (text: string) => (
    <ul className="list-disc ml-5 mt-1 space-y-0.5">
      {bullets(text).map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );

  const exp = data.experience.filter((e) => e.company.trim() || e.position.trim());
  const proj = data.projects.filter((p) => p.name.trim());
  const certs = data.certifications.filter((c) => c.name.trim());
  const edu = data.education.filter((e) => e.institution.trim() || e.degree.trim());

  return (
    <div
      id="resume-print"
      className={`bg-white shadow-lg mx-auto w-full max-w-[794px] print:shadow-none print:max-w-none ${
        compact ? "p-6 text-[11px] leading-snug" : "p-8 text-[12px] leading-relaxed"
      } ${classic ? "font-serif" : "font-sans"} text-slate-800`}
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      {/* Header */}
      <header className={classic ? "text-center" : ""}>
        <h1
          className={`font-bold ${compact ? "text-2xl" : "text-3xl"}`}
          style={{ color: classic ? "#111827" : accent }}
        >
          {data.name || "Your Name"}
        </h1>

        {data.headline && (
          <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-slate-600 mt-0.5`}>
            {data.headline}
          </p>
        )}

        {contact.length > 0 && (
          <p className="text-slate-600 mt-1.5 break-words">
            {contact.join("  •  ")}
          </p>
        )}
      </header>

      {data.about.trim() && (
        <>
          {heading("Summary")}
          <p className="whitespace-pre-line">{data.about}</p>
        </>
      )}

      {sortedSkills.length > 0 && (
        <>
          {heading("Skills")}
          <p>
            {sortedSkills.map((s, i) => (
              <span key={s.name}>
                <b>{s.name}</b>
                {s.level >= 7 && (
                  <span className="text-slate-500"> ({levelLabel(s.level)})</span>
                )}
                {i < sortedSkills.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </>
      )}

      {exp.length > 0 && (
        <>
          {heading("Experience")}
          {exp.map((e, i) => (
            <div key={i} className={compact ? "mb-1.5" : "mb-3"} style={{ breakInside: "avoid" }}>
              <div className="flex justify-between gap-3">
                <b>
                  {e.position}
                  {e.company && <span className="font-normal"> — {e.company}</span>}
                </b>
                <span className="text-slate-500 shrink-0">{formatRange(e)}</span>
              </div>
              {e.location && <div className="text-slate-500 italic">{e.location}</div>}
              {bulletList(e.description)}
            </div>
          ))}
        </>
      )}

      {proj.length > 0 && (
        <>
          {heading("Projects")}
          {proj.map((p, i) => {
            const tech = p.technologies
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            return (
              <div key={i} className={compact ? "mb-1.5" : "mb-3"} style={{ breakInside: "avoid" }}>
                <div className="flex justify-between gap-3">
                  <b>{p.name}</b>
                  <span className="text-slate-500 text-right break-all">
                    {[p.githubUrl, p.liveUrl].filter(Boolean).map(cleanHost).join("  |  ")}
                  </span>
                </div>
                {tech.length > 0 && (
                  <div className="text-slate-500 italic">{tech.join(", ")}</div>
                )}
                {bulletList(p.description)}
              </div>
            );
          })}
        </>
      )}

      {edu.length > 0 && (
        <>
          {heading("Education")}
          {edu.map((e, i) => (
            <div key={i} className="mb-2" style={{ breakInside: "avoid" }}>
              <div className="flex justify-between gap-3">
                <b>{e.institution}</b>
                <span className="text-slate-500 shrink-0">
                  {[e.startYear, e.endYear].filter(Boolean).join(" – ")}
                </span>
              </div>
              <div>
                {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ")}
              </div>
            </div>
          ))}
        </>
      )}

      {certs.length > 0 && (
        <>
          {heading("Certifications")}
          <ul className="list-disc ml-5 space-y-0.5">
            {certs.map((c, i) => (
              <li key={i}>
                <b>{c.name}</b>
                {c.organization && ` — ${c.organization}`}
                {c.year && ` (${c.year})`}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Resume({ skills, onGoToPortfolio }: Props) {
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleResumeFile = (file?: File) => {
    setUploadError("");
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const extensionOk = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!allowed.includes(file.type) && !extensionOk) {
      setUploadError("Please choose a PDF, DOC, or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setUploadedResume(file);
  };

  useEffect(() => {
    (async () => {
      try {
        const { user } = await getPortfolio();

        setData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          headline: user.headline || "",
          location: user.location || "",
          about: user.about || "",
          githubUrl: user.githubUrl || "",
          linkedinUrl: user.linkedinUrl || "",
          websiteUrl: user.websiteUrl || "",
          education: (user.education || []).map((e: any) => ({
            institution: e.institution || "",
            degree: e.degree || "",
            fieldOfStudy: e.fieldOfStudy || "",
            startYear: e.startYear?.toString() || "",
            endYear: e.endYear?.toString() || "",
          })),
          experience: (user.experience || []).map((e: any) => ({
            ...emptyExperience(),
            ...e,
          })),
          projects: (user.projects || []).map((p: any) => ({
            ...emptyProject(),
            ...p,
            technologies: Array.isArray(p.technologies)
              ? p.technologies.join(", ")
              : p.technologies || "",
          })),
          certifications: (user.certifications || []).map((c: any) => ({
            ...emptyCertification(),
            ...c,
          })),
          template: user.resumeTemplate || "modern",
          accent: user.resumeAccent || "#2563eb",
        });
      } catch (error: any) {
        setMessage({
          text: error?.response?.data?.message || "Unable to load resume data",
          ok: false,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const strength = useMemo(() => analyzeResume(data, skills), [data, skills]);

  const patch = (changes: Partial<ResumeData>) => {
    setData((prev) => ({ ...prev, ...changes }));
    setDirty(true);
    setMessage(null);
  };

  /* generic list helpers */
  const updateItem = <T,>(key: "experience" | "projects" | "certifications", index: number, changes: Partial<T>) => {
    const list = [...(data[key] as unknown as T[])];
    list[index] = { ...list[index], ...changes };
    patch({ [key]: list } as Partial<ResumeData>);
  };

  const removeItem = (key: "experience" | "projects" | "certifications", index: number) => {
    const list = (data[key] as unknown[]).filter((_, i) => i !== index);
    patch({ [key]: list } as Partial<ResumeData>);
  };

  const moveItem = (key: "experience" | "projects" | "certifications", index: number, dir: -1 | 1) => {
    const list = [...(data[key] as unknown[])];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    patch({ [key]: list } as Partial<ResumeData>);
  };

  const save = async () => {
    if (data.about.trim() && data.about.trim().length < 20) {
      setMessage({ text: "Summary must contain at least 20 characters", ok: false });
      return;
    }

    for (const [i, e] of data.experience.entries()) {
      if ((e.company || e.position || e.description) && (!e.company.trim() || !e.position.trim())) {
        setMessage({ text: `Experience ${i + 1} needs a company and a role`, ok: false });
        return;
      }
      if (!e.current && e.startDate && e.endDate && e.endDate < e.startDate) {
        setMessage({ text: `Experience ${i + 1}: end date is before start date`, ok: false });
        return;
      }
    }

    if (data.projects.some((p) => (p.description || p.technologies) && !p.name.trim())) {
      setMessage({ text: "Every project needs a name", ok: false });
      return;
    }

    try {
      setSaving(true);

      const res = await updateResume({
        phone: data.phone,
        headline: data.headline,
        location: data.location,
        about: data.about,
        experience: data.experience,
        projects: data.projects,
        certifications: data.certifications,
        resumeTemplate: data.template,
        resumeAccent: data.accent,
      });

      setDirty(false);
      setMessage({ text: res.message || "Resume saved successfully", ok: true });
    } catch (error: any) {
      setMessage({
        text: error?.response?.data?.message || "Unable to save resume",
        ok: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const printResume = () => {
    setTab("preview");
    // let the preview mount before opening the print dialog
    setTimeout(() => {
      const previous = document.title;
      document.title = `${data.name || "Resume"} - Resume`;
      window.print();
      document.title = previous;
    }, 150);
  };

  if (loading) return <div className="p-6">Loading resume...</div>;

  const scoreColor =
    strength.score >= 80 ? "#16a34a" : strength.score >= 50 ? "#d97706" : "#dc2626";
  const scoreLabel =
    strength.score >= 80 ? "Strong" : strength.score >= 50 ? "Good start" : "Needs work";

  const card = "bg-white rounded-xl shadow p-4 sm:p-5 mt-5";
  const addBtn = "bg-blue-600 text-white px-4 py-2 rounded-lg text-sm";

  const rowActions = (key: "experience" | "projects" | "certifications", index: number, total: number) => (
    <div className="flex gap-2 items-center text-sm">
      <button
        type="button"
        onClick={() => moveItem(key, index, -1)}
        disabled={index === 0}
        className="px-2 py-1 bg-slate-100 disabled:opacity-30"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => moveItem(key, index, 1)}
        disabled={index === total - 1}
        className="px-2 py-1 bg-slate-100 disabled:opacity-30"
        aria-label="Move down"
      >
        ↓
      </button>
      <button type="button" onClick={() => removeItem(key, index)} className="text-red-600 px-2 py-1">
        Remove
      </button>
    </div>
  );

  return (
    <section>
      <div className="print:hidden">
        {/* Resume upload */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-semibold">RESUME FILE</span>
              <h3 className="text-xl font-bold text-slate-900 mt-3">Upload your existing resume</h3>
              <p className="text-sm text-slate-500 mt-1">Add a PDF or Word document to keep it handy while you build your CodeSprint resume.</p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">PDF, DOC, DOCX · Max 10 MB</div>
          </div>
          <label
            className={`mt-5 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl px-5 py-8 cursor-pointer transition-colors ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleResumeFile(e.dataTransfer.files?.[0]); }}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(e) => { handleResumeFile(e.target.files?.[0]); e.currentTarget.value = ""; }}
            />
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 text-2xl mb-3" aria-hidden="true">↑</span>
            <span className="font-semibold text-slate-800">Drag and drop your resume here</span>
            <span className="text-sm text-slate-500 mt-1">or click to browse files</span>
            <span className="mt-4 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Choose file</span>
          </label>
          {uploadError && <p role="alert" className="text-sm text-red-600 mt-3">{uploadError}</p>}
          {uploadedResume && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 font-bold text-xs">{uploadedResume.name.split(".").pop()?.toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{uploadedResume.name}</p>
                  <p className="text-xs text-slate-500">{(uploadedResume.size / 1024 / 1024).toFixed(2)} MB · Selected in this session</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={URL.createObjectURL(uploadedResume)} target="_blank" rel="noreferrer" className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">View file</a>
                <button type="button" onClick={() => setUploadedResume(null)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">Remove</button>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">This file is selected locally in your browser; it is not uploaded to the server or saved to your account yet.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Resume Builder</h2>
            <p className="text-slate-500 mt-1">
              Built from your profile, skills and portfolio. Edit, preview and download as PDF.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-green-600 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : dirty ? "Save Changes •" : "Save Resume"}
            </button>
            <button type="button" onClick={printResume} className="bg-slate-900 text-white">
              Download PDF
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
            role="status"
          >
            {message.text}
          </div>
        )}

        {/* Mobile tab switch */}
        <div className="lg:hidden mt-4 flex gap-2">
          {(["edit", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 ${tab === t ? "bg-blue-600 text-white" : "bg-white border"}`}
            >
              {t === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-2 items-start print:block">
        {/* ------------------------------ EDITOR ------------------------------ */}
        <div className={`${tab === "edit" ? "block" : "hidden"} lg:block print:hidden`}>
          {/* Strength */}
          <div className={card}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Resume Strength</h3>
              <span className="font-bold" style={{ color: scoreColor }}>
                {strength.score}/100 · {scoreLabel}
              </span>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${strength.score}%`, background: scoreColor }}
              />
            </div>

            {strength.tips.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm">
                {strength.tips.slice(0, 5).map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{
                        background:
                          tip.level === "high" ? "#dc2626" : tip.level === "medium" ? "#d97706" : "#94a3b8",
                      }}
                    />
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-green-700">
                Your resume covers all the essentials. Nice work!
              </p>
            )}

            {(strength.checks.some((c) => !c.done && ["Education", "5+ skills"].includes(c.label)) ||
              !data.linkedinUrl) &&
              onGoToPortfolio && (
                <button
                  type="button"
                  onClick={onGoToPortfolio}
                  className="mt-4 text-sm text-blue-600 bg-blue-50"
                >
                  Open Digital Portfolio →
                </button>
              )}
          </div>

          {/* Design */}
          <div className={card}>
            <h3 className="text-xl font-bold">Template</h3>

            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => patch({ template: t.id })}
                  className={`text-left border p-3 ${
                    data.template === t.id ? "border-blue-600 bg-blue-50" : "bg-white"
                  }`}
                >
                  <div className="font-bold">{t.label}</div>
                  <div className="text-xs text-slate-500 font-normal">{t.hint}</div>
                </button>
              ))}
            </div>

            {data.template !== "classic" && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-slate-500 mr-1">Accent</span>
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Accent ${c}`}
                    onClick={() => patch({ accent: c })}
                    className="!p-0 w-7 h-7 rounded-full"
                    style={{
                      background: c,
                      outline: data.accent === c ? `3px solid ${c}55` : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Contact & summary */}
          <div className={card}>
            <h3 className="text-xl font-bold">Contact & Summary</h3>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <input className={inputCls} placeholder="Phone (e.g. +91 98765 43210)" value={data.phone}
                onChange={(e) => patch({ phone: e.target.value })} />
              <input className={inputCls} placeholder="Location (City, Country)" value={data.location}
                onChange={(e) => patch({ location: e.target.value })} />
            </div>

            <input className={`${inputCls} mt-3`} maxLength={150}
              placeholder="Headline (e.g. Final-year CSE student | Full-stack developer)"
              value={data.headline} onChange={(e) => patch({ headline: e.target.value })} />

            <textarea className={`${inputCls} mt-3 min-h-28`} maxLength={1000}
              placeholder="Professional summary – 2 to 3 sentences on your focus, strengths and goals."
              value={data.about} onChange={(e) => patch({ about: e.target.value })} />
            <p className="text-xs text-slate-400 text-right">{data.about.length}/1000</p>

            <p className="text-xs text-slate-500 mt-1">
              Email, links, education and skills come from your profile, Digital Portfolio and Skill Assessment.
            </p>
          </div>

          {/* Experience */}
          <div className={card}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Experience</h3>
              <button type="button" className={addBtn}
                onClick={() => patch({ experience: [...data.experience, emptyExperience()] })}>
                + Add
              </button>
            </div>

            {data.experience.length === 0 && (
              <p className="text-sm text-slate-500 mt-3">
                Internships, part-time jobs, freelance work, volunteering or club leadership.
              </p>
            )}

            {data.experience.map((item, i) => (
              <div key={i} className="border rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <strong>Experience {i + 1}</strong>
                  {rowActions("experience", i, data.experience.length)}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="Role / Position *" value={item.position}
                    onChange={(e) => updateItem<Experience>("experience", i, { position: e.target.value })} />
                  <input className={inputCls} placeholder="Company / Organization *" value={item.company}
                    onChange={(e) => updateItem<Experience>("experience", i, { company: e.target.value })} />
                  <input className={inputCls} placeholder="Location (or Remote)" value={item.location}
                    onChange={(e) => updateItem<Experience>("experience", i, { location: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="!w-auto" checked={item.current}
                      onChange={(e) => updateItem<Experience>("experience", i, { current: e.target.checked })} />
                    I currently work here
                  </label>
                  <div>
                    <span className="text-xs text-slate-500">Start</span>
                    <input type="month" className={inputCls} value={item.startDate}
                      onChange={(e) => updateItem<Experience>("experience", i, { startDate: e.target.value })} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">End</span>
                    <input type="month" className={`${inputCls} disabled:bg-slate-100`} value={item.current ? "" : item.endDate}
                      disabled={item.current} min={item.startDate || undefined}
                      onChange={(e) => updateItem<Experience>("experience", i, { endDate: e.target.value })} />
                  </div>
                </div>

                <textarea className={`${inputCls} mt-3 min-h-28`} maxLength={2000}
                  placeholder={"One achievement per line, e.g.\nBuilt a REST API in Node.js serving 2,000 daily requests\nReduced page load time by 35%"}
                  value={item.description}
                  onChange={(e) => updateItem<Experience>("experience", i, { description: e.target.value })} />
                <p className="text-xs text-slate-400">Each line becomes a bullet point.</p>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className={card}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Projects</h3>
              <button type="button" className={addBtn}
                onClick={() => patch({ projects: [...data.projects, emptyProject()] })}>
                + Add
              </button>
            </div>

            {data.projects.length === 0 && (
              <p className="text-sm text-slate-500 mt-3">
                Add academic, personal or hackathon projects – aim for at least two.
              </p>
            )}

            {data.projects.map((item, i) => (
              <div key={i} className="border rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <strong>Project {i + 1}</strong>
                  {rowActions("projects", i, data.projects.length)}
                </div>

                <input className={inputCls} placeholder="Project name *" value={item.name}
                  onChange={(e) => updateItem<Project>("projects", i, { name: e.target.value })} />

                <input className={`${inputCls} mt-3`} placeholder="Technologies (comma separated: React, Node.js, MongoDB)"
                  value={item.technologies}
                  onChange={(e) => updateItem<Project>("projects", i, { technologies: e.target.value })} />

                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <input className={inputCls} placeholder="GitHub link" value={item.githubUrl}
                    onChange={(e) => updateItem<Project>("projects", i, { githubUrl: e.target.value })} />
                  <input className={inputCls} placeholder="Live demo link" value={item.liveUrl}
                    onChange={(e) => updateItem<Project>("projects", i, { liveUrl: e.target.value })} />
                </div>

                <textarea className={`${inputCls} mt-3 min-h-24`} maxLength={2000}
                  placeholder={"One point per line, e.g.\nImplemented JWT authentication with role-based access\nDeployed on Vercel with CI/CD"}
                  value={item.description}
                  onChange={(e) => updateItem<Project>("projects", i, { description: e.target.value })} />
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className={card}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Certifications</h3>
              <button type="button" className={addBtn}
                onClick={() => patch({ certifications: [...data.certifications, emptyCertification()] })}>
                + Add
              </button>
            </div>

            {data.certifications.map((item, i) => (
              <div key={i} className="border rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <strong>Certification {i + 1}</strong>
                  {rowActions("certifications", i, data.certifications.length)}
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <input className={`${inputCls} sm:col-span-3`} placeholder="Certification name *" value={item.name}
                    onChange={(e) => updateItem<Certification>("certifications", i, { name: e.target.value })} />
                  <input className={`${inputCls} sm:col-span-2`} placeholder="Issuing organization" value={item.organization}
                    onChange={(e) => updateItem<Certification>("certifications", i, { organization: e.target.value })} />
                  <input className={inputCls} inputMode="numeric" maxLength={4} placeholder="Year" value={item.year}
                    onChange={(e) => updateItem<Certification>("certifications", i, { year: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full mt-5 bg-green-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Resume"}
          </button>
        </div>

        {/* ------------------------------ PREVIEW ------------------------------ */}
        <div className={`${tab === "preview" ? "block" : "hidden"} lg:block lg:sticky lg:top-20 mt-5 print:!block print:mt-0`}>
          <div className="flex justify-between items-center mb-2 print:hidden">
            <span className="text-sm text-slate-500">Live preview (A4)</span>
            <button type="button" onClick={printResume} className="bg-slate-900 text-white text-sm">
              Download PDF
            </button>
          </div>

          <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-auto print:!max-h-none print:!overflow-visible">
            <ResumePreview data={data} skills={skills} />
          </div>

          <p className="text-xs text-slate-400 mt-2 print:hidden">
            Tip: in the print dialog choose "Save as PDF", set margins to "None" and untick "Headers and footers".
          </p>
        </div>
      </div>
    </section>
  );
}
