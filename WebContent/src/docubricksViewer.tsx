import * as React from "react";
import * as Docubricks from "./docubricks";
//import renderHTML from 'react-render-html';
//State is never set so we use the 'undefined' type. //rwb27: what does this comment refer to...??


function renderHTMLFromString(htmlstring: string | Element){
	if(typeof htmlstring === "string"){
		return htmlstring;
	}else if(htmlstring instanceof Element){
		//
	}
}

/**
 * Main component
 */
export interface DocubricksProjectProps { proj: Docubricks.Project;}
export class DocubricksProject extends React.Component<DocubricksProjectProps, undefined> {

    /**
     * Render the tree of bricks
     */
    renderBrickTree(t:[Docubricks.BrickTree]){
        var mnodes:JSX.Element[]=[];
        for(let n of t){
            mnodes.push(this.renderBrickTreeR(n));
        }
        return <ul>{mnodes}</ul>;
    }
    renderBrickTreeR(t:Docubricks.BrickTree){
        var proj:Docubricks.Project=this.props.proj;
        var mnodes:JSX.Element[]=[];
        for(let c of t.children){
            mnodes.push(<li key={"treechild_"+c.brick.id}>{this.renderBrickTreeR(c)}</li>);
        }
        return <div key={"treenode_"+t.brick.id}><a href={"#brick_"+t.brick.id}>{t.brick.name}</a><ul>{mnodes}</ul></div>;
    }



    /**
     * Main rendering function
     */
    render() {
        var proj:Docubricks.Project=this.props.proj;

        document.title="DocuBricks - "+proj.getNameOfProject();

        var brickTree:[Docubricks.BrickTree] = proj.getBrickTree();

        var itemsAuthors:JSX.Element[]=[];
        for(let a of proj.mapAuthors.values()){
            itemsAuthors.push(<Author key={"author_"+a.id} proj={proj} authorid={a.id}/>);
        }

        var itemsBricks:JSX.Element[]=[];
        for(let b of proj.bricks){
            itemsBricks.push(<div key={b.id}> <Brick proj={proj} brickid={b.id}/></div>);
        }

        var itemsParts:JSX.Element[]=[];
        for(let b of proj.mapParts.values()){
            itemsParts.push(<div key={b.id}> <Part proj={proj} partid={b.id}/></div>);
        }

        var itemsTotalBom:JSX.Element[]=[];
        var roots:string[] = proj.getRootBricks();
        if(roots.length>0){
            var root:Docubricks.Brick=proj.getBrickByName(roots[0]);
            var bom:Docubricks.Bom = root.getBom(proj,true);
            itemsTotalBom.push(
                    <div>
                        <div className="divbom">
                            <h1 id="bom">Total bill of materials for this project</h1>
                        </div>
                        <BomList proj={proj} bom={bom}/>
                    </div>);
        } else {
            console.log("no root brick found for bom");
        }

        var projectid:string=getQueryStringValue("id");
        var downloadlink="DownloadZip?id="+projectid;

        return <div className="all">
        <div className="page-container">

            <div className="navbar navbar-default navbar-fixed-top" role="navigation">
               <div className="container">
              <div className="navbar-header">
                   <button type="button" className="navbar-toggle" data-toggle="offcanvas" data-target=".sidebar-nav">
                     <span className="icon-bar"></span>
                     <span className="icon-bar"></span>
                     <span className="icon-bar"></span>
                   </button>
                   <a className="navbar-brand" href="./">DocuBricks</a>
              </div>
               </div>
            </div>

            <div className="container">
              <div className="row row-offcanvas row-offcanvas-left" >

                <div className="col-xs-12 col-sm-4 sidebar-offcanvas no-print" id="sidebar" role="navigation" >
                    <ul className="nav" data-spy="affix">
                      <li><a href={downloadlink}>Download project</a></li>
                      <li><a className="accordion-toggle" id="btn-1" data-toggle="collapse" data-target="#submenu1" aria-expanded="true">Bricks</a>
                        <li className="nav collapse in " id="submenu1" role="menu" aria-labelledby="btn-1">
                          {this.renderBrickTree(brickTree)}
                        </li>
                      </li>
                      <li><a href="#partstart">Parts</a></li>
                      <li><a href="#bom">Bill of materials</a></li>
                      <li><a href="#authors">Authors</a></li>
                    </ul>
                </div>

                <div className="col-xs-12 col-sm-8" id="main-content">
                  <div>
                      <div id="brickstart">
                          {itemsBricks}
                      </div>
                      <div id="partstart">
                          {itemsParts}
                      </div>
                      <div className="brickdiv">
                          <h3 id="authors">Authors</h3>
                      </div>
                      <table>
                          <thead>
                              <tr>
                                  <th>Name</th>
                                  <th>E-mail</th>
                                  <th>Affiliation</th>
                                  <th>ORCID</th>
                              </tr>
                          </thead>
                          <tbody>
                              {itemsAuthors}
                          </tbody>
                      </table>
                      {itemsTotalBom}
                  </div>


                </div>
            </div>
          </div>
        </div>
        </div>;

    }
}










