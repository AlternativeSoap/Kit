"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ToolPrefill } from "@/tools/prefill";
import type { BuiltinToolId } from "@/tools/types";
import { SIMPLE_TOOL_IDS } from "./simple/defs";
import type { ImageToolMode } from "./media/ImageTool";

type PrefillProps = { prefill?: ToolPrefill };
type EnhederProps = {
  prefill?: ToolPrefill;
  forcedCategory?: import("./enheder/calc").UnitCategory;
};
type ImageProps = { mode: ImageToolMode; allowModeSwitch?: boolean };
type IdProps = { id: string; prefill?: ToolPrefill };

function ToolLoading() {
  return (
    <div className="mx-auto max-w-xl py-10 text-sm text-muted" aria-live="polite">
      …
    </div>
  );
}

function lazyPrefill(
  loader: () => Promise<{ default: ComponentType<PrefillProps> }>,
) {
  return dynamic(loader, { loading: ToolLoading });
}

function lazyPlain(loader: () => Promise<{ default: ComponentType }>) {
  return dynamic(loader, { loading: ToolLoading });
}

const LonTool = lazyPrefill(() =>
  import("./lon/LonTool").then((m) => ({ default: m.LonTool })),
);
const LadmeterTool = lazyPrefill(() =>
  import("./ladmeter/LadmeterTool").then((m) => ({ default: m.LadmeterTool })),
);
const LommeregnerTool = lazyPrefill(() =>
  import("./lommeregner/LommeregnerTool").then((m) => ({
    default: m.LommeregnerTool,
  })),
);
const CountdownTool = lazyPrefill(() =>
  import("./countdown/CountdownTool").then((m) => ({ default: m.CountdownTool })),
);
const MomsTool = lazyPrefill(() =>
  import("./moms/MomsTool").then((m) => ({ default: m.MomsTool })),
);
const ProcentTool = lazyPrefill(() =>
  import("./procent/ProcentTool").then((m) => ({ default: m.ProcentTool })),
);
const PasswordTool = lazyPrefill(() =>
  import("./password/PasswordTool").then((m) => ({ default: m.PasswordTool })),
);
const EnhederTool = dynamic(
  () => import("./enheder/EnhederTool").then((m) => ({ default: m.EnhederTool })),
  { loading: ToolLoading },
) as ComponentType<EnhederProps>;
const DatoTool = lazyPrefill(() =>
  import("./dato/DatoTool").then((m) => ({ default: m.DatoTool })),
);
const BarselTool = lazyPrefill(() =>
  import("./barsel/BarselTool").then((m) => ({ default: m.BarselTool })),
);
const QrTool = lazyPrefill(() =>
  import("./qr/QrTool").then((m) => ({ default: m.QrTool })),
);
const JsonTool = lazyPrefill(() =>
  import("./json/JsonTool").then((m) => ({ default: m.JsonTool })),
);
const TextTool = lazyPrefill(() =>
  import("./text/TextTool").then((m) => ({ default: m.TextTool })),
);
const ColorTool = lazyPrefill(() =>
  import("./color/ColorTool").then((m) => ({ default: m.ColorTool })),
);
const UuidTool = lazyPrefill(() =>
  import("./uuid/UuidTool").then((m) => ({ default: m.UuidTool })),
);
const TimestampTool = lazyPrefill(() =>
  import("./timestamp/TimestampTool").then((m) => ({ default: m.TimestampTool })),
);
const KilometerpengeTool = lazyPrefill(() =>
  import("./kilometerpenge/KilometerpengeTool").then((m) => ({
    default: m.KilometerpengeTool,
  })),
);
const BraendstofTool = lazyPrefill(() =>
  import("./braendstof/BraendstofTool").then((m) => ({
    default: m.BraendstofTool,
  })),
);
const FeriepengeTool = lazyPrefill(() =>
  import("./feriepenge/FeriepengeTool").then((m) => ({
    default: m.FeriepengeTool,
  })),
);
const StopurTool = lazyPlain(() =>
  import("./stopur/StopurTool").then((m) => ({ default: m.StopurTool })),
);
const EncodeTool = lazyPrefill(() =>
  import("./encode/EncodeTool").then((m) => ({ default: m.EncodeTool })),
);
const LanTool = lazyPrefill(() =>
  import("./lan/LanTool").then((m) => ({ default: m.LanTool })),
);
const ArbejdstidTool = lazyPrefill(() =>
  import("./arbejdstid/ArbejdstidTool").then((m) => ({
    default: m.ArbejdstidTool,
  })),
);
const HashTool = lazyPrefill(() =>
  import("./hash/HashTool").then((m) => ({ default: m.HashTool })),
);
const DiffTool = lazyPrefill(() =>
  import("./diff/DiffTool").then((m) => ({ default: m.DiffTool })),
);
const TerminTool = lazyPrefill(() =>
  import("./termin/TerminTool").then((m) => ({ default: m.TerminTool })),
);
const AvanceTool = lazyPrefill(() =>
  import("./avance/AvanceTool").then((m) => ({ default: m.AvanceTool })),
);
const JwtTool = lazyPrefill(() =>
  import("./jwt/JwtTool").then((m) => ({ default: m.JwtTool })),
);
const CronTool = lazyPrefill(() =>
  import("./cron/CronTool").then((m) => ({ default: m.CronTool })),
);
const CidrTool = lazyPrefill(() =>
  import("./cidr/CidrTool").then((m) => ({ default: m.CidrTool })),
);
const AlderTool = lazyPrefill(() =>
  import("./alder/AlderTool").then((m) => ({ default: m.AlderTool })),
);
const BmiTool = lazyPrefill(() =>
  import("./bmi/BmiTool").then((m) => ({ default: m.BmiTool })),
);
const TipTool = lazyPrefill(() =>
  import("./tip/TipTool").then((m) => ({ default: m.TipTool })),
);
const OpsparingTool = lazyPrefill(() =>
  import("./opsparing/OpsparingTool").then((m) => ({
    default: m.OpsparingTool,
  })),
);
const InflationTool = lazyPrefill(() =>
  import("./inflation/InflationTool").then((m) => ({
    default: m.InflationTool,
  })),
);
const EnhedsprisTool = lazyPrefill(() =>
  import("./enhedspris/EnhedsprisTool").then((m) => ({
    default: m.EnhedsprisTool,
  })),
);
const UgenummerTool = lazyPrefill(() =>
  import("./ugenummer/UgenummerTool").then((m) => ({
    default: m.UgenummerTool,
  })),
);
const AspectTool = lazyPrefill(() =>
  import("./aspect/AspectTool").then((m) => ({ default: m.AspectTool })),
);
const SlugTool = lazyPrefill(() =>
  import("./slug/SlugTool").then((m) => ({ default: m.SlugTool })),
);
const BreakevenTool = lazyPrefill(() =>
  import("./breakeven/BreakevenTool").then((m) => ({
    default: m.BreakevenTool,
  })),
);
const CagrTool = lazyPrefill(() =>
  import("./cagr/CagrTool").then((m) => ({ default: m.CagrTool })),
);
const ContrastTool = lazyPrefill(() =>
  import("./contrast/ContrastTool").then((m) => ({ default: m.ContrastTool })),
);
const ImageTool = dynamic(
  () => import("./media/ImageTool").then((m) => ({ default: m.ImageTool })),
  { loading: ToolLoading },
) as ComponentType<ImageProps>;
const VideoCompressTool = lazyPlain(() =>
  import("./media/VideoCompressTool").then((m) => ({
    default: m.VideoCompressTool,
  })),
);
const RegexTool = lazyPrefill(() =>
  import("./regex/RegexTool").then((m) => ({ default: m.RegexTool })),
);
const MyIpTool = lazyPlain(() =>
  import("./myip/MyIpTool").then((m) => ({ default: m.MyIpTool })),
);
const MarkdownTool = lazyPrefill(() =>
  import("./markdown/MarkdownTool").then((m) => ({ default: m.MarkdownTool })),
);
const WorldClockTool = lazyPlain(() =>
  import("./worldclock/WorldClockTool").then((m) => ({
    default: m.WorldClockTool,
  })),
);
const PdfTool = lazyPlain(() =>
  import("./pdf/PdfTool").then((m) => ({ default: m.PdfTool })),
);
const SpeedTool = lazyPlain(() =>
  import("./speed/SpeedTool").then((m) => ({ default: m.SpeedTool })),
);
const PaletteTool = lazyPrefill(() =>
  import("./palette/PaletteTool").then((m) => ({ default: m.PaletteTool })),
);
const ImgBase64Tool = lazyPlain(() =>
  import("./imgbase64/ImgBase64Tool").then((m) => ({
    default: m.ImgBase64Tool,
  })),
);
const CodeShotTool = lazyPrefill(() =>
  import("./codeshot/CodeShotTool").then((m) => ({ default: m.CodeShotTool })),
);
const UaTool = lazyPlain(() =>
  import("./ua/UaTool").then((m) => ({ default: m.UaTool })),
);
const MimeTool = lazyPlain(() =>
  import("./mime/MimeTool").then((m) => ({ default: m.MimeTool })),
);
const SpinWheelTool = lazyPlain(() =>
  import("./spinwheel/SpinWheelTool").then((m) => ({
    default: m.SpinWheelTool,
  })),
);
const WordCountTool = lazyPrefill(() =>
  import("./wordcount/WordCountTool").then((m) => ({
    default: m.WordCountTool,
  })),
);
const DocToPdfTool = lazyPlain(() =>
  import("./doctopdf/DocToPdfTool").then((m) => ({ default: m.DocToPdfTool })),
);
const BgRemoveTool = lazyPlain(() =>
  import("./bgremove/BgRemoveTool").then((m) => ({ default: m.BgRemoveTool })),
);
const GifMakerTool = lazyPlain(() =>
  import("./gifmaker/GifMakerTool").then((m) => ({ default: m.GifMakerTool })),
);
const CsvExcelTool = lazyPrefill(() =>
  import("./csvexcel/CsvExcelTool").then((m) => ({ default: m.CsvExcelTool })),
);
const PdfCleanTool = lazyPrefill(() =>
  import("./pdfclean/PdfCleanTool").then((m) => ({ default: m.PdfCleanTool })),
);
const SkrivTool = lazyPlain(() =>
  import("./skriv/SkrivTool").then((m) => ({ default: m.SkrivTool })),
);
const ArkTool = lazyPlain(() =>
  import("./ark/ArkTool").then((m) => ({ default: m.ArkTool })),
);
const DiasTool = lazyPlain(() =>
  import("./dias/DiasTool").then((m) => ({ default: m.DiasTool })),
);
const SimpleTool = dynamic(
  () => import("./simple/SimpleTool").then((m) => ({ default: m.SimpleTool })),
  { loading: ToolLoading },
) as ComponentType<IdProps>;

