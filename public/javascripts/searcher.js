var searchField = document.getElementById('search-field'),
    searchSubmit = document.getElementById('search-submit');
if(searchField){
  searchSubmit.onclick = function(){
    window.location = window.location.origin+'/search?q='+searchField.value;
  }
  searchField.onkeydown = function(ev){
    if(ev.keyCode == 13){
      window.location = window.location.origin+'/search?q='+searchField.value;
    }
  }
}