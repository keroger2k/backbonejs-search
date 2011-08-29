module('Models Tests');  

 

test('Events', 1, function() {

  var file = new File();
  file.bind('change', function() { 
    equals(file.get('text'), 'test', 'event fired correctly');
  });
  
  file.set({ 'text': 'test'});
});
