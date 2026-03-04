import { suggestCommand } from "./scripts.js";

export class Projects {
	constructor(content) {
		this.content = content;
		this.outputArea = `
											<div>
												<p class="sub-heading fancy-3d flicker">Projects_</p>
												<p>
													Type <span class="clickable">projects &lt;project name&gt;</span>
													command to get more information about a project.
													<br />
													<br />
													Eg: <span class="clickable">projects dataforge</span>
													<br />
													<br />
												</p>
											</div>
											`;
	}

	async getProject(projectName) {
		const projects = await this.getProjects();
		if (
			projects.some(
				(project) =>
					project.projectId.toLowerCase() ===
					projectName.toLowerCase(),
			)
		) {
			let project = this.content.querySelector(
				".frames .project.hidden#" + projectName,
			);
			project.classList.remove("hidden");
			this.outputArea = project.outerHTML;
			return this.outputArea;
		} else {
			const projectElements = this.content.querySelectorAll(
				".frames .project.hidden",
			);
			let projectIds = Object(
				Array.from(projectElements, (element) => element.id),
			);
			const suggestion = suggestCommand(projectName, projectIds);

			let error = `${projectName}: project not found`;
			if (suggestion) {
				error += `; did you mean: <span class="clickable"><span class="hidden">projects </span>${suggestion}</span>?`;
			}
			throw new Error(error);
		}
	}

	async listProjects() {
		let projectsArray = await this.getProjects();
		const projectTag = `<span class="hidden">projects </span>`;
		return projectsArray.reduce((obj, project) => {
			obj[`${projectTag}${project.projectId}`] = project.description;
			return obj;
		}, {});
	}

	async getProjects() {
		try {
			const projectElements =
				this.content.querySelectorAll(".frames .project");

			let projectIds = Array.from(
				projectElements,
				(element) => element.id,
			);
			let projectDesc = Array.from(projectElements, (element) =>
				element.querySelector(".description"),
			);

			return projectIds.map((projectId, index) => {
				const descriptionElement = projectDesc[index];
				const description = descriptionElement
					? descriptionElement.textContent.replace(
							/^[\n* *: *]+|[ *: *]+$/g,
							"",
						)
					: "";

				return { projectId, description };
			});
		} catch (error) {
			console.error("Error processing projects:", error);
			return [];
		}
	}
}