export function BuiltinToolView({
  id,
  prefill,
}: {
  id: BuiltinToolId;
  prefill?: ToolPrefill;
}) {
  switch (id) {
    case "lon":
      return <LonTool prefill={prefill} />;
    case "ladmeter":
      return <LadmeterTool prefill={prefill} />;
    case "lommeregner":
      return <LommeregnerTool prefill={prefill} />;
    case "countdown":
      return <CountdownTool prefill={prefill} />;
    case "moms":
      return <MomsTool prefill={prefill} />;
    case "procent":
      return <ProcentTool prefill={prefill} />;
    case "password":
      return <PasswordTool prefill={prefill} />;
    case "enheder":
      return <EnhederTool prefill={prefill} />;
    case "dato":
      return <DatoTool prefill={prefill} />;
    case "barsel":
      return <BarselTool prefill={prefill} />;
    case "qr":
      return <QrTool prefill={prefill} />;
    case "json":
      return <JsonTool prefill={prefill} />;
    case "text":
      return <TextTool prefill={prefill} />;
    case "color":
      return <ColorTool prefill={prefill} />;
    case "uuid":
      return <UuidTool prefill={prefill} />;
    case "timestamp":
      return <TimestampTool prefill={prefill} />;
    case "kilometerpenge":
      return <KilometerpengeTool prefill={prefill} />;
    case "braendstof":
      return <BraendstofTool prefill={prefill} />;
    case "feriepenge":
      return <FeriepengeTool prefill={prefill} />;
    case "stopur":
      return <StopurTool />;
    case "encode":
      return <EncodeTool prefill={prefill} />;
    case "lan":
      return <LanTool prefill={prefill} />;
    case "arbejdstid":
      return <ArbejdstidTool prefill={prefill} />;
    case "hash":
      return <HashTool prefill={prefill} />;
    case "diff":
      return <DiffTool prefill={prefill} />;
    case "termin":
      return <TerminTool prefill={prefill} />;
    case "avance":
      return <AvanceTool prefill={prefill} />;
    case "jwt":
      return <JwtTool prefill={prefill} />;
    case "cron":
      return <CronTool prefill={prefill} />;
    case "cidr":
      return <CidrTool prefill={prefill} />;
    case "alder":
      return <AlderTool prefill={prefill} />;
    case "bmi":
      return <BmiTool prefill={prefill} />;
    case "tip":
      return <TipTool prefill={prefill} />;
    case "opsparing":
      return <OpsparingTool prefill={prefill} />;
    case "inflation":
      return <InflationTool prefill={prefill} />;
    case "enhedspris":
      return <EnhedsprisTool prefill={prefill} />;
    case "ugenummer":
      return <UgenummerTool prefill={prefill} />;
    case "aspect":
      return <AspectTool prefill={prefill} />;
    case "slug":
      return <SlugTool prefill={prefill} />;
    case "breakeven":
      return <BreakevenTool prefill={prefill} />;
    case "cagr":
      return <CagrTool prefill={prefill} />;
    case "contrast":
      return <ContrastTool prefill={prefill} />;
    case "crop":
      return <ImageTool mode="crop" allowModeSwitch />;
    case "resize":
      return <ImageTool mode="resize" allowModeSwitch />;
    case "imgcompress":
      return <ImageTool mode="compress" allowModeSwitch />;
    case "imgconvert":
      return <ImageTool mode="convert" allowModeSwitch />;
    case "imagerotate":
      return <ImageTool mode="rotate" allowModeSwitch />;
    case "vidcompress":
      return <VideoCompressTool />;
    case "regex":
      return <RegexTool prefill={prefill} />;
    case "myip":
      return <MyIpTool />;
    case "markdown":
      return <MarkdownTool prefill={prefill} />;
    case "worldclock":
      return <WorldClockTool />;
    case "pdf":
      return <PdfTool />;
    case "speedtest":
      return <SpeedTool />;
    case "palette":
      return <PaletteTool prefill={prefill} />;
    case "imgbase64":
      return <ImgBase64Tool />;
    case "codeshot":
      return <CodeShotTool prefill={prefill} />;
    case "ua":
      return <UaTool />;
    case "mime":
      return <MimeTool />;
    case "spinwheel":
      return <SpinWheelTool />;
    case "wordcount":
      return <WordCountTool prefill={prefill} />;
    case "doctopdf":
      return <DocToPdfTool />;
    case "bgremove":
      return <BgRemoveTool />;
    case "gifmaker":
      return <GifMakerTool />;
    case "csvexcel":
      return <CsvExcelTool prefill={prefill} />;
    case "pdfclean":
      return <PdfCleanTool prefill={prefill} />;
    case "skriv":
      return <SkrivTool />;
    case "ark":
      return <ArkTool />;
    case "dias":
      return <DiasTool />;
    // Overlaps: route weaker duplicates into stronger tools.
    case "csvjson":
      return <CsvExcelTool prefill={prefill} />;
    case "datasize":
      return <EnhederTool forcedCategory="data" prefill={prefill} />;
    case "tippercent":
    case "invoicesplit":
      return <TipTool prefill={prefill} />;
    case "mortgage":
      return <LanTool prefill={prefill} />;
    case "cases":
    case "wordfreq":
    case "readingtime":
    case "findreplace":
    case "sortlines":
    case "dedupe":
    case "textreverse":
      return <TextTool prefill={prefill} />;
    default:
      if ((SIMPLE_TOOL_IDS as readonly string[]).includes(id)) {
        return <SimpleTool id={id} prefill={prefill} />;
      }
      return null;
  }
}
