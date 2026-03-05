import { suggestCommand } from "./scripts.js";

class ListCommands {
	constructor(content, config) {
		this.content = content;
		this.config = config;
		this.outputArea = `
            <div>
                <p class="sub-heading fancy-3d flicker">${config.title}</p>
                <p>
                    Type <span class="clickable">${config.command} &lt;${config.itemLabel} name&gt;</span>
                    command to get more information about one ${config.itemLabel}.
                    <br /><br />
                    Eg: <span class="clickable">${config.command} ${config.example}</span>
                    <br /><br />
                </p>
            </div>
        `;
	}

	async getItem(itemName) {
		const items = await this.getItems();
		if (
			items.some(
				(item) => item.itemId.toLowerCase() === itemName.toLowerCase(),
			)
		) {
			let item = this.content.querySelector(
				`.frames .${this.config.itemClass}.hidden#` + itemName,
			);
			item.classList.remove("hidden");
			this.outputArea = item.outerHTML;
			return this.outputArea;
		} else {
			const itemElements = this.content.querySelectorAll(
				`.frames .${this.config.itemClass}.hidden`,
			);
			let itemIds = Object(
				Array.from(itemElements, (element) => element.id),
			);
			const suggestion = suggestCommand(itemName, itemIds);
			let error = `${itemName}: ${this.config.itemLabel} not found`;
			if (suggestion) {
				error += `; did you mean: <span class="clickable"><span class="hidden">${this.config.command} </span>${suggestion}</span>?`;
			}
			throw new Error(error);
		}
	}

	async listItems() {
		let itemsArray = await this.getItems();
		let tableHtml = `<p>`;
		for (let item of itemsArray) {
			tableHtml += `
					<span class="clickable"
						>${`<span class="hidden">${this.config.command} </span
						>`}${item.itemId}</span
					>
					<br />
					&nbsp;&nbsp;${`${item.description}`}
					<br />
					<br />
      `;
		}

		tableHtml += `</p><br>`;
		return tableHtml;
	}

	async getItems() {
		try {
			const itemElements = this.content.querySelectorAll(
				`.frames .${this.config.itemClass}`,
			);
			let itemIds = Array.from(itemElements, (element) => element.id);
			let itemDescs = Array.from(itemElements, (element) =>
				element.querySelector(".description"),
			);
			return itemIds.map((itemId, index) => {
				const descriptionElement = itemDescs[index];
				const description = descriptionElement
					? descriptionElement.textContent.replace(
							/^[\n* *: *]+|[ *: *]+$/g,
							"",
						)
					: "";
				return { itemId, description };
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
			example: "dataforge",
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
			example: "IEDC",
		});
	}
}
