import * as React from "react";
import * as Docubricks from "./docubricks";

//State is never set so we use the 'undefined' type.




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
            mnodes.push(<ul key={"treechild_"+c.brick.id}>{this.renderBrickTreeR(c)}</ul>);
        }
        return <li key={"treenode_"+t.brick.id}><a href={"#brick_"+t.brick.id}>{t.brick.name}</a><ul>{mnodes}</ul></li>;
    }

    
    
    /**
     * Main rendering function
     */
    render() {
        var proj:Docubricks.Project=this.props.proj;
    
        document.title="DocuBricks - "+proj.getNameOfProject();
    
        var brickTree:[Docubricks.BrickTree] = proj.getBrickTree();
        console.log(brickTree);
    
        var itemsAuthors:JSX.Element[]=[];
        for(let a of proj.mapAuthors.values()){
            itemsAuthors.push(<Author key={"author_"+a.id} proj={proj} authorid={a.id}/>);
        }    

        var itemsBricks:JSX.Element[]=[];
        for(let b of proj.mapBricks.values()){
            itemsBricks.push(<div key={b.id}> <Brick proj={proj} brickid={b.id}/></div>);
        }    

        var itemsParts:JSX.Element[]=[];
        for(let b of proj.mapParts.values()){
            itemsBricks.push(<div key={b.id}> <Part proj={proj} partid={b.id}/></div>);
        }    

        var itemsTotalBom:JSX.Element[]=[];
        var roots:string[] = proj.getRootBricks();
        if(roots.length>0){
            var root:Docubricks.Brick=proj.getBrickByName(roots[0]);
            var bom:Docubricks.Bom = root.getBom(proj,true);
            if(!bom.isEmpty()){
                itemsTotalBom.push(
                        <div>
                            <div className="divbom">
                                <h1 id="bom">Total bill of materials for this project</h1>
                            </div>
                            <BomList proj={proj} bom={bom}/>
                        </div>);
            }
        }

        function getQueryStringValue (key:string):string {  
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
         } 
        var projectid:string=getQueryStringValue("id");
        var downloadlink="DownloadZip?id="+projectid;
         
        return <div>
            <div className="w3-sidebar">
                <h3><a href="./">DocuBricks</a></h3>
                <h3><a href={downloadlink}>Download project</a></h3>
                <br/>
                <h3>Bricks:</h3>
                {this.renderBrickTree(brickTree)}
                <h3><a href="#bom">Bill of materials</a></h3>
                <h3><a href="#authors">Authors</a></h3>
            </div>
            <div className="w3-container">
                <div>
                    {itemsBricks}
                </div>
                <div>
                    {itemsParts}
                    </div>
                <div className="brickdiv">
                    <h1 id="authors">Authors</h1>
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
     var addField=function(name:string,value:string):void{
         if(value!="")
             mnodes.push(<p key={brickkey+"_"+name}><b>{name}: </b>{value}</p>);
     }
     addField("Description",brick.long_description);
     mnodes.push(<p key={brickkey+"_brickabstract"} style={pStyle}>{brick.abstract}</p>);
     mnodes.push(<Files key={brickkey+"_files"}proj={proj} files={brick.files} basekey={brickkey}/>);

     addField("License",brick.license);
     addField("notes",brick.notes);

     /////////////// authors
     //////////////// functions & implementations

     //The bill of materials
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

     
     //All the instructions
     for(let instr of brick.instructions){
         mnodes.push(<div key={brickkey+"_"+instr.name}>
                 <InstructionList proj={proj} brick={brick} part={null} instr={instr}/></div>);
     }
     
     var ret:JSX.Element=<div>
         <div className="brickdiv"><h1 id={"brick_"+brickid}>{brick.name}</h1></div>
         {mnodes}
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
         <div className="partdiv"><h1 id={"part_"+partid}>Part: {part.name}</h1></div>
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
         snodes.push(<div key={stepkey}>
                 <nav>
                     <Files proj={proj} files={step.files} basekey={stepkey}/>
                 </nav>
                 <article>
                     <b>Step {curstep}. </b>
                     {step.description}
                 </article>
             </div>);
         const divclear = {clear:"both"};
         snodes.push(<div key={stepkey+"_end"} style={divclear}/>);
         curstep++;
     }
     if(snodes.length>0)
         return <div key={key+"_main"}><h3>Instruction: {instr.name}</h3>{snodes}</div>;
     else
         return <div key={key+"_main"}></div>;
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
        ret.push(<a key={"url_"+urlcount+"_"+url} href={url}><b>File: {filename}</b></a>)
    }
    return ret;
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
        
        //Collect the files and images
        var inodes:JSX.Element[]=[];
        for(let f of files){ //width="50%"
            const imgStyle = {
                    maxWidth:'300px',
                    //width:'100%',
                    maxHeight:'300px',
                    margin:'5px'
            };
            var imgurl="./project/"+f.url;
            if(isImage(imgurl)){
                inodes.push(
                        <a key={this.props.basekey+f.url} href={imgurl} data-lightbox="image">
                        <img src={imgurl} style={imgStyle}/>
                </a>);
            } else{
                inodes.push(formatURLfile(imgurl,f.url)[0]);
            }

        }

         return <div>{inodes}</div>
    }
}
