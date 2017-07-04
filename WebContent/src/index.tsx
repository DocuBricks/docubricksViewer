import * as React from "react";
import * as ReactDOM from "react-dom";

import { DocubricksProject } from "./docubricksViewer";
import * as Docubricks from "./docubricks";

const request = require('browser-request');

//alert(getQueryStringValue("id")); 

try{
    var s= document.getElementById("hiddendata").textContent;
    document.getElementById("hiddendata").textContent="";
    var docu = Docubricks.docubricksFromJSON(s);

    ReactDOM.render(
        <DocubricksProject proj={docu}/>,
        document.getElementById("example")
    );
}catch(e){
    var f = document.getElementById("docubricks_xml_url").textContent;
    document.getElementById("docubricks_xml_url").textContent="";

    request(f, function(error: any, response: any, body: any){
        console.log('statusCode retrieving XML file:',response && response.statusCode);
        console.log('error:',error);


    	Docubricks.docubricksFromXML(body, function(docu){
            ReactDOM.render(
                <DocubricksProject proj={docu}/>,
                document.getElementById("example")
            );
        });
    });
}