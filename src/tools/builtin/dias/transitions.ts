/** Slide and block motion presets for Dias. */

export type SlideTransition =
  | "none"
  | "fade"
  | "slideLeft"
  | "slideRight"
  | "slideUp"
  | "zoom"
  | "wipe";

export type BlockEntrance =
  | "none"
  | "fade"
  | "slideUp"
  | "slideLeft"
  | "zoom"
  | "pop";

export type ImageFit = "contain" | "cover" | "fill";

export const SLIDE_TRANSITIONS: SlideTransition[] = [
  "none",
  "fade",
  "slideLeft",
  "slideRight",
  "slideUp",
  "zoom",
  "wipe",
];

export const BLOCK_ENTRANCES: BlockEntrance[] = [
  "none",
  "fade",
  "slideUp",
  "slideLeft",
  "zoom",
  "pop",
];

export function slideTransitionClass(transition: SlideTransition | undefined) {
  switch (transition ?? "fade") {
    case "none":
      return "dias-slide-none";
    case "fade":
      return "dias-slide-fade";
    case "slideLeft":
      return "dias-slide-left";
    case "slideRight":
      return "dias-slide-right";
    case "slideUp":
      return "dias-slide-up";
    case "zoom":
      return "dias-slide-zoom";
    case "wipe":
      return "dias-slide-wipe";
  }
}

export function blockEntranceClass(entrance: BlockEntrance | undefined) {
  switch (entrance ?? "none") {
    case "none":
      return "";
    case "fade":
      return "dias-enter-fade";
    case "slideUp":
      return "dias-enter-up";
    case "slideLeft":
      return "dias-enter-left";
    case "zoom":
      return "dias-enter-zoom";
    case "pop":
      return "dias-enter-pop";
  }
}

export function imageFitClass(fit: ImageFit | undefined) {
  switch (fit ?? "contain") {
    case "contain":
      return "object-contain";
    case "cover":
      return "object-cover";
    case "fill":
      return "object-fill";
  }
}
