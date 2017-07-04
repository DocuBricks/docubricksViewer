/**
 * Bill of materials
 */

const xml2js = require("xml2js"); //rwb27: tried adding XML import

export class Bom {
    public bom: Map<string,number>=new Map<string,number>();  //part-id

   /**
    * Add to BOM
    * 
    * @param p The part
    * @param n Quantity
    */
    public addPart(p:string,n:number){
        if(n==0)
            n=1;
        if(this.bom.has(p))
            this.bom.set(p,this.bom.get(p)+n);
        else
            this.bom.set(p,n)
    }
    

    public addBom(b:Bom,n:number){
        if(n==0)
            n=1;
        for(let p of b.bom.keys()){
            this.addPart(p,b.bom.get(p)*n);
        }
        
    }
    public isEmpty():boolean{
        return this.bom.size==0;
    }
    
}

/**
 * One author
 */
export class Author {
    public id: string; //Secondary copy
    
    public name: string;
    public email: string;
    public orcid: string;
    public affiliation: string;

    /**
     * Copy (for parsing)
     */
    copyfrom(o:Author):void{
        Object.assign(this,o);
    }

}

/**
 * One brick
 */
export class Brick {
    public id:string; //Secondary store    
    public name: string;
    public abstract: string;
    public long_description: string;
    public notes: string;
    public license: string;
    public files: MediaFile[];
    public authors: [string];
    public functions: [BrickFunction];  //should not be used after import
    public mapFunctions:Map<string,BrickFunction>=new Map<string,BrickFunction>();
    public instructions: StepByStepInstruction[];


    /**
     * Get BOM as only what this particular brick contains
     */
    public getBom(proj:Project, recursive:boolean):Bom {
        var bom:Bom=new Bom();

        console.log("functions");
        console.log(this.functions);
        for(let func of this.mapFunctions.values()){
            func.implementations.forEach(function(imp:FunctionImplementation){
                if(imp.isPart()){
                    var p:Part=imp.getPart(proj);
                    //bom.addPart(p.id, +func.quantity);
                    bom.addPart(p.id, imp.quantity);
                } else if(imp.isBrick()){
                    if(recursive){
                        var b:Bom=imp.getBrick(proj).getBom(proj,true);
                        //bom.addBom(b,+func.quantity);                    
                        bom.addBom(b,imp.quantity);                    
                    }
                } else {
                    console.log("bad imp type"+imp.type);
                }
            });
        }
        console.log("bom");
        console.log(bom);
        return bom;
    }


    /**
     * Get bricks this brick has as direct children
     */
    public getChildBricks():Set<string> {
        var referenced:Set<string> = new Set<string>();
        //this.mapFunctions.values().forEach(function(func:BrickFunction){
        for(let func of this.mapFunctions.values()){
            func.implementations.forEach(function(imp:FunctionImplementation){
                if(imp.isBrick()){
                    referenced.add(imp.id);               
                }
            });
        }
        return referenced;
    }
    
    /**
     * Copy (for parsing)
     */
    copyfrom(o:Brick):void{
        Object.assign(this,o);
        this.functions=<[BrickFunction]>[];
        var t:Brick=this;
        //Copy sub-bricks and functions
        o.functions.forEach(function(ofunc:BrickFunction,index:number){
            var f:BrickFunction=new BrickFunction();
            f.copyfrom(ofunc);
            //t.functions.push(f);
            f.id=""+index;
            t.mapFunctions.set(""+index,f);
        });
    }
    copyfromxml(o:any):void{
        Object.assign(this,o);
        
        console.log("contents:",o);    //dump to console (DEBUG)    

        this.functions=<[BrickFunction]>[];
        var t:Brick=this;
        //Copy sub-bricks and functions
        o.function.forEach(function(ofunc:BrickFunction,index:number){
            var f:BrickFunction=new BrickFunction();
            f.copyfrom(ofunc);
            //t.functions.push(f);
            f.id=""+index;
            t.mapFunctions.set(""+index,f);
        });
    }

}

/**
 * One function for a brick
 */
export class BrickFunction {
    public id: string;

    public description: string;
    public designator: string;
    public quantity: string;  //deprecated
    public implementations: FunctionImplementation[];


    copyfrom(o:BrickFunction):void{
        Object.assign(this,o);
        this.implementations=<[FunctionImplementation]>[];
        o.implementations.forEach((oi:FunctionImplementation,index:number) => {
            var f:FunctionImplementation=new FunctionImplementation();
            f.copyfrom(oi);
            this.implementations.push(f);
        });
    }
}

export class FunctionImplementation {
    public type: string; //"part" or "brick"
    public id: string;
    public quantity: number;

    public isPart():boolean{
        return this.type=="part";
    }
    public isBrick():boolean{
        return this.type=="brick";
    }
    public getPart(proj:Project):Part{
        return proj.getPartByName(this.id);//parts[+this.id];
    }
    public getBrick(proj:Project):Brick{
        return proj.getBrickByName(this.id);//bricks[+this.id];
    }
    
    copyfrom(oi:FunctionImplementation){
        Object.assign(this,oi);
        /*this.id=oi.id;
        this.quantity=oi.quantity;
        this.type=oi.type;*/
    }
}

/**
 * One associated file
 */
export class MediaFile {
    public url: string;
}

/**
 * One part
 */
export class Part {
    public id: string; //secondary
    
    public name: string;
    public description: string;

