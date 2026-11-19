"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Segmented,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Color = "w" | "b";
type PieceChar = "K" | "Q" | "R" | "B" | "N" | "P" | "k" | "q" | "r" | "b" | "n" | "p";
type Square = number; // 0..63, a1=0 … h8=63
type Board = (PieceChar | null)[];

type CastleRights = { wk: boolean; wq: boolean; bk: boolean; bq: boolean };

type GameState = {
  board: Board;
  turn: Color;
  castling: CastleRights;
  ep: Square | null;
  halfmove: number;
  fullmove: number;
};

type Move = {
  from: Square;
  to: Square;
  promo?: "q" | "r" | "b" | "n";
  captured?: PieceChar | null;
};

const UNICODE: Record<PieceChar, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const FILES = "abcdefgh";

function sq(file: number, rank: number): Square {
  return rank * 8 + file;
}

function fileOf(s: Square) {
  return s % 8;
}
function rankOf(s: Square) {
  return Math.floor(s / 8);
}

function isWhite(p: PieceChar) {
  return p === p.toUpperCase();
}
function colorOf(p: PieceChar): Color {
  return isWhite(p) ? "w" : "b";
}
function kindOf(p: PieceChar): string {
  return p.toLowerCase();
}

function cloneState(s: GameState): GameState {
  return {
    board: [...s.board],
    turn: s.turn,
    castling: { ...s.castling },
    ep: s.ep,
    halfmove: s.halfmove,
    fullmove: s.fullmove,
  };
}

function initialState(): GameState {
  const empty: Board = Array.from({ length: 64 }, () => null);
  const place = (r: number, row: (PieceChar | null)[]) => {
    for (let f = 0; f < 8; f++) empty[sq(f, r)] = row[f];
  };
  place(0, ["R", "N", "B", "Q", "K", "B", "N", "R"]);
  place(1, ["P", "P", "P", "P", "P", "P", "P", "P"]);
  place(6, ["p", "p", "p", "p", "p", "p", "p", "p"]);
  place(7, ["r", "n", "b", "q", "k", "b", "n", "r"]);
  return {
    board: empty,
    turn: "w",
    castling: { wk: true, wq: true, bk: true, bq: true },
    ep: null,
    halfmove: 0,
    fullmove: 1,
  };
}

function findKing(board: Board, side: Color): Square | null {
  const target = side === "w" ? "K" : "k";
  for (let i = 0; i < 64; i++) if (board[i] === target) return i;
  return null;
}

function attackedBy(board: Board, target: Square, by: Color): boolean {
  // Pawns
  const dir = by === "w" ? 1 : -1;
  const tr = rankOf(target);
  const tf = fileOf(target);
  for (const df of [-1, 1]) {
    const f = tf + df;
    const r = tr - dir;
    if (f < 0 || f > 7 || r < 0 || r > 7) continue;
    const p = board[sq(f, r)];
    if (p && colorOf(p) === by && kindOf(p) === "p") return true;
  }
  // Knights
  const kn = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ];
  for (const [df, dr] of kn) {
    const f = tf + df;
    const r = tr + dr;
    if (f < 0 || f > 7 || r < 0 || r > 7) continue;
    const p = board[sq(f, r)];
    if (p && colorOf(p) === by && kindOf(p) === "n") return true;
  }
  // King
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      if (df === 0 && dr === 0) continue;
      const f = tf + df;
      const r = tr + dr;
      if (f < 0 || f > 7 || r < 0 || r > 7) continue;
      const p = board[sq(f, r)];
      if (p && colorOf(p) === by && kindOf(p) === "k") return true;
    }
  }
  // Sliding
  const rays: [number, number, string[]][] = [
    [1, 0, ["r", "q"]],
    [-1, 0, ["r", "q"]],
    [0, 1, ["r", "q"]],
    [0, -1, ["r", "q"]],
    [1, 1, ["b", "q"]],
    [1, -1, ["b", "q"]],
    [-1, 1, ["b", "q"]],
    [-1, -1, ["b", "q"]],
  ];
  for (const [df, dr, kinds] of rays) {
    let f = tf + df;
    let r = tr + dr;
    while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
      const p = board[sq(f, r)];
      if (p) {
        if (colorOf(p) === by && kinds.includes(kindOf(p))) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }
  return false;
}

function inCheck(board: Board, side: Color): boolean {
  const k = findKing(board, side);
  if (k === null) return true;
  return attackedBy(board, k, side === "w" ? "b" : "w");
}

