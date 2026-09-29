import { useEffect, useState } from "react";
import axios from "axios";
import Portfolio from "./components/Portfolio";
import Resume from "./components/Resume";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

type Skill = {
  name: string;
  level: number;
  type?: "PREDEFINED" | "CUSTOM";
};

type RequiredSkill = Skill;



const SKILL_CATEGORIES: Record<string, string[]> = {
  Programming: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C",
    "C++",
    "C#",
    "PHP",
  ],
  Frontend: [
    "HTML",
    "CSS",
    "React",
    "Next.js",
    "Angular",
    "Vue.js",
    "Tailwind CSS",
    "Bootstrap",
  ],
  Backend: [
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "Spring Boot",
    "REST API",
  ],
  Database: [
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "Firebase",
    "SQLite",
    "Redis",
  ],
  "Cloud & DevOps": [
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Kubernetes",
    "CI/CD",
  ],
  "Data & AI": [
    "Data Analysis",
    "Data Science",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Power BI",
  ],
  Design: [
    "Figma",
    "UI/UX Design",
    "Canva",
    "Adobe Photoshop",
  ],
  "Soft Skills": [
    "Communication",
    "Teamwork",
    "Leadership",
    "Problem Solving",
    "Critical Thinking",
    "Time Management",
  ],
};

const studentMenu = [
  "Dashboard",
  "My Profile",
  "Skill Assessment",
  "Skill Gap Analysis",
  "Internships & Jobs",
  "My Applications",
  "Learning Programs",
  "Digital Portfolio",
  "Resume",
];

const industryMenu = [
  "Dashboard",
  "Post Opportunity",
  "Manage Opportunities",
  "Candidates",
  "Analytics",
  "Collaboration",
];

const academicMenu = [
  "Dashboard",
  "Faculty Internships",
  "FDP & Training",
  "Research & Consultancy",
  "Collaboration",
];

function score(skills: Skill[]) {
  return skills.length
    ? Math.round(
        (skills.reduce(
          (total, skill) =>
            total + Number(skill.level || 0),
          0
        ) /
          (skills.length * 10)) *
          100
      )
    : 0;
}

