import type { Skill } from "../types/portfolio";

type Props = {
  skills: Skill[];
};

export default function SkillsSection({
  skills,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-5 mt-5">
      <h3 className="text-xl font-bold">
        Skills
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        Your skills from Skill Assessment.
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {skills.length === 0 ? (
          <p className="text-slate-500">
            No skills added yet.
          </p>
        ) : (
          skills.map((skill, index) => (
            <div
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full"
            >
              {skill.name} · Level {skill.level}/10
            </div>
          ))
        )}
      </div>
    </div>
  );
}