function pushQuiet(
  moves: Move[],
  board: Board,
  from: Square,
  to: Square,
  promo?: Move["promo"],
) {
  moves.push({ from, to, promo, captured: board[to] });
}

function genPseudo(state: GameState): Move[] {
  const { board, turn, ep } = state;
  const moves: Move[] = [];
  const enemy = turn === "w" ? "b" : "w";
  const forward = turn === "w" ? 1 : -1;
  const startRank = turn === "w" ? 1 : 6;
  const promoRank = turn === "w" ? 7 : 0;

  for (let from = 0; from < 64; from++) {
    const p = board[from];
    if (!p || colorOf(p) !== turn) continue;
    const k = kindOf(p);
    const f0 = fileOf(from);
    const r0 = rankOf(from);

    if (k === "p") {
      const r1 = r0 + forward;
      if (r1 >= 0 && r1 <= 7) {
        const to = sq(f0, r1);
        if (!board[to]) {
          if (r1 === promoRank) {
            for (const promo of ["q", "r", "b", "n"] as const) {
              pushQuiet(moves, board, from, to, promo);
            }
          } else {
            pushQuiet(moves, board, from, to);
            if (r0 === startRank) {
              const to2 = sq(f0, r0 + 2 * forward);
              if (!board[to2]) pushQuiet(moves, board, from, to2);
            }
          }
        }
      }
      for (const df of [-1, 1]) {
        const f = f0 + df;
        const r = r0 + forward;
        if (f < 0 || f > 7 || r < 0 || r > 7) continue;
        const to = sq(f, r);
        const cap = board[to];
        if (cap && colorOf(cap) === enemy) {
          if (r === promoRank) {
            for (const promo of ["q", "r", "b", "n"] as const) {
              moves.push({ from, to, promo, captured: cap });
            }
          } else {
            moves.push({ from, to, captured: cap });
          }
        } else if (ep !== null && to === ep) {
          const capSq = sq(f, r0);
          moves.push({ from, to, captured: board[capSq] });
        }
      }
    } else if (k === "n") {
      for (const [df, dr] of [
        [1, 2],
        [2, 1],
        [-1, 2],
        [-2, 1],
        [1, -2],
        [2, -1],
        [-1, -2],
        [-2, -1],
      ]) {
        const f = f0 + df;
        const r = r0 + dr;
        if (f < 0 || f > 7 || r < 0 || r > 7) continue;
        const to = sq(f, r);
        const cap = board[to];
        if (!cap || colorOf(cap) === enemy) pushQuiet(moves, board, from, to);
      }
    } else if (k === "k") {
      for (let dr = -1; dr <= 1; dr++) {
        for (let df = -1; df <= 1; df++) {
          if (df === 0 && dr === 0) continue;
          const f = f0 + df;
          const r = r0 + dr;
          if (f < 0 || f > 7 || r < 0 || r > 7) continue;
          const to = sq(f, r);
          const cap = board[to];
          if (!cap || colorOf(cap) === enemy) pushQuiet(moves, board, from, to);
        }
      }
    } else {
      const dirs: [number, number][] =
        k === "b"
          ? [
              [1, 1],
              [1, -1],
              [-1, 1],
              [-1, -1],
            ]
          : k === "r"
            ? [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ]
            : [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, -1],
              ];
      for (const [df, dr] of dirs) {
        let f = f0 + df;
        let r = r0 + dr;
        while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
          const to = sq(f, r);
          const cap = board[to];
          if (!cap) {
            pushQuiet(moves, board, from, to);
          } else {
            if (colorOf(cap) === enemy) pushQuiet(moves, board, from, to);
            break;
          }
          f += df;
          r += dr;
        }
      }
    }
  }

  // Castling
  const { castling } = state;
  if (turn === "w") {
    if (
      castling.wk &&
      !board[sq(5, 0)] &&
      !board[sq(6, 0)] &&
      board[sq(4, 0)] === "K" &&
      board[sq(7, 0)] === "R" &&
      !inCheck(board, "w") &&
      !attackedBy(board, sq(5, 0), "b") &&
      !attackedBy(board, sq(6, 0), "b")
    ) {
      moves.push({ from: sq(4, 0), to: sq(6, 0) });
    }
    if (
      castling.wq &&
      !board[sq(3, 0)] &&
      !board[sq(2, 0)] &&
      !board[sq(1, 0)] &&
      board[sq(4, 0)] === "K" &&
      board[sq(0, 0)] === "R" &&
      !inCheck(board, "w") &&
      !attackedBy(board, sq(3, 0), "b") &&
      !attackedBy(board, sq(2, 0), "b")
    ) {
      moves.push({ from: sq(4, 0), to: sq(2, 0) });
    }
  } else {
    if (
      castling.bk &&
      !board[sq(5, 7)] &&
      !board[sq(6, 7)] &&
      board[sq(4, 7)] === "k" &&
      board[sq(7, 7)] === "r" &&
      !inCheck(board, "b") &&
      !attackedBy(board, sq(5, 7), "w") &&
      !attackedBy(board, sq(6, 7), "w")
    ) {
      moves.push({ from: sq(4, 7), to: sq(6, 7) });
    }
    if (
      castling.bq &&
      !board[sq(3, 7)] &&
      !board[sq(2, 7)] &&
      !board[sq(1, 7)] &&
      board[sq(4, 7)] === "k" &&
      board[sq(0, 7)] === "r" &&
      !inCheck(board, "b") &&
      !attackedBy(board, sq(3, 7), "w") &&
      !attackedBy(board, sq(2, 7), "w")
    ) {
      moves.push({ from: sq(4, 7), to: sq(2, 7) });
    }
  }

  return moves;
}

