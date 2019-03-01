import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./rangeSlider.component.scss"
import { MapColors } from "../codeMap/rendering/renderSettings"
import $ from "jquery"
import { Settings, RenderMode, RecursivePartial } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { MetricCalculator } from "../../MetricCalculator";

export class RangeSliderController implements SettingsServiceSubscriber {
	public sliderOptions: any
	private maxMetricValue: number

	private _viewModel = {
		colorRangeFrom: null,
		colorRangeTo: null
	}

	/* @ngInject */
	constructor(private settingsService: SettingsService, private codeChartaService: CodeChartaService, $timeout, $scope) {
		SettingsService.subscribe($scope, this)
		this.initSliderOptions()

		$timeout(() => {
			$scope.$broadcast("rzSliderForceRender")
		})
	}

	public onSettingsChanged(settings: Settings) {
		// TODO circle ?
		this.initSliderOptions(settings)
		this.updateViewModel(settings)
		this.updateSliderColors()
	}

	private updateViewModel(settings: Settings) {
		this._viewModel.colorRangeFrom = settings.dynamicSettings.neutralColorRange.from
		this._viewModel.colorRangeTo = settings.dynamicSettings.neutralColorRange.to
	}

	public initSliderOptions(settings: Settings = this.settingsService.getSettings()) {
		this.maxMetricValue = MetricCalculator.getMaxMetricInAllRevisions(
			this.codeChartaService.getImportedFiles(),
			settings.dynamicSettings.colorMetric
		)

		this.sliderOptions = {
			ceil: this.maxMetricValue,
			onChange: this.onSliderChange.bind(this),
			pushRange: true,
			onToChange: this.onToSliderChange.bind(this),
			onFromChange: this.onFromSliderChange.bind(this),
			disabled: this.settingsService.getSettings().dynamicSettings.renderMode == RenderMode.Delta
		}
	}

	private onToSliderChange() {
		const update: RecursivePartial<Settings> = {
			dynamicSettings: {
				neutralColorRange: {
					to: Math.min(
						MetricCalculator.getMaxMetricInAllRevisions(
							this.codeChartaService.getImportedFiles(),
							this.settingsService.getSettings().dynamicSettings.colorMetric
						),
						Math.max(1, this._viewModel.colorRangeTo)
					),
					from: Math.min(this._viewModel.colorRangeTo - 1, this._viewModel.colorRangeFrom)
				}
			}
		}

		console.log("hi");
		this.settingsService.updateSettings(update)
	}

	private onFromSliderChange() {
		const update: RecursivePartial<Settings> = {
			dynamicSettings: {
				neutralColorRange: {
					to: Math.max(this._viewModel.colorRangeTo, this._viewModel.colorRangeFrom + 1),
					from: Math.min(
						MetricCalculator.getMaxMetricInAllRevisions(
							this.codeChartaService.getImportedFiles(),
							this.settingsService.getSettings().dynamicSettings.colorMetric
						) - 1,
						this._viewModel.colorRangeFrom
					)
				}
			}
		}

		this.settingsService.updateSettings(update)
	}

	private onSliderChange() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				neutralColorRange: {
					to: this._viewModel.colorRangeTo,
					from: this._viewModel.colorRangeFrom
				}
			}
		})
	}

	private updateSliderColors() {
		const rangeFromPercentage = (100 / this.maxMetricValue) * this._viewModel.colorRangeFrom
		let rangeColors = this.sliderOptions.disabled ? this.getGreyRangeColors() : this.getColoredRangeColors()
		this.applyCssColors(rangeColors, rangeFromPercentage)
	}

	private getGreyRangeColors() {
		return {
			left: MapColors.lightGrey,
			middle: MapColors.lightGrey,
			right: MapColors.lightGrey
		}
	}

	private getColoredRangeColors() {
		const s = this.settingsService.getSettings();
		let mapColorPositive = s.appSettings.whiteColorBuildings ? MapColors.lightGrey : MapColors.positive

		let rangeColors = {
			left: s.dynamicSettings.neutralColorRange.flipped ? MapColors.negative : mapColorPositive,
			middle: MapColors.neutral,
			right: s.dynamicSettings.neutralColorRange.flipped ? mapColorPositive : MapColors.negative
		}
		return rangeColors
	}

	private applyCssColors(rangeColors, rangeFromPercentage) {
		const slider = $("range-slider-component .rzslider")
		const leftSection = slider.find(".rz-bar-wrapper:nth-child(3) .rz-bar")
		const middleSection = slider.find(".rz-selection")
		const rightSection = slider.find(".rz-right-out-selection .rz-bar")

        leftSection.css("cssText", "background: " + rangeColors.left + " !important; width: " + rangeFromPercentage + "%;");
        middleSection.css("cssText", "background: " + rangeColors.middle + " !important;");
        rightSection.css("cssText", "background: " + rangeColors.right + ";");
    }

}

export const rangeSliderComponent = {
	selector: "rangeSliderComponent",
	template: require("./rangeSlider.component.html"),
	controller: RangeSliderController
}
