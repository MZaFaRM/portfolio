import { getCurrentTime, getUptime } from "./hooks.js";
import { browser } from "./scripts.js";
import { Game } from "./tictactoe.js";

const scrollView = document.querySelector("#scroll-view");
const terminalView = document.querySelector("#terminal-view");

const reduceMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)",
).matches;
const SIGNATURE = "مُحَمَّد ظَفَر مُبَارَك مَنزِل";
const RESUME_URL =
	"https://docs.google.com/document/d/1RGvgfufNKBGRyRrKwfn89TncH84hvWEhF_tjKZbYNxU/export?format=pdf";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function stampPrompt(prompt) {
	prompt.querySelector("[data-uptime]").textContent = getUptime().verbose;
	prompt.querySelector("[data-clock]").textContent = getCurrentTime().compact;
}

function buildPrompt() {
	const prompt = document.createElement("div");
	prompt.className = "term-prompt";
	prompt.setAttribute("aria-hidden", "true");
	prompt.innerHTML = `
		<div class="term-prompt-line">
			<span>╭─</span>
			<span class="term-browser">${browser}</span>
			<span class="term-pill" data-uptime></span>
			<span>~</span>
			<span class="term-fill"></span>
			<span class="term-ok">ok</span>
			<span data-clock></span>
			<span>─╮</span>
		</div>
		<div class="term-prompt-line">
			<span>╰─</span>
			<span class="term-face">(⌐■_■)</span>
			<span data-command></span><span class="term-caret"></span>
		</div>`;
	stampPrompt(prompt);
	return prompt;
}

// Types the command, freezes the timestamp, drops the caret
async function runPrompt(prompt, command) {
	stampPrompt(prompt);
	const target = prompt.querySelector("[data-command]");
	if (reduceMotion) {
		target.textContent = command;
	} else {
		await typeInto(target, command, 85);
		await wait(200);
	}
	prompt.querySelector(".term-caret")?.remove();
}

function runWhenVisible(prompt, command) {
	if (reduceMotion || !("IntersectionObserver" in window)) {
		runPrompt(prompt, command);
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries[0].isIntersecting) return;
			observer.disconnect();
			runPrompt(prompt, command);
		},
		{ threshold: 1, rootMargin: "0px 0px -15% 0px" },
	);
	observer.observe(prompt);
}

// Split by grapheme so Arabic diacritics type in with their letters
function graphemes(text) {
	if ("Segmenter" in Intl) {
		return Array.from(
			new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
				text,
			),
			(s) => s.segment,
		);
	}
	return Array.from(text);
}

async function typeInto(element, text, delay) {
	const parts = graphemes(text);
	for (let i = 1; i <= parts.length; i++) {
		element.textContent = parts.slice(0, i).join("");
		if (parts[i - 1] !== " ") await wait(delay);
	}
}

async function loadPage(path) {
	const response = await fetch(path);
	if (!response.ok) throw new Error(`Could not load ${path}`);
	const markup = await response.text();
	return new DOMParser().parseFromString(markup, "text/html");
}

function buildHero() {
	const glitch = reduceMotion ? "" : "glitch";
	const hero = document.createElement("header");
	hero.id = "top";
	hero.className = "scroll-hero";
	hero.innerHTML = `
		<div class="hero-body">
			<h1 class="hero-name">
				<span class="${glitch}">Muhammed</span>
				<span class="${glitch}">Zafar M. M.</span>
			</h1>

			<div class="hero-greeting">
				<p>Hello World! <span class="hero-star">✦</span></p>
				<p>I'm a CS grad and software developer. This is the scrollable side of my terminal portfolio. Pick a section below, or open the terminal and explore with commands.</p>
			</div>

			<nav class="hero-help" aria-label="Jump to">
				<a href="#about">about</a><span>who I am and what I'm up to</span>
				<a href="#experience">experience</a><span>where I've worked</span>
				<a href="#projects">projects</a><span>things I've built</span>
				<a href="${RESUME_URL}" target="_blank" rel="noreferrer">resume</a><span>download my résumé (PDF)</span>
				<a href="mailto:muhammedzafar.mm@gmail.com">contact</a><span>send me an email</span>
				<button type="button" data-open-tictactoe>tictactoe</button><span>play a minimax AI you can't beat</span>
				<button type="button" data-open-terminal>terminal</button><span>switch to the command-line view</span>
			</nav>
		</div>
	`;
	hero.prepend(buildPrompt());
	return hero;
}

