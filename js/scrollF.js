//插件方法开始
(function($, window) {
	var win = $(window);
	$.fn.extend({
		scrollF: function(obj) {
			var elevator = obj.container,
				elevatorH = elevator.height(),
				success = obj.success,
				selectorCallback = obj.selectorCallback,
				resizeCallback = obj.resizeCallback,
				error = obj.error,
				time = obj.time,
				deviation = obj.deviation,
				elem = this,
				lock = false,
				containerSelector = obj.containerSelector;
			if (!elevator) {
				return;
			}
			if (!$.isFunction(success)) {
				success = 0;
			}
			if (!$.isFunction(selectorCallback)) {
				selectorCallback = 0;
			}
			if (!$.isFunction(error)) {
				error = 0;
			}
			if (!$.isFunction(resizeCallback)) {
				resizeCallback = 0;
			}
			if (!$.isNumeric(time)) {
				time = 1000;
			}
			deviation = $.isNumeric(deviation) ? parseFloat(deviation) : 0;
			var eachElem = function() {
				if (lock) return;
				var ch = win.height(),
					i = 0,
					save = [],
					length = elem.length;
				for (; i < length; i++) {
					var top = elem[i].getBoundingClientRect().top,
						elemH = elem[i].offsetHeight;
					if (top > -1) {
						if (top < ch * (obj.proportion || .4)) {
							save[0] = i;
							break;
						}
						if (top <= ch && save.length == 0) {
							save[1] = i;
						}
					} else if (top + elemH > -1 && save[0] == null) {
						save[0] = i;
					}
				}
				if (save.length) {
					var index = save[0] == null ? save[1] : save[0];
					if (typeof(containerSelector) == "string") {
						var find = elevator.find(containerSelector),
							eq = find.eq(index);
						if (eq.length == 0) {
							return error.call(elevator, find, index);
						}
					}
					success && success.call(elevator, find, index);
				} else {
					error.call(elevator,
						typeof(containerSelector) == "string" ?
						elevator.find(containerSelector) :
						null);
				}
			}
			win.scroll(eachElem);
			eachElem();
			if (typeof(containerSelector) == "string") {
				var bh = $("body,html");
				elevator.on("click", containerSelector, function() {
					if (lock) return;
					lock = true;
					var index = $(this).index(),
						ei = elem[index],
						top = ei && ei.getBoundingClientRect().top + win.scrollTop();
					if (top == null) {
						lock = false;
					} else {
						var find = elevator.find(containerSelector);
						selectorCallback && selectorCallback.call(elevator, find, index);
						bh.animate({
							scrollTop: deviation?top - deviation:top
						}, time, function() {
							lock = false;
							eachElem();
						});
					}
				});
			}
			//改变浏览器大小时睡直居中开始
			win.resize((function(event) {
				if (resizeCallback && resizeCallback.call(elevator, event) === false) {
					return;
				}
				var winH = win.height();
				elevator.css("top", winH > elevatorH ? ((winH - elevatorH) / 2) : 0);
				return arguments.callee;
			})());
			//改变浏览器大小时睡直居中结束
		}
	});
})(jQuery, window);
//插件方法结束