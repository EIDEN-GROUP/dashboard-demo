// ─────────────────────────────────────────────
// Branded transactional email templates (French)
// Styled to match the app: navy #28396C, green #B5E18B / #6BA53A, cream
// #FBFDF2 — soft rounded cards, pill CTAs, no monospace. Pure functions,
// zero dependencies, table-based + inline styles for email-client support.
//
// Rounded corners and shadows degrade gracefully: Outlook desktop ignores
// border-radius and renders square, which still reads correctly.
// ─────────────────────────────────────────────

export type DemoRequest = {
  /** Name of the specialized center */
  center: string;
  email: string;
  phone: string;
  /** Preferred demo date as ISO yyyy-mm-dd */
  preferredDate: string;
  /** Optional free-text message */
  message?: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

// Brand palette (literal hex — email clients don't support CSS variables)
const C = {
  navy: "#28396C",
  navyDk: "#1B2A55",
  green: "#B5E18B",
  greenDk: "#6BA53A",
  greenInk: "#3E6420",
  cream: "#FBFDF2",
  wash: "#F4FAE6",
  white: "#ffffff",
  ink: "#28396C",
  muted: "#5C6B94",
  line: "#E4E9F2",
  sand: "#EAE6BC",
} as const;

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const ADMIN_EMAIL = "contact@eiden-group.com";
const WEBSITE = "eiden-group.com";
const PHONE_MA_DISPLAY = "07 77 77 74 28";
const PHONE_MA_TEL = "+212777777428";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Format an ISO yyyy-mm-dd into a long French date label. */
export function formatDemoDate(iso: string): string {
  if (!iso) return "À convenir";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    const label = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return iso;
  }
}

// ── Shared building blocks ──────────────────────

/** Pill button. `variant` mirrors the app's primary / outline CTAs. */
function button(href: string, label: string, variant: "primary" | "outline" = "primary"): string {
  const bg = variant === "primary" ? C.navy : C.white;
  const fg = variant === "primary" ? C.white : C.navy;
  const border = variant === "primary" ? C.navy : C.line;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
    <tr><td style="background-color:${bg};border:1px solid ${border};border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font:700 14px/1 ${FONT};color:${fg};text-decoration:none;letter-spacing:0.2px;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

function shell(opts: {
  preheader: string;
  eyebrow: string;
  title: string;
  titleItalic?: string;
  body: string;
}): string {
  const { preheader, eyebrow, title, titleItalic, body } = opts;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.wash};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.wash};">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.wash};">
