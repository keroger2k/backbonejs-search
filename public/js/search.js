(function($) {

  window.File = Backbone.Model.extend({

  });

  window.Files = Backbone.Collection.extend({
    model: File,
  });

  window.FilesView = Backbone.View.extend({
    tagName: 'ol',
    className: 'search-results',

    events: {
      "change input[type=checkbox]": "checkChange"
    },
    
    initialize: function() {
      _.bindAll(this, 'render');
      this.template = $('#files-template');
    },

    render: function() {
      var html = this.template.tmpl(this.collection.toJSON());
      $(this.el).html(html);
      return this;
    },

    checkChange: function(evt) {
      console.log(this.model);
    }

  });

  window.Query = Backbone.Model.extend({
    
    defaults: {
      text: '',
      count: 0,
      time: '00:00'
    },

    url: function() {
      return 'search?q=' + this.get('text'); 
    },

    parse: function(response) {
      this.set({
        count: response.Count,
        time: response.Time,
      });
      this.files.reset(response.Files);
    },

    initialize: function() {
      this.bind('change:text', this.changedText);
      this.files = new Files();
    },

    changedText: function() {
      this.fetch();
    }

  });

  window.QueryView = Backbone.View.extend({

    events: {
      'submit' : 'search'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'updateQueryResults');
      this.template = $('#queryview-template');
      this.filesView = new FilesView({
        collection: this.model.files,
        model: new Query()
      });
    },

    render: function() {
      var html = this.template.tmpl(this.model.toJSON());
      $(this.el).html(html);
      return this;
    },

    search: function(e) {
      e.preventDefault();
      this.model.set({ 
        text: $('#search').val() 
      });
      window.App.navigate('search/' + this.model.get('text'), true);
    }

  });

  window.Google= Backbone.Router.extend({

    routes: {
      '': 'home',
      'search/:q': 'search'
    },

    initialize: function() {
      this.queryView = new QueryView();
    },

    home: function() {
      var $container = $('#container');
      $container.append(this.queryView.render().el);
    },

    search: function(q) {
      var $container = $('container');
      $container.append(this.queryView.filesView.render().el);
    }

  });

  $(function() {
    window.App = new Google();
    Backbone.history.start();
  });

})(jQuery);
