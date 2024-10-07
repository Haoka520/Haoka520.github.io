/**
 * 类库名称：jQuery.marquee
 * 实现功能：基于 jquery 实现的 marquee 无缝滚动插件
 * 作者主页：http://www.miaoqiyuan.cn/
 * 联系邮箱：mqycn@126.com
 * 使用说明：http://www.miaoqiyuan.cn/p/jquery-marquee
 * 最新版本：http://git.oschina.net/mqycn/jQueryMarquee
*/
jQuery.fn.extend({
	marquee : function(opt, callback){
		opt = opt || {};
		opt.speed = opt.speed || 30;
		opt.direction = opt.direction || 'left';
		opt.pixels = opt.pixels || 2;
		switch( opt.direction ){
			case "left":
			case "right":
				opt.weight = "width";
				opt.margin = "margin-left";
				opt.tpl = '<table><tr><td>[TABLE]</td><td>[TABLE]</td></tr></table>';
				break;
			case "top":
			case "bottom":
				opt.weight = "height";
				opt.margin = "margin-top";
				opt.tpl = '<table><tr><td>[TABLE]</td></tr></tr><td>[TABLE]</td></tr></table>';
				break;
			default:
				throw Error("[jQuery.marquee.js] Options.direction Error!");
		}
		
		switch( opt.direction ){
			case "left":
			case "top":
				opt.addon = -1;
				break;
			case "right":
			case "bottom":
				opt.addon = 1;
				break;
			default:
				throw Error("[jQuery.marquee.js] Options.direction Error!");
		}
		
		callback = typeof callback == "function" ? callback : function(){};
		
		//设置宽度
		$(this).each(function(){
			if( this.control ){
				clearInterval(this.control);
			} else {
				//如果第一次执行，初始化代码
				$(this)
					.data(opt.weight, opt.weight == 'width' ? $(this).find("table").width() : $(this).find("table").height())
					.width($(this).data(opt.weight) * 2)
					.html(opt.tpl.replace(/\[TABLE\]/ig, $(this).html()))
					.mouseover(function(){
						$(this).data("pause", true);
					}).mouseout(function(){
						$(this).data("pause", false);
					});
			}
			this.control = setInterval((function(){
				if( $(this).data("pause") ){
					return;
				}
				var _margin = parseInt($(this).css(opt.margin)) + opt.addon * opt.pixels;
				if( opt.addon == -1 && _margin + $(this).data(opt.weight) < 0 ){
					_margin = 0;
				}else if( opt.addon == 1, _margin > 0 ){
					_margin = -1 * $(this).data(opt.weight);
				}
				$(this).css(opt.margin, _margin + "px");
				callback.bind(this)();
			}).bind(this), opt.speed);
		});
		
		return $(this);
	}
});
