/**
 * @file
 * The jquery plugin structure is lent from "Building an Object-Oriented jQuery
 * Plugin" as I'm not smarty pants.
 *
 * @see http://www.virgentech.com/blog/2009/10/building-object-oriented-jquery-plugin.html
 */


(function ($) {

  /**
   * The object constructor to attach as jquery plugin below.
   */
  var tSlotsWheel = function (element, options) {
    // The jquery object for this wheel.
    var $wrapper = $(element);
    var $itemList = $wrapper.children('ul');
    // This $wheels object to store data and functions.
    var $wheel = this;

    // Holds the status of the current element.
    // - init
    // - ready
    // - starting
    // - spinning
    // - stopped
    this.status = 'init';
    // This is the current itemPosition of the element.
    this.itemPosition = 0;

    // For the moment it is supposed all elements have the same height, so we
    // can simply take the height of the first element.
    this.itemHeight = $itemList.children('li').first().outerHeight();
    this.itemCount = $itemList.children('li').size();

    // To get a seemless animation, we have to clone the first item to the last
    // item of the list.
    $itemList.children('li').first().clone().appendTo($itemList);

    // Vars
    this.spinningSpeed = 2000;
    this.spinningEasing = 'linear';

    /**
     * Starts spinning the wheel.
     */
    this.start = function () {

      // We can only start, if the wheel is spinning.
      if ($wheel.status != 'ready' && $wheel.status != 'stopped') {
        console.log('Cannot start wheel, as it is not ready.');
        return;
      }

      $wheel.status = 'starting';

      // Start spinning.
      $wheel.spin();
    };

    /**
     * Stops spinning the wheel.
     */
    this.stop = function () {
      // @todo: stop it.

      // We can only stop, if the wheel is spinning.
      if ($wheel.status != 'spinning') {
        console.log('Cannot stop wheel, as wheel is not spinning.');
        return;
      }

      var style = $wheel.getStyleForPosition($wheel.itemPosition + 1);

      $itemList.stop(true, false)
        .animate(
          style,
          $wheel.spinningSpeed,
          $wheel.spinningEasing,
          function() {
            $wheel.status = 'stopped';
            alert('Done!');
          }
        );

    };

    /**
     * Spins the wheel with a constant velocity, item by item.
     *
     * The function does one item after each other. So we have a fine grained
     * control, instead of animating a whole wheel spin.
     */
    this.spin = function () {
      var style = $wheel.getStyleForPosition(this.itemPosition + 1);

      $wheel.status = 'spinning';

      $itemList.animate(
        style,
        $wheel.spinningSpeed,
        $wheel.spinningEasing,
        // When the animation ends, we will start the animation again to scroll
        // to the next item.
        function () {
          // As the animation ended, we are now on the next item.
          $wheel.itemPosition++;

          // If we reached the last item, we have to reset the item, so the
          // animation can start over to the next item.
          if ($wheel.itemPosition == $wheel.itemCount) {
            $wheel.reset();
          }

          $wheel.spin();
        }
      );

    };

    /**
     * Reset the wheel to the first item.
     */
    this.reset = function() {
      var style = $wheel.getStyleForPosition(0);
      $itemList.css(style);
      // Mark the itemPosition we are at now.
      $wheel.itemPosition = 0;
    }

    /**
     * Provides css styles to show the item of a given item in the slot.
     *
     * @param int pos
     *   Position of the item (starts at 0)
     *
     * @return object
     *   Object containing css styles.
     */
    this.getStyleForPosition = function (pos) {
      var style = {
        "margin-top": '-' + (pos * $wheel.itemHeight) + 'px',
      };
      return style;
    }

    // Set ready status, after we registered all callbacks.
    this.status = 'ready';
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