async function bootHero(hero) {
	const prompt = hero.querySelector(".term-prompt");
	if (reduceMotion) {
		await runPrompt(prompt, "banner");
		return;
	}
	hero.classList.add("is-booting");
	await wait(400);
	await runPrompt(prompt, "banner");
	hero.classList.replace("is-booting", "is-booted");
}

function startHero(hero) {
	hero.querySelector("[data-open-terminal]").addEventListener(
		"click",
		(event) => openTerminal(event.currentTarget),
	);
	hero.querySelector("[data-open-tictactoe]").addEventListener(
		"click",
		(event) => {
			event.stopPropagation();
			openTicTacToe();
		},
	);
	bootHero(hero);
}

function sectionHeading(command, title) {
	const heading = document.createElement("div");
	heading.className = "scroll-section-heading";
	const prompt = buildPrompt();
	const h2 = document.createElement("h2");
	if (!reduceMotion) h2.className = "glitch";
	h2.textContent = title;
	heading.append(prompt, h2);
	runWhenVisible(prompt, command);
	return heading;
}

function makeEntries(source, itemSelector, className) {
	const list = document.createElement("div");
	list.className = `scroll-entry-list ${className}`;
	source.querySelectorAll(itemSelector).forEach((item) => {
		const title = item.querySelector(".project-title, .experience-title");
		const description = item.querySelector(".description");

		const entry = document.createElement("details");
		entry.className = "portfolio-entry";
		entry.id = item.id;

		const summary = document.createElement("summary");
		summary.className = "entry-row";
		summary.innerHTML = `<span class="entry-title"></span><span class="entry-desc"></span><span class="entry-toggle" aria-hidden="true"></span>`;
		summary.querySelector(".entry-title").textContent =
			title?.textContent.trim() ?? item.id;
		summary.querySelector(".entry-desc").textContent = (
			description?.textContent ?? ""
		)
			.replace(/\s+/g, " ")
			.replace(/^[\s:]+|[\s:]+$/g, "");

		const body = document.createElement("div");
		body.className = "entry-body";
		item.querySelectorAll(":scope > *").forEach((child) => {
			if (
				child === title ||
				child === description ||
				child.classList.contains("section-gap")
			)
				return;
			body.append(child.cloneNode(true));
		});
		body.querySelectorAll("img, iframe").forEach((media) => {
			media.loading = "lazy";
		});

		entry.append(summary, body);
		list.append(entry);
	});
	return list;
}

function makeInlineLinksNavigable() {
	const ids = Array.from(scrollView.querySelectorAll("[id]"));
	scrollView
		.querySelectorAll(".portfolio-entry .clickable")
		.forEach((item) => {
			if (item.classList.contains("section-gap")) {
				item.classList.remove("clickable");
				return;
			}
			const command = item.querySelector(".hidden")?.textContent.trim();
			if (!/^(projects|experience)$/i.test(command ?? "")) return;
			const label = item.cloneNode(true);
			label
				.querySelectorAll(".hidden")
				.forEach((hidden) => hidden.remove());
			const itemName = label.textContent.trim();
			const target = ids.find(
				(element) =>
					element.id.toLowerCase() === itemName.toLowerCase(),
			);
			if (!target) return;
			const link = document.createElement("a");
			link.className = "scroll-inline-link";
			link.href = `#${target.id}`;
			link.textContent = itemName;
			item.replaceWith(link);
		});
}

function focusCommandParameter() {
	const params = new URLSearchParams(location.search);
	const commands = params.get("commands");
	if (!commands) return;

	const entries = commands.split(",").map((entry) => entry.trim());
	let target = null;
	for (const entry of entries) {
		const match = entry.match(/^(projects|experience)(?:\s+(.+))?$/i);
		if (!match) continue;
		const section = document.getElementById(match[1].toLowerCase());
		const itemName = match[2]?.trim();
		if (!itemName) {
			target = section;
			continue;
		}
		const item = Array.from(section?.querySelectorAll("[id]") ?? []).find(
			(element) => element.id.toLowerCase() === itemName.toLowerCase(),
		);
		if (item) {
			item.open = true;
			target = item;
		}
	}
	target?.scrollIntoView({ block: "start" });
}

