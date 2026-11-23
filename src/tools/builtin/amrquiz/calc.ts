export type QuizOption = {
  id: string;
  textDa: string;
  textEn: string;
};

export type QuizQuestion = {
  id: string;
  promptDa: string;
  promptEn: string;
  options: QuizOption[];
  correctId: string;
  explainDa: string;
  explainEn: string;
};

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    promptDa: "Hvem har det overordnede ansvar for arbejdsmiljøet?",
    promptEn: "Who has overall responsibility for health and safety?",
    options: [
      { id: "a", textDa: "AMR", textEn: "The health and safety representative" },
      { id: "b", textDa: "Arbejdsgiveren", textEn: "The employer" },
      { id: "c", textDa: "Den enkelte medarbejder", textEn: "Each employee" },
    ],
    correctId: "b",
    explainDa:
      "Arbejdsgiveren har ansvaret. AMR hjælper og repræsenterer kollegerne, men ansvaret kan ikke flyttes over på dig.",
    explainEn:
      "The employer has the responsibility. The representative helps and speaks for colleagues, but the duty cannot be moved onto you.",
  },
  {
    id: "q2",
    promptDa: "Hvad står APV for?",
    promptEn: "What does APV mean?",
    options: [
      {
        id: "a",
        textDa: "Arbejdspladsvurdering",
        textEn: "Workplace assessment",
      },
      {
        id: "b",
        textDa: "Arbejdspersonalets vurdering",
        textEn: "Staff performance review",
      },
      {
        id: "c",
        textDa: "Arbejdsplan og vagtplan",
        textEn: "Work plan and roster",
      },
    ],
    correctId: "a",
    explainDa:
      "APV er arbejdspladsvurderingen. I finder problemer, vurderer dem, laver en plan og tjekker om løsningerne virker.",
    explainEn:
      "APV is the workplace assessment. You find problems, judge them, make a plan, and check that the fixes work.",
  },
  {
    id: "q3",
    promptDa:
      "En kollega har smerter efter mange tunge løft. Hvad gør du som AMR?",
    promptEn:
      "A colleague has pain after many heavy lifts. What do you do as representative?",
    options: [
      {
        id: "a",
        textDa: "Siger at kollegaen må klare det selv",
        textEn: "Tell the colleague to handle it alone",
      },
      {
        id: "b",
        textDa: "Undersøger problemet og tager det op i AMO",
        textEn: "Look into it and raise it in the health and safety organisation",
      },
      {
        id: "c",
        textDa: "Venter til der sker en ulykke",
        textEn: "Wait until an accident happens",
      },
    ],
    correctId: "b",
    explainDa:
      "Du skal hjælpe med at finde og forebygge problemer. Tag det op i AMO, og brug APV hvis det hører hjemme dér.",
    explainEn:
      "You should help find and prevent problems. Raise it in the organisation, and use the APV if it belongs there.",
  },
  {
    id: "q4",
    promptDa: "Hvad er en nærved-ulykke?",
    promptEn: "What is a near miss?",
    options: [
      {
        id: "a",
        textDa: "En ulykke med sygefravær",
        textEn: "An accident with sick leave",
      },
      {
        id: "b",
        textDa: "Noget der næsten gik galt, men uden skade",
        textEn: "Something that almost went wrong, without injury",
      },
      {
        id: "c",
        textDa: "Kun skade på inventar",
        textEn: "Damage to equipment only",
      },
    ],
    correctId: "b",
    explainDa:
      "En nærved-ulykke er et vigtigt signal. I kan rette faren, før nogen bliver skadet.",
    explainEn:
      "A near miss is an important warning. You can fix the hazard before someone gets hurt.",
  },
  {
    id: "q5",
    promptDa:
      "Må du som AMR bruge arbejdstid på at undersøge et arbejdsmiljøproblem?",
    promptEn:
      "May you as representative use working time to look into a health and safety problem?",
    options: [
      {
        id: "a",
        textDa: "Ja, den tid der er nødvendig til hvervet",
        textEn: "Yes, the time needed for the role",
      },
      {
        id: "b",
        textDa: "Nej, kun i pauserne",
        textEn: "No, only during breaks",
      },
      {
        id: "c",
        textDa: "Kun hvis ledelsen undersøger det først",
        textEn: "Only if management investigates first",
      },
    ],
    correctId: "a",
    explainDa:
      "Du har ret til den tid, der er nødvendig for at udføre hvervet. Aftal de praktiske rammer med ledelsen.",
    explainEn:
      "You are entitled to the time needed to do the role. Agree the practical arrangements with management.",
  },
  {
    id: "q6",
    promptDa: "Hvad står AMO for?",
    promptEn: "What does AMO mean?",
    options: [
      {
        id: "a",
        textDa: "Arbejdsmarkedsorganisation",
        textEn: "Labour market organisation",
      },
      {
        id: "b",
        textDa: "Arbejdsmiljøorganisation",
        textEn: "Health and safety organisation",
      },
      {
        id: "c",
        textDa: "En afdeling i Arbejdstilsynet",
        textEn: "A department of the Working Environment Authority",
      },
    ],
    correctId: "b",
    explainDa:
      "AMO er samarbejdet mellem ledelse og medarbejderrepræsentanter om arbejdsmiljøet.",
    explainEn:
      "AMO is the cooperation between management and employee representatives on health and safety.",
  },
  {
    id: "q7",
    promptDa:
      "Hvor ofte skal APV mindst opdateres, hvis intet vigtigt ændrer sig?",
    promptEn:
      "How often must the APV be updated as a minimum if nothing important changes?",
    options: [
      { id: "a", textDa: "Hvert år", textEn: "Every year" },
      { id: "b", textDa: "Hvert tredje år", textEn: "Every three years" },
      {
        id: "c",
        textDa: "Kun når Arbejdstilsynet kommer",
        textEn: "Only when the authority visits",
      },
    ],
    correctId: "b",
    explainDa:
      "APV skal også opdateres, når der sker væsentlige ændringer i arbejdet. Mindst hvert tredje år.",
    explainEn:
      "The APV must also be updated when work changes in an important way. At least every three years.",
  },
  {
    id: "q8",
    promptDa: "Hvem sidder typisk i en arbejdsmiljøgruppe?",
    promptEn: "Who is typically in a health and safety group?",
    options: [
      {
        id: "a",
        textDa: "En arbejdsleder og en AMR",
        textEn: "A supervisor and a representative",
      },
      {
        id: "b",
        textDa: "Kun direktøren",
        textEn: "Only the managing director",
      },
      {
        id: "c",
        textDa: "Kun Arbejdstilsynet",
        textEn: "Only the Working Environment Authority",
      },
    ],
    correctId: "a",
    explainDa:
      "Gruppen arbejder tæt på hverdagen. Den består typisk af en arbejdsleder og en AMR.",
    explainEn:
      "The group works close to daily work. It usually includes a supervisor and a representative.",
  },
  {
    id: "q9",
    promptDa: "Hvilke to spørgsmål er centrale, når du vurderer risiko?",
    promptEn: "Which two questions matter most when you assess risk?",
    options: [
      {
        id: "a",
        textDa: "Hvem har skylden, og hvad koster det?",
        textEn: "Who is to blame, and what does it cost?",
      },
      {
        id: "b",
        textDa: "Hvor sandsynligt er det, og hvor slemt kan det blive?",
        textEn: "How likely is it, and how bad could it be?",
      },
      {
        id: "c",
        textDa: "Hvornår er pausen, og hvem er nærmeste leder?",
        textEn: "When is the break, and who is the line manager?",
      },
    ],
    correctId: "b",
    explainDa:
      "Risiko handler om sandsynlighed og konsekvens. Derefter finder I en praktisk løsning.",
    explainEn:
      "Risk is about likelihood and consequence. Then you find a practical solution.",
  },
  {
    id: "q10",
    promptDa: "Hvad er forskellen på AMU og arbejdsmiljøuddannelsen?",
    promptEn: "What is the difference between AMU and health and safety training?",
    options: [
      {
        id: "a",
        textDa: "AMU er det samme som AMR-kurset",
        textEn: "AMU is the same as the representative course",
      },
      {
        id: "b",
        textDa:
          "AMU er efteruddannelse. Arbejdsmiljøuddannelsen er den lovpligtige AMR- og lederuddannelse",
        textEn:
          "AMU is continuing education. Health and safety training is the mandatory course for representatives and supervisors",
      },
      {
        id: "c",
        textDa: "AMU erstatter APV",
        textEn: "AMU replaces the workplace assessment",
      },
    ],
    correctId: "b",
    explainDa:
      "AMU og arbejdsmiljøuddannelsen er to forskellige ting. Bland dem ikke sammen.",
    explainEn:
      "AMU and health and safety training are two different things. Do not mix them up.",
  },
  {
    id: "q11",
    promptDa: "Hvad skal en handlingsplan som minimum indeholde?",
    promptEn: "What should an action plan include as a minimum?",
    options: [
      {
        id: "a",
        textDa: "Kun en liste over problemer",
        textEn: "Only a list of problems",
      },
      {
        id: "b",
        textDa: "Hvad der skal gøres, hvem der gør det, og hvornår",
        textEn: "What will be done, who will do it, and by when",
      },
      {
        id: "c",
        textDa: "Kun en dato for næste tilsyn",
        textEn: "Only a date for the next inspection",
      },
    ],
    correctId: "b",
    explainDa:
      "Uden ansvarlig og frist bliver planen sjældent til noget i praksis.",
    explainEn:
      "Without an owner and a deadline, plans rarely turn into real change.",
  },
  {
    id: "q12",
    promptDa: "Er AMR ledelsens sikkerhedskontrollør?",
    promptEn: "Is the representative management's safety inspector?",
    options: [
      {
        id: "a",
        textDa: "Ja, AMR skal kontrollere ledelsen",
        textEn: "Yes, the representative must police management",
      },
      {
        id: "b",
        textDa:
          "Nej. AMR samarbejder med ledelsen og repræsenterer medarbejderne",
        textEn:
          "No. The representative cooperates with management and represents employees",
      },
      {
        id: "c",
        textDa: "Ja, men kun efter ulykker",
        textEn: "Yes, but only after accidents",
      },
    ],
    correctId: "b",
    explainDa:
      "Du er hverken ledelsens kontrollør eller en modstander af ledelsen. Rollerne er samarbejde og repræsentation.",
    explainEn:
      "You are neither management's inspector nor an opponent of management. The role is cooperation and representation.",
  },
  {
    id: "q13",
    promptDa:
      "Hvilket område hører tidspres og konflikter typisk under?",
    promptEn:
      "Which area do time pressure and conflicts usually belong under?",
    options: [
      {
        id: "a",
        textDa: "Kemisk arbejdsmiljø",
        textEn: "Chemical working environment",
      },
      {
        id: "b",
        textDa: "Psykisk arbejdsmiljø",
        textEn: "Mental working environment",
      },
      {
        id: "c",
        textDa: "Kun privatliv",
        textEn: "Private life only",
      },
    ],
    correctId: "b",
    explainDa:
      "Psykisk arbejdsmiljø handler blandt andet om stress, tidspres, kommunikation og indflydelse.",
    explainEn:
      "The mental working environment includes stress, time pressure, communication, and influence.",
  },
  {
    id: "q14",
    promptDa:
      "En tung vare står ustabilt på en palle. Hvad er det vigtigste næste skridt efter at se faren?",
    promptEn:
      "A heavy item sits unsteadily on a pallet. What is the most important next step after spotting the hazard?",
    options: [
      {
        id: "a",
        textDa: "Kun at konstatere, at det er farligt",
        textEn: "Only state that it is dangerous",
      },
      {
        id: "b",
        textDa: "Vurdere risikoen og finde en praktisk løsning",
        textEn: "Assess the risk and find a practical solution",
      },
      {
        id: "c",
        textDa: "Ignorere det, hvis ingen er kommet til skade endnu",
        textEn: "Ignore it if nobody has been hurt yet",
      },
    ],
    correctId: "b",
    explainDa:
      "Det er ikke nok at se faren. Vurder risikoen, og hjælp med at finde en løsning der kan bruges i praksis.",
    explainEn:
      "Spotting the hazard is not enough. Assess the risk and help find a solution that works in practice.",
  },
  {
    id: "q15",
    promptDa: "Hvad er formålet med den årlige arbejdsmiljødrøftelse?",
    promptEn: "What is the purpose of the annual health and safety discussion?",
    options: [
      {
        id: "a",
        textDa: "At erstatte APV",
        textEn: "To replace the workplace assessment",
      },
      {
        id: "b",
        textDa:
          "At tale om, hvordan arbejdsmiljøarbejdet er gået, og hvad I prioriterer næste år",
        textEn:
          "To talk about how health and safety work went, and what you prioritise next year",
      },
      {
        id: "c",
        textDa: "At uddele bøder til medarbejdere",
        textEn: "To hand out fines to employees",
      },
    ],
    correctId: "b",
    explainDa:
      "Drøftelsen er et årligt status- og planlægningsmøde mellem ledelse og AMO.",
    explainEn:
      "The discussion is a yearly status and planning meeting between management and the health and safety organisation.",
  },
];

