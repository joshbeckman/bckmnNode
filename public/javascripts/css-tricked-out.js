(function(window, document){
  var bannerTemplate = _.template([
    '<div class="wrapper">',
      '<p class="pull-center message">',
        '<%= message %>',
        '<a class="dismissAlert" id="dismissAlertBtn"><%= confirm %></a>',
      '</p>',
    '</div>'
    ].join('')),
    mainNav = document.getElementsByClassName('main-nav')[0],
    messages = document.getElementById('messages');

  if (window.innerWidth > 1085){
    setTimeout(stepOne, 1000);
  } else {
    setTimeout(notWide, 1000);
  }

  function stepOne(){
    messages.innerHTML = bannerTemplate({
      message: "Why, hello there. In the next few seconds, we're going to watch CSS-Tricks get CSS <span class='emph'>tricked-out!</span><br/>---<br/>You see, the prettiest part of this page (the tabbed menu bar) is NOT acheived with CSS - it's done with SVG images.",
      confirm: "OK, Let's Start"
    });
    messages.style.display = 'block';
    document.getElementById('dismissAlertBtn').addEventListener('click', stepTwo, false);
  }
  function stepTwo(){
    dismissAlert();
    setTimeout(function(){
      mainNav.className += ' tricked';
    }, 1000);
    setTimeout(function(){
      messages.innerHTML = bannerTemplate({
        message: "We've just removed the background SVG images from all of the menu 'tabs.'<br/>---<br/>Now, we're going to lay a bit of base border and styling to the tab elements themselves.",
        confirm: "I'm With You So Far"
      });
      messages.style.display = 'block';
      document.getElementById('dismissAlertBtn').addEventListener('click', stepThree, false);
    }, 2000);
  }
  function stepThree(){
    dismissAlert();
    setTimeout(function(){
      mainNav.className += ' base';
    }, 1000);
    setTimeout(function(){
      messages.innerHTML = bannerTemplate({
        message: "Now that we have a base, we can start adding the pseudo-elements that will round out the 'tabbed' nature of the menu items.<br/>---<br/>Let's start with the <code>:before</code> selector.",
        confirm: "Let's Do This"
      });
      messages.style.display = 'block';
      document.getElementById('dismissAlertBtn').addEventListener('click', stepFour, false);
    }, 2000);
  }
  function stepFour(){
    dismissAlert();
    setTimeout(function(){
      mainNav.className += ' before';
    }, 1000);
    setTimeout(function(){
      messages.innerHTML = bannerTemplate({
        message: "Now that we have the beginnings of a falling curve, we can end the tail with our second pseudo-element.<br/>---<br/>Let's finish with the <code>:after</code> selector.",
        confirm: "I Like Where This Is Going"
      });
      messages.style.display = 'block';
      document.getElementById('dismissAlertBtn').addEventListener('click', stepFive, false);
    }, 2000);
  }
  function stepFive(){
    dismissAlert();
    setTimeout(function(){
      mainNav.className += ' after';
    }, 1000);
    setTimeout(function(){
      messages.innerHTML = bannerTemplate({
        message: "Woohoo! We've successfully reconstructed those complex SVG images with pure CSS.<br/>---<br/>Now <span class='emph'>that's</span> a CSS trick.",
        confirm: "That's Pretty Cool!"
      });
      messages.style.display = 'block';
      document.getElementById('dismissAlertBtn').addEventListener('click', dismissAlert, false);
    }, 2000);
  }
  function notWide(){
    messages.innerHTML = bannerTemplate({
      message: "Oh Noes! Your device/screen is not wide enough (under 1085px) to see this demo.<br/>---<br/>Apologies all around.",
      confirm: "That's OK, I get it."
    });
    messages.style.display = 'block';
    document.getElementById('dismissAlertBtn').addEventListener('click', function(){
      window.location = 'http://' + window.location.host;
    }, false);
  }
  function dismissAlert(evt){
    // evt.preventDefault();
    messages.innerHTML = '';
    messages.style.display = 'none';
  }
})(this, this.document);