/** Ready-made slide layouts and starter decks for Dias. */

import {
  nextBlockId,
  nextSlideId,
  type Slide,
  type SlideBlock,
  type SlidesDoc,
} from "./slides";
import type { SlideTransition } from "./transitions";

export type SlideLayoutId =
  | "titleHero"
  | "sectionBreak"
  | "bullets"
  | "twoColumn"
  | "threeCards"
  | "quote"
  | "bigNumber"
  | "agenda"
  | "comparison"
  | "imageLeft"
  | "imageRight"
  | "photoCaption"
  | "steps"
  | "faq"
  | "team"
  | "closing";

export type StarterDeckId =
  | "pitch"
  | "lesson"
  | "meeting"
  | "workshop"
  | "status";

type Locale = "da" | "en";

type Copy = Record<string, string>;

const copy: Record<Locale, Copy> = {
  da: {
    titleHero_title: "Din præsentation",
    titleHero_body: "En kort undertitel der sætter stemningen",
    section_title: "Næste kapitel",
    section_body: "Et kort overblik før detaljerne",
    bullets_title: "Hovedpointer",
    bullets_body: "• Punkt ét\n• Punkt to\n• Punkt tre\n• Punkt fire",
    twoCol_title: "To sider af sagen",
    twoCol_left: "Venstre kolonne\n\nSkriv dit første argument her.",
    twoCol_right: "Højre kolonne\n\nSkriv dit andet argument her.",
    cards_title: "Tre klare budskaber",
    card1: "Budskab 1\n\nKort forklaring.",
    card2: "Budskab 2\n\nKort forklaring.",
    card3: "Budskab 3\n\nKort forklaring.",
    quote_text: "“Den bedste idé er den, folk husker efter mødet.”",
    quote_by: "— Dit citat",
    big_number: "87%",
    big_label: "Af brugerne forstod budskabet med det samme",
    agenda_title: "Dagsorden",
    agenda_body: "1. Velkommen\n2. Status\n3. Beslutninger\n4. Næste skridt",
    compare_title: "Før og efter",
    compare_left: "Før\n\n• Langsom proces\n• Mange fejl\n• Uklar ejerskab",
    compare_right: "Efter\n\n• Hurtig rytme\n• Færre fejl\n• Klar ejerskab",
    imageLeft_title: "Vis det visuelt",
    imageLeft_body: "Erstat den grå flade med et billede, og behold teksten til højre.",
    imageRight_title: "Fortæl med billeder",
    imageRight_body: "Tekst til venstre, billede til højre. Godt til cases og demos.",
    photo_caption: "Billedtekst: skriv hvad publikum skal lægge mærke til",
    steps_title: "Sådan gør du",
    steps_body: "1. Start med målet\n2. Vis ét eksempel\n3. Opsummér næste skridt",
    faq_title: "Ofte stillede spørgsmål",
    faq_body: "Q: Hvad er det vigtigste?\nA: Hold dig til ét budskab pr. dias.\n\nQ: Hvor meget tekst?\nA: Helst under fem linjer.",
    team_title: "Holdet",
    team_a: "Navn\nRolle",
    team_b: "Navn\nRolle",
    team_c: "Navn\nRolle",
    closing_title: "Tak",
    closing_body: "Spørgsmål? Skriv til os, eller book en opfølgning.",
    pitch_title: "Pitch",
    lesson_title: "Undervisning",
    meeting_title: "Møde",
    workshop_title: "Workshop",
    status_title: "Status",
    pitch_s1_title: "Problemet",
    pitch_s1_body: "Hvem har ondt, og hvorfor nu?",
    pitch_s2_title: "Løsningen",
    pitch_s2_body: "Én sætning om hvad I bygger.",
    pitch_s3_title: "Hvorfor os",
    pitch_s3_body: "• Fordel 1\n• Fordel 2\n• Fordel 3",
    pitch_s4_title: "Næste skridt",
    pitch_s4_body: "Hvad skal publikum gøre i dag?",
    lesson_s1_title: "Læringsmål",
    lesson_s1_body: "Efter i dag kan du…",
    lesson_s2_title: "Kerneidé",
    lesson_s2_body: "Forklar begrebet med ét eksempel.",
    lesson_s3_title: "Øvelse",
    lesson_s3_body: "1. Prøv selv\n2. Del med makker\n3. Opsummér",
    lesson_s4_title: "Takeaway",
    lesson_s4_body: "Husk denne ene ting i morgen.",
    meeting_s1_title: "Formål",
    meeting_s1_body: "Hvad skal være besluttet, når vi går herfra?",
    meeting_s2_title: "Status",
    meeting_s2_body: "• Grønt\n• Gult\n• Rødt",
    meeting_s3_title: "Beslutninger",
    meeting_s3_body: "• Beslutning 1\n• Beslutning 2",
    meeting_s4_title: "Action items",
    meeting_s4_body: "• Hvem / hvad / hvornår",
    workshop_s1_title: "I dag arbejder vi med",
    workshop_s1_body: "Et konkret mål for sessionen",
    workshop_s2_title: "Regler",
    workshop_s2_body: "• Én stemme ad gangen\n• Byg videre på hinanden\n• Tidboks holdes",
    workshop_s3_title: "Opgave",
    workshop_s3_body: "Beskriv opgaven i tre linjer.",
    workshop_s4_title: "Deling",
    workshop_s4_body: "Hvert hold får 2 minutter.",
    status_s1_title: "Highlight",
    status_s1_body: "Det vigtigste der skete siden sidst",
    status_s2_title: "Tal",
    status_s2_body: "Vælg ét tal, der fortæller historien",
    status_s3_title: "Risici",
    status_s3_body: "• Risiko\n• Mitigerende handling",
    status_s4_title: "Plan",
    status_s4_body: "Hvad sker der den næste uge?",
  },
  en: {
    titleHero_title: "Your presentation",
    titleHero_body: "A short subtitle that sets the tone",
    section_title: "Next chapter",
    section_body: "A brief overview before the details",
    bullets_title: "Key points",
    bullets_body: "• Point one\n• Point two\n• Point three\n• Point four",
    twoCol_title: "Two sides of the story",
    twoCol_left: "Left column\n\nWrite your first argument here.",
    twoCol_right: "Right column\n\nWrite your second argument here.",
    cards_title: "Three clear messages",
    card1: "Message 1\n\nShort explanation.",
    card2: "Message 2\n\nShort explanation.",
    card3: "Message 3\n\nShort explanation.",
    quote_text: "“The best idea is the one people remember after the meeting.”",
    quote_by: "— Your quote",
    big_number: "87%",
    big_label: "Of viewers understood the message immediately",
    agenda_title: "Agenda",
    agenda_body: "1. Welcome\n2. Status\n3. Decisions\n4. Next steps",
    compare_title: "Before and after",
    compare_left: "Before\n\n• Slow process\n• Many mistakes\n• Unclear ownership",
    compare_right: "After\n\n• Steady rhythm\n• Fewer mistakes\n• Clear ownership",
    imageLeft_title: "Show it visually",
    imageLeft_body: "Replace the grey panel with an image and keep the text on the right.",
    imageRight_title: "Tell it with pictures",
    imageRight_body: "Text on the left, image on the right. Great for cases and demos.",
    photo_caption: "Caption: tell the audience what to notice",
    steps_title: "How to do it",
    steps_body: "1. Start with the goal\n2. Show one example\n3. Summarize the next step",
    faq_title: "FAQ",
    faq_body: "Q: What matters most?\nA: One message per slide.\n\nQ: How much text?\nA: Prefer under five lines.",
    team_title: "The team",
    team_a: "Name\nRole",
    team_b: "Name\nRole",
    team_c: "Name\nRole",
    closing_title: "Thank you",
    closing_body: "Questions? Reach out, or book a follow-up.",
    pitch_title: "Pitch",
    lesson_title: "Lesson",
    meeting_title: "Meeting",
    workshop_title: "Workshop",
    status_title: "Status",
    pitch_s1_title: "The problem",
    pitch_s1_body: "Who hurts, and why now?",
    pitch_s2_title: "The solution",
    pitch_s2_body: "One sentence on what you build.",
    pitch_s3_title: "Why us",
    pitch_s3_body: "• Benefit 1\n• Benefit 2\n• Benefit 3",
    pitch_s4_title: "Next step",
    pitch_s4_body: "What should the audience do today?",
    lesson_s1_title: "Learning goals",
    lesson_s1_body: "After today you can…",
    lesson_s2_title: "Core idea",
    lesson_s2_body: "Explain the concept with one example.",
    lesson_s3_title: "Exercise",
    lesson_s3_body: "1. Try it\n2. Pair up\n3. Summarize",
    lesson_s4_title: "Takeaway",
    lesson_s4_body: "Remember this one thing tomorrow.",
    meeting_s1_title: "Purpose",
    meeting_s1_body: "What must be decided before we leave?",
    meeting_s2_title: "Status",
    meeting_s2_body: "• Green\n• Yellow\n• Red",
    meeting_s3_title: "Decisions",
    meeting_s3_body: "• Decision 1\n• Decision 2",
    meeting_s4_title: "Action items",
    meeting_s4_body: "• Who / what / when",
    workshop_s1_title: "Today we work on",
    workshop_s1_body: "A concrete goal for the session",
    workshop_s2_title: "Ground rules",
    workshop_s2_body: "• One voice at a time\n• Build on each other\n• Keep the timebox",
    workshop_s3_title: "Task",
    workshop_s3_body: "Describe the task in three lines.",
    workshop_s4_title: "Share-out",
    workshop_s4_body: "Each group gets 2 minutes.",
    status_s1_title: "Highlight",
    status_s1_body: "The most important thing since last time",
    status_s2_title: "The number",
    status_s2_body: "Pick one number that tells the story",
    status_s3_title: "Risks",
    status_s3_body: "• Risk\n• Mitigating action",
    status_s4_title: "Plan",
    status_s4_body: "What happens next week?",
  },
};

