export type LiftFrequency = "rare" | "often" | "constant";
export type LiftPosture = "good" | "bent" | "twisted";
export type LiftHeight = "waist" | "floor" | "shoulder";
export type LiftGrip = "good" | "poor";

export type LiftInput = {
  weightKg: number;
  frequency: LiftFrequency;
  posture: LiftPosture;
  height: LiftHeight;
  grip: LiftGrip;
  distanceM: number;
  twoPerson: boolean;
  aidsAvailable: boolean;
};

export type LiftLevel = "ok" | "attention" | "high" | "stop";

export type LiftFactor = {
  labelDa: string;
  labelEn: string;
  points: number;
};

export type LiftResult = {
  score: number;
  level: LiftLevel;
  tips: string[];
  factors: LiftFactor[];
};

/**
 * Simple screening score for manual handling discussion.
 * Not a substitute for official AT guidance or a full risk assessment.
 */
export function assessLift(input: LiftInput, da: boolean): LiftResult | null {
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) return null;
  if (!Number.isFinite(input.distanceM) || input.distanceM < 0) return null;

  const factors: LiftFactor[] = [];
  let score = 0;

  let weightPoints = 1;
  if (input.weightKg >= 30) weightPoints = 5;
  else if (input.weightKg >= 20) weightPoints = 4;
  else if (input.weightKg >= 12) weightPoints = 3;
  else if (input.weightKg >= 7) weightPoints = 2;
  factors.push({
    labelDa: `Vægt ${input.weightKg} kg`,
    labelEn: `Weight ${input.weightKg} kg`,
    points: weightPoints,
  });
  score += weightPoints;

  const freqPoints =
    input.frequency === "constant" ? 3 : input.frequency === "often" ? 2 : 0;
  if (freqPoints) {
    factors.push({
      labelDa:
        input.frequency === "constant"
          ? "Løftes næsten hele tiden"
          : "Løftes ofte",
      labelEn:
        input.frequency === "constant"
          ? "Lifted almost constantly"
          : "Lifted often",
      points: freqPoints,
    });
    score += freqPoints;
  }

  const posturePoints =
    input.posture === "twisted" ? 3 : input.posture === "bent" ? 2 : 0;
  if (posturePoints) {
    factors.push({
      labelDa:
        input.posture === "twisted" ? "Vrid i kroppen" : "Bøjet ryg",
      labelEn:
        input.posture === "twisted" ? "Twisting the body" : "Bent back",
      points: posturePoints,
    });
    score += posturePoints;
  }

  if (input.height === "floor" || input.height === "shoulder") {
    factors.push({
      labelDa:
        input.height === "floor"
          ? "Løft fra gulv"
          : "Løft til skulder eller over",
      labelEn:
        input.height === "floor"
          ? "Lift from floor"
          : "Lift to shoulder or above",
      points: 2,
    });
    score += 2;
  }

  if (input.grip === "poor") {
    factors.push({
      labelDa: "Dårligt greb",
      labelEn: "Poor grip",
      points: 2,
    });
    score += 2;
  }

  if (input.distanceM > 10) {
    factors.push({
      labelDa: "Lang bæreafstand",
      labelEn: "Long carry distance",
      points: 2,
    });
    score += 2;
  } else if (input.distanceM > 2) {
    factors.push({
      labelDa: "Bæreafstand over 2 m",
      labelEn: "Carry distance over 2 m",
      points: 1,
    });
    score += 1;
  }

  if (input.twoPerson) {
    factors.push({
      labelDa: "To personer løfter",
      labelEn: "Two people lift",
      points: -2,
    });
    score = Math.max(0, score - 2);
  }
  if (input.aidsAvailable) {
    factors.push({
      labelDa: "Hjælpemidler findes",
      labelEn: "Aids are available",
      points: -2,
    });
    score = Math.max(0, score - 2);
  }

  let level: LiftLevel = "ok";
  if (score >= 12) level = "stop";
  else if (score >= 9) level = "high";
  else if (score >= 6) level = "attention";

  const tips: string[] = [];
  if (da) {
    if (input.weightKg >= 20)
      tips.push("Brug hjælpemidler, eller vær flere om løftet.");
    if (input.posture !== "good")
      tips.push("Hold byrden tæt på kroppen. Undgå bøjning og vrid.");
    if (input.height !== "waist")
      tips.push("Placér gods i midterhøjde, når det er muligt.");
    if (input.grip === "poor")
      tips.push("Giv bedre greb med håndtag, stropper eller anden emballage.");
    if (input.frequency !== "rare")
      tips.push("Skift opgaver og hold pauser, når løftene gentages.");
    if (!input.aidsAvailable)
      tips.push("Undersøg palleløfter, sækkevogn eller andet hjælpemiddel.");
    if (level === "stop" || level === "high")
      tips.push(
        "Tag det op i AMO. Skriv en handling med ansvarlig og frist i APV.",
      );
    if (!tips.length)
      tips.push("Hold øje med teknik, variation og tidlige tegn på smerter.");
  } else {
    if (input.weightKg >= 20)
      tips.push("Use aids, or have more people share the lift.");
    if (input.posture !== "good")
      tips.push("Keep the load close to the body. Avoid bending and twisting.");
    if (input.height !== "waist")
      tips.push("Place goods at mid height when possible.");
    if (input.grip === "poor")
      tips.push("Improve the grip with handles, straps, or better packaging.");
    if (input.frequency !== "rare")
      tips.push("Rotate tasks and take breaks when lifts are repeated.");
    if (!input.aidsAvailable)
      tips.push("Look into a pallet jack, sack truck, or other aid.");
    if (level === "stop" || level === "high")
      tips.push(
        "Raise it in the health and safety organisation. Put an action with an owner and deadline in the APV.",
      );
    if (!tips.length)
      tips.push("Watch technique, variation, and early signs of pain.");
  }

  return { score, level, tips, factors };
}

