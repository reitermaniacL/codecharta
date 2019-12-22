import "./codeCharta.module"
import _ from "lodash"
import { IHttpService, ILocationService } from "angular"
import { DialogService } from "./ui/dialog/dialog.service"
import { CodeChartaService } from "./codeCharta.service"
import { CodeChartaController } from "./codeCharta.component"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { State } from "./codeCharta.model"
import { ScenarioHelper } from "./util/scenarioHelper"
import { FileStateService } from "./state/fileState.service"
import { LoadingStatusService } from "./state/loadingStatus.service"
import { InjectorService } from "./state/injector.service"
import { StoreService } from "./state/store.service"
import { setState } from "./state/store/state.actions"
import { STATE } from "./util/dataMocks"

describe("codeChartaController", () => {
	let codeChartaController: CodeChartaController
	let $location: ILocationService
	let $http: IHttpService
	let storeService: StoreService
	let dialogService: DialogService
	let codeChartaService: CodeChartaService
	let fileStateService: FileStateService
	let injectorService: InjectorService
	let loadingStatusService: LoadingStatusService

	let state: State

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedUrlUtils()
		withMockedCodeChartaService()
		withMockedDialogService()
		withMockedScenarioHelper()
		withMockedLoadingStatusService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")

		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		fileStateService = getService<FileStateService>("fileStateService")
		loadingStatusService = getService<LoadingStatusService>("loadingStatusService")
		injectorService = getService<InjectorService>("injectorService")

		state = _.cloneDeep(STATE)
	}

	function rebuildController() {
		codeChartaController = new CodeChartaController(
			$location,
			$http,
			storeService,
			dialogService,
			codeChartaService,
			fileStateService,
			loadingStatusService,
			injectorService
		)
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	function withMockedUrlUtils() {
		codeChartaController["urlUtils"] = jest.fn().mockReturnValue({
			getFileDataFromQueryParam: jest.fn().mockReturnValue(Promise.resolve([])),
			getParameterByName: jest.fn().mockReturnValue(true)
		})()
	}

	function withMockedCodeChartaService() {
		codeChartaService = codeChartaController["codeChartaService"] = jest.fn().mockReturnValue({
			loadFiles: jest.fn().mockReturnValue(Promise.resolve())
		})()
	}

	function withMockedDialogService() {
		dialogService = codeChartaController["dialogService"] = jest.fn().mockReturnValue({
			showErrorDialog: jest.fn()
		})()
	}

	function withMockedScenarioHelper() {
		ScenarioHelper.getDefaultScenario = jest.fn().mockReturnValue({ settings: state })
	}

	function withMockedLoadingStatusService() {
		loadingStatusService = codeChartaController["loadingStatusService"] = jest.fn().mockReturnValue({
			updateLoadingFileFlag: jest.fn(),
			updateLoadingMapFlag: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should set urlUtils", () => {
			rebuildController()

			expect(codeChartaController["urlUtils"]).toBeDefined()
		})

		it("should call updateLoadingFileFlag with true", () => {
			rebuildController()

			expect(loadingStatusService.updateLoadingFileFlag).toHaveBeenCalledWith(true)
		})
	})

	describe("loadFileOrSample", () => {
		beforeEach(() => {
			codeChartaController.tryLoadingSampleFiles = jest.fn()
		})

		it("should call tryLoadingSampleFiles when data is an empty array", async () => {
			await codeChartaController.loadFileOrSample()

			expect(codeChartaController.tryLoadingSampleFiles).toHaveBeenCalled()
		})

		it("should call loadFiles when data is not an empty array", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))

			await codeChartaController.loadFileOrSample()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([{}])
		})

		it("should call storeService.dispatch if loadFiles-Promise resolves", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))
			storeService.dispatch = jest.fn()

			await codeChartaController.loadFileOrSample()

			expect(storeService.dispatch).toHaveBeenCalledWith(setState())
		})
	})

	describe("tryLoadingSampleFiles", () => {
		it("should call getParameterByName with 'file'", () => {
			codeChartaController.tryLoadingSampleFiles()

			expect(codeChartaController["urlUtils"].getParameterByName).toHaveBeenCalledWith("file")
		})

		it("should call showErrorDialog when no file is found", () => {
			const expected = "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."

			codeChartaController.tryLoadingSampleFiles()

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(expected)
		})

		it("should call loadFiles with sample files", () => {
			const expected = [
				{ fileName: "sample1.cc.json", content: require("./assets/sample1.cc.json") },
				{ fileName: "sample2.cc.json", content: require("./assets/sample2.cc.json") }
			]

			codeChartaController.tryLoadingSampleFiles()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith(expected)
		})
	})
})