export type QuizAnswerMap = Record<string, string>;

export function scoreQuiz(answers: QuizAnswerMap): {
  total: number;
  correct: number;
  percent: number;
  details: Array<{
    questionId: string;
    correct: boolean;
    selectedId: string | undefined;
  }>;
} {
  const details = QUIZ_QUESTIONS.map((q) => {
    const selectedId = answers[q.id];
    return {
      questionId: q.id,
      correct: selectedId === q.correctId,
      selectedId,
    };
  });
  const correct = details.filter((d) => d.correct).length;
  const total = QUIZ_QUESTIONS.length;
  return {
    total,
    correct,
    percent: total ? Math.round((correct / total) * 100) : 0,
    details,
  };
}

export function shuffleInPlace<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function scoreMessage(percent: number, da: boolean): string {
  if (da) {
    if (percent >= 90) return "Meget stærkt. Du kender grundprincipperne godt.";
    if (percent >= 70) return "Godt. Genlæs de forkerte svar, så sidder det fast.";
    if (percent >= 50)
      return "Du er i gang. Brug forklaringerne, og prøv igen.";
    return "Start med begreberne AMR, AMO, APV og ansvar. Prøv så igen.";
  }
  if (percent >= 90) return "Very strong. You know the basics well.";
  if (percent >= 70) return "Good. Re-read the wrong answers so they stick.";
  if (percent >= 50) return "You are getting there. Use the explanations and try again.";
  return "Start with AMR, AMO, APV, and responsibility. Then try again.";
}