function applyMove(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const { board } = next;
  const piece = board[move.from];
  if (!piece) return next;

  const isEp =
    kindOf(piece) === "p" &&
    move.to === state.ep &&
    fileOf(move.from) !== fileOf(move.to) &&
    !board[move.to];

  let captured = board[move.to];
  if (isEp) {
    const capSq = sq(fileOf(move.to), rankOf(move.from));
    captured = board[capSq];
    board[capSq] = null;
  }

  board[move.to] = piece;
  board[move.from] = null;

  // Promotion
  if (move.promo && kindOf(piece) === "p") {
    const up = colorOf(piece) === "w";
    const map = { q: "q", r: "r", b: "b", n: "n" } as const;
    const ch = map[move.promo];
    board[move.to] = (up ? ch.toUpperCase() : ch) as PieceChar;
  }

  // Castling rook move
  if (kindOf(piece) === "k" && Math.abs(fileOf(move.to) - fileOf(move.from)) === 2) {
    const r = rankOf(move.from);
    if (fileOf(move.to) === 6) {
      board[sq(5, r)] = board[sq(7, r)];
      board[sq(7, r)] = null;
    } else if (fileOf(move.to) === 2) {
      board[sq(3, r)] = board[sq(0, r)];
      board[sq(0, r)] = null;
    }
  }

  // Castling rights
  if (piece === "K") {
    next.castling.wk = false;
    next.castling.wq = false;
  }
  if (piece === "k") {
    next.castling.bk = false;
    next.castling.bq = false;
  }
  if (move.from === sq(0, 0) || move.to === sq(0, 0)) next.castling.wq = false;
  if (move.from === sq(7, 0) || move.to === sq(7, 0)) next.castling.wk = false;
  if (move.from === sq(0, 7) || move.to === sq(0, 7)) next.castling.bq = false;
  if (move.from === sq(7, 7) || move.to === sq(7, 7)) next.castling.bk = false;

  // En passant target
  next.ep = null;
  if (
    kindOf(piece) === "p" &&
    Math.abs(rankOf(move.to) - rankOf(move.from)) === 2
  ) {
    next.ep = sq(fileOf(move.from), (rankOf(move.from) + rankOf(move.to)) / 2);
  }

  next.halfmove =
    kindOf(piece) === "p" || captured || isEp ? 0 : state.halfmove + 1;
  if (state.turn === "b") next.fullmove = state.fullmove + 1;
  next.turn = state.turn === "w" ? "b" : "w";
  return next;
}

function legalMoves(state: GameState): Move[] {
  const raw = genPseudo(state);
  const out: Move[] = [];
  for (const m of raw) {
    const next = applyMove(state, { ...m });
    if (!inCheck(next.board, state.turn)) out.push(m);
  }
  return out;
}

function parseSq(alg: string): Square {
  const f = FILES.indexOf(alg[0]);
  const r = Number(alg[1]) - 1;
  return sq(f, r);
}

function algOf(s: Square): string {
  return FILES[fileOf(s)] + String(rankOf(s) + 1);
}

