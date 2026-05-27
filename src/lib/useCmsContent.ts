import { useEffect, useState } from "react";
import {
  getByPath,
  mergeDeep,
  readSiteDraft,
  SITE_DRAFT_CHANGE_EVENT,
} from "./contentOverrides";

export function useCmsContent<T>(baseContent: T, path = "") {
  const [content, setContent] = useState(baseContent);

  useEffect(() => {
    const applyDraft = () => {
      setContent(mergeDeep(baseContent, getByPath(readSiteDraft(), path)));
    };

    applyDraft();
    window.addEventListener("storage", applyDraft);
    window.addEventListener(SITE_DRAFT_CHANGE_EVENT, applyDraft);

    return () => {
      window.removeEventListener("storage", applyDraft);
      window.removeEventListener(SITE_DRAFT_CHANGE_EVENT, applyDraft);
    };
  }, [baseContent, path]);

  return content;
}
