import type { ToolPrefill } from "@/tools/prefill";
import type { BuiltinToolId } from "@/tools/types";
import { BarselTool } from "./barsel/BarselTool";
import { CountdownTool } from "./countdown/CountdownTool";
import { DatoTool } from "./dato/DatoTool";
import { EnhederTool } from "./enheder/EnhederTool";
import { LadmeterTool } from "./ladmeter/LadmeterTool";
import { LommeregnerTool } from "./lommeregner/LommeregnerTool";
import { LonTool } from "./lon/LonTool";
import { MomsTool } from "./moms/MomsTool";
import { PasswordTool } from "./password/PasswordTool";
import { ProcentTool } from "./procent/ProcentTool";
import { ColorTool } from "./color/ColorTool";
import { JsonTool } from "./json/JsonTool";
import { QrTool } from "./qr/QrTool";
import { TextTool } from "./text/TextTool";
import { TimestampTool } from "./timestamp/TimestampTool";
import { UuidTool } from "./uuid/UuidTool";
import { KilometerpengeTool } from "./kilometerpenge/KilometerpengeTool";
import { BraendstofTool } from "./braendstof/BraendstofTool";
import { FeriepengeTool } from "./feriepenge/FeriepengeTool";
import { StopurTool } from "./stopur/StopurTool";
import { EncodeTool } from "./encode/EncodeTool";
import { LanTool } from "./lan/LanTool";
import { ArbejdstidTool } from "./arbejdstid/ArbejdstidTool";
import { HashTool } from "./hash/HashTool";
import { DiffTool } from "./diff/DiffTool";
import { TerminTool } from "./termin/TerminTool";
import { AvanceTool } from "./avance/AvanceTool";
import { JwtTool } from "./jwt/JwtTool";
import { CronTool } from "./cron/CronTool";
import { CidrTool } from "./cidr/CidrTool";
import { AlderTool } from "./alder/AlderTool";
import { BmiTool } from "./bmi/BmiTool";
import { TipTool } from "./tip/TipTool";
import { OpsparingTool } from "./opsparing/OpsparingTool";
import { InflationTool } from "./inflation/InflationTool";
import { EnhedsprisTool } from "./enhedspris/EnhedsprisTool";
import { UgenummerTool } from "./ugenummer/UgenummerTool";
import { AspectTool } from "./aspect/AspectTool";
import { SlugTool } from "./slug/SlugTool";
import { BreakevenTool } from "./breakeven/BreakevenTool";
import { CagrTool } from "./cagr/CagrTool";
import { ContrastTool } from "./contrast/ContrastTool";
import { ImageTool } from "./media/ImageTool";
import { VideoCompressTool } from "./media/VideoCompressTool";
import { RegexTool } from "./regex/RegexTool";
import { MyIpTool } from "./myip/MyIpTool";
import { MarkdownTool } from "./markdown/MarkdownTool";
import { WorldClockTool } from "./worldclock/WorldClockTool";
import { PdfTool } from "./pdf/PdfTool";
import { SpeedTool } from "./speed/SpeedTool";
import { PaletteTool } from "./palette/PaletteTool";
import { ImgBase64Tool } from "./imgbase64/ImgBase64Tool";
import { CodeShotTool } from "./codeshot/CodeShotTool";
import { UaTool } from "./ua/UaTool";
import { MimeTool } from "./mime/MimeTool";
import { SimpleTool } from "./simple/SimpleTool";
import { SIMPLE_TOOL_IDS } from "./simple/defs";

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
      return <DiffTool />;
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
      return <ImageTool mode="crop" />;
    case "resize":
      return <ImageTool mode="resize" />;
    case "imgcompress":
      return <ImageTool mode="compress" />;
    case "imgconvert":
      return <ImageTool mode="convert" />;
    case "imagerotate":
      return <ImageTool mode="rotate" />;
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
    default:
      if ((SIMPLE_TOOL_IDS as readonly string[]).includes(id)) {
        return <SimpleTool id={id} />;
      }
      return null;
  }
}
