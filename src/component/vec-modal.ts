import functionPlot, { Chart, FunctionPlotOptions } from "function-plot";
import { App, Modal, Notice, Setting, TextComponent } from "obsidian";

const DEFAULT_VEC_OPTIONS: FunctionPlotOptions = {
	target: "vec-plot-preview",
	grid: true,
	data: [
		{
			offset: [0, 0],
			graphType: "polyline",
			fnType: "vector",
		},
	],
};

export class VecModal extends Modal {
	options: FunctionPlotOptions;
	plot: Chart;
	container: HTMLDivElement;
	vecsContainer: HTMLDivElement;
	previewContainer: HTMLDivElement;

	constructor(app: App) {
		super(app);
		this.options = DEFAULT_VEC_OPTIONS;
	}

	onOpen(): void {
		this.displayHeading();
		this.createContainers();
		this.initSettings();
	}

	private displayHeading() {
		const heading = this.contentEl.createEl("h1");
		heading.setText("2D Vector Plot");
		heading.setCssStyles({ paddingBottom: "1rem" });
	}

	private createContainers() {
		this.container = this.contentEl.createDiv();
		this.previewContainer = this.contentEl.createDiv();
		this.options.target = this.previewContainer;
		this.container.setCssStyles({
			display: "flex",
			alignItems: "left",
			flexDirection: "column",
		});
	}

	private createSetting(name: string, container: HTMLElement) {
		return new Setting(container).setName(name);
	}

	private initSettings() {
		this.createSetting("Title", this.container).addText((text) => {
			text.onChange((title) => {
				this.options.title = title;
				this.preview()
			});
		});

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
					this.options.yAxis = { label };
				}

		this.createSetting("X/Y Bounds", this.container).addText((text) => {
			text.setPlaceholder("minX,maxX,minY,maxY");
			text.onChange(() => this.setBounds(text));
		});


		});

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
