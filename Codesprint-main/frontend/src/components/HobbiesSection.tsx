import { useState } from "react";

type Props = {
  hobbies: string[];
  onChange: (hobbies: string[]) => void;
};

export default function HobbiesSection({
  hobbies,
  onChange,
}: Props) {
  const [input, setInput] = useState("");

  const addHobby = () => {
    const hobby = input.trim();

    if (!hobby) return;

    if (
      hobbies.some(
        (item) =>
          item.toLowerCase() ===
          hobby.toLowerCase()
      )
    ) {
      return;
    }

    onChange([
      ...hobbies,
      hobby,
    ]);

    setInput("");
  };

  const removeHobby = (
    index: number
  ) => {
    onChange(
      hobbies.filter(
        (_, i) => i !== index
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 mt-5">
      <h3 className="text-xl font-bold">
        Hobbies & Interests
      </h3>

      <div className="flex gap-3 mt-4">
        <input
          placeholder="Example: Cricket, Reading, Coding"
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addHobby();
            }
          }}
          className="flex-1 border rounded-lg p-3"
        />

        <button
          type="button"
          onClick={addHobby}
          className="bg-blue-600 text-white px-5 rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {hobbies.map(
          (hobby, index) => (
            <div
              key={index}
              className="bg-slate-100 px-3 py-2 rounded-lg"
            >
              {hobby}

              <button
                type="button"
                onClick={() =>
                  removeHobby(index)
                }
                className="ml-2 text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}