<tr><td align="center" style="padding:36px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;border-collapse:separate;">

    <!-- Header — navy bar, logo badge + wordmark -->
    <tr><td style="background-color:${C.navy};border-radius:20px 20px 0 0;padding:22px 30px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:36px;height:36px;background-color:${C.green};border-radius:50%;text-align:center;vertical-align:middle;font:700 17px/36px ${FONT};color:${C.navy};">G</td>
                <td style="padding-left:11px;font:700 19px/1.1 ${FONT};color:${C.cream};letter-spacing:-0.3px;">Gestio</td>
              </tr>
            </table>
          </td>
          <td align="right" style="vertical-align:middle;font:600 11px/1 ${FONT};color:${C.green};letter-spacing:0.6px;">
            ${escapeHtml(WEBSITE)}
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Green accent rule -->
    <tr><td style="height:3px;background-color:${C.green};font-size:0;line-height:0;">&nbsp;</td></tr>

    <!-- Body card -->
    <tr><td style="background-color:${C.cream};border-radius:0 0 20px 20px;padding:38px 34px;">
      <p style="margin:0 0 12px;font:700 11px/1 ${FONT};color:${C.greenDk};letter-spacing:2px;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
      <h1 style="margin:0 0 22px;font:600 27px/1.25 ${FONT};color:${C.navy};letter-spacing:-0.5px;">${escapeHtml(title)}${
        titleItalic
          ? ` <span style="font-weight:500;font-style:italic;color:${C.muted};">${escapeHtml(titleItalic)}</span>`
          : ""
      }</h1>
      ${body}
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:26px 34px 0;">
      <p style="margin:0 0 6px;font:700 13px/1.4 ${FONT};color:${C.navy};">Gestio · CRM pour centres spécialisés</p>
      <p style="margin:0 0 12px;font:400 12px/1.6 ${FONT};color:${C.muted};">Agadir Bay, Technopole 1 Bloc B, Agadir 80000 · Maroc</p>
      <p style="margin:0;font:400 12px/1.6 ${FONT};color:${C.muted};">
        <a href="tel:${PHONE_MA_TEL}" style="color:${C.greenDk};text-decoration:none;font-weight:600;">${PHONE_MA_DISPLAY}</a>
        &nbsp;·&nbsp;
        <a href="mailto:${ADMIN_EMAIL}" style="color:${C.greenDk};text-decoration:none;font-weight:600;">${ADMIN_EMAIL}</a>
        &nbsp;·&nbsp;
        <a href="https://${WEBSITE}" style="color:${C.greenDk};text-decoration:none;font-weight:600;">${WEBSITE}</a>
      </p>
    </td></tr>

    <tr><td align="center" style="padding:20px 8px 0;font:400 11px/1.5 ${FONT};color:${C.muted};">
      © ${new Date().getFullYear()} Gestio · Eiden Group · Tous droits réservés
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

