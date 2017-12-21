define(function() {

  function Loading(){}
  Loading.prototype={
    open:function(msg){
      msg=msg||"";
      var isShow=msg ?"":"hide",
        mode=base.operatingSystem.IE9LTET?"ie9lt":"normal";


      this.template=$(`<div class="vue-loading-indicator">
              <div class="vue-loading-indicator-wrapper">
                <span class="vue-loading-indicator-spin">
                  <div class="vue-loading-spinner-snake ${mode}"></div>
                </span>
                <span class="vue-loading-indicator-text ${isShow}">${msg}</span>
                </div>
                <div class="vue-loading-indicator-mask">
              </div>
            </div>`);

      $("body").append(this.template);
    },
    close:function(){
      $(".vue-loading-indicator").remove();
    }
  }

  var exports=new Loading();

  return exports;

});