/**
 * One brick
 **/
export interface BrickProps {proj: Docubricks.Project; brickid:string;}
export class Brick extends React.Component<BrickProps, undefined> {
 render() {
     var proj:Docubricks.Project=this.props.proj;
     var brickid:string=this.props.brickid;
     var brick:Docubricks.Brick=proj.getBrickByName(brickid);
     var brickkey="brick"+this.props.brickid;

     const pStyle = {
         textAlign: "left" //text-align
       };

     var mnodes:JSX.Element[]=[];
     var addField=function(name:string,value:string|Array<JSX.Element|string>):void{
         if(value!="")
             mnodes.push(<p key={brickkey+"_"+name}><b>{name}: </b>{value}</p>);
     }

     if (typeof brick.abstract != 'undefined'){
       addField("Abstract", renderDescription(brick.abstract));
     }
     addField("Description",renderDescription(brick.long_description));
     mnodes.push(<p key={brickkey+"_brickabstract"} >{renderDescription(brick.abstract)}</p>);
     mnodes.push(<Files key={brickkey+"_files"} proj={proj} files={brick.files} basekey={brickkey}/>);

     addField("License",brick.license);
     addField("Notes",renderDescription(brick.notes));

     //Authors
     if(brick.authors.length!=0){
            var alist:string="";
            for(let aid of brick.authors){
                var a:Docubricks.Author=proj.getAuthorById(aid);
                if(alist.length!=0){
                    alist=alist+", "+a.name;
                } else
                    alist=a.name;
            }
            addField("Authors",alist);
     }

     //Functions & implementations
     var reqnodes:JSX.Element[]=[];
     for(let func of brick.mapFunctions.values()){
         var fnodes:JSX.Element[]=[];
         for(let imp of func.implementations){
             var impend:string="";
             if(fnodes.length!=0)
                 fnodes.push(<b>, </b>);
             if(imp.isPart()){
                 var ip:Docubricks.Part=imp.getPart(proj);
                 fnodes.push(<a href={"#part_"+imp.id}>{ip.name} <b>x {imp.quantity}</b></a>);
             } else if(imp.isBrick()){
                 var ib:Docubricks.Brick=imp.getBrick(proj);
                 fnodes.push(<a href={"#brick_"+imp.id}>{ib.name} <b>x {imp.quantity}</b></a>);
             }
         }
         var desc:string="";
         if(func.description!="")
             desc=func.description+": ";
         reqnodes.push(<li><b>{desc}</b>{fnodes}</li>)
     }
     var reqnodes2:JSX.Element[]=[];
     if(reqnodes.length!=0){
         reqnodes2=[<div>
                     <b>Requires:</b>
                         <ul>
                         {reqnodes}
                         </ul>
                 </div>];
     }


     //The bill of materials
     /*
     var bom:Docubricks.Bom = brick.getBom(proj,false);
     if(!bom.isEmpty()){
         mnodes.push(
                 <div>
                     <div className="divbrickbom">
                         <h3>Materials for this brick</h3>
                     </div>
                     <BomList proj={proj} bom={bom}/>
                 </div>);
     }
     */


     //All the instructions
     var instrnodes:JSX.Element[]=[];
     for(let instr of brick.instructions){
         instrnodes.push(<div key={brickkey+"_"+instr.name}>
                 <InstructionList proj={proj} brick={brick} part={null} instr={instr}/></div>);
     }

     var ret:JSX.Element=<div>
         <div className="brickdiv"><h1 id={"brick_"+brickid}>{brick.name}</h1></div>
         {mnodes}
         {reqnodes2}
         {instrnodes}
         </div>;
     return ret;
  }


}




/**
 * One part
 **/