export function levelLabel(level: LiftLevel, da: boolean): string {
  if (da) {
    if (level === "stop") return "Ændr metoden nu";
    if (level === "high") return "Høj belastning";
    if (level === "attention") return "Vær opmærksom";
    return "Acceptabel i denne screening";
  }
  if (level === "stop") return "Change the method now";
  if (level === "high") return "High load";
  if (level === "attention") return "Pay attention";
  return "Acceptable in this screening";
}

export function liftToText(
  input: LiftInput,
  result: LiftResult,
  da: boolean,
): string {
  const freq = da
    ? { rare: "Sjældent", often: "Ofte", constant: "Næsten konstant" }
    : { rare: "Rare", often: "Often", constant: "Almost constant" };
  const posture = da
    ? { good: "God", bent: "Bøjet", twisted: "Vredet" }
    : { good: "Good", bent: "Bent", twisted: "Twisted" };
  const height = da
    ? { waist: "Midterhøjde", floor: "Gulv", shoulder: "Skulder eller over" }
    : { waist: "Waist", floor: "Floor", shoulder: "Shoulder or above" };
  const grip = da
    ? { good: "Godt greb", poor: "Dårligt greb" }
    : { good: "Good grip", poor: "Poor grip" };

  return [
    da ? "Løfte-screening" : "Manual handling screening",
    da
      ? `Vægt: ${input.weightKg} kg | Hyppighed: ${freq[input.frequency]}`
      : `Weight: ${input.weightKg} kg | Frequency: ${freq[input.frequency]}`,
    da
      ? `Stilling: ${posture[input.posture]} | Højde: ${height[input.height]} | Greb: ${grip[input.grip]}`
      : `Posture: ${posture[input.posture]} | Height: ${height[input.height]} | Grip: ${grip[input.grip]}`,
    da
      ? `Bæreafstand: ${input.distanceM} m | To personer: ${input.twoPerson ? "Ja" : "Nej"} | Hjælpemidler: ${input.aidsAvailable ? "Ja" : "Nej"}`
      : `Carry distance: ${input.distanceM} m | Two people: ${input.twoPerson ? "Yes" : "No"} | Aids: ${input.aidsAvailable ? "Yes" : "No"}`,
    da
      ? `Score: ${result.score} (${levelLabel(result.level, true)})`
      : `Score: ${result.score} (${levelLabel(result.level, false)})`,
    "",
    ...(da ? ["Det der trækker op:"] : ["What adds points:"]),
    ...result.factors.map(
      (f) => `- ${da ? f.labelDa : f.labelEn}: ${f.points > 0 ? "+" : ""}${f.points}`,
    ),
    "",
    ...(da ? ["Gode næste skridt:"] : ["Good next steps:"]),
    ...result.tips.map((t) => `- ${t}`),
    "",
    da
      ? "Bemærk: Dette er en simpel screening til dialog. Den erstatter ikke Arbejdstilsynets vejledning."
      : "Note: This is a simple screening for discussion. It does not replace official guidance.",
  ].join("\n");
}
