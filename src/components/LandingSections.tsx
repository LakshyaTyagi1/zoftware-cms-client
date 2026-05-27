import {
  ArrowRightIcon,
  CompareIcon,
  FileIcon,
  SparkIcon,
  TargetIcon,
} from "./icons";
import { useCmsContent } from "../lib/useCmsContent";

type SiteSections = typeof import("../data/site/zoftware.json")["sections"];

type LandingSectionsProps = {
  sections: SiteSections;
};

const toolIcons = {
  "strategy-builder": SparkIcon,
  "system-fit-score": TargetIcon,
  "rfp-builder": FileIcon,
  "smart-compare": CompareIcon,
} as const;

const impactIcons = {
  techDecision: TargetIcon,
  customerExperience: ClockIcon,
  successRate: GrowthIcon,
} as const;

export default function LandingSections({ sections }: LandingSectionsProps) {
  const content = useCmsContent(sections, "sections");

  return (
    <>
      <SmartSuiteSection section={content.smartSuite} />
      <DecisionImpactSection section={content.decisionImpact} />
      <TrustedSolutionsSection section={content.trustedSolutions} />
    </>
  );
}

function SmartSuiteSection({
  section,
}: {
  section: SiteSections["smartSuite"];
}) {
  return (
    <section className="smart-suite-section page" id="zoftware-features-section">
      <div className="section-heading">
        <p>{section.eyebrow}</p>
        <h2>{section.heading}</h2>
        <span>{section.description}</span>
      </div>

      <div className="smart-tools">
        {section.tools.map((tool) => {
          const Icon = toolIcons[tool.id as keyof typeof toolIcons] ?? SparkIcon;
          return (
            <a href={tool.href} className="smart-tool-card" key={tool.id}>
              <div className="smart-tool-card__top">
                <span className="smart-tool-card__icon">
                  <Icon />
                </span>
                <em>{tool.badge}</em>
              </div>
              <div className="smart-tool-card__body">
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
              <div className="smart-tool-card__bottom">
                <span>
                  <strong>{tool.metricValue}</strong>
                  <small>{tool.metricLabel}</small>
                </span>
                <b>
                  {tool.cta}
                  <ArrowRightIcon />
                </b>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function DecisionImpactSection({
  section,
}: {
  section: SiteSections["decisionImpact"];
}) {
  return (
    <section className="decision-impact page" id="decision-impact-section">
      <div className="decision-impact__header">
        <h2>{section.heading}</h2>
        <div className="decision-impact__arrows" aria-hidden="true">
          <button type="button">‹</button>
          <button type="button">›</button>
        </div>
      </div>

      <div className="impact-cards">
        {section.cards.map((card) => {
          const Icon =
            impactIcons[card.id as keyof typeof impactIcons] ?? TargetIcon;
          const isGreen = card.id === "customerExperience";

          return (
            <article className="impact-card" key={card.id}>
              <span className={`impact-card__icon ${isGreen ? "is-green" : ""}`}>
                <i>
                  <Icon />
                </i>
              </span>
              <div className="impact-card__panel">
                <strong>{card.value}</strong>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TrustedSolutionsSection({
  section,
}: {
  section: SiteSections["trustedSolutions"];
}) {
  return (
    <section className="trusted-solutions page" id="trusted-solutions-section">
      <h2>{section.heading}</h2>
      <div className="solution-chips">
        {section.chips.map((chip, index) => (
          <span className="solution-chip" key={chip.id}>
            <img src={chip.icon} alt="" aria-hidden="true" />
            {chip.label}
            {index === 6 && <i aria-hidden="true" />}
          </span>
        ))}
      </div>
    </section>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
      <path
        d="M24 34c5.52 0 10-4.48 10-10s-4.48-10-10-10-10 4.48-10 10 4.48 10 10 10Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M24 18v6l4 2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
      <path
        d="M18 30 24 24l5 5 9-11"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      />
      <path
        d="M31 18h7v7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      />
    </svg>
  );
}
