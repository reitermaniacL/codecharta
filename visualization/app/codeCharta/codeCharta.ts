"use strict";

import "./core/core.module";
import "./ui/ui";
import "./state/state.module";
import "./ui/codeMap/codeMap";

import {codeChartaComponent} from "./codeCharta.component";

import angular from "angular";
import { CodeChartaService } from "./codeCharta.service";
import _ from "lodash";

angular.module(
    "app.codeCharta",
    ["app.codeCharta.state", "app.codeCharta.ui.codeMap"]
);

angular.module("app.codeCharta").component(
    codeChartaComponent.selector,
    codeChartaComponent
).service(
    _.camelCase(CodeChartaService.name),
    CodeChartaService
);


