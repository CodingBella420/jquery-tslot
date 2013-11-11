/**
 * @file
 * The jquery plugin structure is lent from "Building an Object-Oriented jQuery
 * Plugin" as I'm not smarty pants.
 *
 * @see http://www.virgentech.com/blog/2009/10/building-object-oriented-jquery-plugin.html
 */


(function ($) {

  // The object constructor to attach as jquery plugin below.
  var tSlotsWheel = function (element, options) {
    var elem = $(element);
    var obj = this;

    var settings = $.extend({
      param: 'defaultValue'
    }, options || {});

    // Public method - can be called from client code
    this.publicMethod = function () {
      console.log('public method called!');
    };

    // Private method - can only be called from within this object
    var privateMethod = function () {
      console.log('private method called!');
    };
  }

  // Attaching our tSlotsWheel object as plugin to jquery elements.
  $.fn.tSlotsWheel = function () {
    return this.each(function () {
      var element = $(this);

      // Return early if this element already has a plugin instance
      if (element.data('tSlotsWheel')) return;

      var tSW = new tSlotsWheel(this);

      // Store plugin object in this element's data
      element.data('tSlotsWheel', tSW);
    });
  };

})(jQuery);
