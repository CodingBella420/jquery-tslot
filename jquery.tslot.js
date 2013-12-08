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
   *
   * @param element
   *   The DOM element to convert to a slot wheel.
   * @param object options
   *   - spinningDuration: the duration for a single item to change
   *   - spinningBrake: the factor the spinning gets slower when stopping
   *   - itemsToStop: the number of items to roll, till the wheel stops
   */
  var tSlotsWheel = function (element, options) {

    /**
     * The jquery object for this wheel.
     *
     * @var
     */
    var $wrapper = $(element);

    /**
     * The jquery object for the list.
     *
     * @var
     */
    var $itemList = $wrapper.children('ul');

    /**
     * This $wheels object to store data and functions.
     *
     * @var
     */
    var $wheel = this;

    /**
     * Holds the status of the current element.
     *
     * @var string
     *   - init
     *   - ready
     *   - starting
     *   - spinning
     *   - stopping
     *   - stopped
     */
    this.status = 'init';

    // This is the current itemPosition of the element.
    this.itemPosition = $itemList.children('li').size();


    // Time since the item stands in that position.
    this.itemTime = +new Date;

    // For the moment it is supposed all elements have the same height, so we
    // can simply take the height of the first element.
    this.itemHeight = $itemList.children('li').first().outerHeight();
    this.itemCount = $itemList.children('li').size();


    this.prependedItems = this.itemCount;
    this.appendedItems = this.itemCount;

    // To get a seemless animation, we have to clone the first item to the last
    // item of the list.
    $itemList.children('li').clone().prependTo($itemList);
    $itemList.children('li').clone().appendTo($itemList);

    // Fill object params with value from options.
    var settings = $.extend({
      spinningDuration: 500,
      spinningBrake: 1.1,
      itemsToStop: 3
    }, options || {});

    this.spinningDuration = settings.spinningDuration;
    this.spinningBrake = settings.spinningBrake;
    this.itemsToStop = settings.itemsToStop;

    // Vars that may be set as options in a later version.
    this.spinningEasing = 'linear';
    this.spinningAcc = 2;

    // Temp param to set for stopping.
    this.itemsToStopToGo = undefined;


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
      // Trigger this event on the wrapper.
      $wrapper.trigger('tslotStarting', {tslot: $wheel});

      // Start spinning.
      spinToNextPosition($wheel.spinningDuration, $wheel.spinningEasing, function () {
        $wheel.spin();
      });
    };

    /**
     * Stops spinning the wheel.
     */
    this.stop = function () {

      // We can only stop, if the wheel is spinning.
      if ($wheel.status != 'spinning') {
        console.log('Cannot stop wheel, as wheel is not spinning.');
        return;
      }

      // Stop and spin out the current item.
      $itemList.stop(true, false);

      // The spinning duration for rolling out is only a part of the default one.
      var restDuration = $wheel.spinningDuration - (+new Date - this.itemTime);
      spinToNextPosition(restDuration, $wheel.spinningEasing, function () {
        // And now start stopping.
        $wheel.itemsToStopToGo = $wheel.itemsToStop;
        stopping();
      });

    };

    /**
     * Spins the wheel with a constant velocity, item by item.
     *
     * The function does one item after each other. So we have a fine grained
     * control, instead of animating a whole wheel spin.
     */
    this.spin = function () {
      if ($wheel.status != 'spinning') {
        $wheel.status = 'spinning';
        // Trigger this event on the wrapper.
        $wrapper.trigger('tslotSpinning', {tslot: $wheel});
      }
      spinToNextPosition($wheel.spinningDuration, $wheel.spinningEasing, function () {
        $wheel.spin();
      });
    };

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
        "margin-top": '-' + ( ( ($wheel.itemCount * 2) + pos) * $wheel.itemHeight) + 'px'
      };
      return style;
    }

    /**
     * Speed up spinning for the next item and on.
     */
    this.faster = function () {
      $wheel.spinningDuration = $wheel.spinningDuration / $wheel.spinningAcc;
    }

    /**
     * Slow down spinning for the next item and on.
     */
    this.slower = function () {
      $wheel.spinningDuration = $wheel.spinningDuration * $wheel.spinningBrake;
    }

    /**
     * Private function to controll the spinning of the wheel to the next item.
     *
     * @param int duration
     * @param string easing
     *
     * @param Function finished
     *   The callback to call when the position is reached.
     */
    var spinToNextPosition = function (duration, easing, finished) {
      var style = $wheel.getStyleForPosition($wheel.itemPosition - 1);

      $itemList.animate(
        style,
        duration,
        easing,
        // When the animation ends, we will update the item position and make
        // sure we start over at the first item, when we reached the last one
        // (which is a duplicate of the first).
        function () {
          // As the animation ended, we are now on the next item.
          setNextPosition();

          // Continue with our callback.
          finished();
        }
      );
    };

    /**
     * Private helper to increment position.
     *
     * Makes the spinning infinite, as it makes sure the weel spins by resetting
     * to the first item when we reached the last.
     */
    var setNextPosition = function () {
      $wheel.itemPosition--;
      if ($wheel.itemPosition <= -1) {
        setPosition($wheel.itemCount - 1);
      }
      $wheel.itemTime = +new Date;
    };

    /**
     * Private helper to set the wheel to a specific position.
     *
     * @param int pos
     */
    var setPosition = function (pos) {
      // Make sure we got an integer one.
      var pos = parseInt(pos);
        var style = $wheel.getStyleForPosition(pos);
        $itemList.css(style);
        $wheel.itemPosition = pos;
    }

    /**
     * Private function to stop the spinning wheel.
     */
    var stopping = function() {
      if ($wheel.status != 'stopping') {
        $wheel.status = 'stopping';

        // Trigger this event on the wrapper.
        $wrapper.trigger('tslotStopping', {tslot: $wheel});
      }

      $wheel.slower();
      if ($wheel.itemsToStopToGo > 1) {
        spinToNextPosition($wheel.spinningDuration, $wheel.spinningEasing, function() {
          $wheel.itemsToStopToGo--;
          stopping();
        });
      }
      else {
        spinToNextPosition($wheel.spinningDuration * 2, 'easeOutBack', function() {
          $wheel.itemsToStopToGo--;
          $wheel.status = 'stopped';
          // Trigger this event on the wrapper.
          $wrapper.trigger('tslotStopped', {tslot: $wheel});
        });
      }
    }

    // If the options provided a default position, we set the init status to it.
    if (options.itemPosition != undefined && options.itemPosition.length > 0) {
      setPosition(options.itemPosition);
    }
    // Ensure the style for the given position is set.
    else {
      setPosition(this.itemPosition);
    }

    // Set ready status, after we registered all methods.
    this.status = 'ready';
    // Trigger this event on the wrapper.
    $wrapper.trigger('tslotReady', {tslot: $wheel});
  }

  // Attaching our tSlotsWheel object as plugin to jquery elements.
  $.fn.tSlotsWheel = function (options) {
    return this.each(function () {
      var element = $(this);

      // Return early if this element already has a plugin instance
      if (element.data('tSlotsWheel')) return;

      var tSW = new tSlotsWheel(this, options);

      // Store plugin object in this element's data
      element.data('tSlotsWheel', tSW);
    });
  };

})(jQuery);