async function renderScrollView() {
	try {
		const [about, experience, projects] = await Promise.all([
			loadPage("pages/whoami.html"),
			loadPage("pages/experience.html"),
			loadPage("pages/projects.html"),
		]);

		const hero = buildHero();
		scrollView.replaceChildren(hero);
		startHero(hero);

		const aboutSection = document.createElement("section");
		aboutSection.id = "about";
		aboutSection.className = "scroll-section scroll-about";
		aboutSection.append(sectionHeading("whoami", "me.DEBUG()"));
		const aboutContent = about.querySelector("#whoami");
		aboutContent.classList.add("scroll-about-content");
		const signature = aboutContent.querySelector(".signature");
		if (signature) signature.textContent = SIGNATURE;
		aboutSection.append(aboutContent);
		scrollView.append(aboutSection);

		const experienceSection = document.createElement("section");
		experienceSection.id = "experience";
		experienceSection.className = "scroll-section";
		experienceSection.append(sectionHeading("experience", "experience_"));
		experienceSection.append(
			makeEntries(experience, ".experience", "experience-list"),
		);
		scrollView.append(experienceSection);

		const projectsSection = document.createElement("section");
		projectsSection.id = "projects";
		projectsSection.className = "scroll-section";
		projectsSection.append(sectionHeading("projects", "projects_"));
		projectsSection.append(
			makeEntries(projects, ".project", "projects-list"),
		);
		scrollView.append(projectsSection);
		makeInlineLinksNavigable();
		entryCommands = collectEntryCommands();

		const end = document.createElement("footer");
		end.className = "scroll-footer";
		end.innerHTML = `<span>Let’s make something useful.</span><a href="mailto:muhammedzafar.mm@gmail.com">Get in touch ↗</a>`;
		scrollView.append(end);
		focusCommandParameter();
	} catch (error) {
		console.error("Unable to build the scrollable portfolio:", error);
		scrollView.innerHTML = `<p>Portfolio content could not be loaded. Use the corner window to open the terminal view.</p>`;
	}
}

/* ---------- Dock: the corner terminal window ---------- */

function goTo(id) {
	const target = scrollView.querySelector(`#${CSS.escape(id)}`);
	if (!target) return;
	if (target instanceof HTMLDetailsElement) target.open = true;
	target.scrollIntoView({
		behavior: reduceMotion ? "auto" : "smooth",
		block: "start",
	});
}

const baseCommands = [
	{ name: "banner", hint: "back to the top", run: () => goTo("top") },
	{ name: "whoami", hint: "about me", run: () => goTo("about") },
	{
		name: "experience",
		hint: "where I've worked",
		run: () => goTo("experience"),
	},
	{
		name: "projects",
		hint: "things I've built",
		run: () => goTo("projects"),
	},
	{
		name: "resume",
		hint: "download PDF",
		run: () => window.open(RESUME_URL, "_blank", "noopener"),
	},
	{
		name: "contact",
		hint: "send an email",
		run: () => (location.href = "mailto:muhammedzafar.mm@gmail.com"),
	},
	{
		name: "tictactoe",
		hint: "play my minimax AI",
		run: () => openTicTacToe(),
	},
	{ name: "terminal", hint: "command-line view", run: () => openTerminal() },
];
let entryCommands = [];

function collectEntryCommands() {
	return Array.from(
		scrollView.querySelectorAll(".portfolio-entry"),
		(entry) => ({
			name: `${entry.closest(".scroll-section").id} ${entry.id.toLowerCase()}`,
			hint: entry.querySelector(".entry-desc").textContent,
			run: () => goTo(entry.id),
		}),
	);
}

const dock = document.createElement("aside");
dock.className = "dock";
dock.setAttribute("aria-label", "Quick navigation");
dock.innerHTML = `
	<div class="dock-titlebar" aria-hidden="true">
		<span class="dock-dots"><i></i><i></i><i></i></span>
		<span>~/zafar</span>
	</div>
	<div class="dock-panel" hidden>
		<ul class="dock-list"></ul>
		<div class="dock-line">
			<span class="term-face">(⌐■_■)</span>
			<input class="dock-input" type="text" autocomplete="off" spellcheck="false"
				placeholder="type a command" aria-label="Type a command or pick one from the list" />
		</div>
	</div>
	<div class="dock-game" hidden>
		<div class="dock-board" aria-label="Tic-tac-toe board"></div>
		<div class="dock-game-status" aria-live="polite"></div>
		<div class="dock-game-actions">
			<button type="button" data-game="retry">retry</button>
			<button type="button" data-game="exit">exit</button>
		</div>
	</div>
	<button class="dock-launcher" type="button" aria-expanded="false">
		<span class="term-face">(⌐■_■)</span>
		<span class="dock-launcher-label">jump to</span><span class="term-caret"></span>
	</button>`;
document.body.append(dock);

