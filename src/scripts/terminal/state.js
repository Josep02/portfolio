export const body = document.getElementById("term-body");
export const term = document.querySelector(".term");
export const PROMPT = "josep@portfolio:~$ ";
export const BASE = document.documentElement.dataset.base || "/portfolio/";
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
