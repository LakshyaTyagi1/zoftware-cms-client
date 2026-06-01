import { ExitIcon, SettingsIcon } from "./icons";

export default function AdminFloatingButton() {
  return (
    <div className="floating-action-stack" aria-label="Site tools">
      <a
        className="floating-action-button"
        href="/onboarding"
        aria-label="Open onboarding"
        data-tooltip="Open onboarding"
      >
        <ExitIcon />
      </a>
      <a
        className="floating-action-button"
        href="/admin"
        target="_blank"
        rel="noreferrer"
        aria-label="Open admin in a new tab"
        data-tooltip="Open admin"
      >
        <SettingsIcon />
      </a>
    </div>
  );
}
