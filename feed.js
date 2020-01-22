/**
 * Copyright 2019-2020 Douglas Silva (0x9fd287d56ec107ac)
 *
 * This file is part of KaBuM!.
 *
 * KaBuM! is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KaBuM!.  If not, see <https://www.gnu.org/licenses/>.
 */

const $ = require('jquery');
import FeedStatus from './feed_status.js';

/**
 * An implementation of the W3C Feed Pattern.
 *
 * This component is responsible for managing the display of content that is
 * loaded via infinite scrolling (with a button).
 */
export default class Feed {
  /**
   * The 'feed' parameter is a unique identifier for the feed instance.
   *
   * Give the feed a unique name on instantiation. This represents a wrapper
   * element that must have an id of the same name. This isolates the instance
   * and allows you to have multiple feeds on the same page.
   */
  constructor(name) {
    this.feed = $('#' + name);

    /**
     * The container feed items are pushed into.
     */
    this.feedData = this.feed.children('.feed-data');

    /**
     * The last feed article, which holds the button that triggers another request.
     *
     * This element is removed on every request after the first, so it must be
     * retrieved again with updateFeedControl().
     */
    this.feedControl;

    this.page = 1;
    this.itemCount = 1;
    this.status = new FeedStatus(this.feed, this.feedData);

    /**
     * The target path of the request.
     *
     * If this is not provided, the Ajax request will be sent to the current
     * path, as expected.
     */
    this.target = this.feedData.data('target');
  }

  /**
   * Requests the first page and initializes the feed control and navigation.
   */
  setup() {
    // Abort if the feed wrapper specified by name was not found
    if (!this.feed.length) {
      return;
    }

    this.status.busy(true);
    var request = this.loadPage();

    request
      .done(data => {
        // Push loaded items onto the page
        this.feedData.append(data);

        this.setItemPosition();
        this.updateFeedControl();
        var metadata = this.getPaginationMetadata();

        // Check pagination metadata and prepare the feed for the next strategy
        if (metadata.data('numberOfResults') > metadata.data('pageSize')) {
          this.status.switchControlLabel(this.status.control.ready);
          this.setItemCount();
        } else if (metadata.data('numberOfResults') === undefined) {
          this.status.switchScreen(this.status.screen.nothingHere);
        } else {
          this.status.switchControlLabel(this.status.control.nothingElse);
          this.setItemCount();
        }

        this.setupFeedControl();
        this.setupNavigation();
      })
      .fail(() => {
        this.status.switchScreen(this.status.screen.error);
      })
      .always(() => {
        this.status.busy(false);
        this.status.switchScreen();
      });
  }

  /**
   * Configure the event listener for subsequent requests.
   *
   * This will also setup the button that controls infinite scrolling.
   */
  setupFeedControl() {
    // Page 2 will be next
    this.page++;

    this.feedData.on('click', '.feed-button', () => {
      this.status.busy(true);
      this.status.switchControlLabel(this.status.control.loading);

      var request = this.loadPage();

      request
        .done(data => {
          /*
           * A new feed control element will be loaded onto the page.
           * The one loaded in the previous request must be removed.
           */
          this.feedControl.remove();

          // Push newly loaded items onto the page
          this.feedData.append(data);

          // New page loaded. Increment page number for the next request.
          this.page++;

          this.setItemPosition();
          this.updateFeedControl();
          var metadata = this.getPaginationMetadata();

          // Check pagination metadata and prepare the feed for the next strategy
          if (this.page > metadata.data('lastPage')) {
            this.status.switchControlLabel(this.status.control.nothingElse);
            this.setItemCount();
          } else {
            this.status.switchControlLabel(this.status.control.ready);
            this.setItemCount();
          }

          /*
           * After requesting a page through the button, focus will be put on
           * the first item of the new set of items.
           */
          this.feedData.children('.focus-me').last().focus();
        })
        .fail(() => {
          this.status.switchControlLabel(this.status.control.error);
        })
        .always(() => {
          this.status.busy(false);
        });
    });
  }

  /**
   * Performs an Ajax request and returns the jqXHR object.
   */
  loadPage() {
    var jqxhr = $.get(this.target, {page: this.page});

    return jqxhr;
  }

  /**
   * Configures keyboard commands to browse feed items.
   *
   * The W3C Feed Pattern requires keyboard shortcuts to facilitate navigation
   * between article items for users of assistive technologies.
   */
  setupNavigation() {
    this.feedData.keydown(event => {
      var target = $(event.target);

      // If the item in focus is not an <article>, find the closest <article>
      if (target.is(':not(article)')) {
        target = target.closest('article');
      }

      // Current position in the set of items
      var itemPosition = target.attr('aria-posinset');

      switch(event.which) {
        case 33: // PAGE_UP, move back
          event.preventDefault();

          if (itemPosition > 1) {
            itemPosition--;
            this.moveFocus(itemPosition);
          }

          break;
        case 34: // PAGE_DOWN, move forward
          event.preventDefault();

          if (itemPosition < this.itemCount) {
            itemPosition++;
            this.moveFocus(itemPosition);
          }

          break;
        case 35: // CTRL + END, last item
          if (event.ctrlKey) {
            event.preventDefault();

            if (itemPosition !== this.itemCount) {
              itemPosition = this.itemCount;
              this.moveFocus(itemPosition);
            }
          }

          break;
        case 36: // CTRL + HOME, first item
          if (event.ctrlKey) {
            event.preventDefault();

            if (itemPosition !== 1) {
              itemPosition = 1;
              this.moveFocus(itemPosition);
            }
          }

          break;
      }
    });
  }

  moveFocus(targetPosition) {
    $('[aria-posinset="' + targetPosition + '"]').focus();
  }

  /**
   * Retrieves an article element which contains pagination metadata.
   *
   * Important pagination metadata is attached to all article elements.
   * This method returns the first of them, on which you can use data()
   * to retrieve the needed data attributes.
   */
  getPaginationMetadata() {
    var metadata = this.feedData.children('article').first();

    return metadata;
  }

  /**
   * Update the feedControl property with a new feed control element.
   *
   * A new feed control element comes with each request, while the old one is
   * deleted. This will retrieve the feed control of the current request and
   * make it available for use.
   */
  updateFeedControl() {
    let feedControl = this.feedData.children('.feed-control');

    this.feedControl = feedControl;
    this.status.feedControl = feedControl;

    this.status.updateControlLabels();
  }

  /**
   * Set each item's position in the set of items, represented by the
   * attribute 'aria-posinset'.
   */
  setItemPosition() {
    var feed = this;

    this.feedData.children('.feed-new-item').each(function() {
      $(this).attr('aria-posinset', feed.itemCount);
      feed.itemCount++;

      // Prevent this item from being selected again
      $(this).removeClass('feed-new-item');
    });

    /*
     * The feedControl element is removed and reinserted after every request.
     * In order to have an accurate item count, we have to decrement it here;
     * otherwise there will be a gap in the item position sequence.
     */
    this.itemCount--;
  }

  /**
   * Set the total number of items in the set onto each <article>. The attribute
   * 'aria-setsize' is used for that.
   */
  setItemCount() {
    var feed = this;

    this.feedData.children().each(function() {
      $(this).attr('aria-setsize', feed.itemCount);
    });
  }
}
