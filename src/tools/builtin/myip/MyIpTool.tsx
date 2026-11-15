"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";

type IpInfo = {
  ip: string;
  version: "IPv4" | "IPv6" | "unknown";
};

async function fetchIp(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as { ip?: string };
  if (!data.ip) throw new Error("No IP in response");
  return data.ip;
}

function detectVersion(ip: string): IpInfo["version"] {
  if (ip.includes(":")) return "IPv6";
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return "IPv4";
  return "unknown";
}

export function MyIpTool() {
  const dictionary = useDictionary();
  const t = dictionary.myipTool;
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let ip: string;
      try {
        ip = await fetchIp("https://api64.ipify.org?format=json");
      } catch {
        ip = await fetchIp("https://api.ipify.org?format=json");
      }
      setInfo({ ip, version: detectVersion(ip) });
    } catch {
      setInfo(null);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-6">
        {loading ? (
          <p className="text-sm text-muted">{t.loading}</p>
        ) : error ? (
          <p className="text-sm text-muted">{error}</p>
        ) : info ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {t.publicIp}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="break-all font-mono text-2xl font-semibold tracking-tight text-foreground">
                {info.ip}
              </p>
              <CopyButton value={info.ip} label={t.copy} copiedLabel={t.copied} />
            </div>
            <p className="mt-3 text-sm text-muted">
              {info.version === "IPv6"
                ? t.ipv6
                : info.version === "IPv4"
                  ? t.ipv4
                  : t.unknown}
            </p>
          </>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => void load()}
        disabled={loading}
        className="rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:border-accent disabled:opacity-50"
      >
        {t.refresh}
      </button>

      <p className="text-xs text-muted">{t.note}</p>
    </div>
  );
}
