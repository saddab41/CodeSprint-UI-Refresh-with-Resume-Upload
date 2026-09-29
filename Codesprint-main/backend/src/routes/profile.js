import { Router } from "express";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import {
  str,
  cleanUrl,
  cleanPhone,
  cleanExperience,
  cleanProjects,
  cleanCertifications,
} from "../utils/sanitize.js";

const router = Router();

const ALLOWED_SKILL_TYPES = ["PREDEFINED", "CUSTOM"];

/* =========================
   SAVE SKILLS
========================= */

router.put(
  "/skills",
  auth(["STUDENT", "ACADEMICIAN"]),
  async (req, res, next) => {
    try {
      const { skills } = req.body;

      if (!Array.isArray(skills)) {
        return res.status(400).json({
          message: "Skills must be provided as a list",
        });
      }

      const skillNames = new Set();
      const cleanedSkills = [];

      for (const skill of skills) {
        const name = skill?.name?.trim();
        const level = Number(skill?.level);
        const type = skill?.type || "PREDEFINED";

        if (!name) {
          return res.status(400).json({
            message: "Every skill must have a name",
          });
        }

        if (
          !Number.isFinite(level) ||
          level < 1 ||
          level > 10
        ) {
          return res.status(400).json({
            message: `Skill "${name}" level must be between 1 and 10`,
          });
        }

        if (!ALLOWED_SKILL_TYPES.includes(type)) {
          return res.status(400).json({
            message: `Invalid skill type for "${name}"`,
          });
        }

        const normalizedName = name.toLowerCase();

        if (skillNames.has(normalizedName)) {
          return res.status(400).json({
            message: `Duplicate skill "${name}" is not allowed`,
          });
        }

        skillNames.add(normalizedName);

        cleanedSkills.push({
          name,
          level,
          type,
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { skills: cleanedSkills },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!user) {
        return res.status(404).json({
          message: "User account not found",
        });
      }

      return res.status(200).json({
        message: "Skills saved successfully",
        skills: user.skills,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================
   GET PORTFOLIO
========================= */

router.get(
  "/portfolio",
  auth(),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select(
        "-password"
      );

      if (!user) {
        return res.status(404).json({
          message: "User account not found",
        });
      }

      return res.status(200).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================
   UPDATE PORTFOLIO
========================= */

router.put(
  "/portfolio",
  auth(["STUDENT"]),
  async (req, res, next) => {
    try {
      const {
        headline,
        location,
        about,
        education,
        experience,
        projects,
        certifications,
        hobbies,
        githubUrl,
        linkedinUrl,
        websiteUrl,
      } = req.body;

      // ABOUT ME IS REQUIRED
      if (!about || !about.trim()) {
        return res.status(400).json({
          message: "Please write something about yourself",
        });
      }

      if (about.trim().length < 20) {
        return res.status(400).json({
          message: "About Me must contain at least 20 characters",
        });
      }

      // EDUCATION IS REQUIRED
      if (!Array.isArray(education) || education.length === 0) {
        return res.status(400).json({
          message: "Please add at least one education detail",
        });
      }

      const cleanedEducation = [];

      for (const item of education) {
        const institution = item?.institution?.trim();
        const degree = item?.degree?.trim();

        if (!institution) {
          return res.status(400).json({
            message: "Please enter your school or college name",
          });
        }

        if (!degree) {
          return res.status(400).json({
            message: "Please enter your degree or course",
          });
        }

        const startYear = item?.startYear
          ? Number(item.startYear)
          : undefined;

        const endYear = item?.endYear
          ? Number(item.endYear)
          : undefined;

        if (
          startYear &&
          (!Number.isInteger(startYear) ||
            startYear < 1900 ||
            startYear > 2100)
        ) {
          return res.status(400).json({
            message: "Please enter a valid start year",
          });
        }

        if (
          endYear &&
          (!Number.isInteger(endYear) ||
            endYear < 1900 ||
            endYear > 2100)
        ) {
          return res.status(400).json({
            message: "Please enter a valid end year",
          });
        }

        if (startYear && endYear && endYear < startYear) {
          return res.status(400).json({
            message: "End year cannot be before start year",
          });
        }

        cleanedEducation.push({
          institution,
          degree,
          fieldOfStudy:
            item?.fieldOfStudy?.trim() || "",
          startYear,
          endYear,
        });
      }

      const cleanedHobbies = Array.isArray(hobbies)
        ? hobbies
            .map((hobby) => String(hobby).trim())
            .filter(Boolean)
        : [];

      const update = {
        headline: headline?.trim() || "",
        location: location?.trim() || "",
        about: about.trim(),
        education: cleanedEducation,
        hobbies: cleanedHobbies,
        githubUrl: cleanUrl(githubUrl, "GitHub link"),
        linkedinUrl: cleanUrl(linkedinUrl, "LinkedIn link"),
        websiteUrl: cleanUrl(websiteUrl, "Website link"),
      };

      // Only touch resume sections when they are actually sent, so saving
      // the portfolio never wipes experience/projects/certifications.
      if (experience !== undefined) update.experience = cleanExperience(experience);
      if (projects !== undefined) update.projects = cleanProjects(projects);
      if (certifications !== undefined) {
        update.certifications = cleanCertifications(certifications);
      }

      const user = await User.findByIdAndUpdate(req.user.id, update, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User account not found",
        });
      }

      return res.status(200).json({
        message: "Portfolio updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================
   UPDATE RESUME
========================= */

const TEMPLATES = ["modern", "classic", "compact"];

router.put(
  "/resume",
  auth(["STUDENT"]),
  async (req, res, next) => {
    try {
      const {
        phone,
        headline,
        location,
        about,
        experience,
        projects,
        certifications,
        resumeTemplate,
        resumeAccent,
      } = req.body;

      const summary = str(about, 1000);

      if (summary && summary.length < 20) {
        return res.status(400).json({
          message: "Summary must contain at least 20 characters",
        });
      }

      if (resumeTemplate && !TEMPLATES.includes(resumeTemplate)) {
        return res.status(400).json({ message: "Invalid resume template" });
      }

      if (resumeAccent && !/^#[0-9a-fA-F]{6}$/.test(resumeAccent)) {
        return res.status(400).json({ message: "Invalid accent colour" });
      }

      const update = {
        phone: cleanPhone(phone),
        headline: str(headline, 150),
        location: str(location, 100),
        experience: cleanExperience(experience),
        projects: cleanProjects(projects),
        certifications: cleanCertifications(certifications),
      };

      // never blank out an existing summary by accident
      if (summary) update.about = summary;
      if (resumeTemplate) update.resumeTemplate = resumeTemplate;
      if (resumeAccent) update.resumeAccent = resumeAccent;

      const user = await User.findByIdAndUpdate(req.user.id, update, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      return res.status(200).json({
        message: "Resume saved successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;