const SANS = "Calibri, 'Segoe UI', system-ui, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function text(
  kind: "title" | "body",
  partial: Omit<SlideBlock, "id" | "kind" | "fontFamily" | "z"> & {
    fontFamily?: string;
    z?: number;
  },
): SlideBlock {
  return {
    id: nextBlockId(),
    kind,
    ...partial,
    fontFamily: partial.fontFamily ?? SANS,
    z: partial.z ?? 1,
    entrance: partial.entrance ?? (kind === "title" ? "slideUp" : "fade"),
  };
}

function shape(
  partial: Omit<SlideBlock, "id" | "kind" | "fontFamily" | "fontSize" | "color" | "align" | "z"> & {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    align?: SlideBlock["align"];
    z?: number;
  },
): SlideBlock {
  return {
    id: nextBlockId(),
    kind: "shape",
    ...partial,
    fontFamily: partial.fontFamily ?? SANS,
    fontSize: partial.fontSize ?? 16,
    color: partial.color ?? "#111111",
    align: partial.align ?? "center",
    z: partial.z ?? 0,
    entrance: partial.entrance ?? "fade",
  };
}

function slide(
  background: string,
  blocks: SlideBlock[],
  transition: SlideTransition = "fade",
): Slide {
  return {
    id: nextSlideId(),
    background,
    transition,
    blocks,
  };
}

