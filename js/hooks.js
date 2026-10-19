export function getCurrentTime() {
	const time = new Date().toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	return { verbose: `at ${time}`, compact: `${time}` };
}

export function getUptime() {
	const uptime = performance.now();

	const minutes = Math.floor(uptime / 60000);
	const seconds = Math.floor((uptime % 60000) / 1000);

	let verbose;
	if (minutes > 0) {
		verbose = `up ${minutes}m ${seconds}s`;
	} else {
		verbose = `up ${seconds}s`;
	}

	const compact = `${Math.floor(uptime / 1000)}s`;
	return { verbose, compact };
}

const glitchGroups = [
	["a", "4", "@", "∂", "A", "∆"],
	["b", "6", "ß", "B"],
	["c", "ç", "¢", "ć", "č", "C", "Ç"],
	["d", "∂", "đ", "ď", "D", "Đ"],
	["e", "3", "€", "ε", "E", "Ɛ"],
	["f", "ƒ", "F"],
	["g", "9", "6", "G"],
	["h", "ħ", "H", "Ħ"],
	["i", "1", "!", "|", "I", "l"],
	["j", "ĵ", "J", "Ĵ"],
	["k", "κ", "K"],
	["l", "1", "|", "ł", "L", "Ł"],
	["m", "m", "M", "ℳ"],
	["n", "η", "N"],
	["o", "0", "ø", "ο", "O", "Ø"],
	["p", "ρ", "þ", "P", "Þ"],
	["q", "φ", "Q"],
	["r", "ɾ", "ř", "R", "Ř"],
	["s", "5", "$", "§", "S"],
	["t", "7", "+", "T"],
	["u", "υ", "µ", "U"],
	["v", "ν", "√", "V"],
	["w", "ω", "W", "Ω"],
	["x", "×", "χ", "X"],
	["y", "γ", "ý", "Y", "Ý", "¥"],
	["z", "2", "ζ", "Z", "Ƶ"],
];

function randomGlitch() {
	document.querySelectorAll(".glitch").forEach((el) => {
		if (!el.dataset.original) el.dataset.original = el.textContent;
		const original = el.dataset.original;
		const originalChars = [...original];

		if (Math.random() > 0.7) return;

		const glitchable = originalChars
			.map((c, i) => (glitchGroups.find((g) => g.includes(c)) ? i : null))
			.filter((i) => i !== null);

		if (glitchable.length === 0) return;

		const idx = glitchable[Math.floor(Math.random() * glitchable.length)];
		// Group is always derived from the original character, never the live one
		const group = glitchGroups.find((g) => g.includes(originalChars[idx]));

		const cycles = 5 + Math.floor(Math.random() * 5);
		let i = 0;

		const interval = setInterval(() => {
			const tempChars = [...originalChars];
			tempChars[idx] = group[Math.floor(Math.random() * group.length)];
			el.textContent = tempChars.join("");
			i++;

			if (i >= cycles) {
				clearInterval(interval);

				// Pick any character from the group for the settled state
				const candidates = group.filter(
					(c) => c !== originalChars[idx],
				);
				const settled =
					candidates[Math.floor(Math.random() * candidates.length)];
				const settledChars = [...originalChars];
				settledChars[idx] = settled;
				el.textContent = settledChars.join("");

				// Restore to original after a brief moment
				setTimeout(
					() => {
						el.textContent = original;
					},
					Math.random() * 150 + 80,
				);
			}
		}, 40);
	});

	setTimeout(randomGlitch, Math.random() * 8000 + 3000);
}

function randomFlicker() {
	document.querySelectorAll(".flicker").forEach((el) => {
		el.style.opacity = (Math.random() * 0.4 + 0.6).toFixed(2);
		setTimeout(
			() => {
				el.style.opacity = 1;
			},
			Math.random() * 100 + 30,
		);

		if (Math.random() > 0.7) {
			setTimeout(
				() => {
					el.style.opacity = 0.7;
					setTimeout(() => (el.style.opacity = 1), 50);
				},
				Math.random() * 150 + 100,
			);
		}
	});

	setTimeout(randomFlicker, Math.random() * 5000 + 1000);
}

