import * as React from "react";
import * as ReactDOM from "react-dom";

import { DocubricksProject } from "./docubricksViewer";
import * as Docubricks from "./docubricks";

//alert(getQueryStringValue("id")); 


var s= document.getElementById("hiddendata").textContent;
document.getElementById("hiddendata").textContent="";
var docu = Docubricks.docubricksFromJSON(s);

ReactDOM.render(
    <DocubricksProject proj={docu}/>,
    document.getElementById("example")
);
