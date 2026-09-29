/* Shared validators/sanitizers for resume-related profile data.
   They throw errors with a `status` so the global error handler
   (server.js) returns a friendly 400 message. */

const fail = (message) => {
  const error = new Error(message);
  error.status = 400;
  throw error;
};

export const str = (value, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export const cleanMonth = (value, label) => {
  const v = str(value, 7);
  if (v && !MONTH_RE.test(v)) fail(`${label} must be a valid month`);
  return v;
};

export const cleanUrl = (value, label) => {
  let v = str(value, 300);
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const url = new URL(v);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    if (!url.hostname.includes(".")) throw new Error();
  } catch {
    fail(`${label} is not a valid link`);
  }
  return v;
};

export const cleanPhone = (value) => {
  const v = str(value, 30);
  if (v && !/^[+()\-.\s\d]{6,30}$/.test(v)) {
    fail("Please enter a valid phone number");
  }
  return v;
};

export const cleanExperience = (list) => {
  if (!Array.isArray(list)) return [];
  if (list.length > 15) fail("You can add up to 15 experience entries");

  return list
    .filter((x) => x && (str(x.company) || str(x.position) || str(x.description)))
    .map((x, i) => {
      const company = str(x.company, 150);
      const position = str(x.position, 150);
      if (!company || !position) {
        fail(`Experience ${i + 1} needs both a company and a role`);
      }
      const current = Boolean(x.current);
      const startDate = cleanMonth(x.startDate, `Experience ${i + 1} start date`);
      const endDate = current
        ? ""
        : cleanMonth(x.endDate, `Experience ${i + 1} end date`);
      if (startDate && endDate && endDate < startDate) {
        fail(`Experience ${i + 1}: end date cannot be before start date`);
      }
      return {
        company,
        position,
        location: str(x.location, 100),
        startDate,
        endDate,
        current,
        description: str(x.description, 2000),
      };
    });
};

export const cleanProjects = (list) => {
  if (!Array.isArray(list)) return [];
  if (list.length > 15) fail("You can add up to 15 projects");

  return list
    .filter((x) => x && (str(x.name) || str(x.description)))
    .map((x, i) => {
      const name = str(x.name, 150);
      if (!name) fail(`Project ${i + 1} needs a name`);

      const techSource = Array.isArray(x.technologies)
        ? x.technologies
        : String(x.technologies || "").split(",");

      const technologies = [
        ...new Set(techSource.map((t) => str(String(t), 40)).filter(Boolean)),
      ].slice(0, 20);

      return {
        name,
        description: str(x.description, 2000),
        technologies,
        githubUrl: cleanUrl(x.githubUrl, `Project ${i + 1} GitHub link`),
        liveUrl: cleanUrl(x.liveUrl, `Project ${i + 1} live link`),
      };
    });
};

export const cleanCertifications = (list) => {
  if (!Array.isArray(list)) return [];
  if (list.length > 20) fail("You can add up to 20 certifications");

  return list
    .filter((x) => x && str(x.name))
    .map((x) => ({
      name: str(x.name, 150),
      organization: str(x.organization, 150),
      year: str(x.year, 4).replace(/\D/g, ""),
    }));
};
