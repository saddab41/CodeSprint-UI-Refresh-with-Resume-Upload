import mongoose from "mongoose";

/* SKILLS */
const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

/* EDUCATION */
const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    fieldOfStudy: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    startYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },

    endYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },
  },
  { _id: true }
);

/* EXPERIENCE */
const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      default: "",
    },

    position: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    startDate: {
      type: String,
      default: "",
    },

    endDate: {
      type: String,
      default: "",
    },

    current: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

/* PROJECTS */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    technologies: {
      type: [String],
      default: [],
    },

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    liveUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

/* CERTIFICATIONS */
const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    organization: {
      type: String,
      trim: true,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

/* USER */
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "STUDENT",
        "ACADEMICIAN",
        "INDUSTRY",
        "ADMIN",
      ],
      default: "STUDENT",
    },

    /* PROFILE */

    headline: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    about: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    /* EDUCATION */

    education: {
      type: [educationSchema],
      default: [],
    },

    /* SKILLS */

    skills: {
      type: [skillSchema],
      default: [],
    },

    /* OPTIONAL PORTFOLIO SECTIONS */

    experience: {
      type: [experienceSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    certifications: {
      type: [certificationSchema],
      default: [],
    },

    hobbies: {
      type: [String],
      default: [],
    },

    /* RESUME SETTINGS */

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    resumeTemplate: {
      type: String,
      enum: ["modern", "classic", "compact"],
      default: "modern",
    },

    resumeAccent: {
      type: String,
      match: /^#[0-9a-fA-F]{6}$/,
      default: "#2563eb",
    },

    /* PROFESSIONAL LINKS */

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", schema);