const dockLauncher = dock.querySelector(".dock-launcher");
const dockPanel = dock.querySelector(".dock-panel");
const dockInput = dock.querySelector(".dock-input");
const dockList = dock.querySelector(".dock-list");
let dockResults = [];
let dockActive = 0;

function renderDock() {
	const query = dockInput.value.trim().toLowerCase();
	const pool = query ? [...baseCommands, ...entryCommands] : baseCommands;
	dockResults = pool
		.filter(
			({ name }) =>
				name.startsWith(query) || (query && name.includes(` ${query}`)),
		)
		.slice(0, 8);
	dockActive = Math.min(dockActive, Math.max(dockResults.length - 1, 0));
	dock.classList.toggle("has-miss", Boolean(query) && !dockResults.length);

	if (!dockResults.length) {
		const empty = document.createElement("li");
		empty.className = "dock-empty";
		empty.textContent = query
			? `${query}: command not found`
			: "nothing to show";
		dockList.replaceChildren(empty);
		return;
	}

	dockList.replaceChildren(
		...dockResults.map((command, index) => {
			const item = document.createElement("li");
			const button = document.createElement("button");
			button.type = "button";
			if (index === dockActive) button.className = "is-active";
			const name = document.createElement("span");
			name.textContent = command.name;
			const hint = document.createElement("span");
			hint.className = "dock-hint";
			hint.textContent = command.hint;
			button.append(name, hint);
			button.addEventListener("click", () => runDock(command));
			item.append(button);
			return item;
		}),
	);
}

const touchInputQuery = window.matchMedia(
	"(hover: none) and (pointer: coarse)",
);

function openDock({ focusInput = !touchInputQuery.matches } = {}) {
	dock.classList.add("is-open");
	dockPanel.hidden = false;
	dockLauncher.hidden = true;
	dockLauncher.setAttribute("aria-expanded", "true");
	dockInput.value = "";
	dockActive = 0;
	renderDock();
	if (focusInput) dockInput.focus();
}

function closeDock({ restoreFocus = false } = {}) {
	clearTimeout(tttMoveTimer);
	tttThinking = false;
	dock.classList.remove("is-playing");
	dockGame.hidden = true;
	dock.classList.remove("is-open", "has-miss");
	dockPanel.hidden = true;
	dockLauncher.hidden = false;
	dockLauncher.setAttribute("aria-expanded", "false");
	if (restoreFocus) dockLauncher.focus();
}

function runDock(command) {
	closeDock();
	command.run();
}

/* ---------- Tic-tac-toe in the dock ---------- */

const dockGame = dock.querySelector(".dock-game");
const dockBoard = dock.querySelector(".dock-board");
const dockGameStatus = dock.querySelector(".dock-game-status");
let ttt = null;
let tttThinking = false;
let tttMoveTimer = null;

for (let i = 0; i < 9; i++) {
	const cell = document.createElement("button");
	cell.type = "button";
	cell.className = "dock-cell";
	cell.addEventListener("click", () => playCell(i));
	dockBoard.append(cell);
}

function newTicTacToe() {
	clearTimeout(tttMoveTimer);
	const template = document.createElement("div");
	template.innerHTML = `<div class="tictactoe-board" id="dock-tictactoe">${'<span class="cell"></span>'.repeat(9)}</div><span id="ai"></span><span id="player"></span>`;
	ttt = new Game(template);
	tttThinking = false;
	renderTicTacToe();
}

function tttOutcome() {
	const winner = ttt.winner(ttt.board);
	if (winner === ttt.currentPlayer)
		return `${winner} wins. you beat minimax?!`;
	if (winner) return `${winner} wins. retry?`;
	if (ttt.board.every(Boolean)) return "draw. the best anyone gets";
	return null;
}

function renderTicTacToe() {
	const outcome = tttOutcome();
	ttt.isGameOver = Boolean(outcome);
	dockBoard.querySelectorAll(".dock-cell").forEach((cell, i) => {
		const mark = ttt.board[i];
		cell.textContent = mark ?? "";
		cell.classList.toggle("is-ai", mark === ttt.AIPlayer);
		cell.setAttribute(
			"aria-disabled",
			String(Boolean(mark) || ttt.isGameOver || tttThinking),
		);
		cell.setAttribute(
			"aria-label",
			`row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${mark ?? "empty"}`,
		);
	});
	dockGameStatus.textContent =
		outcome ??
		(tttThinking
			? "AI is thinking…"
			: `you're ${ttt.currentPlayer}, your move`);
}

