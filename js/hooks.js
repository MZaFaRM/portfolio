export function getCurrentTime() {
	return new Date().toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});
}

export function getIdleTime() {
	const idle = performance.now();
	const minutes = Math.floor(idle / 60000);
	const seconds = Math.floor((idle % 60000) / 1000);

	let idleTime;
	if (minutes > 0) {
		idleTime = `${minutes}m ${seconds}s`;
	} else {
		idleTime = `${seconds}s`;
	}
	return idleTime;
}

function getBrowser() {
	const ua = navigator.userAgent;
	const browser = (() => {
		if (ua.includes("Edg")) return "Edge";
		if (ua.includes("Chrome")) return "Chrome";
		if (ua.includes("Firefox")) return "Firefox";
		if (ua.includes("Safari")) return "Safari";
		return "Unknown";
	})();

	return `󰛳 ${browser}`;
}

const browser = getBrowser();

setInterval(() => {
	document.querySelector(".idle").textContent = `idle ${getIdleTime()}`;
	document.querySelector(".clock").textContent = getCurrentTime();
	document.querySelectorAll(".browser").forEach((el) => {
		el.textContent = browser;
	});
}, 1000);
