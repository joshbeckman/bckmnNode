( function( window ) {
  var b = document.getElementById('runner'),
      rs = document.getElementsByClassName('sound'),
      i = 0,
      length = rs.length;
  b.onclick = function() {
    var rs = document.getElementsByClassName('sound'),
        i = 0,
        length = rs.length;
    for (; i < length; i++) {
      classie.toggle(rs[i], 'run');
    }
  };
})( window );
