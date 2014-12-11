  $(document).ready(function(){
    setTimeout(function(){
      window.tremula = createTremula();
      applyBoxClick();
      loadManually();
      autoColumnSize(window.tremula);
    },10);
  });

  var height = (window.innerHeight/2);

  function createTremula(){

    // .tremulaContainer must exist and have actual dimentionality 
    // requires display:block with an explicitly defined H & W
    $tremulaContainer = $('.tremulaContainer');

    //this creates a hook to a new Tremula instance
    var tremula = new Tremula();

    //Create a config object -- this is how most default behaivior is set.
    //see updateConfig(prop_val_object,refreshStreamFlag) method to change properties of a running instance
    var config = {

      //Size of the static axis in pixels
       //If your scroll axis is set to 'x' then this will be the normalized height of your content blocks.
       //If your scroll axis is set to 'y' then this will be the normalized width of your content blocks.
      itemConstraint      :height,//px

      //Margin in px added to each side of each content item
      itemMargins         :[20,10],//x (left & right), y (top & bottom) in px

      //Display offset of static axis (static axis is the non-scrolling dimention)
      staticAxisOffset    :0,//px

      //Display offset of scroll axis (this is the amount of scrollable area added before the first content block)
      scrollAxisOffset    :20,//px

      //Sets the scroll axis 'x'|'y'.
      //NOTE: projections generally only work with one scroll axis
      //when changeing this value, make sure to use a compatible projection
      scrollAxis          :'x',//'x'|'y'

      //surfaceMap is the projection/3d-effect which will be used to display grid content
      //following is a list of built-in projections with their corresponding scroll direction
      //NOTE: Using a projection with an incompatible Grid or Grid-Direction will result in-not-so awesome results
      //----------------------
      // (x or y) xyPlain
      // (x) streamHorizontal
      // (y) pinterest
      // (x) mountain
      // (x) turntable
      // (x) enterTheDragon
      // (x) userProjection  <-- 
      //----------------------
      surfaceMap          :tremula.projections.streamHorizontal,

      //how many rows (or colums) to display.  note: this is zero based -- so a value of 0 means there will be one row/column
      staticAxisCount     :0,//zero based 

      //the grid that will be used to project content
      //NOTE: Generally, this will stay the same and various surface map projections
      //will be used to create various 3d positioning effects
      defaultLayout       :tremula.layouts.xyPlain,

      //it does not look like this actually got implemented so, don't worry about it ;)
      itemPreloading      :true,

      //enables the item-level momentum envelope
      itemEasing          :false,

      //enables looping with the current seet of results
      isLooping         	:true,

      //if item-level easing is enabled, it will use the following parameters
      //NOTE: this is experimental. This effect can make people queasy.
      itemEasingParams    :{
        touchCurve          :tremula.easings.easeOutCubic,
        swipeCurve          :tremula.easings.easeOutCubic,
        transitionCurve     :tremula.easings.easeOutElastic,
        easeTime            :500,
        springLimit         :40 //in px
      },

      //method called after each frame is painted. Passes internal parameter object.
      //see fn definition below
      onChangePub					: doScrollEvents,

      //content/stream data can optionally be passed in on init()
      data                : null,

      // lastContentBlock enables a persistant content block to exist at the end of the stream at all times.
      // Common use case is to target $('.lastContentItem') with a conditional loading spinner when API is churning.
      lastContentBlock 		: {
        template :'<div class="lastContentItem"></div>',
        layoutType :'tremulaBlockItem',
        noScaling:true,
        w:300,
        h:300,
        isLastContentBlock:true,
        adapter:tremula.dataAdapters.TremulaItem
      },

      //dafault data adapter method which is called on each data item -- this is used if none is supplied during an import operation
      //enables easy adaptation of arbitrary API data formats -- see flickr example
      adapter             :null

    };

    //initalize the tremula instance with 3 parameters: 
    //a DOM container, a config object, and a parent context
    tremula.init($tremulaContainer,config,this);

    //return the tremula hook 
    return tremula;
  }

  function doScrollEvents(o){
    if(o.scrollProgress>.7){
      if(!tremula.cache.endOfScrollFlag){
        tremula.cache.endOfScrollFlag = true;
        pageCtr++;
        loadManually();
        console.log('END OF SCROLL!')
      }
    }
  };

  function loadManually(){
    var arr = [
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0753.jpg", title:"Stars on the first morning."},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0767.jpg", title:"My dad."},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0777.jpg", title:""},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/scope.jpg", h:1000, w:1000, title:"A buck through the scope."},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0793.jpg", title:""},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0808.jpg", title:"The moon rising against failing daylight."},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0812.jpg", title:"Cleaning the deer at night, beneath the stars."},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0818.jpg", title:"Walking out under full moonlight and heavy fog the following morning."},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0825.jpg", title:""},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/antlers.jpg", h:1200, w:800, title:""},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0833.jpg", title:""},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/vertical_shadows.jpg", h:1200, w: 800, title:""},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0842.jpg", title:"My dad and my uncle."},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0845.jpg", title:""},
      {url:"https://s3.amazonaws.com/andjosh/2014-12-10/JRB_0848.jpg", title:""}
    ];
    tremula.appendData(arr,manualDataAdapter);
    tremula.cache.endOfScrollFlag = true;
  }
  function manualDataAdapter(data, env){
    this.data = data;
    this.w = this.width = data.w || 1200;
    this.h = this.height = data.h || 800;
    this.imgUrl = data.url;
    this.auxClassList = "ManualRS";//stamp each mapped item with map ID 
    this.template = this.data.template||('<img draggable="false" class="moneyShot" onload="imageLoaded(this)" src=""/><div class="boxLabel">'+data.title+'</div>');
  }
  function applyBoxClick(){
    $('.tremulaContainer').on('tremulaItemSelect',function(gestureEvt,domEvt){
      // console.log(gestureEvt,domEvt)
      var 
        $e = $(domEvt.target);
        t = $e.closest('.gridBox')[0];
      if(t){
        var data = $.data(t).model.model.data;
      }
      // if(data)alert(JSON.stringify(data));
      if (data) {
        var dl = window.confirm('Download the image?');
        if (dl){
          window.location = data.url;
        }
      };
    })
  }

  function autoColumnSize(t){
    var
      targetSizeFactor = .9
      ,g = t.Grid
      ,saDim_ = g.saDim_
      ,si_ = g.si_
      ,currentCount = g.staticAxisCount
      ,margin = g.itemMargins[si_]*2
      ,eStaticAxisLessMargin = (t.$e[saDim_]()-margin) * (1/(currentCount+1))
      ,currentConstraint = g.itemConstraint
      ,newFactor = Math.max(.1,eStaticAxisLessMargin/currentConstraint)
      ,newConstraint = targetSizeFactor*currentConstraint*newFactor-margin;

    if(newConstraint!=currentConstraint){
      g.updateConfig({itemConstraint:newConstraint},true);
    }

  }

