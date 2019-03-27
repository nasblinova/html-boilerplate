'use strict';

var header = function () {
	var me = {};
	me.init = function () {
		console.log('header');
	};
	return me;
}();
'use strict';

var initPage = function initPage() {
	//document.querySelector('a[href*="#"]') && anchorSmooth.init();

};

var DOMReady = function DOMReady(a, b, c) {
	b = document, c = 'addEventListener';
	b[c] ? b[c]('DOMContentLoaded', a) : window.attachEvent('onload', a);
};

DOMReady(initPage);
//# sourceMappingURL=main.js.map
