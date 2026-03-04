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

setInterval(() => {
	document.querySelector("#idle").textContent = `idle ${getIdleTime()}`;
	document.querySelector("#clock").textContent = getCurrentTime();
}, 1000);
