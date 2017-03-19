"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const docubricksViewer_1 = require("./docubricksViewer");
const Docubricks = require("./docubricks");
var s = document.getElementById("hiddendata").textContent;
document.getElementById("hiddendata").textContent = "";
var docu = Docubricks.docubricksFromJSON(s);
ReactDOM.render(React.createElement(docubricksViewer_1.DocubricksProject, { proj: docu }), document.getElementById("example"));
//# sourceMappingURL=index.js.map