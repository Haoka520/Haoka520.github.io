/**
 * ydui main
 */
!(function (window) {
  'use strict';

  var doc = window.document,
    ydui = {};

  /**
   * 直接绑定FastClick
   */
  $(window).on('load', function () {
    typeof FastClick == 'function' && FastClick.attach(doc.body);
  });

  var util = (ydui.util = {
    /**
     * 格式化参数
     * @param string
     */
    parseOptions: function (string) {
      if ($.isPlainObject(string)) {
        return string;
      }

      var start = string ? string.indexOf('{') : -1,
        options = {};

      if (start != -1) {
        try {
          options = new Function(
            '',
            'var json = ' + string.substr(start) + '; return JSON.parse(JSON.stringify(json));'
          )();
        } catch (e) {}
      }
      return options;
    },
    /**
     * 页面滚动方法【移动端】
     * @type {{lock, unlock}}
     * lock：禁止页面滚动, unlock：释放页面滚动
     */
    pageScroll: (function () {
      var fn = function (e) {
        e.preventDefault();
        e.stopPropagation();
      };
      var islock = false;

      return {
        lock: function () {
          if (islock) return;
          islock = true;
          doc.addEventListener('touchmove', fn);
        },
        unlock: function () {
          islock = false;
          doc.removeEventListener('touchmove', fn);
        },
      };
    })(),
    /**
     * 本地存储
     */
    localStorage: (function () {
      return storage(window.localStorage);
    })(),
    /**
     * Session存储
     */
    sessionStorage: (function () {
      return storage(window.sessionStorage);
    })(),
    /**
     * 序列化
     * @param value
     * @returns {string}
     */
    serialize: function (value) {
      if (typeof value === 'string') return value;
      return JSON.stringify(value);
    },
    /**
     * 反序列化
     * @param value
     * @returns {*}
     */
    deserialize: function (value) {
      if (typeof value !== 'string') return undefined;
      try {
        return JSON.parse(value);
      } catch (e) {
        return value || undefined;
      }
    },
  });

  /**
   * HTML5存储
   */
  function storage(ls) {
    return {
      set: function (key, value) {
        ls.setItem(key, util.serialize(value));
      },
      get: function (key) {
        return util.deserialize(ls.getItem(key));
      },
      remove: function (key) {
        ls.removeItem(key);
      },
      clear: function () {
        ls.clear();
      },
    };
  }

  /**
   * 判断css3动画是否执行完毕
   * @git http://blog.alexmaccaw.com/css-transitions
   * @param duration
   */
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false,
      $el = this;

    $(this).one('webkitTransitionEnd', function () {
      called = true;
    });

    var callback = function () {
      if (!called) $($el).trigger('webkitTransitionEnd');
    };

    setTimeout(callback, duration);
  };

  if (typeof define === 'function') {
    define(ydui);
  } else {
    window.YDUI = ydui;
  }
})(window);

/**
 * Device
 */
!(function (window) {
  var doc = window.document,
    ydui = window.YDUI,
    ua = (window.navigator && window.navigator.userAgent) || '';

  var ipad = !!ua.match(/(iPad).*OS\s([\d_]+)/),
    ipod = !!ua.match(/(iPod)(.*OS\s([\d_]+))?/),
    iphone = !ipad && !!ua.match(/(iPhone\sOS)\s([\d_]+)/);

  ydui.device = {
    /**
     * 是否移动终端
     * @return {Boolean}
     */
    isMobile: !!ua.match(/AppleWebKit.*Mobile.*/) || 'ontouchstart' in doc.documentElement,
    /**
     * 是否IOS终端
     * @returns {boolean}
     */
    isIOS: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    /**
     * 是否Android终端
     * @returns {boolean}
     */
    isAndroid: !!ua.match(/(Android);?[\s\/]+([\d.]+)?/),
    /**
     * 是否ipad终端
     * @returns {boolean}
     */
    isIpad: ipad,
    /**
     * 是否ipod终端
     * @returns {boolean}
     */
    isIpod: ipod,
    /**
     * 是否iphone终端
     * @returns {boolean}
     */
    isIphone: iphone,
    /**
     * 是否webview
     * @returns {boolean}
     */
    isWebView: (iphone || ipad || ipod) && !!ua.match(/.*AppleWebKit(?!.*Safari)/i),
    /**
     * 是否微信端
     * @returns {boolean}
     */
    isWeixin: ua.indexOf('MicroMessenger') > -1,
    /**
     * 是否火狐浏览器
     */
    isMozilla: /firefox/.test(navigator.userAgent.toLowerCase()),
    /**
     * 设备像素比
     */
    pixelRatio: window.devicePixelRatio || 1,
  };
})(window);

