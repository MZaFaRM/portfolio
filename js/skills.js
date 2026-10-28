// Boots every skill tree on the page, in the scroll view or in terminal
// output: lines print top to bottom and names decrypt out of noise.

const reduceMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)",
).matches;
const NOISE = "!<>-_\\/[]{}=+*^?#%&$01";
const LINES = ".skill-tree-root, .skill-dir-name, .skill-dir li";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const noise = () => NOISE[Math.floor(Math.random() * NOISE.length)];

function decrypt(name, duration) {
	if (name.dataset.busy) return Promise.resolve();
	name.dataset.busy = "true";
	const text = name.dataset.text;
	const start = performance.now();

	return new Promise((resolve) => {
		const tick = () => {
			const progress = Math.min((performance.now() - start) / duration, 1);
			const settled = Math.floor(text.length * progress);
			const scrambled = [...text.slice(settled)]
				.map((char) => (char === " " ? " " : noise()))
				.join("");
			name.textContent = text.slice(0, settled) + scrambled;

			if (progress < 1 && name.isConnected) {
				setTimeout(tick, 32);
				return;
			}
			name.textContent = text;
			delete name.dataset.busy;
			resolve();
		};
		tick();
	});
}

function finish(tree) {
	tree.querySelectorAll(".skill-name").forEach((name) => {
		name.dataset.text ??= name.textContent.trim();
		name.textContent = name.dataset.text;
		delete name.dataset.busy;
	});
	tree.dataset.state = "done";
}

// Lines grouped by where they sit on screen, so every layout (columns or the
// compact inline one) prints top to bottom like terminal output
function visualRows(tree) {
	const rows = new Map();
	tree.querySelectorAll(LINES).forEach((line) => {
		const top = Math.round(line.getBoundingClientRect().top);
		if (!rows.has(top)) rows.set(top, []);
		rows.get(top).push(line);
	});
	return [...rows.entries()].sort(([a], [b]) => a - b).map(([, row]) => row);
}

async function boot(tree) {
	tree.dataset.state = "running";

	const pending = [];
	for (const row of visualRows(tree)) {
		if (!tree.isConnected) return;
		row.forEach((line) => {
			line.classList.add("is-printed");
			if (line.matches(".skill-dir-name")) {
				line.closest(".skill-dir").classList.add("is-printed");
			}
			const name = line.querySelector(".skill-name");
			if (!name) return;
			pending.push(decrypt(name, 180 + name.dataset.text.length * 14));
		});
		await wait(36);
	}

	await Promise.all(pending);
	if (tree.isConnected) finish(tree);
}

const bootObserver =
	"IntersectionObserver" in window
		? new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (!entry.isIntersecting) return;
						bootObserver.unobserve(entry.target);
						boot(entry.target);
					});
				},
				{ threshold: 0.1 },
			)
		: null;

function prepare(tree) {
	// The terminal re-serialises its output on every command, so a tree that
	// already booted comes back as fresh markup and only needs settling
	if (tree.dataset.state && tree.dataset.state !== "idle") {
		finish(tree);
		return;
	}
	tree.querySelectorAll(".skill-name").forEach((name) => {
		name.dataset.text ??= name.textContent.trim();
	});
	if (reduceMotion || !bootObserver) {
		finish(tree);
		return;
	}
	tree.dataset.state = "idle";
	bootObserver.observe(tree);
}

function scan(node) {
	if (node.nodeType !== Node.ELEMENT_NODE) return;
	if (node.matches(".skill-tree")) prepare(node);
	else node.querySelectorAll(".skill-tree").forEach(prepare);
}

new MutationObserver((records) => {
	records.forEach((record) => record.addedNodes.forEach(scan));
}).observe(document.body, { childList: true, subtree: true });
scan(document.body);

if (!reduceMotion) {
	document.addEventListener("pointerover", (event) => {
		const name = event.target.closest?.(
			".skill-tree[data-state='done'] .skill-name",
		);
		if (name) decrypt(name, 260);
	});
}
