import { suggestCommand } from "./scripts.js";

// Stable 7-char "commit hash" derived from an id (FNV-1a)
function shortHash(text) {
	let h = 0x811c9dc5;
	for (const c of text) {
		h ^= c.codePointAt(0);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h.toString(16).padStart(8, "0").slice(0, 7);
}

const HEAD_REF = ` <span class="commit-ref">(<span class="ref-head">HEAD -&gt; </span><span class="ref-branch">main</span>)</span>`;

function escapeHtml(value) {
	return value.replace(/[&<>"']/g, (character) => {
		const entities = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return entities[character];
	});
}

class ListCommands {
	constructor(content, config) {
		this.content = content;
		this.config = config;
		this.outputArea = `
			<div><p class="sub-heading fancy-3d flicker">${config.title}</p></div>
		`;
	}

	hint() {
		const { command, example } = this.config;
		return `
			<p class="git-hint">
				hint: run <span class="clickable">${command} ${example}</span> to see one in full<br />
				hint: or type "${command} &lt;name&gt;" for any of the above
			</p><br />`;
	}

	async getItem(itemName) {
		const items = await this.getItems();
		const match = items.find(
			(item) => item.itemId.toLowerCase() === itemName.toLowerCase(),
		);
		if (match) {
			const item = Array.from(
				this.content.querySelectorAll(
					`.frames .${this.config.itemClass}.hidden`,
				),
			).find((element) => element.id === match.itemId);
			if (!item) {
				throw new Error(
					`fatal: ambiguous argument '${escapeHtml(itemName)}': unknown revision.`,
				);
			}
			item.classList.remove("hidden");
			const header = this.config.renderHeader?.(item) ?? "";
			const footer = this.config.renderFooter?.(item) ?? "";
			this.outputArea = header + item.outerHTML + footer;
			return this.outputArea;
		}

		const safeName = escapeHtml(itemName);
		const suggestion = suggestCommand(
			itemName,
			items.map((item) => item.itemId),
		);
		const suggestionHint = suggestion
			? `<br />hint: did you mean <span class="clickable"><span class="hidden">${this.config.command} </span>${suggestion}</span>?`
			: "";
		if (this.config.command === "projects") {
			throw new Error(
				`GraphQL: Could not resolve to a Repository with the name 'MZaFaRM/${safeName}'.${suggestionHint}`,
			);
		}
		throw new Error(
			`fatal: ambiguous argument '${safeName}': unknown revision.${suggestionHint}`,
		);
	}

	async listItems() {
		const items = await this.getItems();
		return this.config.renderList(items) + this.hint();
	}

	async getItems() {
		try {
			const itemElements = this.content.querySelectorAll(
				`.frames .${this.config.itemClass}`,
			);
			return Array.from(itemElements, (element) => {
				const descriptionElement = element.querySelector(".description");
				const description = descriptionElement
					? descriptionElement.textContent.replace(
							/^[\n* *: *]+|[ *: *]+$/g,
							"",
						)
					: "";
				return {
					itemId: element.id,
					description,
				};
			});
		} catch (error) {
			console.error(`Error processing ${this.config.itemLabel}s:`, error);
			return [];
		}
	}
}

export class Projects extends ListCommands {
	constructor(content) {
		super(content, {
			title: "projects_",
			command: "projects",
			itemLabel: "project",
			itemClass: "project",
			example: "datasmith",
			renderList: (items) => `
				<p class="gh-meta">Showing ${items.length} of ${items.length} repositories in @MZaFaRM</p>
				<table class="gh-list">
					<thead><tr class="gh-head">
						<th>NAME</th><th>DESCRIPTION</th><th class="gh-info">INFO</th>
					</tr></thead>
					<tbody>${items
						.map(
							(item) => `
							<tr>
								<td><span class="clickable"><span class="hidden">projects </span>${item.itemId}</span></td>
								<td>${item.description}</td>
								<td class="gh-info">public</td>
							</tr>`,
						)
						.join("")}</tbody>
				</table>`,
			renderFooter: () => `<p><span class="pager-end">(END)</span></p>`,
		});
	}
}

export class Experience extends ListCommands {
	constructor(content) {
		super(content, {
			title: "experience_",
			command: "experience",
			itemLabel: "experience",
			itemClass: "experience",
			example: "SnapshareAI",
			renderList: (items) => `
				<p class="git-log">
					${items
						.map(
							(item, index) => `
							<span class="git-graph">*</span>
							<span class="commit-hash">${shortHash(item.itemId)}</span>${index === 0 ? HEAD_REF : ""}
							<span class="clickable"><span class="hidden">experience </span>${item.itemId}</span>
							${item.description}`,
						)
						.join("<br />")}
				</p>`,
			renderHeader: (element) => `
				<p class="git-show">
					<span class="commit-hash">commit ${shortHash(element.id)}</span>${element === element.parentElement.firstElementChild ? HEAD_REF : ""}<br />
					Author: Muhammed Zafar &lt;muhammedzafar.mm@gmail.com&gt;<br />
					Date:&nbsp;&nbsp;&nbsp;${element.dataset.when ?? ""}
				</p>`,
		});
	}
}
