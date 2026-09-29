import { Router } from "express";
import mongoose from "mongoose";

import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

const ALLOWED_TYPES = [
  "INTERNSHIP",
  "JOB",
  "APPRENTICESHIP",
  "PROJECT",
  "FDP",
];

const ALLOWED_SKILL_TYPES = [
  "PREDEFINED",
  "CUSTOM",
];

/* -------------------------------
   CALCULATE SKILL MATCH SCORE
-------------------------------- */

const score = (student, requirements = []) => {
  if (!student || !requirements.length) {
    return 0;
  }

  const studentSkills = new Map(
    (student.skills || []).map((skill) => [
      skill.name.trim().toLowerCase(),
      Number(skill.level) || 0,
    ])
  );

  let total = 0;

  for (const requirement of requirements) {
    const requiredName =
      requirement.name.trim().toLowerCase();

    const studentLevel =
      studentSkills.get(requiredName) || 0;

    const requiredLevel =
      Number(requirement.level) || 1;

    /*
      Example:
      Student React = 8
      Required React = 10

      Score = 8 / 10 = 80%

      If student has more than required,
      maximum contribution is 100%.
    */

    total += Math.min(
      studentLevel / requiredLevel,
      1
    );
  }

  return Math.round(
    (total / requirements.length) * 100
  );
};

/* -------------------------------
   VALIDATE REQUIRED SKILLS
-------------------------------- */

const validateSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return {
      valid: false,
      message:
        "Required skills must be provided as a list",
    };
  }

  if (skills.length === 0) {
    return {
      valid: false,
      message:
        "Please add at least one required skill",
    };
  }

  const skillNames = new Set();

  const cleanedSkills = [];

  for (const skill of skills) {
    const name = skill?.name?.trim();

    const level = Number(skill?.level);

    const type =
      skill?.type || "PREDEFINED";

    if (!name) {
      return {
        valid: false,
        message:
          "Every required skill must have a name",
      };
    }

    if (
      !Number.isFinite(level) ||
      level < 1 ||
      level > 10
    ) {
      return {
        valid: false,
        message: `Skill "${name}" must have a level between 1 and 10`,
      };
    }

    if (
      !ALLOWED_SKILL_TYPES.includes(type)
    ) {
      return {
        valid: false,
        message: `Invalid skill type for "${name}"`,
      };
    }

    const normalizedName =
      name.toLowerCase();

    if (skillNames.has(normalizedName)) {
      return {
        valid: false,
        message: `Duplicate skill "${name}" is not allowed`,
      };
    }

    skillNames.add(normalizedName);

    cleanedSkills.push({
      name,
      level,
      type,
    });
  }

  return {
    valid: true,
    skills: cleanedSkills,
  };
};

/* -------------------------------
   GET OPPORTUNITIES
-------------------------------- */

router.get(
  "/",
  auth(),
  async (req, res, next) => {
    try {
      const rows =
        await Opportunity.find()
          .sort({ createdAt: -1 })
          .lean();

      let student = null;

      if (req.user.role === "STUDENT") {
        student = await User.findById(
          req.user.id
        ).lean();

        if (!student) {
          return res.status(404).json({
            message: "Student account not found",
          });
        }
      }

      const opportunities = rows.map(
        (opportunity) => ({
          ...opportunity,

          matchScore: student
            ? score(
                student,
                opportunity.requiredSkills
              )
            : null,
        })
      );

      return res.status(200).json(
        opportunities
      );
    } catch (error) {
      next(error);
    }
  }
);

/* -------------------------------
   CREATE OPPORTUNITY
-------------------------------- */

router.post(
  "/",
  auth(["INDUSTRY", "ADMIN"]),
  async (req, res, next) => {
    try {
      let {
        title,
        company,
        description,
        type,
        location,
        requiredSkills,
        deadline,
      } = req.body;

      title = title?.trim();
      company = company?.trim();
      description = description?.trim();
      type = type?.toUpperCase();
      location =
        location?.trim() || "Remote";

      if (!title) {
        return res.status(400).json({
          message:
            "Please enter an opportunity title",
        });
      }

      if (!company) {
        return res.status(400).json({
          message:
            "Please enter a company name",
        });
      }

      if (!description) {
        return res.status(400).json({
          message:
            "Please enter an opportunity description",
        });
      }

      if (!type) {
        return res.status(400).json({
          message:
            "Please select an opportunity type",
        });
      }

      if (!ALLOWED_TYPES.includes(type)) {
        return res.status(400).json({
          message:
            "Please select a valid opportunity type",
        });
      }

      const validation =
        validateSkills(requiredSkills);

      if (!validation.valid) {
        return res.status(400).json({
          message: validation.message,
        });
      }

      if (
        deadline &&
        Number.isNaN(
          new Date(deadline).getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid deadline",
        });
      }

      const item =
        await Opportunity.create({
          title,
          company,
          description,
          type,
          location,
          requiredSkills:
            validation.skills,
          deadline: deadline || undefined,
          createdBy: req.user.id,
        });

      return res.status(201).json({
        message:
          "Opportunity published successfully",
        opportunity: item,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* -------------------------------
   APPLY FOR OPPORTUNITY
-------------------------------- */

router.post(
  "/:id/apply",
  auth(["STUDENT"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid opportunity ID",
        });
      }

      const item =
        await Opportunity.findById(id);

      if (!item) {
        return res.status(404).json({
          message:
            "Opportunity not found",
        });
      }

      const alreadyApplied =
        item.applications.some(
          (application) =>
            application.student.toString() ===
            req.user.id
        );

      if (alreadyApplied) {
        return res.status(409).json({
          message:
            "You have already applied for this opportunity",
        });
      }

      const student =
        await User.findById(req.user.id);

      if (!student) {
        return res.status(404).json({
          message:
            "Student account not found",
        });
      }

      const matchScore = score(
        student,
        item.requiredSkills
      );

      item.applications.push({
        student: req.user.id,
        status: "APPLIED",
        matchScore,
      });

      await item.save();

      return res.status(201).json({
        message:
          "Application submitted successfully",
        matchScore,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;