/**
 * WSM Publisher — Cloudflare Workers Cron (UTC), fail-closed by default.
 * Only schedules approved same-day assets through Floot. No IG credentials here.
 * Never deploy alongside GitHub cron in publishing mode.
 */
export const ORIGIN = "https://cubebox-campaign-assets.floot.app";
export const CRONS = Object.freeze({
  "45 4 * * *": "11:45",
  "30 5 * * *": "12:30",
  "30 12 * * *": "19:30",
  "15 13 * * 0": "20:15",
  "45 13 * * *": "20:45"
});
const ACCOUNTS = Object.freeze({
  umrohfriendly: "17841456189730019",
  infoumrohhemat: "17841408096044761",
  muslimhalaltrip: "17841456186551011"
});
const encoder = new TextEncoder();

export function utcScheduledToJakarta(scheduledTime) {
  if (!Number.isFinite(scheduledTime)) throw Error("invalid scheduledTime");
  // Indonesia WIB is UTC+7, without DST.
  const date = new Date(scheduledTime + 7 * 3600_000);
  if (!Number.isFinite(date.getTime())) throw Error("invalid scheduledTime");
  return {
    date: date.toISOString().slice(0, 10),
    weekday: date.getUTCDay()
  };
}

export function resolveTarget(cron, scheduledTime) {
  const slot = CRONS[cron];
  if (!slot) throw Error("unknown cron");
  const { date, weekday } = utcScheduledToJakarta(scheduledTime);
  if (slot === "20:15" && weekday !== 0) throw Error("Sunday slot must be Sunday");
  const account = slot === "11:45" ? "umrohfriendly"
    : (slot === "12:30" || slot === "19:30") ? "infoumrohhemat"
    : "muslimhalaltrip";
  const media_type = slot === "12:30" ? "story"
    : slot === "20:45" ? ([1,3,5].includes(weekday) ? "feed" : "story")
    : "feed";
  return {
    date,
    timezone: "Asia/Jakarta",
    account,
    account_id: ACCOUNTS[account],
    slot_time: slot,
    media_type
  };
}

export async function signatureHex(secret, timestamp, body) {
  if (!secret || secret.length < 32) throw Error("WSM_CF_HMAC_SECRET must have >=32 characters");
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(timestamp + "." + body));
  return Array.from(new Uint8Array(bytes)).map(x => x.toString(16).padStart(2, "0")).join("");
}

export async function publishScheduled(event, env, send=fetch, now=Date.now()) {
  const target = resolveTarget(event.cron, Number(event.scheduledTime));
  const currentJakartaDate = utcScheduledToJakarta(now).date;
  if (target.date !== currentJakartaDate) {
    // GitHub's original cron date rollover bug must not recur.
    return { status: "no_op", reason: "cross_day_delayed", target };
  }
  if (now < Number(event.scheduledTime)) {
    return { status: "no_op", reason: "not_due", target };
  }
  // Intentionally default to SHADOW: even before secret configuration this cannot publish.
  const dry_run = env.WSM_SHADOW_MODE !== "false";
  if (!env.WSM_CF_HMAC_SECRET || env.WSM_CF_HMAC_SECRET.length < 32)
    throw Error("HMAC secret not configured");
  const body = JSON.stringify({ ...target, dry_run });
  const timestamp = String(now);
  const sig = await signatureHex(env.WSM_CF_HMAC_SECRET, timestamp, body);
  const response = await send(ORIGIN + "/_api/publisher-run", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-wsm-scheduler": "cloudflare-cron-v1",
      "x-wsm-timestamp": timestamp,
      "x-wsm-signature": "sha256=" + sig
    },
    body
  });
  let payload = {};
  try { payload = await response.json(); } catch { payload = { error: "invalid_publisher_json" }; }
  if (!response.ok) {
    throw Error("Floot publisher HTTP " + response.status + " " + String(payload.error || "").slice(0, 160));
  }
  const allowed = dry_run ? ["no_op","already_published"] : ["published","already_published","in_progress","no_op"];
  if (!allowed.includes(payload.status)) throw Error("unexpected publisher status");
  return { status: payload.status, slot: target.slot_time, date: target.date, dry_run, mediaId: payload.mediaId ?? null };
}

export default {
  async scheduled(event, env, ctx) {
    const job = publishScheduled(event, env);
    ctx.waitUntil(job.then(result => {
      console.log(JSON.stringify({event:"wsm_cloudflare_cron",...result}));
    }).catch(error => {
      console.error(JSON.stringify({event:"wsm_cloudflare_cron_failed",slot:event.cron,error:String(error).slice(0,250)}));
      throw error;
    }));
  },
  async fetch() {
    return new Response("Not Found", {status:404});
  }
};
