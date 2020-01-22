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

/**
 * Feed status controller.
 *
 * Handles contextual changes to the feed.
 */
export default class FeedStatus {
  constructor(feed, feedData) {
    this.feed = feed;
    this.feedData = feedData;
    this.feedControl;

    /**
     * Screens are large placeholder elements commonly used to indicate
     * a busy state, errors and other status information.
     *
     * Screens should only be used to announce the status of the initial request,
     * such as when there are no results or when it's still loading.
     */
    this.screen = {
      loading: this.feed.children('.feed-loading-screen'),
      error: this.feed.children('.feed-error-screen'),
      nothingHere: this.feed.children('.feed-nothing-here-screen')
    };

    /**
     * Feed control labels are used to announce the status of the feed button,
     * whether it's loading or ready for a new request or if there's nothing else
     * to show.
     *
     * This should only be used after the initial request completes successfully.
     */
    this.control = {
      ready: undefined,
      loading: undefined,
      error: undefined,
      nothingElse: undefined
    };
  }

  /**
   * Informs screen readers whether the feed is ready or is busy loading
   * more content.
   *
   * This method takes a boolean. True means it is busy, and false means
   * it is not.
   */
  busy(state) {
    this.feedData.attr('aria-busy', state);
  }

  /**
   * Change the Feed Screen.
   *
   * If a screen is provided, it will switch to that screen. Otherwise,
   * it will only hide the loading screen.
   */
  switchScreen(screen) {
    if (screen) {
      screen.addClass('feed-expanded');

      // Hide the empty feed data container
      this.feedData.hide();
    }

    // Hide the loading screen
    this.screen.loading.removeClass('feed-expanded');
  }

  /**
   * Change the feed control label.
   */
  switchControlLabel(control) {
    let label = control.data('label');

    // Show selected feed control and hide all others
    control.addClass('feed-expanded');
    control.siblings('.feed-control-label').removeClass('feed-expanded');

    this.feedControl.attr('aria-labelledby', label);
  }

  /**
   * Reassign all feed control labels.
   *
   * Since the feed control is replaced after every request, we lose the button
   * labels with it. This will reassign their values.
   */
  updateControlLabels() {
    this.control.ready = this.feedControl.children('.feed-control-label-ready');
    this.control.loading = this.feedControl.children('.feed-control-label-loading');
    this.control.error = this.feedControl.children('.feed-control-label-error');
    this.control.nothingElse = this.feedControl.children('.feed-control-label-nothing-else');
  }
}