function getErrorMessage(e: any, fallback: string) {
  if (e.response) {
    return (
      e.response.data?.message ||
      fallback
    );
  }

  if (e.request) {
    return "Unable to connect to the server. Please try again later.";
  }

  return fallback;
}

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [user, setUser] = useState<any>(
    JSON.parse(
      localStorage.getItem("user") || "null"
    )
  );

  const [mode, setMode] = useState("login");
  const [page, setPage] = useState("Dashboard");
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [skills, setSkills] = useState<Skill[]>(
    user?.skills || []
  );

  // STUDENT SKILL FORM
  const [selectedSkill, setSelectedSkill] =
    useState("");

  const [customSkill, setCustomSkill] =
    useState("");

  const [customMode, setCustomMode] =
    useState(false);

  const [skillLevel, setSkillLevel] =
    useState(5);

  // COMPANY REQUIRED SKILL FORM
  const [requiredSkills, setRequiredSkills] =
    useState<RequiredSkill[]>([]);

  const [
    selectedRequiredSkill,
    setSelectedRequiredSkill,
  ] = useState("");

  const [
    customRequiredSkill,
    setCustomRequiredSkill,
  ] = useState("");

  const [
    customRequiredMode,
    setCustomRequiredMode,
  ] = useState(false);

  const [
    requiredSkillLevel,
    setRequiredSkillLevel,
  ] = useState(5);

  const [post, setPost] = useState({
    title: "",
    company: "",
    description: "",
    type: "INTERNSHIP",
    location: "Remote",
  });

  const headers = () => ({
    Authorization: `Bearer ${token}`,
  });

  const load = async () => {
    if (!token) return;

    try {
      const r = await axios.get(
        `${API}/opportunities`,
        {
          headers: headers(),
        }
      );

      setItems(r.data);
    } catch (e: any) {
      setMsg(
        getErrorMessage(
          e,
          "Unable to load opportunities"
        )
      );
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const auth = async (e: any) => {
    e.preventDefault();

    setMsg("");

    try {
      const url =
        mode === "login"
          ? "/auth/login"
          : "/auth/register";

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : form;

      const { data } = await axios.post(
        API + url,
        body
      );

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);

      setSkills(data.user.skills || []);

      setMsg("");
    } catch (e: any) {
      setMsg(
        getErrorMessage(
          e,
          "Something went wrong. Please try again."
        )
      );
    }
  };

  const logout = () => {
    localStorage.clear();

    setToken("");
    setUser(null);
    setSkills([]);
    setMsg("");
  };

  // -------------------------
  // STUDENT SKILLS
  // -------------------------

  const addSkill = () => {
    const name = customMode
      ? customSkill.trim()
      : selectedSkill.trim();

    if (!name) {
      setMsg(
        customMode
          ? "Please enter a custom skill"
          : "Please select a skill"
      );
      return;
    }

    const exists = skills.some(
      (skill) =>
        skill.name.toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
      setMsg(
        `${name} has already been added`
      );
      return;
    }

    setSkills([
      ...skills,
      {
        name,
        level: skillLevel,
        type: customMode
          ? "CUSTOM"
          : "PREDEFINED",
      },
    ]);

    setSelectedSkill("");
    setCustomSkill("");
    setSkillLevel(5);
    setMsg("");
  };

  const removeSkill = (index: number) => {
    setSkills(
      skills.filter(
        (_, i) => i !== index
      )
    );
  };

  const updateSkillLevel = (
    index: number,
    level: number
  ) => {
    setSkills(
      skills.map((skill, i) =>
        i === index
          ? {
              ...skill,
              level,
            }
          : skill
      )
    );
  };

  // This will work after backend
  // PUT /api/v1/profile/skills is added
  const saveSkills = async () => {
    setMsg("");

    try {
      const { data } = await axios.put(
        `${API}/profile/skills`,
        { skills },
        {
          headers: headers(),
        }
      );

      const savedSkills =
        data.skills || skills;

      setSkills(savedSkills);

      const updatedUser = {
        ...user,
        skills: savedSkills,
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMsg(
        data.message ||
          "Skills saved successfully"
      );
    } catch (e: any) {
      setMsg(
        getErrorMessage(
          e,
          "Could not save skills"
        )
      );
    }
  };

  // -------------------------
  // COMPANY REQUIRED SKILLS
  // -------------------------

  const addRequiredSkill = () => {
    const name = customRequiredMode
      ? customRequiredSkill.trim()
      : selectedRequiredSkill.trim();

    if (!name) {
      setMsg(
        customRequiredMode
          ? "Please enter a custom skill"
          : "Please select a required skill"
      );
      return;
    }

    const exists = requiredSkills.some(
      (skill) =>
        skill.name.toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
      setMsg(
        `${name} has already been added`
      );
      return;
    }

    setRequiredSkills([
      ...requiredSkills,
      {
        name,
        level: requiredSkillLevel,
        type: customRequiredMode
          ? "CUSTOM"
          : "PREDEFINED",
      },
    ]);

    setSelectedRequiredSkill("");
    setCustomRequiredSkill("");
    setRequiredSkillLevel(5);
    setMsg("");
  };

  const removeRequiredSkill = (
    index: number
  ) => {
    setRequiredSkills(
      requiredSkills.filter(
        (_, i) => i !== index
      )
    );
  };

  const updateRequiredSkillLevel = (
    index: number,
    level: number
  ) => {
    setRequiredSkills(
      requiredSkills.map((skill, i) =>
        i === index
          ? {
              ...skill,
              level,
            }
          : skill
      )
    );
  };

  // -------------------------
  // APPLY
  // -------------------------

  const apply = async (id: string) => {
    setMsg("");

    try {
      const r = await axios.post(
        `${API}/opportunities/${id}/apply`,
        {},
        {
          headers: headers(),
        }
      );

      setMsg(
        r.data.message ||
          "Application submitted successfully"
      );
    } catch (e: any) {
      setMsg(
        getErrorMessage(
          e,
          "Could not apply. Please try again."
        )
      );
    }
  };

  // -------------------------
  // CREATE OPPORTUNITY
  // -------------------------

  const create = async (e: any) => {
    e.preventDefault();

    setMsg("");

    if (!post.title.trim()) {
      setMsg(
        "Please enter an opportunity title"
      );
      return;
    }

    if (!post.company.trim()) {
      setMsg(
        "Please enter a company name"
      );
      return;
    }

    if (!post.description.trim()) {
      setMsg(
        "Please enter a description"
      );
      return;
    }

    if (requiredSkills.length === 0) {
      setMsg(
        "Please add at least one required skill"
      );
      return;
    }

    try {
      await axios.post(
        `${API}/opportunities`,
        {
          ...post,
          requiredSkills,
        },
        {
          headers: headers(),
        }
      );

      setMsg(
        "Opportunity published successfully"
      );

      setPost({
        title: "",
        company: "",
        description: "",
        type: "INTERNSHIP",
        location: "Remote",
      });

      setRequiredSkills([]);

      load();
    } catch (e: any) {
      setMsg(
        getErrorMessage(
          e,
          "Could not publish opportunity"
        )
      );
    }
  };

  // -------------------------
  // LOGIN / REGISTER
  // -------------------------

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <form
          onSubmit={auth}
          className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-8 space-y-4 shadow-2xl"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Academia
              <span className="text-blue-600">
                Link
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Academia–Industry Collaboration
              Platform
            </p>
          </div>

          {mode === "register" && (
            <>
              <input
                placeholder="Full name"
                className="w-full border rounded-lg p-3"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <select
                className="w-full border rounded-lg p-3"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
              >
                <option value="STUDENT">
                  Student
                </option>

                <option value="ACADEMICIAN">
                  Academician
                </option>

                <option value="INDUSTRY">
                  Industry / Recruiter
                </option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg p-3"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium">
            {mode === "login"
              ? "Login"
              : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              );

              setMsg("");
            }}
            className="w-full text-blue-600 py-2"
          >
            {mode === "login"
              ? "Create new account"
              : "Already have an account?"}
          </button>

          {msg && (
            <p className="text-red-600 text-sm text-center">
              {msg}
            </p>
          )}
        </form>
      </div>
    );
  }

  const menu =
    user.role === "STUDENT"
      ? studentMenu
      : user.role === "INDUSTRY"
      ? industryMenu
      : academicMenu;

  const cards =
    user.role === "STUDENT"
      ? [
          [
            "Employability Score",
            score(skills) + "%",
          ],
          ["Applications", "0"],
          [
            "Skill Match",
            items[0]?.matchScore
              ? items[0].matchScore + "%"
              : "—",
          ],
          [
            "Verified Skills",
            skills.length,
          ],
        ]
      : user.role === "INDUSTRY"
      ? [
          [
            "Active Opportunities",
            items.length,
          ],
          [
            "Applications",
            "Manage candidates",
          ],
          ["Industry Programs", "0"],
          ["Collaboration", "Active"],
        ]
      : [
          ["Faculty Programs", "0"],
          [
            "Industry Training",
            "Explore",
          ],
          ["Research Projects", "0"],
          ["Collaboration", "Active"],
        ];

  const content = () => {
    // -------------------------
    // SKILL ASSESSMENT
    // -------------------------

    if (page === "Skill Assessment") {
      return (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Skill Assessment
          </h2>

          <p className="text-slate-500 mt-2">
            Select skills from the standard list
            or add your own custom skill.
          </p>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow mt-5">
            <div className="flex flex-wrap gap-3 mb-5">
              <button
                type="button"
                onClick={() =>
                  setCustomMode(false)
                }
                className={`px-4 py-2 rounded-lg ${
                  !customMode
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }`}
              >
                Select Skill
              </button>

              <button
                type="button"
                onClick={() =>
                  setCustomMode(true)
                }
                className={`px-4 py-2 rounded-lg ${
                  customMode
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }`}
              >
                + Custom Skill
              </button>
            </div>

            {!customMode ? (
              <select
                value={selectedSkill}
                onChange={(e) =>
                  setSelectedSkill(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >
                <option value="">
                  Select a skill
                </option>

                {Object.entries(
                  SKILL_CATEGORIES
                ).map(
                  ([
                    category,
                    categorySkills,
                  ]) => (
                    <optgroup
                      key={category}
                      label={category}
                    >
                      {categorySkills.map(
                        (skill) => (
                          <option
                            key={skill}
                            value={skill}
                          >
                            {skill}
                          </option>
                        )
                      )}
                    </optgroup>
                  )
                )}
              </select>
            ) : (
              <input
                value={customSkill}
                onChange={(e) =>
                  setCustomSkill(
                    e.target.value
                  )
                }
                placeholder="Enter your custom skill"
                className="w-full border rounded-lg p-3"
              />
            )}

            <div className="mt-5">
              <div className="flex justify-between">
                <span>Skill Level</span>

                <b>{skillLevel}/10</b>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={skillLevel}
                onChange={(e) =>
                  setSkillLevel(
                    Number(e.target.value)
                  )
                }
                className="w-full mt-2"
              />
            </div>

            <button
              type="button"
              onClick={addSkill}
              className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              Add Skill
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {skills.length === 0 && (
              <div className="bg-white p-5 rounded-xl shadow text-slate-500">
                No skills added yet.
              </div>
            )}

            {skills.map(
              (skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  className="bg-white p-4 sm:p-5 rounded-xl shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold">
                        {skill.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {skill.type ===
                        "CUSTOM"
                          ? "Custom Skill"
                          : "Standard Skill"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeSkill(index)
                      }
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between">
                      <span>Level</span>

                      <b>
                        {skill.level}/10
                      </b>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={skill.level}
                      onChange={(e) =>
                        updateSkillLevel(
                          index,
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full mt-2"
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={saveSkills}
            className="mt-5 bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Save Skills
          </button>
        </section>
      );
    }

    // -------------------------
    // SKILL GAP
    // -------------------------

    if (
      page === "Skill Gap Analysis"
    ) {
      return (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold">
            AI Skill Gap Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <div className="bg-white p-5 rounded-xl shadow">
              <b>Current Readiness</b>

              <p className="text-4xl font-bold text-blue-600 mt-2">
                {score(skills)}%
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <b>Strengths</b>

              <p className="mt-2">
                {skills
                  .filter(
                    (skill) =>
                      skill.level >= 7
                  )
                  .map(
                    (skill) =>
                      skill.name
                  )
                  .join(", ") ||
                  "Complete assessment"}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <b>
                Recommended Next Skills
              </b>

              <p className="mt-2">
                Problem Solving, Industry
                Tools, Projects
              </p>
            </div>
          </div>
        </section>
      );
    }

    // -------------------------
    // DIGITAL PORTFOLIO
    // -------------------------

    if (page === "Digital Portfolio") {
      return <Portfolio skills={skills} />;
    }

    // -------------------------
    // RESUME
    // -------------------------

    if (page === "Resume" && user.role === "STUDENT") {
      return (
        <Resume
          skills={skills}
          onGoToPortfolio={() => setPage("Digital Portfolio")}
        />
      );
    }

    // -------------------------
    // POST OPPORTUNITY
    // -------------------------

    if (
      page === "Post Opportunity"
    ) {
      return (
        <form
          onSubmit={create}
          className="bg-white p-4 sm:p-6 rounded-xl shadow max-w-3xl space-y-4"
        >
          <h2 className="text-2xl font-bold">
            Post Internship / Job
          </h2>

          <input
            placeholder="Opportunity title"
            className="w-full border rounded-lg p-3"
            value={post.title}
            onChange={(e) =>
              setPost({
                ...post,
                title: e.target.value,
              })
            }
          />

          <input
            placeholder="Company name"
            className="w-full border rounded-lg p-3"
            value={post.company}
            onChange={(e) =>
              setPost({
                ...post,
                company: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Description"
            className="w-full border rounded-lg p-3 min-h-32"
            value={post.description}
            onChange={(e) =>
              setPost({
                ...post,
                description:
                  e.target.value,
              })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              className="w-full border rounded-lg p-3"
              value={post.type}
              onChange={(e) =>
                setPost({
                  ...post,
                  type: e.target.value,
                })
              }
            >
              <option value="INTERNSHIP">
                INTERNSHIP
              </option>

              <option value="JOB">
                JOB
              </option>

              <option value="APPRENTICESHIP">
                APPRENTICESHIP
              </option>

              <option value="PROJECT">
                PROJECT
              </option>
            </select>

            <input
              value={post.location}
              placeholder="Location"
              className="w-full border rounded-lg p-3"
              onChange={(e) =>
                setPost({
                  ...post,
                  location:
                    e.target.value,
                })
              }
            />
          </div>

          {/* REQUIRED SKILLS */}

          <div className="border rounded-xl p-4 bg-slate-50">
            <h3 className="font-bold text-lg">
              Required Skills
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Select skills required for
              this opportunity.
            </p>

            <div className="flex flex-wrap gap-3 mt-4 mb-4">
              <button
                type="button"
                onClick={() =>
                  setCustomRequiredMode(false)
                }
                className={`px-4 py-2 rounded-lg ${
                  !customRequiredMode
                    ? "bg-blue-600 text-white"
                    : "bg-white border"
                }`}
              >
                Select Skill
              </button>

              <button
                type="button"
                onClick={() =>
                  setCustomRequiredMode(true)
                }
                className={`px-4 py-2 rounded-lg ${
                  customRequiredMode
                    ? "bg-blue-600 text-white"
                    : "bg-white border"
                }`}
              >
                + Custom Skill
              </button>
            </div>

            {!customRequiredMode ? (
              <select
                value={selectedRequiredSkill}
                onChange={(e) =>
                  setSelectedRequiredSkill(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >
                <option value="">
                  Select required skill
                </option>

                {Object.entries(
                  SKILL_CATEGORIES
                ).map(
                  ([
                    category,
                    categorySkills,
                  ]) => (
                    <optgroup
                      key={category}
                      label={category}
                    >
                      {categorySkills.map(
                        (skill) => (
                          <option
                            key={skill}
                            value={skill}
                          >
                            {skill}
                          </option>
                        )
                      )}
                    </optgroup>
                  )
                )}
              </select>
            ) : (
              <input
                value={customRequiredSkill}
                onChange={(e) =>
                  setCustomRequiredSkill(
                    e.target.value
                  )
                }
                placeholder="Enter custom required skill"
                className="w-full border rounded-lg p-3"
              />
            )}

            <div className="mt-4">
              <div className="flex justify-between">
                <span>
                  Minimum Required Level
                </span>

                <b>
                  {requiredSkillLevel}/10
                </b>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={requiredSkillLevel}
                onChange={(e) =>
                  setRequiredSkillLevel(
                    Number(e.target.value)
                  )
                }
                className="w-full mt-2"
              />
            </div>

            <button
              type="button"
              onClick={addRequiredSkill}
              className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              + Add Required Skill
            </button>

            <div className="mt-5 space-y-3">
              {requiredSkills.map(
                (skill, index) => (
                  <div
                    key={`${skill.name}-${index}`}
                    className="bg-white border rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <b>
                          {skill.name}
                        </b>

                        <p className="text-sm text-slate-500">
                          Required level:{" "}
                          {skill.level}/10
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeRequiredSkill(
                            index
                          )
                        }
                        className="text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={skill.level}
                      onChange={(e) =>
                        updateRequiredSkillLevel(
                          index,
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full mt-3"
                    />
                  </div>
                )
              )}

              {requiredSkills.length === 0 && (
                <p className="text-sm text-slate-500">
                  No required skills added yet.
                </p>
              )}
            </div>
          </div>

          <button className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-lg">
            Publish Opportunity
          </button>
        </form>
      );
    }

    // -------------------------
    // OPPORTUNITIES
    // -------------------------

    if (
      [
        "Internships & Jobs",
        "Manage Opportunities",
        "Candidates",
      ].includes(page)
    ) {
      return (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {page}
          </h2>

          {items.length === 0 && (
            <div className="bg-white p-5 rounded-xl shadow mt-5 text-slate-500">
              No opportunities found.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
            {items.map((x) => (
              <div
                key={x._id}
                className="bg-white rounded-xl shadow p-4 sm:p-5 break-words"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <h3 className="font-bold">
                    {x.title}
                  </h3>

                  <span className="text-sm bg-slate-100 px-2 py-1 rounded w-fit">
                    {x.type}
                  </span>
                </div>

                <p className="text-slate-500 mt-2">
                  {x.company} ·{" "}
                  {x.location}
                </p>

                <p className="my-3">
                  {x.description}
                </p>

                <p className="text-sm">
                  <b>Skills:</b>{" "}
                  {x.requiredSkills
                    ?.map(
                      (skill: Skill) =>
                        `${skill.name} (${skill.level}/10)`
                    )
                    .join(", ")}
                </p>

                {x.matchScore !== null &&
                  x.matchScore !==
                    undefined && (
                    <p className="font-bold text-green-600 mt-3">
                      Match:{" "}
                      {x.matchScore}%
                    </p>
                  )}

                {user.role ===
                  "STUDENT" && (
                  <button
                    onClick={() =>
                      apply(x._id)
                    }
                    className="w-full mt-3 bg-blue-600 text-white py-3 rounded-lg"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    // -------------------------
    // MY APPLICATIONS
    // -------------------------

    if (
      page === "My Applications"
    ) {
      return (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Application Tracking
          </h2>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow mt-5">
            <p>
              Applications are tracked
              from the opportunity
              workflow. Apply to
              internships or jobs from
              the Opportunities page.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded">
                Applied
                <br />
                <b>0</b>
              </div>

              <div className="p-4 bg-slate-50 rounded">
                Shortlisted
                <br />
                <b>0</b>
              </div>

              <div className="p-4 bg-slate-50 rounded">
                Selected
                <br />
                <b>0</b>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // -------------------------
    // DASHBOARD
    // -------------------------

    return (
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold">
          Welcome back, {user.name} 👋
        </h2>

        <p className="text-slate-500 mt-2">
          Your central workspace for
          skills, internships,
          placements and industry
          collaboration.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mt-7">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow"
            >
              <p className="text-slate-500">
                {card[0]}
              </p>

              <p className="text-2xl font-bold mt-2 break-words">
                {card[1]}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mt-7">
          <h3 className="font-bold text-lg sm:text-xl">
            Recommended Opportunities
          </h3>

          <p className="text-slate-500 mt-1">
            Explore internships, jobs,
            projects, learning programs
            and industry collaborations
            from your dashboard.
          </p>

          <button
            onClick={() =>
              setPage(
                user.role === "STUDENT"
                  ? "Internships & Jobs"
                  : "Manage Opportunities"
              )
            }
            className="w-full sm:w-auto bg-blue-600 text-white mt-4 px-5 py-3 rounded-lg"
          >
            Explore Opportunities
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-x-hidden print:block print:bg-white print:overflow-visible">
      <aside className="hidden md:block print:!hidden w-64 shrink-0 bg-slate-950 text-white p-5 min-h-screen">
        <h1 className="text-xl font-bold">
          Academia
          <span className="text-blue-400">
            Link
          </span>
        </h1>

        <p className="text-xs text-slate-400 mb-8">
          Academia–Industry Portal
        </p>

        {menu.map((m) => (
          <button
            key={m}
            onClick={() =>
              setPage(m)
            }
            className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition ${
              page === m
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}
          >
            {m}
          </button>
        ))}
      </aside>

      <div className="flex-1 min-w-0">
        <header className="print:hidden bg-white px-4 py-3 md:p-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMobileMenu(
                  !mobileMenu
                )
              }
              className="md:hidden bg-slate-900 text-white px-3 py-2 rounded-lg"
            >
              {mobileMenu ? "✕" : "☰"}
            </button>

            <div className="font-bold text-lg md:hidden">
              Academia
              <span className="text-blue-600">
                Link
              </span>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4 items-center">
            <span className="hidden sm:inline text-sm text-slate-600">
              {user.role}
            </span>

            <button
              onClick={logout}
              className="bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {mobileMenu && (
          <div className="md:hidden print:hidden bg-slate-950 text-white p-4 shadow-lg sticky top-[56px] z-10">
            <p className="text-xs text-slate-400 mb-4">
              Academia–Industry Portal
            </p>

            {menu.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setPage(m);
                  setMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 ${
                  page === m
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        <main className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
          {msg && (
            <div className="print:hidden bg-blue-100 text-blue-800 p-3 rounded-lg mb-5 break-words">
              {msg}
            </div>
          )}

          {content()}
        </main>
      </div>
    </div>
  );
}