import { ArrowRightIcon, CheckCircleIcon, CompareIcon, FileIcon, SearchIcon, SparkIcon, TargetIcon } from "./icons";

type HeroProps = {
  hero: typeof import("../data/site/zoftware.json")["hero"];
};

export default function Hero({ hero }: HeroProps) {
  const featureCards = hero.featureCards;
  const activeCard = featureCards[0];

  return (
    <section className="hero">
      <div className="hero__inner page">
        <div className="hero__copy">
          <h1>{hero.headline}</h1>
          <div className="hero__actions" role="group" aria-label="Primary call to action links">
            <a href={hero.primaryHref} className="button button--primary">
              {hero.primaryCta}
            </a>
            <a href={hero.secondaryHref} className="button button--secondary">
              {hero.secondaryCta}
            </a>
          </div>
          <div className="hero__badges">
            {hero.badges.map((badge) => (
              <span key={badge.label}>
                <BadgeIcon icon={badge.icon} />
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <div className="hero__visual">
          <FeatureCard card={activeCard} />
        </div>
      </div>

      <div className="trusted">
        <p>
          {hero.trustedBy.usedBy}
          <strong>{hero.trustedBy.cxoText}</strong>
        </p>
        <div className="trusted__marquee" aria-label="Trusted partner logos">
          <div className="trusted__track">
            {[...hero.trustedBy.logos, ...hero.trustedBy.logos].map((logo, index) => (
              <div className="trusted__item" key={`${logo.src}-${index}`}>
                <span />
                <figure>
                  <img src={logo.src} alt={logo.alt} />
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BadgeIcon({ icon }: { icon: string }) {
  if (icon === "check") {
    return <CheckCircleIcon />;
  }

  if (icon === "trend") {
    return <ArrowRightIcon />;
  }

  return <TargetIcon />;
}

type FeatureCardProps = {
  card: HeroProps["hero"]["featureCards"][number];
};

function FeatureCard({ card }: FeatureCardProps) {
  let body = <ReportBody />;

  if (card.type === "matches") {
    body = <MatchesBody />;
  } else if (card.type === "requirements") {
    body = <RequirementsBody />;
  } else if (card.type === "compare") {
    body = <CompareBody />;
  }

  return (
    <a href={card.href} className="feature-card">
      <div className="feature-card__heading">
        <ZoftMark />
        <span>
          <strong>{card.title}</strong>
          <small>{card.subtitle}</small>
        </span>
      </div>
      <div className="feature-card__rule" />
      {body}
      <div className="feature-card__rule" />
      <span className="feature-card__cta">
        {card.cta}
        <ArrowRightIcon />
      </span>
    </a>
  );
}

function ZoftMark() {
  return (
    <span className="zoft-mark" aria-hidden="true">
      <svg
        width="39"
        height="42"
        fill="none"
        viewBox="0 0 39 42"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#zoft-card-shadow)">
          <rect x="6.27" y="8" width="25.62" height="25.62" rx="12.81" fill="url(#zoft-card-gradient)" />
        </g>
        <path d="M16.8 15.07 13.35 18.42c-.09.09-.24.03-.24-.1v-2.71c0-.43.36-.78.79-.78h2.8c.13 0 .2.15.1.24Z" fill="#fff" />
        <path d="M25.21 15.32c0 .12-.05.25-.14.34l-3.1 3.01-4.92 4.76-3.71 3.61a.78.78 0 0 1-.23-.56V21.9c0-.19.08-.36.22-.5l6.54-6.35c.14-.14.32-.21.51-.21h4.33c.27 0 .5.22.5.49Z" fill="#fff" />
        <path d="M25.51 23.71c0 .06-.03.12-.06.17l-.04.04-3.01 2.93c-.27.26-.64.41-1.03.41H13.9a.78.78 0 0 1-.56-.22l3.94-3.84c.14.14.35.22.56.22h7.37c.17 0 .3.14.3.29Z" fill="#fff" />
        <path d="M35.37 4s.11 1.08.56 1.53c.45.45 1.53.56 1.53.56s-1.08.12-1.53.57c-.45.45-.56 1.53-.56 1.53s-.12-1.08-.57-1.53c-.45-.45-1.53-.57-1.53-.57s1.08-.11 1.53-.56c.45-.45.57-1.53.57-1.53Z" fill="#A1AAFF" />
        <path d="M33.41 8s.17 1.62.85 2.29c.67.68 2.29.85 2.29.85s-1.62.17-2.29.84c-.68.68-.85 2.29-.85 2.29s-.17-1.61-.85-2.29c-.67-.67-2.29-.84-2.29-.84s1.62-.17 2.29-.85c.68-.67.85-2.29.85-2.29Z" fill="#654CFF" />
        <path d="M29.46 0s.23 2.15 1.13 3.05c.9.9 3.05 1.13 3.05 1.13s-2.15.23-3.05 1.13c-.9.9-1.13 3.05-1.13 3.05s-.23-2.15-1.13-3.05c-.9-.9-3.05-1.13-3.05-1.13s2.15-.23 3.05-1.13C29.23 2.15 29.46 0 29.46 0Z" fill="#0a0a0a" />
        <defs>
          <filter id="zoft-card-shadow" x="0" y="3.53" width="38.17" height="38.17" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="1.8" />
            <feGaussianBlur stdDeviation="3.14" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.49 0 0 0 0 0 0 0 0 0 0.61 0 0 0 0.3 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
          <linearGradient id="zoft-card-gradient" x1="10.46" y1="10.61" x2="27.19" y2="31.27" gradientUnits="userSpaceOnUse">
            <stop offset="0.06" stopColor="#DF8DFF" />
            <stop offset="0.5" stopColor="#3371FF" />
            <stop offset="0.65" stopColor="#004EFF" />
            <stop offset="1" stopColor="#FF4CAE" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

function ReportBody() {
  return (
    <>
      <div className="mini-panel">
        <div className="mini-panel__row">
          <small>Top Match</small>
          <strong className="success">92%</strong>
        </div>
        <b>Salesforce</b>
        <p>+ 2 more options with fit analysis</p>
      </div>
      <div className="mini-grid">
        <div className="mini-panel">
          <small>Stack modules</small>
          <b>5 tools</b>
        </div>
        <div className="mini-panel">
          <small>Timeline</small>
          <b>6 weeks</b>
        </div>
      </div>
      <div className="mini-panel">
        <div className="mini-panel__label">
          <ArrowRightIcon />
          <b>Implementation Roadmap</b>
        </div>
        <div className="progress-bars">
          <span />
          <span />
          <span />
        </div>
        <p>+ Risk analysis & dependencies</p>
      </div>
    </>
  );
}

function MatchesBody() {
  const items = [
    ["HubSpot CRM", "CRM • $$", "94%"],
    ["Zoho CRM", "CRM • $", "89%"],
    ["Salesforce", "CRM • $$$", "87%"],
  ];

  return (
    <>
      <div className="search-pill">
        <SearchIcon />
        CRM for retail, 50-200 employees
      </div>
      <div className="match-list">
        {items.map(([name, meta, score]) => (
          <div className="mini-panel match-row" key={name}>
            <span>
              <b>{name}</b>
              <small>{meta}</small>
            </span>
            <strong className="success">{score}</strong>
          </div>
        ))}
      </div>
      <p className="feature-card__helper">+ 47 more matches found</p>
    </>
  );
}

function RequirementsBody() {
  const steps = [
    ["Business Info", true],
    ["Requirements", false],
    ["Features Needed", false],
    ["Pre-filled based on your search", true],
  ] as const;

  return (
    <>
      <div className="progress-heading">
        <small>Building your RFP</small>
        <strong>33%</strong>
      </div>
      <div className="progress-track">
        <span />
      </div>
      <div className="steps">
        {steps.map(([label, active]) => (
          <div key={label} className={active ? "is-active" : ""}>
            <CheckCircleIcon />
            {label}
          </div>
        ))}
      </div>
      <p className="feature-card__helper">Generate complete RFP in 5 minutes</p>
    </>
  );
}

function CompareBody() {
  const rows = [
    ["Cloud-based", true, true, false],
    ["Mobile App", true, false, true],
    ["API Access", true, true, true],
    ["24/7 Support", true, false, false],
  ] as const;

  return (
    <>
      <p className="compare-label">Comparing 3 solutions:</p>
      <div className="compare-tags">
        <span>HubSpot</span>
        <span>Zoho</span>
        <span>Salesforce</span>
      </div>
      <div className="compare-table">
        <div className="compare-table__head">
          <span>Feature</span>
          <span>A</span>
          <span>B</span>
          <span>C</span>
        </div>
        {rows.map(([label, a, b, c]) => (
          <div className="compare-table__row" key={label}>
            <span>{label}</span>
            {[a, b, c].map((value, index) => (
              <span key={`${label}-${index}`} className={value ? "yes" : "no"}>
                {value ? <CheckCircleIcon /> : <CompareIcon />}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="compare-note">Compare pricing, features & integrations</p>
    </>
  );
}
