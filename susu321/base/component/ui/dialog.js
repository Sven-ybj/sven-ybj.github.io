define(function() {

  function Dialog(){

  }
  Dialog.prototype={
    alert:function(msg,callback){
      msg=msg||"提示信息";
      
        var template=(function(){/*
        <div class="modal modal-vue-dialog fade bs-example-modal-sm" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-sm" role="document">
          <div class="modal-content">

            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal"><span>×</span></button>
              <h4 class="modal-title" id="mySmallModalLabel">温馨提示</h4>
            </div>
            <div class="modal-body">
              {msg}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-dismiss="modal">确定</button>
            </div>
          </div>
        </div>
        </div>
      */}).heredoc({ 'msg':msg });

      var el=document.createElement('div');
      el.innerHTML=template;
      document.body.appendChild(el);

      setTimeout(function(){
        $(el).find(".modal").modal({'show':true,backdrop:'static'}).on('hidden.bs.modal', function (e) {
          $(this).parent().remove();
          callback && callback();
        });
      },30);

    },
    confirm:function(msg,callback){
      var params={
        title:"温馨提示",
        msg:"温馨提示",
        buttons:["确定","取消"],
        callback:null,
        cancallback:null
      };
      if(base.isString(msg)){
        params.msg=msg;
        params.callback=callback;
      }else if(base.isObject(msg)){
        params=base.extend(params,msg);
      }

        var template=(function(){/*
        <div class="modal modal-vue-dialog fade bs-example-modal-sm" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-sm" role="document">
          <div class="modal-content">

            <div class="modal-header">
              <h4 class="modal-title" id="mySmallModalLabel">{title}</h4>
            </div>
            <div class="modal-body">
              {msg}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary">{button0}</button>
              <button type="button" class="btn btn-warning">{button1}</button>
            </div>
          </div>
        </div>
        </div>`
      */}).heredoc({ 'msg':params.msg,'title':params.title,'button0':params.buttons[0],'button1':params.buttons[1] });

      var el=document.createElement('div');
      el.innerHTML=template;
      document.body.appendChild(el);

      setTimeout(function(){
        var mod=$(el).find(".modal");
        mod.modal({'show':true,backdrop:'static',keyboard:false});
        mod.find("button:eq(0)").click(function(){
          if(!(params.callback && params.callback()===false)){
            mod.modal("hide");
          }
        });
        mod.find("button:eq(1)").click(function(){
          if(!(params.cancallback && params.cancallback()===false)){
            mod.modal("hide");
          }
        });

        mod.on('hidden.bs.modal', function (e) {
          $(this).parent().remove();
        });
      },30);

    }
  }

  var exports=new Dialog();

  return exports;

});