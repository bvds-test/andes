dojo.provide("drawing.manager.Canvas");

(function(){
	
	var _surface;
	//dojox.gfx.renderer
	
	drawing.manager.Canvas = drawing.util.oo.declare(
		function(options){
			dojo.mixin(this, options);
			
			var dim = dojo.contentBox(this.srcRefNode);
			this.height = this.parentHeight = dim.h;
			this.width = this.parentWidth = dim.w;
			this.domNode = dojo.create("div", {id:"canvasNode"}, this.srcRefNode);
			dojo.style(this.domNode, {
				width:this.width,
				height:"auto"
			});
			
			dojo.setSelectable(this.domNode, false);
			
			this.id = this.id || this.util.uid("surface");
			
			_surface = dojox.gfx.createSurface(this.domNode, this.width, this.height);
			_surface.whenLoaded(this, function(){
				setTimeout(dojo.hitch(this, function(){
					this.surfaceReady = true;
					if(dojo.isIE){
						//_surface.rawNode.parentNode.id = this.id;
					}else if(dojox.gfx.renderer == "silverlight"){
						this.id = this.domNode.firstChild.id
					}else{
						//_surface.rawNode.id = this.id;
					}
					
					this.underlay = _surface.createGroup();
					this.surface = _surface.createGroup();
					this.overlay = _surface.createGroup();
					
					this.surface.setTransform({dx:0, dy:0,xx:1,yy:1});
					this.surface.getDimensions = dojo.hitch(_surface, "getDimensions");
					if(options.callback){
						options.callback(this.domNode);
					}
				}),500);
			});
			this._mouseHandle = this.mouse.register(this);
		},
		{
			id:"",
			width:0,
			height:0,
			parentHeight:0, // may change on pane or browser resize
			parentWidth:0, // may change on pane or browser resize
			domNode:null,
			srcRefNode:null,
			util:null,
			mouse:null,
			useScrollbars: true,
			baseClass:"drawingCanvas",
			surfaceReady:false,
			
			blockScrollbars: function(block){
				this._scrollBlocked = block;
			},

			onDown: function(obj){
				this.blockScrollbars(true);
			},
			onUp: function(obj){
				this.blockScrollbars(false);
			},
			showScrollbars: function(showing){
				if(this.useScrollbars && showing){
					dojo.style(this.domNode.parentNode, {
						overflowY: this.height > this.parentHeight ? "scroll" : "hidden",
						overflowX: this.width > this.parentWidth ? "scroll" : "hidden"
					});
				}else{
					dojo.style(this.domNode.parentNode, {
						overflowY: "hidden",
						overflowX: "hidden"
					});
				}
				
			},
			setXYWH: function(){
				this.width = 900;
				this.height = 600
				_surface.setDimensions(this.width, this.height);
				this.domNode.parentNode.scrollTop = 100;
				this.domNode.parentNode.scrollLeft = 0;
				dojo.style(this.domNode.parentNode, {
					overflowY: this.height > this.parentHeight ? "scroll" : "hidden",
					overflowX: this.width > this.parentWidth ? "scroll" : "hidden"
				});
			},
			resize: function(width, height){
				this.parentWidth = width;
				this.parentHeight = height;
				this.setDimensions(width, height);
			},
			setDimensions: function(width, height, scrollx, scrolly){
				// changing the size of the surface and setting scroll
				// if items are off screen
				//
			
				var sw = this.getScrollWidth() //+ 10;
				this.width = Math.max(width, this.parentWidth);
				this.height = Math.max(height, this.parentHeight);
				
				if(this.height>this.parentHeight){
					this.width -= sw;
				}
				if(this.width>this.parentWidth){
					this.height -= sw;
				}
				
				_surface.setDimensions(this.width, this.height);
				//var d = _surface.getDimensions();
		
				
				clearTimeout(this.vrl);
					this.vrl = setTimeout(function(){
					console.warn("SET DIM", this.width, this.height)
				},100)
			
				//return;
			
				this.domNode.parentNode.scrollTop = scrolly || 0;
				this.domNode.parentNode.scrollLeft = scrollx || 0;
				
				
				if(this.useScrollbars){
					//console.info("Set Canvas Scroll", (this.height > this.parentHeight), this.height, this.parentHeight)
					dojo.style(this.domNode.parentNode, {
						overflowY: this.height > this.parentHeight ? "scroll" : "hidden",
						overflowX: this.width > this.parentWidth ? "scroll" : "hidden"
					});
				}else{
					dojo.style(this.domNode.parentNode, {
						overflowY: "hidden",
						overflowX: "hidden"
					});
				}
			},
			
			
			setZoom: function(zoom){
				this.surface.setTransform({xx:zoom, yy:zoom});
			},
			
			onScroll: function(){
				// stub 	
			},
			
			getScrollOffset: function(){
				return {
					top:this.domNode.parentNode.scrollTop,
					left:this.domNode.parentNode.scrollLeft		
				};
			},
			
			getScrollWidth: function() {
				var p = dojo.create('div');
				p.innerHTML = '<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:0px;left:-1000px;"><div style="height:100px;"></div>';
				var div = p.firstChild;
				dojo.body().appendChild(div);
				var noscroll = dojo.contentBox(div).h;
				dojo.style(div, "overflow", "scroll")
				var scrollWidth = noscroll - dojo.contentBox(div).h;
				dojo.destroy(div);
				this.getScrollWidth = function(){
					return scrollWidth;
				}
				return scrollWidth;
			}
		}
	);
	
})();