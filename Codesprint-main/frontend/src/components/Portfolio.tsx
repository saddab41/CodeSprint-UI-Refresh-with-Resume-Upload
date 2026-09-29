import {
  useEffect,
  useState,
} from "react";

import type {
  Education,
  Portfolio as PortfolioType,
  Skill,
} from "../types/portfolio";

import {
  getPortfolio,
  updatePortfolio,
} from "../services/profileService";

import PortfolioBasicInfo from "./PortfolioBasicInfo";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import HobbiesSection from "./HobbiesSection";
import ProfessionalLinks from "./ProfessionalLinks";

type Props = {
  skills: Skill[];
};

const emptyPortfolio: PortfolioType = {
  headline: "",
  location: "",
  about: "",
  education: [
    {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
    },
  ],
  hobbies: [],
  githubUrl: "",
  linkedinUrl: "",
  websiteUrl: "",
};

export default function Portfolio({
  skills,
}: Props) {
  const [portfolio, setPortfolio] =
    useState<PortfolioType>(
      emptyPortfolio
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);

      const data =
        await getPortfolio();

      const user = data.user;

      setPortfolio({
        headline:
          user.headline || "",

        location:
          user.location || "",

        about:
          user.about || "",

        education:
          user.education?.length
            ? user.education.map(
                (item: any) => ({
                  institution:
                    item.institution || "",
                  degree:
                    item.degree || "",
                  fieldOfStudy:
                    item.fieldOfStudy || "",
                  startYear:
                    item.startYear?.toString() ||
                    "",
                  endYear:
                    item.endYear?.toString() ||
                    "",
                })
              )
            : emptyPortfolio.education,

        hobbies:
          user.hobbies || [],

        githubUrl:
          user.githubUrl || "",

        linkedinUrl:
          user.linkedinUrl || "",

        websiteUrl:
          user.websiteUrl || "",
      });
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Unable to load portfolio"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field: keyof PortfolioType,
    value: any
  ) => {
    setPortfolio((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addEducation = () => {
    setPortfolio((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
        },
      ],
    }));
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    setPortfolio((prev) => {
      const education = [
        ...prev.education,
      ];

      education[index] = {
        ...education[index],
        [field]: value,
      };

      return {
        ...prev,
        education,
      };
    });
  };

  const removeEducation = (
    index: number
  ) => {
    if (
      portfolio.education.length === 1
    ) {
      setMessage(
        "At least one education is required"
      );

      return;
    }

    setPortfolio((prev) => ({
      ...prev,
      education:
        prev.education.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const savePortfolio = async () => {
    setMessage("");

    if (
      !portfolio.about.trim()
    ) {
      setMessage(
        "About Me is required"
      );

      return;
    }

    if (
      portfolio.about.trim().length <
      20
    ) {
      setMessage(
        "About Me must contain at least 20 characters"
      );

      return;
    }

    const invalidEducation =
      portfolio.education.some(
        (item) =>
          !item.institution.trim() ||
          !item.degree.trim()
      );

    if (invalidEducation) {
      setMessage(
        "Please complete your education details"
      );

      return;
    }

    try {
      setSaving(true);

      const formattedPortfolio = {
        ...portfolio,

        education:
          portfolio.education.map(
            (item) => ({
              ...item,

              startYear:
                item.startYear
                  ? Number(
                      item.startYear
                    )
                  : undefined,

              endYear:
                item.endYear
                  ? Number(
                      item.endYear
                    )
                  : undefined,
            })
          ),
      };

      const data =
        await updatePortfolio(
          formattedPortfolio
        );

      setMessage(
        data.message ||
          "Portfolio saved successfully"
      );
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Unable to save portfolio"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading portfolio...
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold">
        Digital Portfolio
      </h2>

      <p className="text-slate-500 mt-2">
        Complete your professional profile.
      </p>

      {message && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100">
          {message}
        </div>
      )}

      <div className="mt-5">
        <PortfolioBasicInfo
          portfolio={portfolio}
          onChange={updateField}
        />

        <EducationSection
          education={
            portfolio.education
          }
          onChange={
            updateEducation
          }
          onAdd={addEducation}
          onRemove={
            removeEducation
          }
        />

        <SkillsSection
          skills={skills}
        />

        <HobbiesSection
          hobbies={
            portfolio.hobbies
          }
          onChange={(hobbies) =>
            updateField(
              "hobbies",
              hobbies
            )
          }
        />

        <ProfessionalLinks
          portfolio={portfolio}
          onChange={updateField}
        />

        <button
          type="button"
          onClick={savePortfolio}
          disabled={saving}
          className="w-full mt-5 bg-green-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Portfolio"}
        </button>
      </div>
    </section>
  );
}