/** Rounded white card of key/value rows, hairline separators. */
function detailTable(rows: Array<{ label: string; value: string; href?: string }>): string {
  const cells = rows
    .map((r, i) => {
      const value = r.href
        ? `<a href="${r.href}" style="color:${C.greenDk};text-decoration:none;font-weight:600;">${escapeHtml(r.value)}</a>`
        : `<span style="color:${C.ink};font-weight:600;">${escapeHtml(r.value)}</span>`;
      const top = i === 0 ? "" : `border-top:1px solid ${C.line};`;
      return `<tr>
        <td style="${top}padding:14px 18px;font:600 11px/1.3 ${FONT};color:${C.muted};letter-spacing:0.8px;text-transform:uppercase;white-space:nowrap;vertical-align:top;width:38%;">${escapeHtml(r.label)}</td>
        <td style="${top}padding:14px 18px;font:400 14px/1.5 ${FONT};">${value}</td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:16px;background-color:${C.white};border-collapse:separate;overflow:hidden;">${cells}</table>`;
}

// ── Visitor confirmation ────────────────────────

export function renderVisitorConfirmationEmail(data: DemoRequest): RenderedEmail {
  const dateLabel = formatDemoDate(data.preferredDate);
  const rows: Array<{ label: string; value: string; href?: string }> = [
    { label: "Centre", value: data.center },
    { label: "Créneau souhaité", value: dateLabel },
    { label: "Téléphone", value: data.phone, href: `tel:${data.phone.replace(/\s+/g, "")}` },
    { label: "Email", value: data.email, href: `mailto:${data.email}` },
  ];
  if (data.message?.trim()) {
    rows.push({ label: "Message", value: data.message.trim() });
  }

  const body = `
    <p style="margin:0 0 24px;font:400 15px/1.7 ${FONT};color:${C.muted};">
      Bonjour,<br /><br />
      Merci d'avoir demandé une démo de <strong style="color:${C.navy};">Gestio</strong> pour
      <strong style="color:${C.navy};">${escapeHtml(data.center)}</strong>. Votre demande est bien enregistrée.
      Notre équipe vous contactera <strong style="color:${C.navy};">sous 2&nbsp;heures ouvrées</strong> pour confirmer le créneau ci-dessous.
    </p>

    ${detailTable(rows)}

    <!-- Ce qui vous attend -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:${C.wash};border-left:4px solid ${C.greenDk};border-radius:12px;border-collapse:separate;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 10px;font:700 13px/1.2 ${FONT};color:${C.navy};">Ce qui vous attend pendant la démo</p>
        <p style="margin:0;font:400 14px/1.8 ${FONT};color:${C.muted};">
          • Une présentation personnalisée selon votre type de centre<br />
          • Vos cas concrets : dossiers, paiements, planning<br />
          • 20 minutes, sans engagement
        </p>
      </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;">
      <tr><td>${button(`tel:${PHONE_MA_TEL}`, `Une question ? Appelez-nous`, "primary")}</td></tr>
    </table>

    <p style="margin:26px 0 0;font:400 13px/1.6 ${FONT};color:${C.muted};">
      À très vite,<br />L'équipe Gestio
    </p>`;

  const text = [
    `Merci d'avoir demandé une démo de Gestio pour ${data.center}.`,
    `Notre équipe vous contactera sous 2 heures ouvrées.`,
    ``,
    `Centre : ${data.center}`,
    `Créneau souhaité : ${dateLabel}`,
    `Téléphone : ${data.phone}`,
    `Email : ${data.email}`,
    data.message?.trim() ? `Message : ${data.message.trim()}` : ``,
    ``,
    `Une question urgente ? Appelez-nous au ${PHONE_MA_DISPLAY}.`,
    `${WEBSITE} · ${ADMIN_EMAIL}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Votre démo Gestio est en cours de confirmation — ${data.center}`,
    html: shell({
      preheader: `Demande reçue pour ${data.center}. Nous vous recontactons sous 2h.`,
      eyebrow: "Demande de démo reçue",
      title: "C'est noté,",
      titleItalic: "on s'occupe de tout.",
      body,
    }),
    text,
  };
}

// ── Admin notification ("receipt") ──────────────

export function renderAdminNotificationEmail(data: DemoRequest): RenderedEmail {
  const dateLabel = formatDemoDate(data.preferredDate);
  const received = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date());

  const rows: Array<{ label: string; value: string; href?: string }> = [
    { label: "Centre", value: data.center },
    { label: "Créneau souhaité", value: dateLabel },
    { label: "Téléphone", value: data.phone, href: `tel:${data.phone.replace(/\s+/g, "")}` },
    { label: "Email", value: data.email, href: `mailto:${data.email}` },
    { label: "Reçu le", value: received },
  ];
  if (data.message?.trim()) {
    rows.push({ label: "Message", value: data.message.trim() });
  }

  const body = `
    <p style="margin:0 0 24px;font:400 15px/1.7 ${FONT};color:${C.muted};">
      Une nouvelle demande de démo vient d'arriver via le site. Recontactez le centre
      <strong style="color:${C.navy};">sous 2&nbsp;heures ouvrées</strong>.
    </p>

    ${detailTable(rows)}

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;">
      <tr>
        <td>${button(`tel:${data.phone.replace(/\s+/g, "")}`, "Appeler le centre", "primary")}</td>
        <td style="width:10px;font-size:0;">&nbsp;</td>
        <td>${button(`mailto:${data.email}`, "Répondre par email", "outline")}</td>
      </tr>
    </table>`;

  const text = [
    `Nouvelle demande de démo Gestio.`,
    ``,
    `Centre : ${data.center}`,
    `Créneau souhaité : ${dateLabel}`,
    `Téléphone : ${data.phone}`,
    `Email : ${data.email}`,
    `Reçu le : ${received}`,
    data.message?.trim() ? `Message : ${data.message.trim()}` : ``,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Nouvelle demande de démo — ${data.center}`,
    html: shell({
      preheader: `${data.center} · ${data.phone} · créneau : ${dateLabel}`,
      eyebrow: "Nouveau lead · à recontacter",
      title: "Demande de démo",
      titleItalic: data.center,
      body,
    }),
    text,
  };
}