//====================
// This is a custom Projection template which allows you to specify your own bezier path
// To use, modify the above configuration @ surfaceMap -->  surfaceMap : userProjection,

//EXPERIMENTAL! Generally, this works, But it's not particularly tested. Some paths may not work as expected.
//Please file bugs to https://github.com/garris/TremulaJS/issues

// ALSO:  This currently only works in horizontal mode.  Vertical coming soon.

// Handy bezier editor/visualizer here --> https://www.desmos.com/calculator/iaf7aha9yl

	var userPath = [
		{x:0,y:.2},
		{x:.5,y:.5},
		{x:.5,y:.8},
		{x:1,y:.5}
	];



	function userProjection(x,y){

		var curve = userPath;

		var 
		grid0 = this.parent.gridDims[0],
		grid1 = this.parent.gridDims[1],
		axisLength = this.parent.currentGridContentDims,
		tRamp = this.waves.tailRamp,
		hRamp = this.waves.headRamp,
		tri = this.waves.triangle,
		xo,
		yo;

		var xyFactor = [
			grid0,
			grid1
		];

		var cubicBezier = jsBezier.factorCurveBy(curve,xyFactor);
		
		var p = jsBezier.pointOnCurve(cubicBezier, tRamp);
		var g = jsBezier.gradientAtPoint(cubicBezier, tRamp);

		var xo = p.x - (this.dims[0]*.5);

		var yo = grid1 - p.y - (this.dims[1]*.5) - (((axisLength[1]-this.dims[1])*.5) - y - this.itemMargins[1]);

		var zo = 0;

		this.e.style.transformOrigin = this.e.style.webkitTransformOrigin = this.e.style.MozTransformOrigin = '50%';
		
		this.e.style.transform = this.e.style.MozTransform = this.e.style.webkitTransform = 'translate3d(' + xo + 'px,' + yo +'px, ' + zo + 'px)' + ' rotateZ('+g*40+120+'deg)';

		var z = 10000-this.index;
		this.e.style.zIndex = z;

		this.e.style.opacity = 1;
     //this.e.style.zIndex = Math.abs(Math.floor(tri*100));
    
    
		this.pPos = [x,y];
	}



