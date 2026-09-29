import type { Education } from "../types/portfolio";

type Props = {
  education: Education[];

  onChange: (
    index: number,
    field: keyof Education,
    value: string
  ) => void;

  onAdd: () => void;

  onRemove: (index: number) => void;
};

export default function EducationSection({
  education,
  onChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-5 mt-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">
          Education *
        </h3>

        <button
          type="button"
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Education
        </button>
      </div>

      {education.map((item, index) => (
        <div
          key={index}
          className="border rounded-xl p-4 mt-4"
        >
          <div className="flex justify-between mb-3">
            <strong>
              Education {index + 1}
            </strong>

            {education.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="School / College / University *"
              value={item.institution}
              onChange={(e) =>
                onChange(
                  index,
                  "institution",
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <input
              placeholder="Degree / Course *"
              value={item.degree}
              onChange={(e) =>
                onChange(
                  index,
                  "degree",
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <input
              placeholder="Field of Study"
              value={item.fieldOfStudy}
              onChange={(e) =>
                onChange(
                  index,
                  "fieldOfStudy",
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Start Year"
              value={item.startYear}
              onChange={(e) =>
                onChange(
                  index,
                  "startYear",
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="End Year"
              value={item.endYear}
              onChange={(e) =>
                onChange(
                  index,
                  "endYear",
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />
          </div>
        </div>
      ))}
    </div>
  );
}