/** Resolve a SAN-ish or UCI ply against the current position (openings use UCI). */
function findUciMove(state: GameState, uci: string): Move | null {
  const from = parseSq(uci.slice(0, 2));
  const to = parseSq(uci.slice(2, 4));
  const promo = uci.length > 4 ? (uci[4] as Move["promo"]) : undefined;
  const legals = legalMoves(state);
  return (
    legals.find(
      (m) => m.from === from && m.to === to && (promo ? m.promo === promo : true),
    ) ?? null
  );
}

type Opening = {
  id: string;
  da: string;
  en: string;
  /** UCI plies */
  uci: string[];
};

const OPENINGS: Opening[] = [
  {
    id: "italian",
    da: "Italiensk parti",
    en: "Italian Game",
    uci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
  },
  {
    id: "ruy",
    da: "Spansk parti",
    en: "Ruy Lopez",
    uci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
  },
  {
    id: "sicilian",
    da: "Siciliansk forsvar",
    en: "Sicilian Defense",
    uci: ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4"],
  },
  {
    id: "french",
    da: "Fransk forsvar",
    en: "French Defense",
    uci: ["e2e4", "e7e6", "d2d4", "d7d5", "b1c3"],
  },
  {
    id: "qgambit",
    da: "Dronninggambit",
    en: "Queen's Gambit",
    uci: ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3"],
  },
  {
    id: "kingsindian",
    da: "Kongeindisk opstilling",
    en: "King's Indian setup",
    uci: ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3"],
  },
];

function pieceOrder(p: PieceChar): number {
  const o: Record<string, number> = { q: 5, r: 4, b: 3, n: 2, p: 1, k: 0 };
  return o[kindOf(p)] ?? 0;
}

type CpuLevel = "off" | "easy" | "medium" | "hard" | "impossible";

const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

/** Midgame-ish piece-square tables (white perspective, a1 = index 0). */
const PST: Record<string, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
    20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10,
    0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
    0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20,
    15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
    5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0,
    -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
    -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0,
    -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0,
    -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
    5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5,
    5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
    -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20,
    -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

function pstBonus(kind: string, square: Square, side: Color): number {
  const table = PST[kind];
  if (!table) return 0;
  const idx = side === "w" ? square : sq(fileOf(square), 7 - rankOf(square));
  return table[idx] ?? 0;
}

function materialAndPst(board: Board): number {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p) continue;
    const k = kindOf(p);
    const side = colorOf(p);
    const v = (PIECE_VALUE[k] ?? 0) + pstBonus(k, i, side);
    score += side === "w" ? v : -v;
  }
  return score;
}

function staticEval(state: GameState): number {
  const moves = legalMoves(state);
  if (moves.length === 0) {
    if (inCheck(state.board, state.turn)) {
      // Side to move is checkmated.
      return state.turn === "w" ? -100000 + state.fullmove : 100000 - state.fullmove;
    }
    return 0;
  }
  return materialAndPst(state.board);
}

function moveSortKey(state: GameState, m: Move): number {
  const victim = state.board[m.to];
  const attacker = state.board[m.from];
  let score = 0;
  if (victim && attacker) {
    score +=
      10 * (PIECE_VALUE[kindOf(victim)] ?? 0) -
      (PIECE_VALUE[kindOf(attacker)] ?? 0);
  }
  if (m.promo) score += 800;
  return score;
}

function orderedMoves(state: GameState): Move[] {
  const moves = legalMoves(state);
  moves.sort((a, b) => moveSortKey(state, b) - moveSortKey(state, a));
  return moves;
}

type SearchLimit = { nodes: number; maxNodes: number };

