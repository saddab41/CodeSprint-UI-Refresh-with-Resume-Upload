import type { Portfolio } from "../types/portfolio";

type Props = {
  portfolio: Portfolio;
  onChange: (
    field: keyof Portfolio,
    value: string
  ) => void;
};

export default function PortfolioBasicInfo({
  portfolio,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-xl font-bold">
        Professional Details
      </h3>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <input
          placeholder="Professional Headline"
          value={portfolio.headline}
          onChange={(e) =>
            onChange("headline", e.target.value)
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Location"
          value={portfolio.location}
          onChange={(e) =>
            onChange("location", e.target.value)
          }
          className="border rounded-lg p-3"
        />
      </div>

      <h3 className="text-xl font-bold mt-6">
        About Me *
      </h3>

      <textarea
        placeholder="Tell companies about yourself..."
        value={portfolio.about}
        onChange={(e) =>
          onChange("about", e.target.value)
        }
        className="w-full border rounded-lg p-3 mt-3 min-h-32"
      />

      <p className="text-sm text-slate-500 mt-2">
        About Me is mandatory.
      </p>
    </div>
  );
}