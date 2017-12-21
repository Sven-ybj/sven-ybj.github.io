base.ready(['paginator'],function(){
    
    //搜索菜单选择项点击事件
    $(".search-menu").on("click","li",function(){
        $(this).toggleClass("active");
    });

	NProgress.done();


    var currentPage = 1;
    var totalPages = 25;
    $("#page").bootstrapPaginator({
       bootstrapMajorVersion:3, //对应的bootstrap版本
       currentPage: currentPage, //当前页数
       numberOfPages: 10, //每次显示页数
       totalPages:totalPages, //总页数
       shouldShowPage:true,//是否总是显示首页、末页按钮
       useBootstrapTooltip:true,//使用tip提示
       //点击事件
       onPageClicked: function (event, originalEvent, type, page) {

       }
    });

    //计算搜索菜单是否出现更多按钮
    var _searchMenuHeight=$(".search-menu .fr:eq(0)").height();//存储原始高度
    //搜索菜单更多按钮点击事件
    $(".search-menu").on("click",".more",function(){
        if($(this).parent().height()>_searchMenuHeight){
            $(this).parent().height(_searchMenuHeight);
            $(this).find("span").text('更多').next().removeClass('glyphicon-menu-up');
        }else{
            $(this).parent().height('auto');
            $(this).find("span").text('收起').next().addClass('glyphicon-menu-up');
        }
    });
    function calcSearchMenuMoreButton(){
        $(".search-menu .fr").height(_searchMenuHeight);//恢复原始高度
        $(".search-menu .fr .more").remove();//移除所有更多按钮

        $(".search-menu .fr ul").each(function(){
            if($(this).height()>_searchMenuHeight){
                $(this).parent().addClass('more-model')
                        .append("<span class='more'><span>更多</span><i class='glyphicon glyphicon-menu-down'></i></span>")
            }
        });
    }
    calcSearchMenuMoreButton();
});