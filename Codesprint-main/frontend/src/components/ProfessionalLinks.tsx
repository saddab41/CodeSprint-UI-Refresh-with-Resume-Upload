import type { Portfolio } from "../types/portfolio";

type Props = {
  portfolio: Portfolio;

  onChange: (
    field: keyof Portfolio,
    value: string
  ) => void;
};

export default function ProfessionalLinks({
  portfolio,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-5 mt-5">
      <h3 className="text-xl font-bold">
        Professional Links
      </h3>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <input
          placeholder="GitHub URL"
          value={portfolio.githubUrl}
          onChange={(e) =>
            onChange(
              "githubUrl",
              e.target.value
            )
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="LinkedIn URL"
          value={portfolio.linkedinUrl}
          onChange={(e) =>
            onChange(
              "linkedinUrl",
              e.target.value
            )
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Personal Website URL"
          value={portfolio.websiteUrl}
          onChange={(e) =>
            onChange(
              "websiteUrl",
              e.target.value
            )
          }
          className="border rounded-lg p-3"
        />
      </div>
    </div>
  );
}