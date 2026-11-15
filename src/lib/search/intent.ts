import type { Dictionary } from "@/i18n/types";
import type { AnswerSpec } from "@/lib/answers/parse";
import type { ParsedSearchQuery } from "@/lib/search";

/**
 * One quiet line under the search field. Empty when confidence is low.
 * Plain tool-name matches stay silent; show only answers, operators, or
 * constraint/topic filters that change how search ranks.
 */
export function describeSearchIntent(
  query: string,
  answer: AnswerSpec | null,
  parsed: ParsedSearchQuery,
  dictionary: Dictionary,
): string {
  const t = dictionary.intent;
  const trimmed = query.trim();
  if (!trimmed) return "";

  if (answer) {
    switch (answer.kind) {
      case "vat":
        return t.calculateVat;
      case "percent":
        return t.calculatePercent;
      case "units":
        return t.convertUnits;
      case "dateSpan":
      case "dateShift":
        return t.calculateDate;
      case "clockSpan":
        return t.calculateDuration;
      case "throughput":
        return t.calculateTakt;
      case "salary":
        return t.estimateSalary;
      case "password":
        return t.generatePassword;
      case "random":
        return t.generateRandom;
      case "math":
        return t.calculateMath;
      case "liveData":
        return answer.topic === "currency" ? t.liveCurrency : t.liveWeather;
      case "url":
        return t.recognizeUrl;
      case "color":
        return t.recognizeColor;
      case "json":
        return t.recognizeJson;
      case "timestamp":
        return t.recognizeTimestamp;
      case "uuid":
        return t.recognizeUuid;
      case "email":
        return t.recognizeEmail;
    }
  }

  if (parsed.surface === "kit") return t.filterKit;
  if (parsed.surface === "web") return t.filterWeb;

  const parts: string[] = [];
  if (parsed.constraints.pricing === "free") parts.push(t.constraintFree);
  if (parsed.constraints.registration === "none") {
    parts.push(t.constraintNoLogin);
  }
  if (
    parsed.constraints.privacy === "local" ||
    parsed.constraints.privacy === "privacy-focused"
  ) {
    parts.push(t.constraintPrivacy);
  }
  if (parsed.constraints.openSource) parts.push(t.constraintOpenSource);
  if (parsed.constraints.tags.includes("pdf")) parts.push(t.topicPdf);
  if (parsed.constraints.tags.includes("image")) parts.push(t.topicImage);
  if (parsed.constraints.tags.includes("password")) {
    parts.push(t.topicPassword);
  }
  if (parsed.constraints.tags.includes("compress")) {
    parts.push(t.topicCompress);
  }
  if (
    parsed.constraints.tags.includes("merge") ||
    parsed.constraints.tags.includes("split")
  ) {
    parts.push(t.topicMerge);
  }

  // Topic-only single words (just "pdf") stay quiet so plain searches feel calm.
  // Show when the user combined a topic with a requirement, or named two topics.
  const hasRequirement =
    Boolean(parsed.constraints.pricing) ||
    Boolean(parsed.constraints.registration) ||
    Boolean(parsed.constraints.privacy) ||
    Boolean(parsed.constraints.openSource);

  if (!hasRequirement && parts.length < 2) return "";

  if (parts.length >= 2) {
    return t.findWithRequirements.replace("{requirements}", parts.join(", "));
  }
  if (parts.length === 1) {
    return t.findTopic.replace("{topic}", parts[0]!);
  }

  return "";
}