export interface PartProps {proj: Docubricks.Project; partid:string;}
export class Part extends React.Component<PartProps, undefined> {
 render() {
     var proj:Docubricks.Project=this.props.proj;
     var partid:string=this.props.partid;
     var part:Docubricks.Part=proj.getPartByName(partid);
     var partkey="part"+partid;

     ////////////////////////////xpublic files: MediaFile[];


     var mnodes:JSX.Element[]=[];
     var addField=function(name:string,value:string):void{
         if(value!="")
             mnodes.push(<p key={partkey+"_"+name}><b>{name}: </b>{value}</p>);
     }
     addField("Description",part.description);
     mnodes.push(<Files key={partkey+"_files"} proj={proj} files={part.files} basekey={partkey}/>);
     addField("Supplier",part.supplier);
     addField("Supplier catalog #",part.supplier_part_num);
     addField("Manufacturer catalog #",part.manufacturer_part_num);
     if(part.url!="")
         mnodes.push(<p key={partkey+"_url"}><b>URL: </b>{formatURL(part.url)}</p>);
     if(part.material_amount!="")
         addField("Material usage",part.material_amount+" "+part.material_unit);

     //All the instructions
     if(part.manufacturing_instruction.steps.length!=null){
         mnodes.push(<div key={partkey+"_instr"}>
                 <InstructionList proj={proj} brick={null} part={part} instr={part.manufacturing_instruction}/></div>);
     }

     var ret:JSX.Element=<div>
         <div className="partdiv"><h3 id={"part_"+partid}>Part: {part.name}</h3></div>
         {mnodes}
         </div>;
     return ret;
 }
}



/**
 * One author
 */
export interface AuthorProps {proj: Docubricks.Project; authorid:string;}
export class Author extends React.Component<AuthorProps, undefined> {
 render() {
     var proj:Docubricks.Project=this.props.proj;
     var author:Docubricks.Author=proj.getAuthorById(this.props.authorid);
     return <tr key={"authorrow_"+author.id}>
                 <td>{author.name}</td>
                 <td>{author.email}</td>
                 <td>{author.affiliation}</td>
                 <td>{author.orcid}</td>
            </tr>;
 }
}





/**
 * List of instructions
 */
export interface InstructionListProps
    {proj: Docubricks.Project; brick:Docubricks.Brick; part:Docubricks.Part; instr:Docubricks.StepByStepInstruction;}
export class InstructionList extends React.Component<InstructionListProps, undefined> {
    render() {
     var proj:Docubricks.Project=this.props.proj;
     var brick:Docubricks.Brick=this.props.brick;
     var instr:Docubricks.StepByStepInstruction=this.props.instr;

     var key;
     if(brick!=null)
         key="instrBrick"+brick.id+"_instr"+instr.name;
     else
         key="instrPart"+this.props.part.id+"_instr"+instr.name;

     var snodes:JSX.Element[]=[];
     var curstep:number=1;
     for(let step of instr.steps){
         var stepkey=key+"_"+curstep;
         snodes.push(<div className="step" key={stepkey}>
           <hr/>
                 <nav className="image-col">
                     <Files proj={proj} files={step.files} basekey={stepkey}/>
                 </nav>
                 <InstructionStep listKey={key} stepIndex={curstep} step={step}/>
             </div>);
         const divclear = {clear:"both"};
         snodes.push(<div key={stepkey+"_end"} style={divclear}/>);
         curstep++;
     }
     var instrName:string = instr.name || '';
     var instrtitle:string = "Instruction: "+instrName;
     if(instr.name=="assembly")
         instrtitle="Assembly instruction";
     if(snodes.length>0)
         return <div key={key+"_main"}><h3>{instrtitle}</h3>{snodes}</div>;
     else
         return <div key={key+"_main"}></div>;
 }
}

function domNodeToReactElement(domNode: Element): JSX.Element | string{
	if(domNode.nodeType == 3){
		return domNode.nodeValue;
	}else if(domNode.nodeType == 1){
		return React.createElement(domNode.nodeName, domNodeChildrenToReactElements(domNode));
	}
}

interface AttributeDictionary{
	[key: string]: string;
}

function renderDescription(description: string | Element): Array<JSX.Element | string> | string{
	if(typeof(description) == "string"){
		return description;
	}else{
		return domNodeChildrenToReactElements(description);
	}
}

function domNodeChildrenToReactElements(domNode: Element): Array<JSX.Element|string>{
	let nodes: Array<JSX.Element|string> = [];
	for(let i=0; i<domNode.childNodes.length; i++){
		let childNode = domNode.childNodes[i];
		if(childNode.nodeType == 3){
			//we have a text node, so push it into the list as a string
			nodes.push(childNode.nodeValue);
		}else if(childNode.nodeType == 1){
			//we have an XML Element
			let allowedTags = ["b","i","ul","ol","li","p","a"];
			if(allowedTags.indexOf(childNode.nodeName) >= 0){
				let attributes: AttributeDictionary = {};
				for(let j=0; j<childNode.attributes.length; j++){
					let attrNode = childNode.attributes[j];
					attributes[attrNode.nodeName] = attrNode.nodeValue;
				}
				nodes.push(
					React.createElement(childNode.nodeName, attributes, 
										domNodeChildrenToReactElements(childNode as Element)));
			}else if(childNode.nodeName=="br"){
				nodes.push(<br/>);
			}
		}
	}
	return nodes;
}

