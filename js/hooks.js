export function getCurrentTime() {
	return new Date().toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});
}

export function getUptime() {
	const uptime = performance.now();
	const minutes = Math.floor(uptime / 60000);
	const seconds = Math.floor((uptime % 60000) / 1000);

	let uptimeTime;
	if (minutes > 0) {
		uptimeTime = `${minutes}m ${seconds}s`;
	} else {
		uptimeTime = `${seconds}s`;
	}
	return uptimeTime;
}

const glitchGroups = [
	["a", "4", "@", "∂", "A", "∆"],
	["b", "8", "6", "ß", "B"],
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
	document.querySelectorAll(".fancy-3d").forEach((el) => {
		if (Math.random() > 0.5) return;

		const current = el.textContent;
		const currentChars = [...current];
		const glitchable = currentChars
			.map((c, i) => (glitchGroups.find((g) => g.includes(c)) ? i : null))
			.filter((i) => i !== null);

		if (glitchable.length === 0) return;

		const idx = glitchable[Math.floor(Math.random() * glitchable.length)];
		const group = glitchGroups.find((g) => g.includes(currentChars[idx]));

		const cycles = 5 + Math.floor(Math.random() * 5);
		let i = 0;

		const interval = setInterval(() => {
			const tempChars = [...currentChars];
			tempChars[idx] = group[Math.floor(Math.random() * group.length)];
			el.textContent = tempChars.join("");
			i++;

			if (i >= cycles) {
				clearInterval(interval);
				const original = currentChars[idx];
				const candidates = group.filter((c) => c !== original);
				const settled =
					candidates[Math.floor(Math.random() * candidates.length)];
				const finalChars = [...currentChars];
				finalChars[idx] = settled;
				el.textContent = finalChars.join("");

				if (Math.random() > 0.5) {
					setTimeout(
						() => {
							el.textContent = current;
						},
						Math.random() * 150 + 80,
					);
				}
			}
		}, 40);
	});

	// Adjust to fix frequency of glitches (currently set to glitch every 3-11 seconds)
	setTimeout(randomGlitch, Math.random() * 8000 + 3000);
}

function randomFlicker() {
	document.querySelectorAll(".fancy-3d").forEach((el) => {
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

randomFlicker();
randomGlitch();

setInterval(() => {
	document.querySelector("#uptime").textContent = `up ${getUptime()}`;
	document.querySelector("#clock").textContent = getCurrentTime();
}, 1000);
