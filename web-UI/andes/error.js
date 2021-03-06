dojo.provide("andes.error");
dojo.provide("andes.error._Error");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");

(function(){

	var dialog = null;

	andes.error = function(spec){
		var message = spec.message || "An unknown error occurred.",
		    title = spec.title || "Error",
		    dialogType = spec.dialogType || 0;
		dialog.attr({
			content: message,
			title: title,
			dialogType: dialogType
		});
		dialog.show();
	};

	// dialogType constants
	andes.error.FATAL = 0;
	andes.error.OK = 1;

	dojo.declare("andes.error._Error", dijit.Dialog, {
		postCreate: function(){
			this.inherited(arguments);
			var container = dojo.create("div", {className:"dijitDialogPaneContent", style:"border-top:none;"});

			// andesButtonPageDefault -- just an OK button
			var props = {className:"andesButtonPage", id:"andesButtonPageDefault", style:"display:none;"};
			var page1 = dojo.create("div", props, container);
			var btn_OK = new dijit.form.Button({
				label:"OK",
				type:"submit"
			}, dojo.create("div", null, page1));

			dojo.place(container, this.domNode);
			this.buttonsNode = container;
		},

		_onKey: function(evt){
			if(this.dialogType == andes.error.FATAL){
				if(evt.charOrCode == dojo.keys.ESC || evt.charOrCode == dojo.keys.TAB){
					dojo.stopEvent(evt);
				}
				return;
			}
			this.inherited(arguments);
		},

		show: function(){
			dojo.query(".andesButtonPage", this.buttonsNode).style("display", "none");
			var node = this._chooseButtonPageNode();
			if(node){
				dojo.style(node, "display", "block");
				dojo.style(this.closeButtonNode, "display", "block");
			}else{
				dojo.style(this.closeButtonNode, "display", "none");
			}
			this.inherited(arguments);
		},

		_chooseButtonPageNode: function(){
			switch(this.dialogType){
				case andes.error.FATAL:
					return null; // fatal errors won't have any dialog buttons
					break;
				case andes.error.OK:
				default:
					return "andesButtonPageDefault";
			}
			return null;
		}
	});

	dojo.addOnLoad(function(){
		dialog = new andes.error._Error({
			id: "andesErrorDialog",
			title: "Error",
			style: "width:400px"
		});
	});

})();
