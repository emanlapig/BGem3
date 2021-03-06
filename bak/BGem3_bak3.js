// CLASSES

var BGem3 = {};

BGem3.Scene = function() {
    this.objs = [];
    this.add = function(obj) {
        this.objs.push(obj);
    };
    this.action = function() {};
};

BGem3.Obj3D = function(mesh) {
    this.mesh = mesh;
    this.translate = [];
    this.vertices2 = [];
    this.gPosition = {x:0,y:0,z:0};
    this.lPosition = {x:0,y:0,z:0};
    this.gRotation = {x:0,y:0,z:0};
    this.lRotation = {x:0,y:0,z:0};
    this.applyGlobalRot = false;
};

BGem3.Mesh = function() {
    this.vertices = [];
    this.faces = [];
};

BGem3.CubeMesh = function(obj) {
    BGem3.Mesh.apply(this,arguments);
    this.size = obj.size;
    this.vertices = [
        {x:-this.size, y:-this.size, z:-this.size},
        {x:-this.size, y:-this.size, z:this.size},
        {x:this.size, y:-this.size, z:this.size},
        {x:this.size, y:-this.size, z:-this.size},
        {x:-this.size, y:this.size, z:-this.size},
        {x:-this.size, y:this.size, z:this.size},
        {x:this.size, y:this.size, z:this.size},
        {x:this.size, y:this.size, z:-this.size},
        {x:0, y:0, z:0} // anchor point
    ];
    this.faces = [
        [0,1,2,3],
        [0,1,5,4],
        [1,2,6,5],
        [2,3,7,6],
        [3,0,4,7],
        [4,5,6,7]
    ];
    this.transform = [];
    for (var i=0;i<this.vertices.length;i++) {
        var obj = JSON.parse(JSON.stringify(this.vertices[i]));
        this.transform.push(obj);
    }
};
BGem3.CubeMesh.prototype = new BGem3.Mesh();

BGem3.Camera = function() {
    this.position = {x:0,y:0,z:0};
    this.focalLength = 300;
};