export const SLIDE_LAYOUTS: Array<{
  id: SlideLayoutId;
  group: "start" | "content" | "visual" | "end";
}> = [
  { id: "titleHero", group: "start" },
  { id: "sectionBreak", group: "start" },
  { id: "agenda", group: "start" },
  { id: "bullets", group: "content" },
  { id: "twoColumn", group: "content" },
  { id: "threeCards", group: "content" },
  { id: "steps", group: "content" },
  { id: "comparison", group: "content" },
  { id: "faq", group: "content" },
  { id: "bigNumber", group: "content" },
  { id: "quote", group: "content" },
  { id: "team", group: "content" },
  { id: "imageLeft", group: "visual" },
  { id: "imageRight", group: "visual" },
  { id: "photoCaption", group: "visual" },
  { id: "closing", group: "end" },
];

export const STARTER_DECKS: StarterDeckId[] = [
  "pitch",
  "lesson",
  "meeting",
  "workshop",
  "status",
];

export function buildLayoutSlide(
  layoutId: SlideLayoutId,
  locale: Locale = "en",
  background = "#ffffff",
): Slide {
  const c = copy[locale];
  const dark = background === "#0f172a" || background === "#111827";
  const titleColor = dark ? "#f8fafc" : "#111111";
  const bodyColor = dark ? "#cbd5e1" : "#404040";
  const accent = dark ? "#38bdf8" : "#0f766e";
  const panel = dark ? "#1e293b" : "#f1f5f9";

  switch (layoutId) {
    case "titleHero":
      return slide(
        background,
        [
          shape({ x: 0, y: 0, w: 100, h: 8, fill: accent, z: 0, entrance: "none" }),
          text("title", {
            x: 8,
            y: 30,
            w: 84,
            h: 18,
            text: c.titleHero_title,
            fontSize: 48,
            color: titleColor,
            align: "center",
            bold: true,
            z: 2,
          }),
          text("body", {
            x: 14,
            y: 52,
            w: 72,
            h: 14,
            text: c.titleHero_body,
            fontSize: 22,
            color: bodyColor,
            align: "center",
            z: 3,
          }),
        ],
        "zoom",
      );
    case "sectionBreak":
      return slide(
        background,
        [
          shape({ x: 8, y: 42, w: 12, h: 1.4, fill: accent, z: 1 }),
          text("title", {
            x: 8,
            y: 28,
            w: 84,
            h: 16,
            text: c.section_title,
            fontSize: 42,
            color: titleColor,
            align: "left",
            bold: true,
            z: 2,
          }),
          text("body", {
            x: 8,
            y: 50,
            w: 70,
            h: 12,
            text: c.section_body,
            fontSize: 20,
            color: bodyColor,
            align: "left",
            z: 3,
          }),
        ],
        "slideLeft",
      );
    case "bullets":
      return slide(background, [
        text("title", {
          x: 8,
          y: 10,
          w: 84,
          h: 12,
          text: c.bullets_title,
          fontSize: 34,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        text("body", {
          x: 8,
          y: 28,
          w: 84,
          h: 58,
          text: c.bullets_body,
          fontSize: 24,
          color: bodyColor,
          align: "left",
          entrance: "slideUp",
          z: 2,
        }),
      ]);
    case "twoColumn":
      return slide(background, [
        text("title", {
          x: 8,
          y: 8,
          w: 84,
          h: 12,
          text: c.twoCol_title,
          fontSize: 32,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        shape({ x: 8, y: 24, w: 40, h: 62, fill: panel, z: 0 }),
        shape({ x: 52, y: 24, w: 40, h: 62, fill: panel, z: 0 }),
        text("body", {
          x: 11,
          y: 28,
          w: 34,
          h: 52,
          text: c.twoCol_left,
          fontSize: 18,
          color: bodyColor,
          align: "left",
          entrance: "slideLeft",
          z: 2,
        }),
        text("body", {
          x: 55,
          y: 28,
          w: 34,
          h: 52,
          text: c.twoCol_right,
          fontSize: 18,
          color: bodyColor,
          align: "left",
          entrance: "slideLeft",
          z: 3,
        }),
      ]);
    case "threeCards":
      return slide(background, [
        text("title", {
          x: 8,
          y: 8,
          w: 84,
          h: 12,
          text: c.cards_title,
          fontSize: 32,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        shape({ x: 6, y: 26, w: 28, h: 56, fill: panel, z: 0 }),
        shape({ x: 36, y: 26, w: 28, h: 56, fill: panel, z: 0 }),
        shape({ x: 66, y: 26, w: 28, h: 56, fill: panel, z: 0 }),
        text("body", {
          x: 9,
          y: 32,
          w: 22,
          h: 44,
          text: c.card1,
          fontSize: 18,
          color: bodyColor,
          align: "left",
          entrance: "pop",
          z: 2,
        }),
        text("body", {
          x: 39,
          y: 32,
          w: 22,
          h: 44,
          text: c.card2,
          fontSize: 18,
          color: bodyColor,
          align: "left",
          entrance: "pop",
          z: 3,
        }),
        text("body", {
          x: 69,
          y: 32,
          w: 22,
          h: 44,
          text: c.card3,
          fontSize: 18,
          color: bodyColor,
          align: "left",
          entrance: "pop",
          z: 4,
        }),
      ]);
    case "quote":
      return slide(background, [
        text("title", {
          x: 10,
          y: 28,
          w: 80,
          h: 28,
          text: c.quote_text,
          fontSize: 28,
          color: titleColor,
          align: "center",
          italic: true,
          fontFamily: SERIF,
          entrance: "fade",
          z: 1,
        }),
        text("body", {
          x: 10,
          y: 62,
          w: 80,
          h: 10,
          text: c.quote_by,
          fontSize: 18,
          color: bodyColor,
          align: "center",
          z: 2,
        }),
      ]);
    case "bigNumber":
      return slide(
        background,
        [
          text("title", {
            x: 8,
            y: 22,
            w: 84,
            h: 28,
            text: c.big_number,
            fontSize: 96,
            color: accent,
            align: "center",
            bold: true,
            entrance: "zoom",
            z: 1,
          }),
          text("body", {
            x: 14,
            y: 58,
            w: 72,
            h: 16,
            text: c.big_label,
            fontSize: 22,
            color: bodyColor,
            align: "center",
            z: 2,
          }),
        ],
        "zoom",
      );
    case "agenda":
      return slide(background, [
        text("title", {
          x: 8,
          y: 12,
          w: 84,
          h: 12,
          text: c.agenda_title,
          fontSize: 36,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        text("body", {
          x: 8,
          y: 30,
          w: 70,
          h: 52,
          text: c.agenda_body,
          fontSize: 26,
          color: bodyColor,
          align: "left",
          entrance: "slideUp",
          z: 2,
        }),
      ]);
    case "comparison":
      return slide(background, [
        text("title", {
          x: 8,
          y: 8,
          w: 84,
          h: 12,
          text: c.compare_title,
          fontSize: 32,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        shape({ x: 8, y: 24, w: 40, h: 62, fill: dark ? "#7f1d1d" : "#fee2e2", z: 0 }),
        shape({ x: 52, y: 24, w: 40, h: 62, fill: dark ? "#14532d" : "#dcfce7", z: 0 }),
        text("body", {
          x: 11,
          y: 28,
          w: 34,
          h: 52,
          text: c.compare_left,
          fontSize: 18,
          color: dark ? "#fecaca" : "#7f1d1d",
          align: "left",
          z: 2,
        }),
        text("body", {
          x: 55,
          y: 28,
          w: 34,
          h: 52,
          text: c.compare_right,
          fontSize: 18,
          color: dark ? "#bbf7d0" : "#14532d",
          align: "left",
          z: 3,
        }),
      ]);
    case "imageLeft":
      return slide(background, [
        shape({ x: 0, y: 0, w: 48, h: 100, fill: panel, z: 0, entrance: "none" }),
        text("body", {
          x: 8,
          y: 40,
          w: 32,
          h: 20,
          text: locale === "da" ? "Tilføj billede her" : "Add image here",
          fontSize: 18,
          color: bodyColor,
          align: "center",
          z: 1,
        }),
        text("title", {
          x: 54,
          y: 28,
          w: 40,
          h: 16,
          text: c.imageLeft_title,
          fontSize: 32,
          color: titleColor,
          align: "left",
          bold: true,
          z: 2,
        }),
        text("body", {
          x: 54,
          y: 48,
          w: 40,
          h: 30,
          text: c.imageLeft_body,
          fontSize: 18,
          color: bodyColor,
          align: "left",
          z: 3,
        }),
      ]);
    case "imageRight":
      return slide(background, [
        shape({ x: 52, y: 0, w: 48, h: 100, fill: panel, z: 0, entrance: "none" }),
        text("body", {
          x: 60,
          y: 40,
          w: 32,
          h: 20,
          text: locale === "da" ? "Tilføj billede her" : "Add image here",
          fontSize: 18,
          color: bodyColor,
          align: "center",
          z: 1,
        }),
        text("title", {
          x: 6,
          y: 28,
          w: 40,
          h: 16,
          text: c.imageRight_title,
          fontSize: 32,
          color: titleColor,
          align: "left",
          bold: true,
          z: 2,
        }),
        text("body", {
          x: 6,
          y: 48,
          w: 40,
          h: 30,
          text: c.imageRight_body,
          fontSize: 18,
          color: bodyColor,
          align: "left",
          z: 3,
        }),
      ]);
    case "photoCaption":
      return slide(background, [
        shape({ x: 8, y: 8, w: 84, h: 68, fill: panel, z: 0 }),
        text("body", {
          x: 20,
          y: 34,
          w: 60,
          h: 16,
          text: locale === "da" ? "Fyld med billede (Fyld dias)" : "Fill with image (Fill slide)",
          fontSize: 20,
          color: bodyColor,
          align: "center",
          z: 1,
        }),
        text("body", {
          x: 8,
          y: 80,
          w: 84,
          h: 12,
          text: c.photo_caption,
          fontSize: 18,
          color: bodyColor,
          align: "center",
          z: 2,
        }),
      ]);
    case "steps":
      return slide(background, [
        text("title", {
          x: 8,
          y: 10,
          w: 84,
          h: 12,
          text: c.steps_title,
          fontSize: 34,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        text("body", {
          x: 8,
          y: 30,
          w: 84,
          h: 50,
          text: c.steps_body,
          fontSize: 26,
          color: bodyColor,
          align: "left",
          entrance: "slideUp",
          z: 2,
        }),
      ]);
    case "faq":
      return slide(background, [
        text("title", {
          x: 8,
          y: 10,
          w: 84,
          h: 12,
          text: c.faq_title,
          fontSize: 34,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        text("body", {
          x: 8,
          y: 28,
          w: 84,
          h: 58,
          text: c.faq_body,
          fontSize: 20,
          color: bodyColor,
          align: "left",
          z: 2,
        }),
      ]);
    case "team":
      return slide(background, [
        text("title", {
          x: 8,
          y: 8,
          w: 84,
          h: 12,
          text: c.team_title,
          fontSize: 34,
          color: titleColor,
          align: "left",
          bold: true,
          z: 1,
        }),
        shape({ x: 8, y: 28, w: 26, h: 48, fill: panel, z: 0 }),
        shape({ x: 37, y: 28, w: 26, h: 48, fill: panel, z: 0 }),
        shape({ x: 66, y: 28, w: 26, h: 48, fill: panel, z: 0 }),
        text("body", {
          x: 11,
          y: 48,
          w: 20,
          h: 20,
          text: c.team_a,
          fontSize: 18,
          color: bodyColor,
          align: "center",
          entrance: "pop",
          z: 2,
        }),
        text("body", {
          x: 40,
          y: 48,
          w: 20,
          h: 20,
          text: c.team_b,
          fontSize: 18,
          color: bodyColor,
          align: "center",
          entrance: "pop",
          z: 3,
        }),
        text("body", {
          x: 69,
          y: 48,
          w: 20,
          h: 20,
          text: c.team_c,
          fontSize: 18,
          color: bodyColor,
          align: "center",
          entrance: "pop",
          z: 4,
        }),
      ]);
    case "closing":
      return slide(
        background,
        [
          shape({ x: 0, y: 92, w: 100, h: 8, fill: accent, z: 0, entrance: "none" }),
          text("title", {
            x: 8,
            y: 32,
            w: 84,
            h: 16,
            text: c.closing_title,
            fontSize: 52,
            color: titleColor,
            align: "center",
            bold: true,
            entrance: "zoom",
            z: 2,
          }),
          text("body", {
            x: 14,
            y: 54,
            w: 72,
            h: 14,
            text: c.closing_body,
            fontSize: 20,
            color: bodyColor,
            align: "center",
            z: 3,
          }),
        ],
        "fade",
      );
  }
}

function packDeck(
  title: string,
  locale: Locale,
  layouts: Array<{ layout: SlideLayoutId; patch?: (s: Slide) => Slide }>,
  background = "#ffffff",
): SlidesDoc {
  return {
    version: 2,
    kind: "dias",
    title,
    slides: layouts.map(({ layout, patch }) => {
      const built = buildLayoutSlide(layout, locale, background);
      return patch ? patch(built) : built;
    }),
  };
}

function retitle(slideDoc: Slide, title: string, body?: string): Slide {
  let titleDone = false;
  let bodyDone = body === undefined;
  const blocks = slideDoc.blocks.map((b) => {
    if (!titleDone && b.kind === "title") {
      titleDone = true;
      return { ...b, text: title };
    }
    if (!bodyDone && b.kind === "body") {
      bodyDone = true;
      return { ...b, text: body! };
    }
    return b;
  });
  return { ...slideDoc, blocks };
}

export function buildStarterDeck(
  deckId: StarterDeckId,
  locale: Locale = "en",
): SlidesDoc {
  const c = copy[locale];
  switch (deckId) {
    case "pitch":
      return packDeck(
        c.pitch_title,
        locale,
        [
          {
            layout: "titleHero",
            patch: (s) => retitle(s, c.pitch_title, c.pitch_s1_body),
          },
          {
            layout: "sectionBreak",
            patch: (s) => retitle(s, c.pitch_s1_title, c.pitch_s1_body),
          },
          {
            layout: "bullets",
            patch: (s) => retitle(s, c.pitch_s2_title, c.pitch_s2_body),
          },
          {
            layout: "threeCards",
            patch: (s) => retitle(s, c.pitch_s3_title),
          },
          {
            layout: "closing",
            patch: (s) => retitle(s, c.pitch_s4_title, c.pitch_s4_body),
          },
        ],
        "#ffffff",
      );
    case "lesson":
      return packDeck(c.lesson_title, locale, [
        {
          layout: "titleHero",
          patch: (s) => retitle(s, c.lesson_title, c.lesson_s1_body),
        },
        {
          layout: "bullets",
          patch: (s) => retitle(s, c.lesson_s1_title, c.lesson_s1_body),
        },
        {
          layout: "twoColumn",
          patch: (s) => retitle(s, c.lesson_s2_title),
        },
        {
          layout: "steps",
          patch: (s) => retitle(s, c.lesson_s3_title, c.lesson_s3_body),
        },
        {
          layout: "bigNumber",
          patch: (s) => retitle(s, "1", c.lesson_s4_body),
        },
        {
          layout: "closing",
          patch: (s) => retitle(s, c.lesson_s4_title, c.lesson_s4_body),
        },
      ], "#f5f0e8");
    case "meeting":
      return packDeck(c.meeting_title, locale, [
        {
          layout: "agenda",
          patch: (s) => retitle(s, c.agenda_title, c.agenda_body),
        },
        {
          layout: "sectionBreak",
          patch: (s) => retitle(s, c.meeting_s1_title, c.meeting_s1_body),
        },
        {
          layout: "bullets",
          patch: (s) => retitle(s, c.meeting_s2_title, c.meeting_s2_body),
        },
        {
          layout: "comparison",
          patch: (s) => retitle(s, c.meeting_s3_title),
        },
        {
          layout: "steps",
          patch: (s) => retitle(s, c.meeting_s4_title, c.meeting_s4_body),
        },
      ], "#ffffff");
    case "workshop":
      return packDeck(c.workshop_title, locale, [
        {
          layout: "titleHero",
          patch: (s) => retitle(s, c.workshop_title, c.workshop_s1_body),
        },
        {
          layout: "bullets",
          patch: (s) => retitle(s, c.workshop_s2_title, c.workshop_s2_body),
        },
        {
          layout: "sectionBreak",
          patch: (s) => retitle(s, c.workshop_s3_title, c.workshop_s3_body),
        },
        {
          layout: "threeCards",
          patch: (s) => retitle(s, c.workshop_s4_title),
        },
        {
          layout: "closing",
          patch: (s) => retitle(s, c.closing_title, c.workshop_s4_body),
        },
      ], "#ecfdf5");
    case "status":
      return packDeck(c.status_title, locale, [
        {
          layout: "titleHero",
          patch: (s) => retitle(s, c.status_title, c.status_s1_body),
        },
        {
          layout: "sectionBreak",
          patch: (s) => retitle(s, c.status_s1_title, c.status_s1_body),
        },
        {
          layout: "bigNumber",
          patch: (s) => retitle(s, "42", c.status_s2_body),
        },
        {
          layout: "bullets",
          patch: (s) => retitle(s, c.status_s3_title, c.status_s3_body),
        },
        {
          layout: "steps",
          patch: (s) => retitle(s, c.status_s4_title, c.status_s4_body),
        },
        { layout: "closing" },
      ], "#0f172a");
  }
}
