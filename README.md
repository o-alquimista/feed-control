# Feed Control
The JavaScript implementation of the [W3C Feed Pattern](https://www.w3.org/TR/2017/REC-wai-aria-1.1-20171214/#feed).

This plugin is responsible for requesting the feed data from the server, interpreting pagination data to return the proper response, and setting up event handlers for keyboard navigation. There is no support for scroll-activated loading. Instead, this plugin configures a button that, when clicked, will request more items to be pushed onto the feed.

Templating must still be handled separately. The usage instructions cover how to create the required element structure. The examples here include the necessary ARIA roles and attributes. I know it still requires a lot from you, but this will likely improve with time and development. Libraries such as React may help ease the templating setup one day.

## Installation and Usage
Install the [package](https://www.npmjs.com/package/feed-control) as a dependency of your project using your preferred package manager.
```
npm install feed-control --save-dev
yarn add feed-control --dev
```

Then import the module.
```
const Feed = require('feed-control');
```

Now create an instance of `Feed` and give its constructor a string representing the `id` HTML attribute of the wrapper element we'll be creating. This is how we distinguish between multiple instances of a feed on the same page.
```
var feed = new Feed('feed');
```

So if we wanted two feeds, we would create two instances with unique `id` attributes, like this:
```
var oneFeed = new Feed('oneFeed');
var anotherFeed = new Feed('anotherFeed');
```

Run `setup()` to initialize it.
```
feed.setup();
```

That's it for the JavaScript part.

We're going to need some CSS for the next step.
```
@import "~feed-control/css/feed.css";
```

1. Create a wrapper element with an `id` attribute set to the one you defined on the constructor of the `Feed` class.
2. Create some children elements that represent the screens (more on that later).
3. Create the `.feed-data` element, which is where the data returned from the server is appended into.
```
<div id="feed">
  <div class="feed-loading-screen feed-screen feed-collapsible feed-expanded"></div>
  <div class="feed-error-screen feed-screen feed-collapsible"></div>
  <div class="feed-nothing-here-screen feed-screen feed-collapsible"></div>

  <section role="feed" aria-busy="false" data-target="" class="feed-data" aria-label=""></section>
</div>
```

Don't forget to set `data-target` to the URL that allows the Ajax request to retrieve the feed data, then give the `role="feed"` element a label that describes the purpose of the feed, as [recommended by the W3C](https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-9).

Before we start building the Ajax response template, let me explain a few things.

**Screens** are overlays for the `.feed-data` element. They are used during the initial loading process, when the request fails very early, or when there are no results. In other words, _screens should only be used to announce the status of the initial request_. Once feed articles are on the page, control labels kick in.

**Control labels** are used to announce the status of the feed button, whether it's loading or ready for a new request or if there's nothing else to show. _They should only be used after the initial request has completed successfully._

The response received from the URL specified through `data-target` should contain a paginated collection of `<article>` elements. The last of them should be the `.feed-control` element, within which the feed button and all of its control labels are located. These are the requirements for all but the last `<article>`:
- Provide the pagination metadata via data attributes.
- Indicate the first `<article>` of the set by giving it the class `.focus-me`, which tells the plugin to focus this element as soon as it is loaded. This ensures the correct TAB sequence is maintained.

```
<article class="feed-item feed-new-item focus-me" tabindex="-1" data-number-of-results="" data-page-size="" data-last-page="" aria-labelledby=""></article>
```

- `data-number-of-results` represents the absolute total number of items.
- `data-page-size` represents the number of items loaded per page.
- `data-last-page` represents the total number of pages.
- `aria-labelledby` should point to a label for the current `<article>`. You can use unique `id`s to reference them. This gives screen reader users a short title or description for the item while browsing the feed with the provided keyboard navigation commands.

The last `<article>`, which is `.feed-control`, holds the feed button and all of its labels.
```
<article class="feed-control feed-item feed-new-item" tabindex="-1">
  <button class="feed-control-label feed-control-label-ready feed-button feed-collapsible" type="button" data-label="fcl-ready">
    <span id="fcl-ready">Ready</span>
  </button>

  <div class="feed-control-label feed-control-label-loading feed-collapsible" data-label="fcl-loading">
    <span id="fcl-loading">Loading</span>
  </div>

  <button class="feed-control-label feed-control-label-error feed-button feed-collapsible" type="button" data-label="fcl-error">
    <span id="fcl-error">Error</span>
  </button>

  <div class="feed-control-label feed-control-label-nothing-else feed-collapsible" data-label="fcl-nothing-else">
    <span id="fcl-nothing-else">Nothing Else</span>
  </div>
</article>
```

`data-label` is used by the plugin to give the appropriate label to the `.feed-control` element.

Phew! That's it. Give it a try!