BGem3.Renderer = function() {
    this.fps = fps;
    this.interval = 1/this.fps * 1000;
    this.render = function() {
        for (var i=0;i<scene.objs.length;i++) {
            renderer.stats = [];
            scene.objs[i].translate = [];
            scene.objs[i].vertices2 = [];
            for (var l=0;l<scene.objs[i].mesh.vertices.length;l++) {
                var obj = JSON.parse(JSON.stringify(scene.objs[i].mesh.transform[l]));
                scene.objs[i].translate.push(obj);
            }
            scene.objs[i].mesh.transform = [];
            for (var m=0;m<scene.objs[i].mesh.vertices.length;m++) {
                var obj = JSON.parse(JSON.stringify(scene.objs[i].translate[m]));
                scene.objs[i].mesh.transform.push(obj);
            }
        }
        scene.action();
        renderer.rotate('local',renderer.translate); // begin callback chain
    };
    /*  RENDER PIPELINE:
        1. rotate local
        2. translate local
        3. rotate global
        4. translate global
        5. project 3d to 2d
        6. draw to canvas
        7. update stats
    */
    this.rotate = function(lg,cb) {
        for (var i=0;i<scene.objs.length;i++) {
            // X ROTATION
            for (var k=0;k<scene.objs[i].translate.length;k++) {
                var vy = scene.objs[i].translate[k].y,
                    vz = scene.objs[i].translate[k].z,
                    angle = BGem3.Math.getAngle(0,0,vy,vz),
                    angle2 = lg=='local' ? 
                        angle - (scene.objs[i].lRotation.x * Math.PI/180):
                        angle - (scene.objs[i].gRotation.x * Math.PI/180);
                if (angle2>2*Math.PI) {
                    angle2-=2*Math.PI;
                }
                var r = BGem3.Math.getDist(0,0,vy,vz);
                if (lg=='local') {
                    scene.objs[i].mesh.transform[k].y = Math.cos(angle2) * r;
                    scene.objs[i].mesh.transform[k].z = Math.sin(angle2) * r;
                } else {
                    scene.objs[i].translate[k].y = Math.cos(angle2) * r;
                    scene.objs[i].translate[k].z = Math.sin(angle2) * r;
                }
            }
            // Y ROTATION
            for (var j=0;j<scene.objs[i].translate.length;j++) {
                var vx = scene.objs[i].translate[j].x,
                    vz = scene.objs[i].translate[j].z,
                    angle = BGem3.Math.getAngle(0,0,vx,vz),
                    angle2 = lg=='local' ?
                        angle - (scene.objs[i].lRotation.y * Math.PI/180):
                        angle - (scene.objs[i].gRotation.y * Math.PI/180);
                if (angle2>2*Math.PI) {
                    angle2-=2*Math.PI;
                }
                var r = BGem3.Math.getDist(0,0,vx,vz);
                if (lg=='local') {
                    scene.objs[i].mesh.transform[j].x = Math.cos(angle2) * r;
                    scene.objs[i].mesh.transform[j].z = Math.sin(angle2) * r;
                } else {
                    scene.objs[i].translate[j].x = Math.cos(angle2) * r;
                    scene.objs[i].translate[j].z = Math.sin(angle2) * r;
                }
            }
            // Z ROTATION
            for (var l=0;l<scene.objs[i].translate.length;l++) {
                var vx = scene.objs[i].translate[l].x,
                    vy = scene.objs[i].translate[l].y,
                    angle = BGem3.Math.getAngle(0,0,vx,vy),
                    angle2 = lg=='local' ?
                        angle - (scene.objs[i].lRotation.z * Math.PI/180):
                        angle - (scene.objs[i].gRotation.z * Math.PI/180);
                if (angle2>2*Math.PI) {
                    angle2-=2*Math.PI;
                }
                var r = BGem3.Math.getDist(0,0,vx,vy);
                if (lg=='local') {
                    scene.objs[i].mesh.transform[l].x = Math.cos(angle2) * r;
                    scene.objs[i].mesh.transform[l].y = Math.sin(angle2) * r;
                } else {
                    scene.objs[i].translate[l].x = Math.cos(angle2) * r;
                    scene.objs[i].translate[l].y = Math.sin(angle2) * r;
                }
            }
            // If global apply transform to local geometry
            if (lg=='global' && scene.objs[i].applyGlobalRot) {
                scene.objs[i].mesh.transform = [];
                for (var m=0;m<scene.objs[i].translate.length;m++) {
                    scene.objs[i].mesh.transform.push(JSON.parse(JSON.stringify(scene.objs[i].translate[m])));
                }
                scene.objs[i].gRotation = {x:0,y:0,z:0};
                scene.objs[i].lRotation = {x:0,y:0,z:0};
                scene.objs[i].applyGlobalRot = false;
            }
        }
        if (lg=='local') {
            cb('local',renderer.rotate);
        } else {
            for (var i=0;i<scene.objs.length;i++) {
                scene.objs[i].lPosition.x = JSON.parse(JSON.stringify(scene.objs[i])).translate[8].x;
                scene.objs[i].lPosition.y = JSON.parse(JSON.stringify(scene.objs[i])).translate[8].y;
                scene.objs[i].lPosition.z = JSON.parse(JSON.stringify(scene.objs[i])).translate[8].z;
            }
            cb('global',renderer.project);
        }
    };
    this.translate = function(lg,cb) {
        for (var i=0;i<scene.objs.length;i++) {
            for (var j=0;j<scene.objs[i].translate.length;j++) {
                if (lg=='local') {
                    scene.objs[i].mesh.transform[j].x += scene.objs[i].lPosition.x;
                    scene.objs[i].mesh.transform[j].y += scene.objs[i].lPosition.y;
                    scene.objs[i].mesh.transform[j].z += scene.objs[i].lPosition.z;
                } else {
                    scene.objs[i].translate[j].x += scene.objs[i].gPosition.x;
                    scene.objs[i].translate[j].y += scene.objs[i].gPosition.y;
                    scene.objs[i].translate[j].z += scene.objs[i].gPosition.z;
                }
            }
        }
        if (lg=='local') {
            cb('global',renderer.translate);
        } else {
            cb(renderer.draw);
            renderer.stats.push(["translateX1",scene.objs[0].translate[0].x]);
        }
    };
    this.project = function(cb) {
        for (var i=0;i<scene.objs.length;i++) {
            for (var j=0;j<scene.objs[i].translate.length;j++) {
                var scaleRatio = camera.focalLength / scene.objs[i].translate[j].z;
                var obj = {};
                obj.x = BGem3.Math.round2(scene.objs[i].translate[j].x * scaleRatio + centerX);
                obj.y = BGem3.Math.round2(scene.objs[i].translate[j].y * scaleRatio + centerY);
                scene.objs[i].vertices2.push(obj);
            }
        }
        cb(renderer.updateStats);
        renderer.stats.push(["vertices2X1",scene.objs[0].vertices2[0].x]);
    };
    this.draw = function(cb) {
        ctx.clearRect(0,0,maxWidth,maxHeight);
        for (var i=0;i<scene.objs.length;i++) {
            for (var j=0;j<scene.objs[i].mesh.faces.length;j++) {
                var v1 = scene.objs[i].mesh.faces[j][0],
                    v2 = scene.objs[i].mesh.faces[j][1],
                    v3 = scene.objs[i].mesh.faces[j][2],
                    v4 = scene.objs[i].mesh.faces[j][3];
                ctx.beginPath();
                ctx.moveTo( scene.objs[i].vertices2[v1].x, scene.objs[i].vertices2[v1].y );
                ctx.lineTo( scene.objs[i].vertices2[v2].x, scene.objs[i].vertices2[v2].y );
                ctx.lineTo( scene.objs[i].vertices2[v3].x, scene.objs[i].vertices2[v3].y );
                ctx.lineTo( scene.objs[i].vertices2[v4].x, scene.objs[i].vertices2[v4].y );
                ctx.lineTo( scene.objs[i].vertices2[v1].x, scene.objs[i].vertices2[v1].y );
                ctx.closePath();
                ctx.strokeStyle="rgba(0,0,0,1)";
                ctx.stroke();
            }
        }
        cb();
    };
    this.stats = [];
    this.updateStats = function() {
        var html = "";
        for (var i=0;i<renderer.stats.length;i++) {
            html += renderer.stats[i][0]+": "+renderer.stats[i][1]+"<br>";
        }
        $("#log").html(html);
    };
};