function playCell(index) {
	if (ttt.isGameOver || tttThinking || ttt.board[index]) return;
	ttt.board[index] = ttt.currentPlayer;
	renderTicTacToe();
	if (ttt.isGameOver) return;

	tttThinking = true;
	renderTicTacToe();
	tttMoveTimer = setTimeout(() => {
		ttt.board[ttt.minimax(ttt.board)] = ttt.AIPlayer;
		tttThinking = false;
		renderTicTacToe();
	}, 450);
}

function openTicTacToe() {
	openDock();
	dock.classList.add("is-playing");
	dockPanel.hidden = true;
	dockGame.hidden = false;
	newTicTacToe();
	dockBoard.querySelector('.dock-cell[aria-disabled="false"]')?.focus();
}

dockGame
	.querySelector('[data-game="retry"]')
	.addEventListener("click", newTicTacToe);
dockGame
	.querySelector('[data-game="exit"]')
	.addEventListener("click", () => closeDock({ restoreFocus: true }));
dockGame.addEventListener("keydown", (event) => {
	if (event.key === "Escape") closeDock({ restoreFocus: true });
});

function setView(view) {
	const terminal = view === "terminal";
	terminalView.hidden = !terminal;
	scrollView.hidden = terminal;
	dock.classList.toggle("is-terminal", terminal);
	dock.querySelector(".dock-launcher-label").textContent = terminal
		? "page view"
		: "jump to";
	closeDock();
	window.scrollTo({ top: 0 });
	if (terminal) document.getElementById("prompt-input")?.focus();
}

// Grow a terminal window out of `from` until it fills the screen, then swap
function zoomFrom(from, done) {
	if (reduceMotion) {
		done();
		return;
	}
	const rect = from.getBoundingClientRect();
	const zoom = document.createElement("div");
	zoom.className = "dock-zoom";
	Object.assign(zoom.style, {
		top: `${rect.top}px`,
		left: `${rect.left}px`,
		width: `${rect.width}px`,
		height: `${rect.height}px`,
	});
	document.body.append(zoom);
	requestAnimationFrame(() =>
		requestAnimationFrame(() =>
			Object.assign(zoom.style, {
				top: "0px",
				left: "0px",
				width: "100vw",
				height: "100vh",
			}),
		),
	);
	zoom.addEventListener(
		"transitionend",
		() => {
			done();
			zoom.classList.add("is-done");
			setTimeout(() => zoom.remove(), 200);
		},
		{ once: true },
	);
}

function openTerminal(from = dock) {
	closeDock();
	zoomFrom(from, () => setView("terminal"));
}

dockLauncher.addEventListener("click", () => {
	if (!terminalView.hidden) {
		setView("scroll");
		return;
	}
	openDock();
});

dockInput.addEventListener("input", () => {
	dockActive = 0;
	renderDock();
});

// The list renders bottom-up, so ArrowUp moves to the next match
dockInput.addEventListener("keydown", (event) => {
	const step = { ArrowUp: 1, ArrowDown: -1 }[event.key];
	if (step) {
		event.preventDefault();
		if (!dockResults.length) return;
		dockActive =
			(dockActive + step + dockResults.length) % dockResults.length;
		renderDock();
	} else if (
		event.key === "Tab" &&
		dockInput.value &&
		dockResults[dockActive]
	) {
		event.preventDefault();
		dockInput.value = dockResults[dockActive].name;
		renderDock();
	} else if (event.key === "Enter" && dockResults[dockActive]) {
		runDock(dockResults[dockActive]);
	} else if (event.key === "Escape") {
		closeDock({ restoreFocus: true });
	}
});

document.addEventListener("click", (event) => {
	if (
		dock.classList.contains("is-open") &&
		!event.composedPath().includes(dock)
	) {
		closeDock();
	}
});

// Typing a letter anywhere in the page view opens the dock
document.addEventListener("keydown", (event) => {
	if (scrollView.hidden || event.ctrlKey || event.metaKey || event.altKey)
		return;
	if (event.target.closest?.("input, textarea")) return;
	if (dock.contains(event.target)) return;
	if (/^[a-z]$/i.test(event.key)) {
		openDock({ focusInput: true });
		dockInput.value = event.key;
		renderDock();
	}
});

// In-page links open a collapsed entry before jumping to it
scrollView.addEventListener("click", (event) => {
	const link = event.target.closest('a[href^="#"]');
	if (!link || link.hash.length < 2) return;
	const target = scrollView.querySelector(
		`#${CSS.escape(link.hash.slice(1))}`,
	);
	if (target instanceof HTMLDetailsElement) target.open = true;
});

renderScrollView();
