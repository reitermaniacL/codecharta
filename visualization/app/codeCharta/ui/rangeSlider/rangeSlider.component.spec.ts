import "./rangeSlider.module"

import { RangeSliderController } from "./rangeSlider.component"
import { MetricService } from "../../state/metric.service"
import { FileStateService } from "../../state/fileState.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { StoreService } from "../../state/store.service"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { setWhiteColorBuildings } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.actions"
import { setInvertColorRange } from "../../state/store/appSettings/invertColorRange/invertColorRange.actions"
import { FileSelectionState, FileState, MapColors } from "../../codeCharta.model"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { InvertColorRangeService } from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { WhiteColorBuildingsService } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { TEST_FILE_DATA } from "../../util/dataMocks"
import { FileStateHelper } from "../../util/fileStateHelper"

describe("RangeSliderController", () => {
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let storeService: StoreService
	let fileStateService: FileStateService
	let metricService: MetricService
	let rangeSliderController: RangeSliderController

	let mapColors: MapColors
	let fileStates: FileState[]

	function rebuildController() {
		rangeSliderController = new RangeSliderController($rootScope, $timeout, storeService, fileStateService, metricService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.rangeSlider")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")
		fileStateService = getService<FileStateService>("fileStateService")
		metricService = getService<MetricService>("metricService")

		mapColors = storeService.getState().appSettings.mapColors
		fileStates = [
			{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.Single },
			{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.None }
		]
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedMetricService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function withMockedMetricService() {
		metricService = rangeSliderController["metricService"] = jest.fn().mockReturnValue({
			getMaxMetricByMetricName: jest.fn().mockReturnValue(100),
			getMetricData: jest.fn().mockReturnValue({})
		})()
	}

	describe("constructor", () => {
		it("should subscribe to ColorMetricService", () => {
			ColorMetricService.subscribe = jest.fn()

			rebuildController()

			expect(ColorMetricService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})

		it("should subscribe to ColorRangeService", () => {
			ColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(ColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})

		it("should subscribe to InvertColorRangeService", () => {
			InvertColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(InvertColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})

		it("should subscribe to WhiteColorBuildingsService", () => {
			WhiteColorBuildingsService.subscribe = jest.fn()

			rebuildController()

			expect(WhiteColorBuildingsService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})

		it("should subscribe to FileStateService", () => {
			FileStateService.subscribe = jest.fn()

			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, rangeSliderController)
		})
	})

	describe("onColorMetricChanged", () => {
		it("should set maxMetricValue", () => {
			rangeSliderController["_viewModel"].sliderOptions.ceil = undefined

			rangeSliderController.onColorMetricChanged("myMetric")

			expect(rangeSliderController["_viewModel"].sliderOptions.ceil).toEqual(100)
		})
	})

	describe("onInvertColorRangeChanged", () => {
		it("should set the maxMetricValue", () => {
			rangeSliderController["updateSliderColors"] = jest.fn()

			rangeSliderController.onInvertColorRangeChanged(false)

			expect(rangeSliderController["updateSliderColors"]).toHaveBeenCalled()
		})
	})

	describe("onWhiteColorBuildingsChanged", () => {
		it("should set the maxMetricValue", () => {
			rangeSliderController["updateSliderColors"] = jest.fn()

			rangeSliderController.onWhiteColorBuildingsChanged(false)

			expect(rangeSliderController["updateSliderColors"]).toHaveBeenCalled()
		})
	})

	describe("onColorRangeChanged", () => {
		it("should update the viewModel", () => {
			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			expect(rangeSliderController["_viewModel"].colorRangeFrom).toBe(10)
			expect(rangeSliderController["_viewModel"].colorRangeTo).toBe(30)
		})

		it("should init the slider options when metric data is available", () => {
			const expected = {
				ceil: 100,
				onChange: () => rangeSliderController["updateSliderColors"],
				pushRange: true,
				disabled: false
			}

			rangeSliderController.onColorMetricChanged("mcc")

			setTimeout(() => {
				expect(JSON.stringify(rangeSliderController["_viewModel"].sliderOptions)).toEqual(JSON.stringify(expected))
			})
		})

		it("should set grey colors when slider is disabled", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(true)
			const expected = { left: mapColors.lightGrey, middle: mapColors.lightGrey, right: mapColors.lightGrey }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			setTimeout(() => {
				expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
			})
		})

		it("should set standard colors", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			const expected = { left: mapColors.positive, middle: mapColors.neutral, right: mapColors.negative }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			setTimeout(() => {
				expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
			})
		})

		it("should set grey positive color when positive buildings are white", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			storeService.dispatch(setWhiteColorBuildings(true))
			const expected = { left: mapColors.lightGrey, middle: mapColors.neutral, right: mapColors.negative }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			setTimeout(() => {
				expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
			})
		})

		it("should set inverted color slider", () => {
			rangeSliderController["applyCssColors"] = jest.fn()
			storeService.dispatch(setInvertColorRange(true))
			const expected = { left: mapColors.negative, middle: mapColors.neutral, right: mapColors.positive }

			rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

			setTimeout(() => {
				expect(rangeSliderController["applyCssColors"]).toHaveBeenCalledWith(expected, 10)
			})
		})

		describe("updateSliderColors", () => {
			beforeEach(() => {
				rangeSliderController["applyCssColors"] = jest.fn()
				rangeSliderController["getColoredRangeColors"] = jest.fn()
				rangeSliderController["getGreyRangeColors"] = jest.fn()
			})

			describe("single state", () => {
				beforeEach(() => {
					fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)
				})

				it("should set sliderOptions.disabled to false", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

					setTimeout(() => {
						expect(rangeSliderController["_viewModel"].sliderOptions.disabled).toBeFalsy()
					})
				})

				it("should set sliders with range colors", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

					setTimeout(() => {
						expect(rangeSliderController["getColoredRangeColors"]).toHaveBeenCalled()
						expect(rangeSliderController["getGreyRangeColors"]).not.toHaveBeenCalled()
					})
				})
			})

			describe("delta state", () => {
				beforeEach(() => {
					fileStates[0].selectedAs = FileSelectionState.Reference
					fileStates[1].selectedAs = FileSelectionState.Comparison
					fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)
				})

				it("should set sliderOptions.disabled to true", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

					setTimeout(() => {
						expect(rangeSliderController["_viewModel"].sliderOptions.disabled).toBeTruthy()
					})
				})

				it("should set sliders with grey colors", () => {
					rangeSliderController.onColorRangeChanged({ from: 10, to: 30 })

					setTimeout(() => {
						expect(rangeSliderController["getColoredRangeColors"]).not.toHaveBeenCalled()
						expect(rangeSliderController["getGreyRangeColors"]).toHaveBeenCalled()
					})
				})
			})
		})
	})

	describe("onFileStatesChanged", () => {
		it("should set maxMetricValue", () => {
			rangeSliderController["_viewModel"].sliderOptions.ceil = undefined

			rangeSliderController.onFileStatesChanged(fileStates)

			expect(rangeSliderController["_viewModel"].sliderOptions.ceil).toEqual(100)
		})

		it("should set sliderOptions.disabled", () => {
			rangeSliderController["_viewModel"].sliderOptions.disabled = undefined

			rangeSliderController.onFileStatesChanged(fileStates)

			setTimeout(() => {
				expect(rangeSliderController["_viewModel"].sliderOptions.disabled).toEqual(false)
			})
		})
	})
})