document.addEventListener("click", (event) => {
	const portrait = event.target.closest?.(".portrait");
	if (!portrait) return;
	const raw = portrait.getAttribute("aria-pressed") !== "true";
	portrait.setAttribute("aria-pressed", String(raw));
	portrait.setAttribute("aria-label", raw ? "Show ASCII portrait" : "Show photo");
});

function glitchRevealWord(li, word, currentHTML, onComplete) {
	const glitchCycles = 3 + Math.floor(Math.random() * 3);
	let i = 0;

	const interval = setInterval(() => {
		const glitched = [...word]
			.map((c) => {
				const group = glitchGroups.find((g) => g.includes(c));
				return group
					? group[Math.floor(Math.random() * group.length)]
					: c;
			})
			.join("");
		li.innerHTML = currentHTML + glitched;
		i++;

		if (i >= glitchCycles) {
			clearInterval(interval);
			li.innerHTML = currentHTML + word;
			onComplete();
		}
	}, 40);
}

randomFlicker();
randomGlitch();

const BIRTH_DATE = new Date(2003, 6, 23);
const WORK_STINTS = [
	[new Date(2023, 0, 1), new Date(2024, 1, 1)], // MuLearn: Jan 2023 to end of Jan 2024
	[new Date(2025, 8, 1), null], // Snapshare: Sep 2025 to now
];

export function getCareer() {
	const now = new Date();
	const worked = WORK_STINTS.reduce(
		(total, [start, end]) => total + ((end ?? now) - start),
		0,
	);
	return elapsedSince(new Date(now - worked), now);
}

// Calendar-accurate time since `start`, as "1y 2m 3d 4h 5m 6s"
function elapsedSince(start, now = new Date()) {
	let totalMonths =
		(now.getFullYear() - start.getFullYear()) * 12 +
		(now.getMonth() - start.getMonth());

	const anchor = new Date(start);
	anchor.setMonth(start.getMonth() + totalMonths);
	if (anchor > now) {
		totalMonths--;
		anchor.setTime(start.getTime());
		anchor.setMonth(start.getMonth() + totalMonths);
	}

	const years = Math.floor(totalMonths / 12);
	const months = totalMonths % 12;
	const rest = now - anchor;
	const days = Math.floor(rest / 86_400_000);
	const hours = Math.floor((rest % 86_400_000) / 3_600_000);
	const minutes = Math.floor((rest % 3_600_000) / 60_000);
	const seconds = Math.floor((rest % 60_000) / 1000);

	return `${years}y ${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getAge() {
	const now = new Date();
	const isBirthday =
		now.getMonth() === BIRTH_DATE.getMonth() &&
		now.getDate() === BIRTH_DATE.getDate();
	return `${elapsedSince(BIRTH_DATE, now)}${isBirthday ? " <span style='color: #fcce7b'></span>" : ""}`;
}

setInterval(() => {
	const { verbose: uptimeVerbose, compact: uptimeCompact } = getUptime();
	const uptimeVerboseEl = document.querySelector("#uptime-verbose");
	const uptimeEl = document.querySelector("#uptime");
	if (uptimeVerboseEl) uptimeVerboseEl.textContent = uptimeVerbose;
	if (uptimeEl) uptimeEl.textContent = uptimeCompact;

	const { verbose: timeVerbose, compact: timeCompact } = getCurrentTime();
	const clockVerboseEl = document.querySelector("#clock-verbose");
	const clockEl = document.querySelector("#clock");
	if (clockVerboseEl) clockVerboseEl.textContent = timeVerbose;
	if (clockEl) clockEl.textContent = timeCompact;

	document.querySelectorAll(".age").forEach((el) => {
		el.innerHTML = getAge();
	});
	document.querySelectorAll(".career").forEach((el) => {
		el.textContent = getCareer();
	});
}, 1000);

document.addEventListener("keydown", (event) => {
	const inputElement = document.getElementById("prompt-input");
	if (
		event.key.match(/^[a-zA-Z]$/) &&
		!event.ctrlKey &&
		!event.metaKey &&
		inputElement !== document.activeElement
	) {
		inputElement.focus();
	}
});
