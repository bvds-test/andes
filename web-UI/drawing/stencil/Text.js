dojo.provide("drawing.stencil.Text");

drawing.stencil.Text = drawing.util.oo.declare(
	// summary:
	//	Creates a dojox.gfx Text (SVG or VML) based on data provided.
	// description:
	//	There are two text classes. TextBlock extends this one and
	//	adds editable functionality, discovers text width etc.
	//	This class displays text only. There is no line wrapping.
	//	Multiple lines can be acheived by inserting \n linebreaks
	//	in the text.
	//
	drawing.stencil._Base,
	function(options){
		// summary: constructor.
	},
	{
		type:"drawing.stencil.Text",
		anchorType:"none",
		baseRender:true,
		
		// align: String
		//	Text horizontal alignment.
		//		Options: start, middle, end
		align:"start",
		//
		// valign:String
		//	Text vertical alignment
		//		Options: top, middle, bottom (FIXME: bottom not supported)
		valign:"top",
		//
		// _lineHeight: [readonly] Number
		// 	The height of each line of text. Based on style information
		//	and font size.
		_lineHeight:1,
		
		/*=====
		dojox.__StencilData = {
			// summary:
			//	the data used to create the dojox.gfx Text
			// x: Number
			//	Left point x
			// y: Number
			//	Top point y
			// width: ? Number
			//	Optional width of Text. Not required but reccommended.
			//	for auto-sizing, use TextBlock
			// height: ? Number
			//	Optional height of Text. If not provided, _lineHeight is used.
			// text: String
			//	The string content. If not provided, may auto-delete depending on defaults.
		}
		
		dojox.__StencilPoints = [
			// summary:
			//	An Array of dojox.__StencilPoint objects that describe the Stencil
			// 0: Object
			//	Top left point
			// 1: Object
			//	Top right point
			// 2: Object
			//	Bottom right point
			// 3: Object
			//	Bottom left point
		]
		=====*/
		
		setText: function(text){
			// summary:
			//	Setter for text.
			//
			this._text = text;
			this._textArray = [];
			this.created && this.render(text);
		},
		
		getText: function(){
			// summary:
			//	Getter for text.
			//
			return this._text;	
		},
		
		dataToPoints: function(/*Object*/o){
			//summary:
			//	Converts data to points.
			o = o || this.data;
			var w = o.width =="auto" ? 1 : o.width;
			var h = o.height || this._lineHeight;
			this.points = [
				{x:o.x, y:o.y}, 						// TL
				{x:o.x + w, y:o.y},				// TR
				{x:o.x + w, y:o.y + h},	// BR
				{x:o.x, y:o.y + h}				// BL
			];
			return this.points;
		},
		pointsToData: function(/*Array*/p){
			// summary:
			//	Converts points to data
			p = p || this.points;
			var s = p[0];
			var e = p[2];
			this.data = {
				x: s.x,
				y: s.y,
				width: e.x-s.x,
				height: e.y-s.y
			};
			return this.data;
		},
		
		render: function(/* String*/text){
			// summary:
			//	Renders the 'hit' object (the shape used for an expanded
			//	hit area and for highlighting) and the'shape' (the actual
			//	display object). Text is slightly different than other
			//	implementations. Instead of calling render twice, it calls
			//	_createHilite for the 'hit'
			// arguments:
			//		text String
			//			Changes text if sent. Be sure to use the setText and
			//			not to call this directly.
			//
			this.remove(this.shape, this.hit);
			!this.annotation && this.renderHit && this._renderOutline();
			if(text){
				this._text = text;
				this._textArray = this._text.split("\n");	
			}
			
			var d = this.pointsToData();
			var w = d.width;
			var h = this._lineHeight;
			var x = d.x + this.style.text.pad*2;
			var y = d.y + this._lineHeight - (this.textSize*.4);
			if(this.valign=="middle"){
				y -= h/2;
			}
			this.shape = this.container.createGroup();
			
			/*console.log("    render ", this.type, this.id)
			console.log("    render Y:", d.y, "textSize:", this.textSize, "LH:", this._lineHeight)
			console.log("    render text:", y, " ... ", this._text, "enabled:", this.enabled);
			console.log("    render text:", this.style.currentText);
			*/
			dojo.forEach(this._textArray, function(txt, i){
				var tb = this.shape.createText({x: x, y: y+(h*i), text: unescape(txt), align: this.align})
					.setFont(this.style.currentText)
					.setFill(this.style.currentText.color);
				
				this._setNodeAtts(tb);
			
			}, this);
			
			this._setNodeAtts(this.shape);
			
		},
		_renderOutline: function(){
			// summary:
			//	Create the hit and highlight area
			//	for the Text.
			//
			if(this.annotation){ return; }
			var d = this.pointsToData();
			
			if(this.align=="middle"){
				d.x -= d.width/2 - this.style.text.pad * 2;
			}else if(this.align=="start"){
				d.x += this.style.text.pad;
			}else if(this.align=="end"){
				d.x -= d.width - this.style.text.pad * 3;
			}
			
			if(this.valign=="middle"){
				d.y -= (this._lineHeight )/2 - this.style.text.pad;
			}
			
			this.hit = this.container.createRect(d)
				.setStroke(this.style.currentHit)
				.setFill(this.style.currentHit.fill);
			
			this._setNodeAtts(this.hit);
			this.hit.moveToBack();
		}
	}
);