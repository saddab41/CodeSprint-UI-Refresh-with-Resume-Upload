import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5,
    },

    type: {
      type: String,
      enum: ["PREDEFINED", "CUSTOM"],
      default: "PREDEFINED",
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "APPLIED",
        "REVIEWING",
        "SHORTLISTED",
        "REJECTED",
        "SELECTED",
      ],
      default: "APPLIED",
    },

    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "INTERNSHIP",
        "JOB",
        "APPRENTICESHIP",
        "PROJECT",
        "FDP",
      ],
      required: true,
    },

    location: {
      type: String,
      trim: true,
      default: "Remote",
    },

    requiredSkills: {
      type: [skillSchema],
      default: [],
    },

    deadline: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applications: {
      type: [applicationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Opportunity",
  schema
);