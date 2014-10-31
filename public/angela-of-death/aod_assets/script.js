  $(document).ready(function(){
    setTimeout(function(){
      window.tremula = createTremula();
      applyBoxClick();
      loadManually();
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
      isLooping         	:false,

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
      {url:"https://www.dropbox.com/s/f6e8qmw3vfcfx0b/2014_0730_AoD_41.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/p80c5euqm21k779/2014_0730_AoD_21.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/vuqa9igk1tzlwqs/2014_0730_AoD_24.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/sqq0izq1zw7zyu8/2014_0730_AoD_11.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/v0yho7fcyaavnw6/2014_0730_AoD_37.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/z9f1c4taon7g7yk/2014_0730_AoD_31.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/58l3mdz9yqo72e6/2014_0730_AoD_03.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/e5gvmivq5d4q5w1/2014_0730_AoD_05.JPG?dl=1", h:3000, w:2000},
      {url:"https://www.dropbox.com/s/tnthhqod3r4cjom/2014_1018_AngelaOfDeath_01.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/9f1l9uyd2nrk70c/2014_1018_AngelaOfDeath_02.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/srbop565f8ef1nz/2014_1018_AngelaOfDeath_03.JPG?dl=1", h:1200, w:800},
      {url:"https://www.dropbox.com/s/ztgtfrszj4zpxvx/2014_1018_AngelaOfDeath_04.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/crqtqj3pqmggyt9/2014_1018_AngelaOfDeath_05.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/grgrisppohlxqgw/2014_1018_AngelaOfDeath_06.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/hb99hcnjtac7rg6/2014_1018_AngelaOfDeath_07.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/veomvqh42l6fmpj/2014_1018_AngelaOfDeath_08.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/6rk32jwh5809hj7/2014_1018_AngelaOfDeath_09.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/qfzb9yd42l81uq5/2014_1018_AngelaOfDeath_10.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/s5n4i59ckfk5osv/2014_1018_AngelaOfDeath_11.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/8rlcryq7x6qsnsm/2014_1018_AngelaOfDeath_12.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/92x1q80ao258fsw/2014_1018_AngelaOfDeath_13.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/1mp8ky6ufzh7ruf/2014_1018_AngelaOfDeath_14.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/579bzsg4gnztusi/2014_1018_AngelaOfDeath_15.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/qo2lzua1a6ss406/2014_1018_AngelaOfDeath_16.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/c1tcedtzh5bzsi5/2014_1018_AngelaOfDeath_17.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/ugit12dq4e22eyw/2014_1018_AngelaOfDeath_18.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/vonnyslywfmlw09/2014_1018_AngelaOfDeath_19.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/xr93stebv7luqay/2014_1018_AngelaOfDeath_20.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/pafib7mo5eh1ihz/2014_1018_AngelaOfDeath_21.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/cviwgp3yavqqr60/2014_1018_AngelaOfDeath_22.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/252qc9wyr0xk7hv/2014_1018_AngelaOfDeath_23.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/3qlvl1k6c63i3xz/2014_1018_AngelaOfDeath_24.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/clne4cwhplt806r/2014_1018_AngelaOfDeath_25.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/h1g1v42jyu6r2xu/2014_1018_AngelaOfDeath_26.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/8oe21p9kpy7qa3w/2014_1018_AngelaOfDeath_27.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/j6fb9l6g2xpqyxk/2014_1018_AngelaOfDeath_28.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/6etj31g3fe0o73r/2014_1018_AngelaOfDeath_29.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/8ff5j8w7h7zurzm/2014_1018_AngelaOfDeath_30.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/p2hvspgpzx8d1c8/2014_1018_AngelaOfDeath_31.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/di1xuhfw5gs91pp/2014_1018_AngelaOfDeath_32.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/v1zkws8qkuolkmq/2014_1018_AngelaOfDeath_33.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/i3t6gp8ykbrzuob/2014_1018_AngelaOfDeath_34.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/ntbq9p4ljpjms0u/2014_1018_AngelaOfDeath_35.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/hvnhfztlwv12ya1/2014_1018_AngelaOfDeath_36.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/o21ffktmzxa8skc/2014_1018_AngelaOfDeath_37.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/83z2alcslik3kfq/2014_1018_AngelaOfDeath_38.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/9wr3vs3icx3pgua/2014_1018_AngelaOfDeath_39.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/wxc1ywy4j95el5k/2014_1018_AngelaOfDeath_40.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/88yaedwpv1t7tul/2014_1018_AngelaOfDeath_42.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/hyqp1n5471tc5fs/2014_1018_AngelaOfDeath_43.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/gmlx074t5a5shyp/2014_1018_AngelaOfDeath_44.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/n27cseqpcc4ccii/2014_1018_AngelaOfDeath_45.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/9nvuvk2jcoa3h8c/2014_1018_AngelaOfDeath_46.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/8bjsk7yusv67hbi/2014_1018_AngelaOfDeath_47.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/r9lm3rd166ubzun/2014_1018_AngelaOfDeath_48.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/oyinvpxzlc14phj/2014_1018_AngelaOfDeath_49.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/s85zfum901k1shv/2014_1018_AngelaOfDeath_50.JPG?dl=1"},
      {url:"https://www.dropbox.com/s/v48a2e86pv8bmyo/2014_1018_AngelaOfDeath_51.JPG?dl=1"},
      {
        url: "https://www.dropbox.com/s/j8dkxl5rgfmz1ga/2014_1018_AngelaOfDeath_52.JPG?dl=1"
      },
      {url:"https://www.dropbox.com/s/u3ema1y7unz5d8m/2014_1018_AngelaOfDeath_53.JPG?dl=1"},
      {
        url: "https://www.dropbox.com/s/qwh3pwbj2z5ep3x/2014_1018_AngelaOfDeath_54.JPG?dl=1"
      },
      {url:"https://www.dropbox.com/s/hgndf6qqjyibm6s/2014_1018_AngelaOfDeath_55.JPG?dl=1"}
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
    this.template = this.data.template||('<img draggable="false" class="moneyShot" onload="imageLoaded(this)" src=""/>');
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



