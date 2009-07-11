dojo.provide("andes.drawing");


(function(){
	var drawingId = "drawing";
	var _drawing;
	var domLoaded = false;
	var stencilMods = {
		statement:"text",
		equation:"text",
		graphics:"image"
	}
	
	// better name
	var stencils = {
		rect: "drawing.stencil.Rect",
		ellipse: "drawing.stencil.Ellipse",
		vector: "drawing.tools.custom.Vector",
		axes: "drawing.tools.custom.Axes",
		textBlock:"drawing.tools.TextBlock"
	};
	
	var hasStatement = {
		"drawing.stencil.Rect":true,
		"drawing.stencil.Ellipse":true,
		"drawing.tools.custom.Vector":true,
		"drawing.tools.custom.Axes":true
	}
	var hasLabel = {
		"drawing.tools.custom.Axes":true
	}
	
	var items = {};
	
	var getStatementPosition = function(box){
		var gap = 10;
		return {data:{
			x:box.x2 + gap,
			y:box.y1,
			showEmpty:true
		}}
	};
	
	
	dojo.addOnLoad(function(){
		domLoaded = true;
		_drawing = dijit.byId(drawingId);
		var cn = dojo.connect(_drawing, "onSurfaceReady", function(){
			dojo.disconnect(cn);
			andes.drawing.onSurfaceReady();
		});
		dojo.connect(_drawing, "onRenderStencil", andes.drawing, "onRenderStencil");
		
	});
	andes.drawing = {
		
		onRenderStencil: function(item){
			console.log("drawing, new item:", item, "make label:", item.type);
			items[item.id] = {
				item:item
			};
			
			if(hasStatement[item.type]){
				var box = item.getBounds();
				var props = getStatementPosition(box);
				console.warn("statement...")
				var statement = _drawing.addStencil("textBlock", props);
				console.warn("statement !")
				item.connect(statement, "onChange", function(value){
					if(hasLabel[item.type]){
						item.setLabel(value);
						_drawing.removeStencil(statement);
					}else{
						items[item.id].linked = statement;
						items[statement.id] = {
							item:statement,
							linked:item
						}
						item.setLabel(andes.variablename.parse(value));
						
						//item.connect(statement, "destroy", item, "destroy");
						//item.connect(item, "destroy", statement, "destroy");
					}
				});
				
			}
			
			
		},
		
		onSurfaceReady: function(){
			//drawing.addStencil("image", {data:{src:"tests/images/BallOnWall.png", x:300, y:200, width:"auto"}});
			if(!this._initialData){ return; }
			dojo.forEach(this._initialData, function(obj){
				if(obj.action =="new-object"){
					if(obj.href) { obj.src = obj.href; }
					var item = _drawing.addStencil(stencilMods[obj.type], {data:obj});
					items[item.id] = {
						item:item
					}
				}
			});
		},
		
		load: function(auth){
			this.user = auth.u;
			this.project = auth.p;
			andes.api.open({user:this.user, problem:this.project}).addCallback(this, "onLoad").addErrback(this, "onError");
		},
		
		onLoad: function(data){
			console.info("Project Data Loaded");
			this._initialData = data;
			
			//DEV============================= >
			this._initialData = andes.drawing._initialData.reverse()
			
			var y=30, h = 25;
			dojo.forEach(this._initialData, function(obj, i){
				if(obj.action =="new-object"){
					if(i==0){
						y = obj.y
					}else{
						obj.y = y;
						y += obj.height || h;
					}
					console.log("OBJECT:", obj)
				}
			});
			
			
			// < ============================DEV 
			//console.dir(data);
			andes.api.close();
		},
		onError: function(err){
			console.error("There was an error loading project data:", err);
		}
	};
	
})();

/*
 var cb = function(){ console.warn("IN CALLBACK"); };
var eb = function(){ console.error("IN ERRBACK"); };

andes.api.open({user:"joe", problem:"s2e"}).addCallbacks(cb,eb);

andes.api.step({action:"new-object", id:"a3", type:"circle", mode:"unknown", x:66, y:188, radius:25, text:"ball"});

andes.api.close().addCallbacks(cb,eb);
*/