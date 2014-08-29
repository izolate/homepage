var Loc = function() {

  var self = this;

  // request
  this.req = new XMLHttpRequest();
  this.req.overrideMimeType('application/json');

  // get location
  Loc.prototype.get_location = function() {

    this.req.onreadystatechange = function() {
      ready = (self.req.readyState === 4 && self.req.status === 200);

      self.update_location( ready? self.req.responseText : false );
    };

    this.req.open('GET', 'location.json', true);
    this.req.send();
  };

  Loc.prototype.update_location = function(response) {
    if (response) {
      var elem = document.getElementById('current-location');
      response = JSON.parse(response);
      elem.innerHTML = response.location;
    }
  };

};

loc = new Loc();
loc.get_location();
