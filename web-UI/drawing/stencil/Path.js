dojo.provide("drawing.stencil.Path");


drawing.stencil.Path = drawing.util.oo.declare(
	// summary:
	//	Creates a dojox.gfx Path based on points provided.
	//
	drawing.stencil._Base,
	function(options){
		dojo.disconnect(this._postRenderCon);

		if(options.points){
			this.points = options.points;
			this.render();
		}
	},
	{
		type:"drawing.stencil.Path",
		closePath: true,
		
		/*=====
		dojox.__StencilData = {
			// NOT SUPPORTED FOR PATH
		}
		
		dojox.__StencilPoints = [
			// summary:
			//	An Array of dojox.__StencilPoint objects that describe the Stencil
			// 0: Object
			//	First point
			// [1, 2, 3...] more points
		]
		=====*/
		
		_create: function(/*String*/shp, /*Object*/sty){
			// summary:
			//	Creates a dojox.gfx.shape based on passed arguments.
			//	Can be called many times by implementation to create
			//	multiple shapes in one stencil.
			//
			this.remove(this[shp]);
			if(!this.points.length){ return; }
			
			if(dojox.gfx.renderer=="svg"){
				// NOTE:
				// In order to avoid the Safari d="" errors,
				// we'll need to build a string and set that.
				var strAr = [];
				dojo.forEach(this.points, function(o, i){
					if(i==0){
						strAr.push("M " + o.x +" "+ o.y);
					}else{
						strAr.push("L " + o.x +" "+ o.y);
					}
				}, this);
				if(this.closePath){
					strAr.push("Z");
				}
				this[shp] = this.container.createPath(strAr.join(", ")).setStroke(sty);
				this.closePath && this[shp].setFill(sty.fill);
				
			}else{
				// Leaving this code for VML. It seems slightly faster but times vary.
				this[shp] = this.container.createPath({}).setStroke(sty);
				
				this.closePath && this[shp].setFill(sty.fill);
				
				dojo.forEach(this.points, function(o, i){
					if(i==0){
						this[shp].moveTo(o.x, o.y);
					}else{
						this[shp].lineTo(o.x, o.y);
					}
				}, this);
				
				this.closePath && this[shp].closePath();
			}
			
			this._setNodeAtts(this[shp]);
		},
		
		render: function(){
			// summary:
			//	Renders the 'hit' object (the shape used for an expanded
			//	hit area and for highlighting) and the'shape' (the actual
			//	display object).
			//
			this.onBeforeRender(this);
			this._create("hit", this.style.currentHit);
			this._create("shape", this.style.current);
			//console.log("path render")
		}		
		
	}
);
drawing.stencil.Path.name = "Path";
drawing.stencil.Path.drawable = false;