BGem3.RotController = function(obj) {
    this.div = obj.div;
    this.mouseX = 0;
    this.mouseY = 0;
    $(this.div).mousedown(function(event) {
        controller.mouseX = event.pageX;
        controller.mouseY = event.pageY;
        $(this).mousemove(function(event) {
            var deltaX = event.pageX-controller.mouseX;
            var deltaY = event.pageY-controller.mouseY;
            for (var i=0;i<scene.objs.length;i++) {
                scene.objs[i].gRotation.y -= deltaX/2;
                scene.objs[i].gRotation.x -= deltaY/2;
            }
            controller.mouseX = event.pageX;
            controller.mouseY = event.pageY;
        }).mouseup(function(event) {
            $(this).unbind('mousemove');
            for (var i=0;i<scene.objs.length;i++) {
                scene.objs[i].applyGlobalRot = true;
            }
        });
    });
};

BGem3.MathFunc = function() {
    this.getDist = function(x1,y1,x2,y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        var dist = Math.sqrt(dx*dx + dy*dy);
        return dist;
    };
    this.getAngle = function(x1,y1,x2,y2) {
        var angle;
        // quad i
        if (x2>=x1 && y2>=y1) {
            angle = Math.atan((y2-y1)/(x2-x1)); 
        }
        // quad ii
        else if (x2<=x1 && y2>=y1) {
            angle = 0.5*Math.PI - Math.atan((x2-x1)/(y2-y1));   
        }
        // quad iii
        else if (x2<=x1 && y2<=y1) {
            angle = Math.PI + Math.atan((y2-y1)/(x2-x1));
        }
        // quad iv
        else if (x2>=x1 && y2<=y1) {
            angle = 1.5*Math.PI - Math.atan((x2-x1)/(y2-y1));
        }
        return angle;
    };
    this.round2 = function(num) {
        return Math.round((num + 0.00001) * 100) / 100;
    };
};
BGem3.Math = new BGem3.MathFunc();
