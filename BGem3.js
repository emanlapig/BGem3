// BGem3 -- 3d js canvas drawing engine

    var BGem3 = {};

    BGem3.Scene = function() {
        this.objs = [];
        this.add = function(obj) {
            this.objs.push(obj);
        };
        this.action = function() {};
    };

    BGem3.Camera = function() {
        this.position = {x:0,y:0,z:0};
        this.focalLength = focalLength;
    };

    BGem3.Obj3D = function(mesh) {
        this.mesh = mesh;
        this.transform = [];
        this.vertices2 = [];
        this.sgPosition = {x:0,y:0,z:0};
        this.gPosition = {x:0,y:0,z:0};
        this.lPosition = {x:0,y:0,z:0};
        this.gRotation = {x:0,y:0,z:0};
        this.lRotation = {x:0,y:0,z:0};
        this.applyGlobalRot = false;
        this.lockRotation = false;
        this.visible = true;
        this.shade = true;
        this.shine = true;
    };

    BGem3.Mesh = function() {
        this.vertices = [];
        this.faces = [];
        this.transform = [];
        this.makeTransform = function() {
            this.transform = JSON.parse(JSON.stringify(this.vertices));
        };
        this.stroke = true;
        this.strokeStyle = "";
        this.fill = false;
        this.fillStyle = "";
        this.textured = false;
    };

    BGem3.CubeMesh = function(obj) {
        BGem3.Mesh.apply(this,arguments);
        this.size = obj.size;
        this.vertices = [
            {x:0.1, y:0.1, z:0.1}, // anchor point
            {x:this.size, y:-this.size, z:-this.size},
            {x:-this.size, y:-this.size, z:-this.size},
            {x:-this.size, y:this.size, z:-this.size},
            {x:this.size, y:this.size, z:-this.size},
            {x:this.size, y:-this.size, z:this.size},
            {x:-this.size, y:-this.size, z:this.size},
            {x:-this.size, y:this.size, z:this.size},
            {x:this.size, y:this.size, z:this.size}

        ];
        this.faces = [
            [1,2,3,4,[102,45,145,1],true,texture,true],  // front
            [5,1,4,8,[102,45,145,1],true,texture,false], // right
            [6,5,8,7,[102,45,145,1],true,texture,false], // back
            [2,6,7,3,[102,45,145,1],true,texture,false], // left
            [5,6,2,1,[102,45,145,1],true,texture,false], // top
            [4,3,7,8,[102,45,145,1],true,texture,false]  // bottom
        ];
        this.makeTransform();
    };
    BGem3.CubeMesh.prototype = new BGem3.Mesh();

    BGem3.AnchorPt = function() {
        BGem3.Mesh.apply(this,arguments);
        this.size = 6;
        this.vertices = [
            {x:0.1, y:0.1, z:0.1}, // anchor point
            {x:this.size, y:-this.size, z:-this.size},
            {x:-this.size, y:-this.size, z:-this.size},
            {x:-this.size, y:this.size, z:-this.size},
            {x:this.size, y:this.size, z:-this.size},
        ];
        this.faces = [
            [1,2,3,4,[102,45,145,1],true,texture,true]
        ];
        this.makeTransform();
        this.lockRotation = true;
    };
    BGem3.AnchorPt.prototype = new BGem3.Mesh();

    BGem3.Renderer = function() {
        this.fps = fps;
        this.interval = 1/this.fps * 1000;
        this.centerX = maxWidth/2;
        this.centerY = maxHeight/2;
        this.render = function() {
            for (var i=0;i<scene.objs.length;i++) {
                renderer.debug = [];
                scene.objs[i].transform = [];
                scene.objs[i].vertices2 = [];
                for (var l=0;l<scene.objs[i].mesh.vertices.length;l++) {
                    var obj = JSON.parse(JSON.stringify(scene.objs[i].mesh.transform[l]));
                    scene.objs[i].transform.push(obj);
                }
                scene.objs[i].mesh.transform = [];
                for (var m=0;m<scene.objs[i].mesh.vertices.length;m++) {
                    var obj = JSON.parse(JSON.stringify(scene.objs[i].transform[m]));
                    scene.objs[i].mesh.transform.push(obj);
                }
            }
            scene.action();
            renderer.rotate('local',renderer.translate); // begin callback chain
            renderer.trackFPS += 1;
        };
        /*  RENDER PIPELINE:
            1. rotate local
            2. translate local
            3. rotate global
            4. translate global
            5. project 3d to 2d
            6. z-sort objects
            7. draw to canvas
            8. update stats
            9. post-action
        */
        this.rotate = function(lg,cb) {
            for (var i=0;i<scene.objs.length;i++) {
                // X AXIS
                for (var k=0;k<scene.objs[i].transform.length;k++) {
                    var vy = scene.objs[i].transform[k].y,
                        vz = scene.objs[i].transform[k].z,
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
                        scene.objs[i].transform[k].y = Math.cos(angle2) * r;
                        scene.objs[i].transform[k].z = Math.sin(angle2) * r;
                    }
                }
                // Y AXIS
                for (var j=0;j<scene.objs[i].transform.length;j++) {
                    var vx = scene.objs[i].transform[j].x,
                        vz = scene.objs[i].transform[j].z,
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
                        scene.objs[i].transform[j].x = Math.cos(angle2) * r;
                        scene.objs[i].transform[j].z = Math.sin(angle2) * r;
                    }
                }
                // Z AXIS
                for (var l=0;l<scene.objs[i].transform.length;l++) {
                    var vx = scene.objs[i].transform[l].x,
                        vy = scene.objs[i].transform[l].y,
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
                        scene.objs[i].transform[l].x = Math.cos(angle2) * r;
                        scene.objs[i].transform[l].y = Math.sin(angle2) * r;
                    }
                }
                // (on mouseup) apply transform to local geometry
                if (lg=='global' && scene.objs[i].applyGlobalRot) {
                    scene.objs[i].mesh.transform = [];
                    for (var m=0;m<scene.objs[i].transform.length;m++) {
                        scene.objs[i].mesh.transform.push(JSON.parse(JSON.stringify(scene.objs[i].transform[m])));
                    }
                    scene.objs[i].gRotation = {x:0,y:0,z:0};
                    scene.objs[i].lRotation = {x:0,y:0,z:0};
                    scene.objs[i].applyGlobalRot = false;
                }
            }
            if (lg=='local') {
                cb('local',renderer.rotate);
            } else {
                // apply global rotation to local position
                for (var i=0;i<scene.objs.length;i++) {
                    scene.objs[i].lPosition = {x:0,y:0,z:0};
                }
                cb('global',renderer.project);
            }
        };
        this.translate = function(lg,cb) {
            for (var i=0;i<scene.objs.length;i++) {
                for (var j=0;j<scene.objs[i].transform.length;j++) {
                    if (lg=='local') {
                        scene.objs[i].mesh.transform[j].x += scene.objs[i].lPosition.x;
                        scene.objs[i].mesh.transform[j].y += scene.objs[i].lPosition.y;
                        scene.objs[i].mesh.transform[j].z += scene.objs[i].lPosition.z;
                    } else {
                        scene.objs[i].transform[j].x += scene.objs[i].gPosition.x;
                        scene.objs[i].transform[j].y += scene.objs[i].gPosition.y;
                        scene.objs[i].transform[j].z += scene.objs[i].gPosition.z;
                    }
                }
            }
            if (lg=='local') {
                cb('global',renderer.translate);
            } else {
                for (var i=0;i<scene.objs.length;i++) {
                    // update superglobal position
                    scene.objs[i].sgPosition.x = JSON.parse(JSON.stringify(scene.objs[i])).transform[0].x;
                    scene.objs[i].sgPosition.y = JSON.parse(JSON.stringify(scene.objs[i])).transform[0].y;
                    scene.objs[i].sgPosition.z = JSON.parse(JSON.stringify(scene.objs[i])).transform[0].z;
                    // if rotation locked, revert rotation
                    if (scene.objs[i].mesh.lockRotation) {
                        for (var j=1;j<scene.objs[i].transform.length;j++) {
                            scene.objs[i].transform[j].x = scene.objs[i].mesh.vertices[j].x + scene.objs[i].sgPosition.x;
                            scene.objs[i].transform[j].y = scene.objs[i].mesh.vertices[j].y + scene.objs[i].sgPosition.y;
                            scene.objs[i].transform[j].z = scene.objs[i].mesh.vertices[j].z + scene.objs[i].sgPosition.z;
                        }
                    }
                }
                cb(renderer.zSortObjs);
            }
        };
        this.project = function(cb) {
            for (var i=0;i<scene.objs.length;i++) {
                for (var j=0;j<scene.objs[i].transform.length;j++) {
                    var scaleRatio = camera.focalLength / scene.objs[i].transform[j].z;
                    var obj = {};
                    obj.x = scene.objs[i].transform[j].x * scaleRatio + renderer.centerX;
                    obj.y = scene.objs[i].transform[j].y * scaleRatio + renderer.centerY;
                    scene.objs[i].vertices2.push(obj);
                }
            }
            cb(renderer.draw);
        };
        this.zSort = [];
        this.zSortObjs = function(cb) {
            renderer.zSort = [];
            for (var i=0;i<scene.objs.length;i++) {
                for (var j=0;j<scene.objs[i].mesh.faces.length;j++) {
                    var transform = JSON.parse(JSON.stringify(scene.objs[i].transform)),
                        vertices2 = JSON.parse(JSON.stringify(scene.objs[i].vertices2)),
                        face = JSON.parse(JSON.stringify(scene.objs[i].mesh.faces[j])),
                        style = JSON.parse(JSON.stringify(scene.objs[i].mesh.faces[j][4])),
                        textured = scene.objs[i].mesh.faces[j][7] && scene.objs[i].mesh.textured,
                        p1 = {}, p2 = {}, p3 = {}, p4 = {},
                        pts = [p1,p2,p3,p4];
                    /*  
                        VERTEX ORDER:
                        2 <- 1
                        |
                        v
                        3 -> 4
                    */
                    p1.v3 = transform[face[0]];
                    p1.v2 = vertices2[face[0]];
                    p1.v2.u = 640;
                    p1.v2.v = 0;
                    p2.v3 = transform[face[1]];
                    p2.v2 = vertices2[face[1]];
                    p2.v2.u = 0;
                    p2.v2.v = 0;
                    p3.v3 = transform[face[2]];
                    p3.v2 = vertices2[face[2]];
                    p3.v2.u = 0;
                    p3.v2.v = 360;
                    p4.v3 = transform[face[3]];
                    p4.v2 = vertices2[face[3]];
                    p4.v2.u = 640;
                    p4.v2.v = 360;
                    var zInd = 0;
                    for (var k=0;k<pts.length;k++) {
                        zInd += pts[k].v3.z;
                    }
                    var visible = scene.objs[i].visible;
                    var zObj = {obj:scene.objs[i], face:face, p1:p1, p2:p2, p3:p3, p4:p4, zInd:zInd, visible:visible, fillStyle:style, cull:false, textured:textured};
                    renderer.zSort.push(zObj);
                }
            }
            renderer.zSort.sort(function(a,b) {
                return b.zInd - a.zInd;
            });
            cb(renderer.updateStats);
        };
        this.draw = function(cb) {
            if (renderer.skip) {
                renderer.skip = false;
                return;
            } else {
                ctx.clearRect(0,0,maxWidth,maxHeight);   // clear canvas
                for (var i=0;i<renderer.zSort.length;i++) {   // loop through faces
                    if (renderer.zSort[i].visible) {   // if face visible
                        renderer.backfaceCull(renderer.zSort[i]);   // backface cull
                        if (!renderer.zSort[i].cull) {   // if not culled
                            var normal = BGem3.Math.getNormal(renderer.zSort[i]),
                                angle = normal.angle,
                                shade = 1-(angle/Math.PI),
                                shine = 1-(angle/Math.PI)*1.2,
                                fillStyle = renderer.zSort[i].fillStyle,
                                pts = [
                                    renderer.zSort[i].p1.v2,
                                    renderer.zSort[i].p2.v2,
                                    renderer.zSort[i].p3.v2,
                                    renderer.zSort[i].p4.v2
                                ];
                            // draw path
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo( pts[0].x, pts[0].y );
                            ctx.lineTo( pts[1].x, pts[1].y );
                            ctx.lineTo( pts[2].x, pts[2].y );
                            ctx.lineTo( pts[3].x, pts[3].y );
                            ctx.lineTo( pts[0].x, pts[0].y );
                            ctx.closePath();
                            // stroke
                            var r = Math.floor(fillStyle[0]*shade) + Math.floor(fillStyle[0]*shine + 50*shine),
                                g = Math.floor(fillStyle[1]*shade) + Math.floor(fillStyle[1]*shine + 50*shine),
                                b = Math.floor(fillStyle[2]*shade) + Math.floor(fillStyle[2]*shine + 50*shine);
                            ctx.strokeStyle="rgb("+r+","+g+","+b+")";
                            ctx.stroke();
                            // fill
                            var r = Math.floor(fillStyle[0]*shade) + Math.floor(fillStyle[0]*shine + 50*shine),
                                g = Math.floor(fillStyle[1]*shade) + Math.floor(fillStyle[1]*shine + 50*shine),
                                b = Math.floor(fillStyle[2]*shade) + Math.floor(fillStyle[2]*shine + 50*shine);
                            ctx.fillStyle="rgb("+r+","+g+","+b+")";
                            ctx.fill();
                            // texture
                            if (renderer.zSort[i].textured) {
                                pts = renderer.overDraw(pts);
                                ctx.beginPath();
                                ctx.moveTo( pts[0].x, pts[0].y );
                                ctx.lineTo( pts[1].x, pts[1].y );
                                ctx.lineTo( pts[2].x, pts[2].y );
                                ctx.lineTo( pts[3].x, pts[3].y );
                                ctx.lineTo( pts[0].x, pts[0].y );
                                ctx.closePath();
                                ctx.clip();
                                var tris = [[0,1,3],[1,2,3]];
                                for (var t=0; t<tris.length; t++) {
                                    var pp = tris[t],
                                        p1 = pp[0], p2 = pp[1], p3 = pp[2],
                                        x0 = pts[p1].x, x1 = pts[p2].x, x2 = pts[p3].x,
                                        y0 = pts[p1].y, y1 = pts[p2].y, y2 = pts[p3].y,
                                        u0 = pts[p1].u, u1 = pts[p2].u, u2 = pts[p3].u,
                                        v0 = pts[p1].v, v1 = pts[p2].v, v2 = pts[p3].v;
                                    var delta = u0*v1+v0*u2+u1*v2-v1*u2-v0*u1-u0*v2,
                                        da = x0*v1+v0*x2+x1*v2-v1*x2-v0*x1-x0*v2,
                                        db = u0*x1+x0*u2+u1*x2-x1*u2-x0*u1-u0*x2,
                                        dc = u0*v1*x2+v0*x1*u2+x0*u1*v2-x0*v1*u2-v0*u1*x2-u0*x1*v2,
                                        dd = y0*v1+v0*y2+y1*v2-v1*y2-v0*y1-y0*v2,
                                        de = u0*y1+y0*u2+u1*y2-y1*u2-y0*u1-u0*y2,
                                        df = u0*v1*y2+v0*y1*u2+y0*u1*v2-y0*v1*u2-v0*u1*y2-u0*y1*v2;
                                    ctx.transform(
                                        da/delta, dd/delta,
                                        db/delta, de/delta,
                                        dc/delta, df/delta
                                    );
                                    ctx.drawImage(texture, 0, 0);
                                }
                                ctx.restore();
                            }
                        }
                    }
                }
            }
            cb(renderer.post);
        };
        this.skip = true;
        this.debug = [];
        this.updateStats = function(cb) {
            var html = "";
            for (var i=0;i<renderer.debug.length;i++) {
                html += renderer.debug[i][0]+": "+renderer.debug[i][1]+"<br>";
            }
            $("#debug").html(html);
            cb();
        };
        this.showFPS = true;
        this.updateFPS = function() {
            updateFPS = setInterval(function() {
                var statsHtml = "fps: "+renderer.trackFPS;
                $("#fps").html( statsHtml );
                renderer.trackFPS = 0;
            },1000);
        };
        this.trackFPS = 0;
        if (this.showFPS) {
            this.updateFPS();
        };
        this.backfaceCull = function(obj) {
            var a = obj.p1.v2,
                b = obj.p2.v2,
                c = obj.p3.v2,
                ax = b.x - a.x,
                ay = b.y - a.y,
                bx = b.x - c.x,
                by = b.y - c.y,
                z = (ax*by) - (ay*bx);
            if (z<0) {
                obj.cull = true;
            } else {
                obj.cull = false;
            }
        };
        this.overDraw = function(pts) {
            var pts = pts,
                scale = 1.03,
                p1 = pts[0],
                p2 = pts[1],
                p3 = pts[2],
                p4 = pts[3],
                x1 = pts[2].x - pts[0].x,
                y1 = pts[2].y - pts[0].y,
                x2 = pts[3].x - pts[1].x,
                y2 = pts[3].y - pts[1].y;
            var m1 = y1/x1,
                m2 = y2/x2,
                b1 = p1.y - m1*p1.x,
                b2 = p2.y - m2*p2.x,
                mx = (b2-b1) / (m1-m2),
                my = m1*mx + b1;
            for (var i=0;i<pts.length;i++) {
                var dist = BGem3.Math.getDist(mx,my,pts[i].x,pts[i].y),
                    angle = BGem3.Math.getAngle(mx,my,pts[i].x,pts[i].y),
                    r = dist * scale;
                pts[i].x = mx + Math.cos(angle) * r;
                pts[i].y = my + Math.sin(angle) * r;
            }
            return pts;
        };
        this.post = function() {};
    };

    BGem3.Controller = function(obj) {
        this.div = obj.div;
        this.mouseX = 0;
        this.mouseY = 0;
        this.events = {
            desktop:['mousedown','mousemove','mouseup'],
            mobile:['touchstart','touchmove','touchend']
        };
        this.bindEvents = function(device) {
            var desktop = device=='desktop';
            var ev = desktop? this.events.desktop : this.events.mobile;
            $(this.div).bind(ev[0], function(event) {
                controller.mouseX = desktop? event.pageX : event.originalEvent.touches[0].pageX;
                controller.mouseY = desktop? event.pageY : event.originalEvent.touches[0].pageY;
                $(this).bind(ev[1], function(event) {
                    var dX = desktop? event.pageX-controller.mouseX : event.originalEvent.touches[0].pageX-controller.mouseX;
                    var dY = desktop? event.pageY-controller.mouseY : event.originalEvent.touches[0].pageY-controller.mouseY;
                    for (var i=0;i<scene.objs.length;i++) {
                        scene.objs[i].gRotation.y -= dX/2;
                        scene.objs[i].gRotation.x -= dY/2;
                    }
                    controller.mouseX = desktop? event.pageX : event.originalEvent.touches[0].pageX;
                    controller.mouseY = desktop? event.pageY : event.originalEvent.touches[0].pageY;
                }).bind(ev[2], function(event) {
                    $(this).unbind(ev[1]);
                    for (var i=0;i<scene.objs.length;i++) {
                        scene.objs[i].applyGlobalRot = true;
                    }
                });
            });
        };
        this.bindEvents('desktop');
        this.bindEvents('potato');
    };

    BGem3.MathFunc = function() {
        this.getDist = function(x1,y1,x2,y2) {
            var dx = x1 - x2,
                dy = y1 - y2,
                dist = Math.sqrt(dx*dx + dy*dy);
            return dist;
        };
        this.getAngle = function(x1,y1,x2,y2) {
            var angle;
            if (x2>=x1 && y2>=y1) { // quad i
                angle = Math.atan((y2-y1)/(x2-x1)); 
            }
            else if (x2<=x1 && y2>=y1) { // quad ii
                angle = 0.5*Math.PI - Math.atan((x2-x1)/(y2-y1));   
            }
            else if (x2<=x1 && y2<=y1) { // quad iii
                angle = Math.PI + Math.atan((y2-y1)/(x2-x1));
            }
            else if (x2>=x1 && y2<=y1) { // quad iv
                angle = 1.5*Math.PI - Math.atan((x2-x1)/(y2-y1));
            }
            return angle;
        };
        this.round2 = function(num) {
            return Math.round((num + 0.00001) * 100) / 100;
        };
        this.random = function(a,b) {
            var c = b - a;
            return Math.floor(Math.random()*c+a);
        };
        this.getNormal = function(obj) {
            var light = {x:100,y:-200,z:50};
            var p1 = obj.p1,
                p2 = obj.p2,
                p3 = obj.p3;
            var Ax = p2.v3.x - p1.v3.x,
                Ay = p2.v3.y - p1.v3.y,
                Az = p2.v3.z - p1.v3.z,
                Bx = p3.v3.x - p1.v3.x,
                By = p3.v3.y - p1.v3.y,
                Bz = p2.v3.z - p1.v3.z;
            var Cx = Ay*Bz - Az*By,
                Cy = Az*Bx - Ax*Bz,
                Cz = Ax*By - Ay*Bx;
            var ax = Cx +0.01,
                ay = Cy +0.01,
                az = Cz +0.01,
                bx = light.x,
                by = light.y,
                bz = light.z;
            var angle = Math.acos( (ax*bx+ay*by+az*bz) / Math.sqrt((ax*ax+ay*ay+az*az)*(bx*bx+by*by+bz*bz)) ),
                normal = {x:Cx, y:Cy, z:Cz, angle:angle};
            return normal;
        };
    };
    BGem3.Math = new BGem3.MathFunc();

// the end.