/**
 * 解决:active这个高端洋气的CSS伪类不能使用问题
 */
!(function (window) {
  window.document.addEventListener(
    'touchstart',
    function (event) {
      /* Do Nothing */
    },
    false
  );
})(window);

/**
 * CitySelect Plugin
 */
!(function (window) {
  'use strict';

  var $body = $(window.document.body);

  function CitySelect(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, CitySelect.DEFAULTS, options || {});
    this.init();
  }

  CitySelect.DEFAULTS = {
    provance: '',
    city: '',
    area: '',
  };

  CitySelect.prototype.init = function () {
    var _this = this,
      options = _this.options;

    if (typeof YDUI_CITYS == 'undefined') {
      console.error('请在ydui.js前引入ydui.citys.js。下载地址：http://cityselect.ydui.org');
      return;
    }

    _this.citys = YDUI_CITYS;

    _this.createDOM();

    _this.defaultSet = {
      provance: options.provance,
      city: options.city,
      area: options.area,
    };
  };

  CitySelect.prototype.open = function () {
    var _this = this;

    $body.append(_this.$mask);

    // 防止火狐浏览器文本框丑丑的一坨小水滴
    YDUI.device.isMozilla && _this.$element.blur();

    _this.$mask.on('click.ydui.cityselect.mask', function () {
      _this.close();
    });

    var $cityElement = _this.$cityElement,
      defaultSet = _this.defaultSet;

    $cityElement
      .find('.cityselect-content')
      .removeClass('cityselect-move-animate cityselect-next cityselect-prev');

    _this.loadProvance();

    if (defaultSet.provance) {
      _this.setNavTxt(0, defaultSet.provance);
    } else {
      $cityElement.find('.cityselect-nav a').eq(0).addClass('crt').html('请选择');
    }

    if (defaultSet.city) {
      _this.loadCity();
      _this.setNavTxt(1, defaultSet.city);
    }

    if (defaultSet.area) {
      _this.loadArea();
      _this.ForwardView(false);
      _this.setNavTxt(2, defaultSet.area);
    }

    $cityElement.addClass('brouce-in');
  };

  CitySelect.prototype.close = function () {
    var _this = this;

    _this.$mask.remove();
    _this.$cityElement
      .removeClass('brouce-in')
      .find('.cityselect-nav a')
      .removeClass('crt')
      .html('');
    _this.$itemBox.html('');
  };

  CitySelect.prototype.createDOM = function () {
    var _this = this;

    _this.$mask = $('<div class="mask-black"></div>');

    _this.$cityElement = $(
      '' +
        '<div class="m-cityselect">' +
        '    <div class="cityselect-header">' +
        '        <p class="cityselect-title">所在地区</p>' +
        '        <div class="cityselect-nav">' +
        '            <a href="javascript:;" ></a>' +
        '            <a href="javascript:;"></a>' +
        '            <a href="javascript:;"></a>' +
        '        </div>' +
        '    </div>' +
        '    <ul class="cityselect-content">' +
        '        <li class="cityselect-item">' +
        '            <div class="cityselect-item-box"></div>' +
        '        </li>' +
        '        <li class="cityselect-item">' +
        '            <div class="cityselect-item-box"></div>' +
        '        </li>' +
        '        <li class="cityselect-item">' +
        '            <div class="cityselect-item-box"></div>' +
        '        </li>' +
        '    </ul>' +
        '</div>'
    );

    $body.append(_this.$cityElement);

    _this.$itemBox = _this.$cityElement.find('.cityselect-item-box');

    _this.$cityElement.on('click.ydui.cityselect', '.cityselect-nav a', function () {
      var $this = $(this);

      $this.addClass('crt').siblings().removeClass('crt');

      $this.index() < 2 ? _this.backOffView() : _this.ForwardView(true);
    });
  };

  CitySelect.prototype.setNavTxt = function (index, txt) {
    var $nav = this.$cityElement.find('.cityselect-nav a');

    index < 2 && $nav.removeClass('crt');

    $nav.eq(index).html(txt);
    $nav
      .eq(index + 1)
      .addClass('crt')
      .html('请选择');
    $nav
      .eq(index + 2)
      .removeClass('crt')
      .html('');
  };

  CitySelect.prototype.backOffView = function () {
    this.$cityElement
      .find('.cityselect-content')
      .removeClass('cityselect-next')
      .addClass('cityselect-move-animate cityselect-prev');
  };

  CitySelect.prototype.ForwardView = function (animate) {
    this.$cityElement
      .find('.cityselect-content')
      .removeClass('cityselect-move-animate cityselect-prev')
      .addClass((animate ? 'cityselect-move-animate' : '') + ' cityselect-next');
  };

  CitySelect.prototype.bindItemEvent = function () {
    var _this = this,
      $cityElement = _this.$cityElement;

    $cityElement.on('click.ydui.cityselect', '.cityselect-item-box a', function () {
      var $this = $(this);

      if ($this.hasClass('crt')) return;
      $this.addClass('crt').siblings().removeClass('crt');

      var tag = $this.data('tag');

      _this.setNavTxt(tag, $this.text());

      var $nav = $cityElement.find('.cityselect-nav a'),
        defaultSet = _this.defaultSet;

      if (tag == 0) {
        _this.loadCity();
        $cityElement.find('.cityselect-item-box').eq(1).find('a').removeClass('crt');
      } else if (tag == 1) {
        _this.loadArea();
        _this.ForwardView(true);
        $cityElement.find('.cityselect-item-box').eq(2).find('a').removeClass('crt');
      } else {
        defaultSet.provance = $nav.eq(0).html();
        defaultSet.city = $nav.eq(1).html();
        defaultSet.area = $nav.eq(2).html();

        _this.returnValue();
      }
    });
  };

  CitySelect.prototype.returnValue = function () {
    var _this = this,
      defaultSet = _this.defaultSet;

    _this.$element.trigger(
      $.Event('done.ydui.cityselect', {
        provance: defaultSet.provance,
        city: defaultSet.city,
        area: defaultSet.area,
      })
    );

    _this.close();
  };

  CitySelect.prototype.scrollPosition = function (index) {
    var _this = this,
      $itemBox = _this.$itemBox.eq(index),
      itemHeight = $itemBox.find('a.crt').height(),
      itemBoxHeight = $itemBox.parent().height();

    $itemBox.parent().animate(
      {
        scrollTop: $itemBox.find('a.crt').index() * itemHeight - itemBoxHeight / 3,
      },
      0,
      function () {
        _this.bindItemEvent();
      }
    );
  };

  CitySelect.prototype.fillItems = function (index, arr) {
    var _this = this;

    _this.$itemBox.eq(index).html(arr).parent().animate({ scrollTop: 0 }, 10);

    _this.scrollPosition(index);
  };

  CitySelect.prototype.loadProvance = function () {
    var _this = this;

    var arr = [];
    $.each(_this.citys, function (k, v) {
      arr.push(
        $(
          '<a class="' +
            (v.n == _this.defaultSet.provance ? 'crt' : '') +
            '" href="javascript:;"><span>' +
            v.n +
            '</span></a>'
        ).data({
          citys: v.c,
          tag: 0,
        })
      );
    });
    _this.fillItems(0, arr);
  };

  CitySelect.prototype.loadCity = function () {
    var _this = this;

    var cityData = _this.$itemBox.eq(0).find('a.crt').data('citys');

    var arr = [];
    $.each(cityData, function (k, v) {
      arr.push(
        $(
          '<a class="' +
            (v.n == _this.defaultSet.city ? 'crt' : '') +
            '" href="javascript:;"><span>' +
            v.n +
            '</span></a>'
        ).data({
          citys: v.a,
          tag: 1,
        })
      );
    });
    _this.fillItems(1, arr);
  };

  CitySelect.prototype.loadArea = function () {
    var _this = this;

    var areaData = _this.$itemBox.eq(1).find('a.crt').data('citys');

    var arr = [];
    $.each(areaData, function (k, v) {
      arr.push(
        $(
          '<a class="' +
            (v == _this.defaultSet.area ? 'crt' : '') +
            '" href="javascript:;"><span>' +
            v +
            '</span></a>'
        ).data({ tag: 2 })
      );
    });

    if (arr.length <= 0) {
      arr.push($('<a href="javascript:;"><span>全区</span></a>').data({ tag: 2 }));
    }
    _this.fillItems(2, arr);
  };

  function Plugin(option) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var $this = $(this),
        citySelect = $this.data('ydui.cityselect');

      if (!citySelect) {
        $this.data('ydui.cityselect', (citySelect = new CitySelect(this, option)));
      }

      if (typeof option == 'string') {
        citySelect[option] && citySelect[option].apply(citySelect, args);
      }
    });
  }

  $.fn.citySelect = Plugin;
})(window);

(function () {
  'use strict';
})();