function negamax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  limit: SearchLimit,
): number {
  limit.nodes += 1;
  if (limit.nodes > limit.maxNodes) return staticEval(state);

  const moves = orderedMoves(state);
  if (depth <= 0 || moves.length === 0) return staticEval(state);

  let best = -Infinity;
  for (const m of moves) {
    const child = applyMove(state, m);
    const score = -negamax(child, depth - 1, -beta, -alpha, limit);
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

function bestMoveAtDepth(
  state: GameState,
  depth: number,
  maxNodes: number,
): Move | null {
  const moves = orderedMoves(state);
  if (moves.length === 0) return null;
  const limit: SearchLimit = { nodes: 0, maxNodes };
  let bestMove = moves[0]!;
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;
  for (const m of moves) {
    const child = applyMove(state, m);
    const score = -negamax(child, depth - 1, -beta, -alpha, limit);
    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
    if (score > alpha) alpha = score;
  }
  return bestMove;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

function pickCpuMove(state: GameState, level: Exclude<CpuLevel, "off">): Move | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;

  if (level === "easy") {
    // Prefer weak 1-ply choices most of the time.
    const scored = moves.map((m) => {
      const next = applyMove(state, m);
      const score = staticEval(next);
      // Higher is better for White; if Black to move, lower is better for CPU.
      return { m, score };
    });
    scored.sort((a, b) =>
      state.turn === "b" ? a.score - b.score : b.score - a.score,
    );
    const weakCount = Math.max(1, Math.ceil(scored.length * 0.45));
    const pool = scored.slice(-weakCount);
    if (Math.random() < 0.25) {
      return scored[Math.floor(Math.random() * scored.length)]!.m;
    }
    return pool[Math.floor(Math.random() * pool.length)]!.m;
  }

  if (level === "medium") {
    if (Math.random() < 0.18) {
      return shuffleInPlace([...moves])[0]!;
    }
    return bestMoveAtDepth(state, 1, 8000);
  }

  if (level === "hard") {
    return bestMoveAtDepth(state, 2, 25000);
  }

  // Impossible: deeper search with a generous node budget.
  const deep = bestMoveAtDepth(state, 3, 120000);
  if (deep) return deep;
  return bestMoveAtDepth(state, 2, 40000);
}

function forceQueenPromo(move: Move, state: GameState): Move {
  if (!move.promo) {
    const piece = state.board[move.from];
    if (piece && kindOf(piece) === "p") {
      const toRank = rankOf(move.to);
      if (toRank === 0 || toRank === 7) return { ...move, promo: "q" };
    }
  }
  return move.promo ? { ...move, promo: "q" } : move;
}

export function SkakTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [state, setState] = useState<GameState>(() => initialState());
  const [history, setHistory] = useState<GameState[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null,
  );
  const [statusNote, setStatusNote] = useState("");
  const [promoPending, setPromoPending] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [cpuLevel, setCpuLevel] = useState<CpuLevel>("off");
  const [cpuThinking, setCpuThinking] = useState(false);
  const cpuJob = useRef(0);

  /** Human plays white; CPU plays black when enabled. */
  const cpuColor: Color | null = cpuLevel === "off" ? null : "b";
  const cpuToMove = cpuColor !== null && state.turn === cpuColor;

  const legals = useMemo(() => legalMoves(state), [state]);
  const targets = useMemo(() => {
    if (selected === null) return new Set<Square>();
    return new Set(legals.filter((m) => m.from === selected).map((m) => m.to));
  }, [legals, selected]);

  const check = inCheck(state.board, state.turn);
  const noMoves = legals.length === 0;
  const gameOver = noMoves;
  const endKind: "mate" | "stalemate" | null = gameOver
    ? check
      ? "mate"
      : "stalemate"
    : null;
  /** Side that still had to move when the game ended (the loser on mate). */
  const sideToMoveAtEnd = state.turn;
  const winner: Color | null =
    endKind === "mate" ? (sideToMoveAtEnd === "w" ? "b" : "w") : null;

  const reset = useCallback(() => {
    cpuJob.current += 1;
    setCpuThinking(false);
    setState(initialState());
    setHistory([]);
    setSelected(null);
    setLastMove(null);
    setPromoPending(null);
    setStatusNote("");
  }, []);

  const undo = useCallback(() => {
    cpuJob.current += 1;
    setCpuThinking(false);
    setHistory((h) => {
      if (h.length === 0) return h;
      // Vs CPU: undo the engine reply and the human move together when possible.
      const steps = cpuLevel !== "off" && h.length >= 2 ? 2 : 1;
      const prev = h[h.length - steps]!;
      setState(prev);
      setSelected(null);
      setPromoPending(null);
      setLastMove(null);
      setStatusNote("");
      return h.slice(0, -steps);
    });
  }, [cpuLevel]);

  // Recompute captured lists whenever history/state changes via replay
  const captured = useMemo(() => {
    const path = [...history, state];
    const w: PieceChar[] = [];
    const b: PieceChar[] = [];
    for (let i = 1; i < path.length; i++) {
      const before = path[i - 1];
      const after = path[i];
      // Detect capture by piece count drop
      const count = (board: Board, side: Color) =>
        board.filter((p) => p && colorOf(p) === side).length;
      if (count(after.board, "w") < count(before.board, "w")) {
        const beforePieces = before.board.filter(
          (p): p is PieceChar => !!p && colorOf(p) === "w",
        );
        const afterPieces = after.board.filter(
          (p): p is PieceChar => !!p && colorOf(p) === "w",
        );
        const used = [...afterPieces];
        for (const p of beforePieces) {
          const idx = used.indexOf(p);
          if (idx >= 0) used.splice(idx, 1);
          else w.push(p);
        }
      }
      if (count(after.board, "b") < count(before.board, "b")) {
        const beforePieces = before.board.filter(
          (p): p is PieceChar => !!p && colorOf(p) === "b",
        );
        const afterPieces = after.board.filter(
          (p): p is PieceChar => !!p && colorOf(p) === "b",
        );
        const used = [...afterPieces];
        for (const p of beforePieces) {
          const idx = used.indexOf(p);
          if (idx >= 0) used.splice(idx, 1);
          else b.push(p);
        }
      }
    }
    w.sort((a, c) => pieceOrder(c) - pieceOrder(a));
    b.sort((a, c) => pieceOrder(c) - pieceOrder(a));
    return { w, b };
  }, [history, state]);

  const playMove = useCallback(
    (move: Move) => {
      setHistory((h) => [...h, cloneState(state)]);
      const next = applyMove(state, move);
      setState(next);
      setLastMove({ from: move.from, to: move.to });
      setSelected(null);
      setPromoPending(null);
      const afterLegals = legalMoves(next);
      const oppCheck = inCheck(next.board, next.turn);
      if (afterLegals.length === 0) {
        setStatusNote(
          oppCheck
            ? da
              ? "Skakmat"
              : "Checkmate"
            : da
              ? "Pat (uafgjort)"
              : "Stalemate",
        );
      } else if (oppCheck) {
        setStatusNote(da ? "Skak" : "Check");
      } else {
        setStatusNote("");
      }
    },
    [state, da],
  );

  useEffect(() => {
    if (cpuLevel === "off" || gameOver || !cpuToMove || promoPending) {
      setCpuThinking(false);
      return;
    }
    const job = ++cpuJob.current;
    setCpuThinking(true);
    const delay =
      cpuLevel === "easy" ? 280 : cpuLevel === "medium" ? 220 : 80;
    const timer = window.setTimeout(() => {
      const move = pickCpuMove(state, cpuLevel);
      if (cpuJob.current !== job) return;
      setCpuThinking(false);
      if (!move) return;
      playMove(forceQueenPromo(move, state));
    }, delay);
    return () => {
      window.clearTimeout(timer);
    };
  }, [cpuLevel, cpuToMove, gameOver, promoPending, state, playMove]);

  const onSquare = (s: Square) => {
    if (promoPending) return;
    if (gameOver) return;
    if (cpuToMove || cpuThinking) return;
    const piece = state.board[s];
    if (selected !== null && targets.has(s)) {
      const candidates = legals.filter((m) => m.from === selected && m.to === s);
      if (candidates.length > 1) {
        // Promotion choice
        setPromoPending({ from: selected, to: s });
        return;
      }
      if (candidates[0]) playMove(candidates[0]);
      return;
    }
    if (piece && colorOf(piece) === state.turn) {
      setSelected(s);
      return;
    }
    setSelected(null);
  };

  const applyOpening = (op: Opening) => {
    cpuJob.current += 1;
    setCpuThinking(false);
    let cur = initialState();
    const hist: GameState[] = [];
    let last: { from: Square; to: Square } | null = null;
    for (const u of op.uci) {
      const m = findUciMove(cur, u);
      if (!m) break;
      hist.push(cloneState(cur));
      cur = applyMove(cur, m);
      last = { from: m.from, to: m.to };
    }
    setState(cur);
    setHistory(hist);
    setSelected(null);
    setPromoPending(null);
    setLastMove(last);
    setStatusNote(
      da
        ? `Åbning: ${op.da} (${op.uci.length} træk)`
        : `Opening: ${op.en} (${op.uci.length} plies)`,
    );
  };

  const onCpuLevel = (level: CpuLevel) => {
    cpuJob.current += 1;
    setCpuThinking(false);
    setCpuLevel(level);
    setSelected(null);
    setPromoPending(null);
  };

  const displayRanks = flipped
    ? [0, 1, 2, 3, 4, 5, 6, 7]
    : [7, 6, 5, 4, 3, 2, 1, 0];
  const displayFiles = flipped
    ? [7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7];

  const turnLabel = cpuThinking
    ? da
      ? "CPU tænker…"
      : "CPU thinking…"
    : state.turn === "w"
      ? da
        ? "Hvid i trækket"
        : "White to move"
      : da
        ? "Sort i trækket"
        : "Black to move";

  const overlayCopy = (() => {
    if (!endKind) return null;
    if (endKind === "stalemate") {
      return {
        title: da ? "Pat" : "Stalemate",
        body: da
          ? "Ingen lovlige træk, og kongen står ikke i skak. Partiet er uafgjort."
          : "No legal moves, and the king is not in check. The game is a draw.",
      };
    }
    if (cpuLevel !== "off") {
      const humanWon = winner === "w";
      return humanWon
        ? {
            title: da ? "Du vandt" : "You won",
            body: da
              ? "Skakmat. Sort har ingen lovlige træk."
              : "Checkmate. Black has no legal moves.",
          }
        : {
            title: da ? "Du tabte" : "You lost",
            body: da
              ? "Skakmat. Hvid har ingen lovlige træk."
              : "Checkmate. White has no legal moves.",
          };
    }
    const whiteWon = winner === "w";
    return {
      title: whiteWon
        ? da
          ? "Hvid vandt"
          : "White won"
        : da
          ? "Sort vandt"
          : "Black won",
      body: da
        ? "Skakmat. Modstanderen har ingen lovlige træk."
        : "Checkmate. The opponent has no legal moves.",
    };
  })();

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Spil skak frit eller mod CPU. Du er altid hvid. Klik en brik, derefter et lovligt felt. Rokade og en passant er med."
          : "Play free chess or against the CPU. You are always white. Click a piece, then a legal square. Castling and en passant are included."}
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {da ? "Modstander" : "Opponent"}
        </p>
        <Segmented
          value={cpuLevel}
          onChange={onCpuLevel}
          ariaLabel={da ? "CPU-sværhedsgrad" : "CPU difficulty"}
          options={[
            { id: "off", label: da ? "2 spillere" : "2 players" },
            { id: "easy", label: da ? "Nem" : "Easy" },
            { id: "medium", label: da ? "Medium" : "Medium" },
            { id: "hard", label: da ? "Svær" : "Hard" },
            { id: "impossible", label: da ? "Umulig" : "Impossible" },
          ]}
        />
        <p className="text-xs text-muted">
          {cpuLevel === "off"
            ? da
              ? "Menneske mod menneske på samme enhed."
              : "Human vs human on the same device."
            : da
              ? "CPU spiller sort. Fortryd fjerner både dit træk og CPU-svaret."
              : "CPU plays black. Undo removes both your move and the CPU reply."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={undo}
          disabled={history.length === 0 || cpuThinking}
        >
          {da ? "Fortryd" : "Undo"}
        </button>
        <button type="button" className={secondaryBtnClass} onClick={() => setFlipped((f) => !f)}>
          {da ? "Vend bræt" : "Flip board"}
        </button>
        <button type="button" className={secondaryBtnClass} onClick={reset}>
          {da ? "Nulstil" : "Reset"}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-medium text-foreground">{turnLabel}</p>
        <p className="text-muted" aria-live="polite">
          {statusNote || (check && !gameOver ? (da ? "Skak" : "Check") : "")}
        </p>
      </div>

      {/* Captured */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm">
          <p className="text-xs text-muted">{da ? "Taget af hvid" : "Captured by white"}</p>
          <p className="mt-1 min-h-[1.5rem] text-xl leading-none tracking-wide">
            {captured.b.map((p, i) => (
              <span key={i}>{UNICODE[p]}</span>
            ))}
            {captured.b.length === 0 ? (
              <span className="text-sm text-muted">-</span>
            ) : null}
          </p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm">
          <p className="text-xs text-muted">{da ? "Taget af sort" : "Captured by black"}</p>
          <p className="mt-1 min-h-[1.5rem] text-xl leading-none tracking-wide">
            {captured.w.map((p, i) => (
              <span key={i}>{UNICODE[p]}</span>
            ))}
            {captured.w.length === 0 ? (
              <span className="text-sm text-muted">-</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[min(100%,420px)]">
        <div className="relative">
          <div
            role="grid"
            aria-label={da ? "Skakbræt" : "Chess board"}
            aria-hidden={overlayCopy ? true : undefined}
            className="grid grid-cols-8 overflow-hidden rounded-[12px] border border-border shadow-sm"
          >
            {displayRanks.map((r) =>
              displayFiles.map((f) => {
                const s = sq(f, r);
                const p = state.board[s];
                const light = (f + r) % 2 === 1;
                const isSel = selected === s;
                const isTarget = targets.has(s);
                const isLast =
                  lastMove && (lastMove.from === s || lastMove.to === s);
                const label = `${algOf(s)}${p ? `, ${UNICODE[p]}` : ""}`;
                return (
                  <button
                    key={s}
                    type="button"
                    role="gridcell"
                    aria-label={label}
                    aria-selected={isSel}
                    onClick={() => onSquare(s)}
                    tabIndex={overlayCopy ? -1 : undefined}
                    className="kit-touch-target relative aspect-square min-h-0 border-0 p-0 text-[clamp(1.35rem,5vw,2rem)] leading-none transition-[filter] duration-100 sm:min-h-0"
                    style={{
                      backgroundColor: isSel
                        ? "color-mix(in srgb, var(--accent) 45%, #c8a45a)"
                        : isLast
                          ? "color-mix(in srgb, var(--accent) 28%, " +
                            (light ? "#f0d9b5" : "#b58863") +
                            ")"
                          : light
                            ? "#f0d9b5"
                            : "#b58863",
                    }}
                  >
                    {p ? (
                      <span
                        className={
                          isWhite(p)
                            ? "text-[#1a1a1a] drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
                            : "text-[#111]"
                        }
                        aria-hidden
                      >
                        {UNICODE[p]}
                      </span>
                    ) : null}
                    {isTarget ? (
                      <span
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        aria-hidden
                      >
                        {p ? (
                          <span
                            className="size-[78%] rounded-full border-[3px]"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--accent) 80%, #000)",
                            }}
                          />
                        ) : (
                          <span
                            className="size-[22%] rounded-full opacity-70"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--accent) 70%, #000)",
                            }}
                          />
                        )}
                      </span>
                    ) : null}
                  </button>
                );
              }),
            )}
          </div>

          {overlayCopy ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] p-4"
              style={{
                background:
                  "color-mix(in srgb, var(--background) 72%, transparent)",
                backdropFilter: "blur(3px)",
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="skak-result-title"
              aria-describedby="skak-result-body"
            >
              <div className="w-full max-w-[18rem] rounded-[14px] border border-border bg-surface px-5 py-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <p
                  id="skak-result-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  {overlayCopy.title}
                </p>
                <p
                  id="skak-result-body"
                  className="mt-2 text-sm leading-relaxed text-muted"
                >
                  {overlayCopy.body}
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    className={primaryBtnClass}
                    onClick={reset}
                  >
                    {da ? "Spil igen" : "Play again"}
                  </button>
                  <button
                    type="button"
                    className={secondaryBtnClass}
                    onClick={undo}
                    disabled={history.length === 0}
                  >
                    {da ? "Fortryd sidste træk" : "Undo last move"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-1 flex justify-between px-1 text-[10px] text-muted sm:text-xs">
          {displayFiles.map((f) => (
            <span key={f} className="w-[12.5%] text-center">
              {FILES[f]}
            </span>
          ))}
        </div>
      </div>

      {promoPending ? (
        <div className="kit-tool-panel flex flex-wrap items-center gap-2 p-3">
          <p className="text-sm text-foreground">
            {da ? "Vælg forvandling:" : "Choose promotion:"}
          </p>
          {(["q", "r", "b", "n"] as const).map((pr) => {
            const ch = (state.turn === "w" ? pr.toUpperCase() : pr) as PieceChar;
            return (
              <button
                key={pr}
                type="button"
                className={primaryBtnClass}
                onClick={() => {
                  const m = legals.find(
                    (x) =>
                      x.from === promoPending.from &&
                      x.to === promoPending.to &&
                      x.promo === pr,
                  );
                  if (m) playMove(m);
                }}
              >
                {UNICODE[ch]}
              </button>
            );
          })}
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() => setPromoPending(null)}
          >
            {da ? "Annuller" : "Cancel"}
          </button>
        </div>
      ) : null}

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Åbninger" : "Openings"}
        </h2>
        <p className="text-xs text-muted">
          {da
            ? "Afspil de første træk automatisk på brættet. Derefter spiller I videre selv."
            : "Auto-play the first few plies onto the board. Then continue free play."}
        </p>
        <div className="flex flex-wrap gap-2">
          {OPENINGS.map((op) => (
            <button
              key={op.id}
              type="button"
              className={secondaryBtnClass}
              onClick={() => applyOpening(op)}
            >
              {da ? op.da : op.en}
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
