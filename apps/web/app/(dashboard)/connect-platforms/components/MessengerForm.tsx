import { type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  CARD, ICON_BOX, INPUT, LABEL, PRIMARY_BTN,
  MESSENGER_WEBHOOK_URL, MESSENGER_VERIFY_TOKEN,
} from "../utils/platforms.constants";
import { MessengerIcon } from "./BrandIcons";
import { CopyField } from "./CopyField";

interface MessengerFormProps {
  pageId:                   string;
  pageAccessToken:          string;
  onPageIdChange:           (v: string) => void;
  onPageAccessTokenChange:  (v: string) => void;
  isConnecting:             boolean;
  error:                    string | null;
  onSubmit:                 (e: FormEvent) => void;
}

export function MessengerForm({
  pageId,
  pageAccessToken,
  onPageIdChange,
  onPageAccessTokenChange,
  isConnecting,
  error,
  onSubmit,
}: MessengerFormProps) {
  return (
    <div className="space-y-4">
      {/* ── Credentials card ── */}
      <div className={`${CARD} p-6`}>
        <div className="flex items-start gap-3 pb-5 border-b border-[var(--border-subtle)]">
          <div className={ICON_BOX}>
            <span className="text-blue-500 dark:text-blue-400"><MessengerIcon /></span>
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
              Conectează Messenger
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Facebook Messenger — Graph API
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="ms-page-id" className={LABEL}>Page ID</label>
            <input
              id="ms-page-id"
              type="text"
              value={pageId}
              onChange={(e) => onPageIdChange(e.target.value)}
              placeholder="108016472517…"
              required
              autoFocus
              className={INPUT}
            />
            <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
              Găsești Page ID în{" "}
              <span className="font-semibold text-[var(--text-secondary)]">
                Meta for Developers → App Dashboard → Messenger → Settings
              </span>
              .
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="ms-page-token" className={LABEL}>Page Access Token</label>
            <input
              id="ms-page-token"
              type="password"
              value={pageAccessToken}
              onChange={(e) => onPageAccessTokenChange(e.target.value)}
              placeholder="EAAUlx…"
              required
              className={INPUT}
            />
            <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
              Generează un token de lungă durată în{" "}
              <span className="font-semibold text-[var(--text-secondary)]">
                Messenger → Generate Token
              </span>
              .
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isConnecting || !pageId.trim() || !pageAccessToken.trim()}
              className={PRIMARY_BTN}
            >
              {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isConnecting ? "Se conectează…" : "Conectează Messenger"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Webhook configuration card ── */}
      <div className={`${CARD} p-6`}>
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Configurare Webhook</p>
          <p className="mt-0.5 text-[12px] text-[var(--text-secondary)] leading-relaxed">
            Configurează webhook-ul în Meta Developer Portal.
          </p>
        </div>

        <div className="space-y-4">
          <CopyField label="Callback URL" value={MESSENGER_WEBHOOK_URL} />
          <CopyField label="Verify Token" value={MESSENGER_VERIFY_TOKEN} />
        </div>

        <div className="mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-4">
          <p className="text-[12px] font-semibold text-[var(--text-secondary)] mb-2.5">Pași de urmat</p>
          <ol className="space-y-2 text-[12px] text-[var(--text-tertiary)] leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-[var(--accent-primary)]">1.</span>
              <span>
                Meta for Developers → App Dashboard → Messenger →{" "}
                <span className="font-semibold text-[var(--text-secondary)]">Webhooks → Add Callback URL</span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-[var(--accent-primary)]">2.</span>
              <span>
                Lipește URL-ul și Verify Token-ul de mai sus, apasă{" "}
                <span className="font-semibold text-[var(--text-secondary)]">Verify and Save</span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-[var(--accent-primary)]">3.</span>
              <span>
                Abonează-te la evenimentul{" "}
                <code className="rounded border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-primary)]">
                  messages
                </code>{" "}
                pentru pagina ta
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-semibold text-[var(--accent-primary)]">4.</span>
              <span>
                Completează câmpurile de mai sus cu Page ID și Page Access Token, apoi apasă{" "}
                <span className="font-semibold text-[var(--text-secondary)]">Conectează Messenger</span>
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
