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
				this.preview();
			});
		});

		this.createSetting("X Axis Label", this.container).addText((text) => {
			text.onChange((label) => {
				if (this.options.xAxis) {
					this.options.xAxis.label = label;
				} else {
					this.options.xAxis = { label };
				}
				this.preview();
			});
		});

		this.createSetting("Y Axis Label", this.container).addText((text) => {
			text.onChange((label) => {
				if (this.options.yAxis) {
					this.options.yAxis.label = label;
				} else {
					this.options.yAxis = { label };
				}
				this.preview();
			});
		});

		this.createSetting("X/Y Bounds", this.container).addText((text) => {
			text.setPlaceholder("minX,maxX,minY,maxY");
			text.onChange(() => this.setBounds(text));
		});

		this.createSetting("Vector", this.container).addText((text) => {
			text.setPlaceholder("x, y");
			text.onChange(() => this.setVec(text));
		});

		this.createSetting("Offset", this.container).addText((text) => {
			text.setPlaceholder("num1, num2, num3...");
			text.onChange(() => this.setOffset(text));
		});
	}

	private setVec(text: TextComponent) {
		const vec = this.parseInputNumbers(text);
		switch (vec.length) {
			case 0:
			case 1:
				return;
			case 2:
				if (this.options.data) {
					this.options.data[0].vector = [vec[0], vec[1]];
				}
				this.preview();
				return;
			default:
				new Notice("Vector should contain 2 integers or 2 floating point numbers");
		}
	}

	private setOffset(text: TextComponent) {
		const offset = this.parseInputNumbers(text);
		if (!offset.length && this.options.data) {
			return;
		}

		if (this.options.data) {
			this.options.data[0].offset = offset;
		}

		this.preview();
	}

	private parseInputNumbers(text: TextComponent) {
		return text
			.getValue()
			.split(",")
			.map((n) => parseFloat(n.trim()))
			.filter((n) => !isNaN(n));
	}

	private setBounds(text: TextComponent) {
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

		this.preview();
	}

	/*
	 * @TODO: debounce/timeout when plotting the vector preview
	 * If the user is swiftly adding vector plot options, we do not
	 * want to rebuild the plot on each key press. The better approach
	 * is to wait some amount of time, and then display the preview.
	 * */
	private preview() {
		try {
			this.plot = functionPlot(this.options);
			this.plot != null && this.plot.build();
		} catch (err) {
			console.debug(err);
		}
	}
}
