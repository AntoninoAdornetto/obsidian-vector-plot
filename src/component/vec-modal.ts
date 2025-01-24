import { Chart, FunctionPlotOptions } from "function-plot";
import { App, Modal, Setting, TextComponent } from "obsidian";

const DEFAULT_VEC_OPTIONS: FunctionPlotOptions = {
	target: "vec-plot-preview",
	grid: true,
	data: [
		{
			graphType: 'polyline',
			fnType: 'vector',
		}
	]
}

export class VecModal extends Modal {
	options: FunctionPlotOptions;
	plot: Chart;

	container: HTMLDivElement;
	vecsContainer: HTMLDivElement;
	previewContainer: HTMLDivElement;

	vectorCount: number;

	constructor(app: App) {
		super(app);
		this.vectorCount = 0;
		this.options = DEFAULT_VEC_OPTIONS;
	}

	onOpen(): void {
		this.displayHeading();
		this.createContainers();
		this.initSettings();
	}

	displayHeading() {
		const heading = this.contentEl.createEl("h1");
		heading.setText("Plot 2d Vector");
		heading.setCssStyles({ paddingBottom: "1rem" });
	}

	createContainers() {
		this.container = this.contentEl.createDiv();
		this.container.setCssStyles({ display: "flex", alignItems: "left", flexDirection: "column" });
		this.previewContainer = this.contentEl.createDiv();
		this.options.target = this.previewContainer;
	}

	createSetting(name: string, container: HTMLElement) {
		return new Setting(container).setName(name);
	}

	initSettings() {
		this.createSetting("Title", this.container).addText((text) => {
			text.onChange((title) => {
				this.options.title = title;
			})
		})

		this.createSetting("X Axis Label", this.container).addText((text) => {
			text.onChange((label) => {
				if (this.options.xAxis) {
					this.options.xAxis.label = label;
				} else {
					this.options.xAxis = { label };
				}
			})
		})

		this.createSetting("Y Axis Label", this.container).addText((text) => {
			text.onChange((label) => {
				if (this.options.yAxis) {
					this.options.yAxis.label = label;
				} else {
					this.options.yAxis = { label }
				}
			})
		})

		this.createSetting("X/Y Bounds", this.container).addText((text) => {
			text.setPlaceholder("minX,maxX,minY,maxY");
			text.onChange(() => this.setBounds(text));
		})


		this.createSetting("Vectors", this.container).addButton((btn) => {
			btn.setButtonText("Add Vector")
			btn.onClick(() => this.appendVec(this.vectorCount));
		})
	}

	appendVec(index: number) {
		this.createSetting(`Vector ${this.vectorCount}`, this.container).addText((text) => {
			text.setPlaceholder("x,y");
			text.onChange(() => {
				const { data } = this.options;
				const vec = this.parseInputNumbers(text);
				if (vec.length != 2) {
					return;
				}

				const [x, y] = vec;
				if (data?.[index] != null) {
					data[index].vector = [x, y]
				} else {
					data?.push({
						vector: [x, y],
						graphType: 'polyline',
						fnType: 'vector',

					})
				}

				console.log(this.options);
			})
		});

		this.createSetting(`Offset ${this.vectorCount}`, this.container).addText((text) => {
			text.setPlaceholder("x,y");
			text.onChange(() => {
				const { data } = this.options;
				const offset = this.parseInputNumbers(text);
				if (offset.length != 2) {
					return;
				}

				const [x, y] = offset;
				if (data?.[index] != null) {
					data[index].offset = [x, y]
				} else {
					data?.push({
						offset: [x, y],
						graphType: 'polyline',
						fnType: 'vector',
					})
				}

				console.log(this.options);
			})
		});

		this.vectorCount = this.options.data?.length ?? 0;
	}

	parseInputNumbers(text: TextComponent) {
		return text.getValue().split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
	}

	setBounds(text: TextComponent) {
		const bounds = this.parseInputNumbers(text);
		if (bounds.length < 4) {
			return;
		}

		const [minX, maxX, minY, maxY] = bounds;

		if (this.options.xAxis) {
			this.options.xAxis.domain = [minX, maxX];
		}

		if (this.options.yAxis) {
			this.options.yAxis.domain = [minY, maxY];
		}
	}
}
