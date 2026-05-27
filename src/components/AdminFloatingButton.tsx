import { SettingsIcon } from "./icons";

export default function AdminFloatingButton() {
  return (
    <a className="admin-floating-button" href="/admin" aria-label="Open admin">
      <SettingsIcon />
    </a>
  );
}