export interface InstructionStepProps
{listKey: string; stepIndex: number; step: Docubricks.AssemblyStep;}
export class InstructionStep extends React.Component<InstructionStepProps, undefined> {
	render(){
		let step: Docubricks.AssemblyStep = this.props.step;
		let stepIndex: number = this.props.stepIndex;
		let listKey: string = this.props.listKey;
		return <article className="text-col">
				 <b>Step {stepIndex}. </b>
				 {renderDescription(step.description)}
			   </article>;
	}
}


/**
 * Bill of materials
 */
export interface BomProps
    {proj: Docubricks.Project; bom:Docubricks.Bom}
export class BomList extends React.Component<BomProps, undefined> {
render() {
    var proj:Docubricks.Project=this.props.proj;
    var snodes:JSX.Element[]=[];

    var roots:string[] = proj.getRootBricks();
    if(roots.length>0){
        var root:Docubricks.Brick=proj.getBrickByName(roots[0]);
        var bom:Docubricks.Bom = root.getBom(proj,true);

        //Loop over parts
        var key="mainbom_";
        var curstep:number=1;
        for(let partid of bom.bom.keys()){
            var quantity=bom.bom.get(partid);
            var part:Docubricks.Part=proj.getPartByName(partid);
            var stepkey=key+curstep;
            curstep++;

            snodes.push(
                <tr key={stepkey}>
                    <td>{part.name}</td>
                    <td>{quantity}</td>
                    <td>{part.supplier}</td>
                    <td>{part.supplier_part_num}</td>
                    <td>{formatURL(part.url)}</td>
                </tr>);
        }

        } else {
            return <div></div>;
        }

    return <div key={key+"_main"}>
            <table>
                <thead>
                    <tr>
                    <th>Part</th>
                    <th>Quantity</th>
                    <th>Supplier</th>
                    <th>Supplier part number</th>
                    <th>URL</th>
                </tr>
                </thead>
                <tbody>
                    {snodes}
                </tbody>
            </table>
            </div>;
    }


}


var urlcount:number=1;
var formatURL=function(url:string):JSX.Element[]{
    urlcount=urlcount+1;
    var ret:JSX.Element[]=[];
    if(url!=""){
        var s:String=new String(url);
        s=s.replace(/.+\:\/\//gi, "");
        s=s.replace(/\/.*/gi, "");
        ret.push(<a key={"url_"+urlcount+"_"+url} href={url}>{s.toString()}</a>)
    }
    return ret;
}


var formatURLfile=function(url:string, filename:string):JSX.Element[]{
    urlcount=urlcount+1;
    var ret:JSX.Element[]=[];
    if(url!=""){
        ret.push(<p key={"url_"+urlcount+"_"+url}><a href={url}><b>File: {filename}</b></a></p>)
    }
    return ret;
}

var getQueryStringValue=function(key:string):string {
    return decodeURIComponent(
            window.location.search.replace(
                    new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).
                            replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}



/**
 * List of files
 */
export interface FilesProps
    {proj: Docubricks.Project; files:Docubricks.MediaFile[]; basekey:string}
export class Files extends React.Component<FilesProps, undefined> {
    render() {
        var proj:Docubricks.Project=this.props.proj;
        var files:Docubricks.MediaFile[]=this.props.files;

        function isImage(url:string) {
            return(url.toLowerCase().match(/\.(jpeg|jpg|gif|png|svg)$/) != null);
        }

        var projectid:string=getQueryStringValue("id");
        var basedir:string=proj.base_url;
        //var downloadlink="DownloadZip?id="+projectid;

        //Collect the files and images
        var inodes:JSX.Element[]=[];
        var fnodes:JSX.Element[]=[];
        for(let f of files){
            var imgurl=basedir  + f.url.replace(/\.\//g, '');
            if(isImage(imgurl)){
                inodes.push(
                        <a key={this.props.basekey+f.url} href={imgurl} data-lightbox="image">
                        <img className="instr-img"src={imgurl}/>
                        <p className = "instr-img-caption no-print">Expand</p>
                </a>);
            } else{
                var s:String=new String(f.url);
                s=s.replace(/.*\//gi, "");
                fnodes.push(formatURLfile(imgurl,s.toString())[0]);
            }

        }

         return <div>{fnodes}{inodes}</div>
    }
}