    public supplier: string;
    public supplier_part_num: string;
    public manufacturer_part_num: string;
    public url: string;

    public material_amount: string;
    public material_unit: string;

    public files: MediaFile[];

    public manufacturing_instruction: StepByStepInstruction;

    copyfrom(o:Part):void{
        Object.assign(this,o);
    }
}

/**
 * One step-by-step instruction
 */
export class StepByStepInstruction {
    public name: string;
    public steps: AssemblyStep[];
}

/**
 * One assembly step (or any instruction step)
 */
export class AssemblyStep {
    public description: string;
    public files: MediaFile[];
    public components: AssemblyStepComponent[];
}

/**
 * reference - to be removed?
 */
export class AssemblyStepComponent {
    public quantity: string;
    public id: string;
}


export class BrickTree{
    public brick:Brick;
    public children:BrickTree[]=[];
}




/**
 * One docubricks project
 */
export class Project {
    public bricks:Brick[]=[];
    public parts:Part[]=[];
    public authors:Author[]=[];
//    public mapBricks:Map<string,Brick>=new Map<string,Brick>();    //discards order. SHOULD use bricks[]
    public mapParts:Map<string,Part>=new Map<string,Part>();
    public mapAuthors:Map<string,Author>=new Map<string,Author>();


    public getBrickByName(id:string):Brick{
        for(let b of this.bricks)
            if(b.id==id)
                return b;
        //var b:Brick=this.mapBricks.get(id)
        //if(b===undefined){
        console.error("---- no such brick \""+id+"\"");
        console.error(this.bricks)
        //for(let of of this.bricks)
        //    console.error(i);
        return null;
        //}
        //return b;
    }
    
    public getPartByName(id:string):Part{
        return this.mapParts.get(id);
    }
    
    public getAuthorById(id:string):Author{
        return this.mapAuthors.get(id);
    }
    
    
    /**
     * Get all the roots. Hopefully only one
     */
    public getRootBricks():string[]{
        //See what is referenced
        var referenced:Set<string> = new Set<string>();
   
        //for(let b of this.mapBricks.values()){
        for(let b of this.bricks){
            for(let c of b.getChildBricks())
                referenced.add(c);
        }
        //Pick unreferenced bricks as roots
        var roots:string[]=[];
        for(let b of this.bricks)
            if(!referenced.has(b.id))
                roots.push(b.id);
        
        //Backup: Pick anything as the root. Not great but better
        if(roots.length==0)
            for(let b of this.bricks){
                roots.push(b.id);
                break;
            }
        return roots;
    }


    public getBrickTree():[BrickTree]{
        var thetree:[BrickTree]=<[BrickTree]>[];
    
        
        //Pick unreferenced bricks as roots
        var roots:string[]=this.getRootBricks();
        var referenced:Set<string> = new Set<string>();
        for(let b of this.bricks)
            if(!referenced.has(b.id))
                thetree.push(this.getBrickTreeR(this, b, referenced));
        return thetree;
    }

    getBrickTreeR(thisProject:Project, thisbrick:Brick, referenced:Set<string>): BrickTree {
        var t:BrickTree=new BrickTree();
        t.brick=thisbrick;//this.mapBricks.get(thisbrick);//bricks[+thisbrick];
        referenced.add(thisbrick.id);
        var children:Set<string>=thisbrick.getChildBricks();
        for(let c of children){
            if(!referenced.has(c)){
                t.children.push(thisProject.getBrickTreeR(thisProject, 
                        thisProject.getBrickByName(c), referenced));
            }
        }
        return t;
    }
    
    
    /**
     * For parsing only
     */
    public copyfrom(o:Project):void{
        //Copy bricks
        for(let ob of o.bricks){
            //var ob:Brick=o.bricks[index];
            var b:Brick=new Brick();
            b.copyfrom(ob);
            //var si:string=""+index;
            //b.id=si;
            this.bricks.push(b);
            //this.mapBricks.set(si,b);
        };
        //Copy parts
        for(let op of o.parts){
            var p:Part=new Part();
            p.copyfrom(op);
            this.mapParts.set(p.id,p);
        };
        //Copy authors
        for(let oa of o.authors){
            var a:Author=new Author();
            a.copyfrom(oa);
            this.mapAuthors.set(a.id,a);
        };
        
        
    }

    /**
     * Get the name of the project - use the name of the root brick
     */
    public getNameOfProject():string{
        var roots:string[] = this.getRootBricks();
        if(roots.length>0){
            var root:Brick=this.getBrickByName(roots[0]);
            return root.name;
        } else
            return "";
    }
}


    
   

export function docubricksFromJSON(s:string):Project{
    var proj:Project=<Project>JSON.parse(s);    

    var realproj:Project=new Project();
    realproj.copyfrom(proj);
    return realproj;
}

export function docubricksFromXML(s:string, callback: (p: Project)=>any ){
    xml2js.parseString(s, function(err: any, res: any){
        var proj:Project=new Project();

        //Copy bricks
        for(let ob of res.docubricks.brick){
            console.log("copying:",ob.name);    //dump to console (DEBUG)
            var b:Brick=new Brick();
            b.copyfromxml(ob);
            this.bricks.push(b);
        };        

        proj.bricks = res.docubricks.brick;
        console.log(JSON.stringify(proj.bricks, null, 4));    //dump to console (DEBUG)
        var realproj:Project=new Project();
        realproj.copyfrom(proj);
        callback(realproj); //I really hate JS callbacks :(
    });
}
