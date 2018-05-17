export class AggregateMapService {
    constructor(dialogService) {
        this.dialogService = dialogService;
    }
    aggregateMaps(inputMaps) {
        if (inputMaps.length == 1)
            return inputMaps[0];
        let projectNameArray = [];
        let fileNameArray = [];
        for (let inputMap of inputMaps) {
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
        }
        let outputMap = {};
        outputMap.projectName = "Aggregation of following projects: " + projectNameArray.join(", ");
        outputMap.fileName = "Aggregation of following files: " + fileNameArray.join(", ");
        outputMap.root = {};
        outputMap.root.name = "root";
        outputMap.root.children = [];
        for (let inputMap of inputMaps) {
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }
        return outputMap;
    }
    convertMapToNode(inputCodeMap) {
        let outputNode = {
            name: inputCodeMap.projectName
        };
        for (let property in inputCodeMap.root) {
            if (property == "children")
                outputNode[property] = JSON.parse(JSON.stringify(inputCodeMap.root.children));
            else if (property == "path")
                outputNode[property] = this.updatePath(inputCodeMap.projectName, inputCodeMap.root.path);
            else
                outputNode[property] = inputCodeMap.root[property];
        }
        this.updatePathOfAllChildren(inputCodeMap.projectName, outputNode.children);
        return outputNode;
    }
    updatePathOfAllChildren(projectName, children) {
        for (let i = 0; i < children.length; i++) {
            children[i].path = this.updatePath(projectName, children[i].path);
            if (children[i].children) {
                this.updatePathOfAllChildren(projectName, children[i].children);
            }
        }
    }
    updatePath(projectName, path) {
        let subPath = path.substring(6, path.length);
        let slash = (subPath.length > 0) ? "/" : "";
        return "/root/" + projectName + slash + subPath;
    }
}
AggregateMapService.SELECTOR = "aggregateMapService";
//# sourceMappingURL=aggregate.service.js.map