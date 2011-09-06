/// <reference path="jquery-1.6.2-vsdoc.js" />
jQuery.download = function(url, data, method){
	//url and data options required
	if( url && data ){ 
		//data can be string of parameters or array/object
		data = typeof data == 'string' ? data : jQuery.param(data);
		//split params into form inputs
		var inputs = '';
		jQuery.each(data.split('&'), function(){ 
			var pair = this.split('=');
			inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />'; 
		});
		//send request
		jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
		.appendTo('body').submit().remove();
	};
};


(function ($) {
  
  File = Backbone.Model.extend({ 
  
  });

  Query = Backbone.Model.extend({
    url: "/search",

    initialize: function() {
      this.bind('change:text', this.render);
    },

    parse: function(response) {
      files.reset(response.Files);
      query.set({ count: response.Count, time: response.Time });
    },

    render: function() {
      var text = this.get('text');
      this.fetch({ data: { q: text } });
    }

  });

  Files = Backbone.Collection.extend({
    model: File,
  });
  
  window.query = new Query();
  window.files = new Files();
  window.download = new Files();

  FileView = Backbone.View.extend({
    tagName: 'li',
   
    events: {
      'change input[type=checkbox]' : 'select'
    },

    initialize: function() { 
      this.template = $('#file-template');
    },

    render: function() {
      var content = this.template.tmpl(this.model.toJSON());
      $(this.el).html(content);
      return this;
    },

    select: function(e) {
      if(window.download.getByCid(this.model.cid)) {
        window.download.remove(this.model);
      } else {
        window.download.add(this.model)
      }
    }

  });

  HelpView = Backbone.View.extend({
    
    events: {
      "keydown" : "show",
      "click #help-view span.wi" : "close",
      "click" : "nofocus"
    },

    initialize: function() {
      this.menu = $('#help-view');
    },

    nofocus: function(e) {
      if(this.menu.is(':visible') && $(e.target).parents('#' + this.menu.attr('id')).length != 1) {
        this.menu.toggle();
      }
    },

    close: function() {
      this.menu.toggle();
    },

    show: function(e) {
      if(e.shiftKey && e.keyCode === 191 && e.target.type != "text") {
        this.menu.toggle();
      }
    }

  });
  
  ResultsView = Backbone.View.extend({

    initialize: function() {
      this.collection.bind('reset', this.render, this);
    },

    render: function() {
      $(this.el).empty();
		  var els = [];
		  this.collection.each(function(model){
			  var view = new FileView({model : model});
		    els.push(view.render().el);
		  });
		  $(this.el).append(els);
		  return this;
    },

  });

  StatsView = Backbone.View.extend({
    
    initialize: function() {
      this.template = $('#stats-template');
      this.model.bind('change:time', this.render, this);
    },

    render: function() {
      var content = this.template.tmpl(this.model.toJSON());
      $(this.el).html(content);
      return this;
    }

  });

  MenuView = Backbone.View.extend({
    
    initialize: function() {
      this.template = $('#menu-template');
      this.model.bind('change:count', this.render, this);
    },

    render: function() {
      $(this.el).empty();
      if(this.model.get('count') > 0 ) {
        var content = this.template.tmpl();
        $(this.el).html(content);
      }
      return this;
    }

  });

  SearchFormView = Backbone.View.extend({
    
    initialize: function() {
      this.template = $('#form-template');
    },

    events: {
      'submit #search-form' : 'query'
    },

    render: function() {
      var content = this.template.tmpl(this.model.toJSON());
      $(this.el).html(content);
      return this;
    },

    query: function(e) {
      e.preventDefault();
      app.navigate("search/" + $('#search').val(), true);
    }

  });

  DownloadView = Backbone.View.extend({
    
    initialize: function() {
      this.template = $('#download-item-template');
      this.collection.bind("add", this.render, this);
      this.collection.bind("remove", this.render, this);
    },

    render: function() {
      var content = this.template.tmpl(this.collection.toJSON());
      $(this.el).html(content);
      return this;
    }

  });

  Google = Backbone.Router.extend({
    
    initialize: function() {
      var query = new Query();
      this.formView = new SearchFormView({ model: window.query, el: $("#search-form") });
      this.resultsView = new ResultsView({ model: window.query, collection: window.files, el: $("#search-results") });
      this.helpView = new HelpView({ el: $("body") });
      this.statsView = new StatsView({ model: window.query, el: $('#result-stats') });
      this.menuView = new MenuView({ model: window.query, el: $('#menu') });
      this.downloadView = new DownloadView({ collection: window.download, el: $('#download-list') });
    },

    routes: {
      '' : 'index',
      'search/:q' : 'search'
    },

    index: function() {
      this.formView.render();
    },

    search: function(q) {
      window.query.set({ text: q });
      this.formView.render();
    }

  });

  $(function () {
    app = new Google();
    Backbone.history.start();

    $('body').ajaxError(function(e) {
      console.log(e);
    });

  });

})(jQuery);

