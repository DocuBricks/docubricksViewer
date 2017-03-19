"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Bom {
    constructor() {
        this.bom = new Map();
    }
    addPart(p, n) {
        if (n == 0)
            n = 1;
        if (this.bom.has(p))
            this.bom.set(p, this.bom.get(p) + n);
        else
            this.bom.set(p, n);
    }
    addBom(b, n) {
        if (n == 0)
            n = 1;
        for (let p of b.bom.keys()) {
            this.addPart(p, b.bom.get(p) * n);
        }
    }
    isEmpty() {
        return this.bom.size == 0;
    }
}
exports.Bom = Bom;
class Author {
    copyfrom(o) {
        Object.assign(this, o);
    }
}
exports.Author = Author;
class Brick {
    constructor() {
        this.mapFunctions = new Map();
    }
    getBom(proj, recursive) {
        var bom = new Bom();
        console.log("functions");
        console.log(this.functions);
        for (let func of this.mapFunctions.values()) {
            func.implementations.forEach(function (imp) {
                if (imp.isPart()) {
                    var p = imp.getPart(proj);
                    bom.addPart(p.id, imp.quantity);
                }
                else if (imp.isBrick()) {
                    if (recursive) {
                        var b = imp.getBrick(proj).getBom(proj, true);
                        bom.addBom(b, imp.quantity);
                    }
                }
                else {
                    console.log("bad imp type" + imp.type);
                }
            });
        }
        console.log("bom");
        console.log(bom);
        return bom;
    }
    getChildBricks() {
        var referenced = new Set();
        for (let func of this.mapFunctions.values()) {
            func.implementations.forEach(function (imp) {
                if (imp.isBrick()) {
                    referenced.add(imp.id);
                }
            });
        }
        return referenced;
    }
    copyfrom(o) {
        Object.assign(this, o);
        this.functions = [];
        var t = this;
        o.functions.forEach(function (ofunc, index) {
            var f = new BrickFunction();
            f.copyfrom(ofunc);
            f.id = "" + index;
            t.mapFunctions.set("" + index, f);
        });
    }
}
exports.Brick = Brick;
class BrickFunction {
    copyfrom(o) {
        Object.assign(this, o);
        this.implementations = [];
        o.implementations.forEach((oi, index) => {
            var f = new FunctionImplementation();
            f.copyfrom(oi);
            this.implementations.push(f);
        });
    }
}
exports.BrickFunction = BrickFunction;
class FunctionImplementation {
    isPart() {
        return this.type == "part";
    }
    isBrick() {
        return this.type == "brick";
    }
    getPart(proj) {
        return proj.getPartByName(this.id);
    }
    getBrick(proj) {
        return proj.getBrickByName(this.id);
    }
    copyfrom(oi) {
        Object.assign(this, oi);
    }
}
exports.FunctionImplementation = FunctionImplementation;
class MediaFile {
}
exports.MediaFile = MediaFile;
class Part {
    copyfrom(o) {
        Object.assign(this, o);
    }
}
exports.Part = Part;
class StepByStepInstruction {
}
exports.StepByStepInstruction = StepByStepInstruction;
class AssemblyStep {
}
exports.AssemblyStep = AssemblyStep;
class AssemblyStepComponent {
}
exports.AssemblyStepComponent = AssemblyStepComponent;
class BrickTree {
    constructor() {
        this.children = [];
    }
}
exports.BrickTree = BrickTree;
class Project {
    constructor() {
        this.bricks = [];
        this.parts = [];
        this.authors = [];
        this.mapParts = new Map();
        this.mapAuthors = new Map();
    }
    getBrickByName(id) {
        for (let b of this.bricks)
            if (b.id == id)
                return b;
        console.error("---- no such brick \"" + id + "\"");
        console.error(this.bricks);
        return null;
    }
    getPartByName(id) {
        return this.mapParts.get(id);
    }
    getAuthorById(id) {
        return this.mapAuthors.get(id);
    }
    getRootBricks() {
        var referenced = new Set();
        for (let b of this.bricks) {
            for (let c of b.getChildBricks())
                referenced.add(c);
        }
        var roots = [];
        for (let b of this.bricks)
            if (!referenced.has(b.id))
                roots.push(b.id);
        if (roots.length == 0)
            for (let b of this.bricks) {
                roots.push(b.id);
                break;
            }
        return roots;
    }
    getBrickTree() {
        var thetree = [];
        var roots = this.getRootBricks();
        var referenced = new Set();
        for (let b of this.bricks)
            if (!referenced.has(b.id))
                thetree.push(this.getBrickTreeR(this, b, referenced));
        return thetree;
    }
    getBrickTreeR(thisProject, thisbrick, referenced) {
        var t = new BrickTree();
        t.brick = thisbrick;
        referenced.add(thisbrick.id);
        var children = thisbrick.getChildBricks();
        for (let c of children) {
            if (!referenced.has(c)) {
                t.children.push(thisProject.getBrickTreeR(thisProject, thisProject.getBrickByName(c), referenced));
            }
        }
        return t;
    }
    copyfrom(o) {
        for (let ob of o.bricks) {
            var b = new Brick();
            b.copyfrom(ob);
            this.bricks.push(b);
        }
        ;
        for (let op of o.parts) {
            var p = new Part();
            p.copyfrom(op);
            this.mapParts.set(p.id, p);
        }
        ;
        for (let oa of o.authors) {
            var a = new Author();
            a.copyfrom(oa);
            this.mapAuthors.set(a.id, a);
        }
        ;
    }
    getNameOfProject() {
        var roots = this.getRootBricks();
        if (roots.length > 0) {
            var root = this.getBrickByName(roots[0]);
            return root.name;
        }
        else
            return "";
    }
}
exports.Project = Project;
function docubricksFromJSON(s) {
    var proj = JSON.parse(s);
    var realproj = new Project();
    realproj.copyfrom(proj);
    return realproj;
}
exports.docubricksFromJSON = docubricksFromJSON;
//# sourceMappingURL=docubricks.js.map