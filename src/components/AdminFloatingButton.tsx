import { SettingsIcon } from "./icons";

export default function AdminFloatingButton() {
  return (
    <a
      className="admin-floating-button"
      href="/admin"
      target="_blank"
      rel="noreferrer"
      aria-label="Open admin in a new tab"
    >
      <SettingsIcon />
    </a>
  );
}
