/*
 *  inlineDisqussions
 *  By Tsachi Shlidor ( @shlidor )
 *  Inspired by http://mystrd.at/articles/multiple-disqus-threads-on-one-page/
 *
 *  USAGE:
 *
 *       disqus_shortname = 'your_disqus_shortname';
 *       $(document).ready(function() {
 *         $("p").inlineDisqussions(options);
 *       });
 *
 *  See https://github.com/tsi/inlineDisqussions for more info.
 */

// Disqus global vars.
var disqus_shortname;
var disqus_identifier;
var disqus_url;

(function($) {

  var settings = {};

  $.fn.extend({
    inlineDisqussions: function(options) {

      // Set up defaults
      var defaults = {
        identifier: 'disqussion',
        displayCount: true,
        highlighted: false
      };

      // Overwrite default options with user provided ones.
      settings = $.extend({}, defaults, options);

      // Append #disqus_thread to body if it doesn't exist yet.
      if ($('#disqussions_wrapper').length === 0) {
        $('<div id="disqussions_wrapper"></div>').appendTo($('body'));
      }
      if ($('#disqus_thread').length === 0) {
        $('<div id="disqus_thread"></div>').appendTo('#disqussions_wrapper');
      }
      if (settings.highlighted) {
        $('<div id="disqussions_overlay"></div>').appendTo($('body'));
      }

      // Attach a discussion to each paragraph.
      $(this).each(function(i) {
        disqussionNotesHandler(i, $(this));
      });

      // Display comments count.
      if (settings.displayCount) {
        loadDisqusCounter();
      }

      // Hide the discussion.
      $('html').click(function(event) {
        if($(event.target).parents('#disqussions_wrapper').length === 0) {
          hideDisqussion();
        }
      });

    }
  });

  var disqussionNotesHandler = function(i, node) {

    var identifier;
    // You can force a specific identifier by adding an attribute to the paragraph.
    if (node.attr('data-disqus-identifier')) {
      identifier = node.attr('data-disqus-identifier');
    }
    else {
      while ($('[data-disqus-identifier="' + window.location.pathname + settings.identifier + '-' + i + '"]').length > 0) {
        i++;
      }
      identifier = window.location.pathname + settings.identifier + '-' + i;
    }

    // Create the discussion note.
    var cls = settings.highlighted ? 'disqussion-link disqussion-highlight' : 'disqussion-link';
    var a = $('<a class="' + cls + '" />')
      .attr('href', window.location.pathname + settings.identifier + '-'  + i + '#disqus_thread')
      .attr('data-disqus-identifier', identifier)
      .attr('data-disqus-url', window.location.href + settings.identifier + '-' + i)
      .text('+')
      .wrap('<div class="disqussion" />')
      .parent()
      .css({
        'top': node.offset().top,
        'left': node.offset().left + node.outerWidth()
      })
      .appendTo('#disqussions_wrapper');

    node.attr('data-disqus-identifier', identifier).mouseover(function() {
        a.addClass("hovered");
    }).mouseout(function() {
        a.removeClass("hovered");
    });

    // Load the relative discussion.
    a.delegate('a.disqussion-link', "click", function(e) {
      e.preventDefault();

      if ($(this).is('.active')) {
        e.stopPropagation();
        hideDisqussion();
      }
      else {
        loadDisqus($(this), function(source) {
          relocateDisqussion(source);
        });
      }

    });

  };

  var loadDisqus = function(source, callback) {

    var identifier = source.attr('data-disqus-identifier');
    var url = source.attr('data-disqus-url');

    if (window.DISQUS) {
      // If Disqus exists, call it's reset method with new parameters.
      DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = identifier;
          this.page.url = url;
        }
      });

    } else {

      disqus_identifier = identifier;
      disqus_url = url;

      // Append the Disqus embed script to <head>.
      var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
      s.src = '//' + disqus_shortname + '.disqus.com/embed.js';
      $('head').append(s);

    }

    // Add 'active' class.
    $('a.disqussion-link').removeClass('active').filter(source).addClass('active');

    // Highlight
    if (source.is('.disqussion-highlight')) {
      highlightDisqussion(identifier);
    }

    callback(source);

  };

  var loadDisqusCounter = function() {

    // Append the Disqus count script to <head>.
    var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
    s.src = '//' + disqus_shortname + '.disqus.com/count.js';
    $('head').append(s);

    // Add class to discussions that already have comments.
    window.setTimeout(function() {
      $('.disqussion-link').filter(function() {
        return $(this).text().match(/[1-9]/g);
      }).addClass("has-comments");
    }, 1000);

  };

  var relocateDisqussion = function(el) {

    // Move the discussion to the right position.
    $('#disqus_thread').stop().fadeIn('fast').animate({
      "top": el.offset().top,
      "left": el.offset().left + el.outerWidth(),
      "width": $(window).width() - (el.offset().left + el.outerWidth())
    }, "fast" );

  };

  var hideDisqussion = function() {

    $('#disqus_thread').stop().fadeOut('fast');
    $('a.disqussion-link').removeClass('active');
    if (settings.highlighted) {
      $('#disqussions_overlay').fadeOut('fast');
      $('body').removeClass('disqussion-highlight');
    }

  };

  var highlightDisqussion = function(identifier) {

    $('body').addClass('disqussion-highlight');
    $('#disqussions_overlay').fadeIn('fast');
    $('[data-disqus-identifier]')
      .removeClass('disqussion-highlighted')
      .filter('[data-disqus-identifier="' + identifier + '"]:not(".disqussion-link")')
      .addClass('disqussion-highlighted');

  };

})(jQuery);
