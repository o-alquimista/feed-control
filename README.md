# Feed Control
The JavaScript implementation of the [W3C Feed Pattern](https://www.w3.org/TR/2017/REC-wai-aria-1.1-20171214/#feed).

This plugin is responsible for requesting the feed data from the server, interpreting pagination data to return the proper response, and setting up event handlers for keyboard navigation. There is no support for scroll-activated loading. Instead, this plugin configures a button that, when clicked, will request more items to be pushed onto the feed.

Templating must be handled separately. The usage instructions cover how to create the required element structure. The code snippets here include the necessary ARIA roles and attributes. I know it still requires a lot from you, but this will likely improve with time, development and the right libraries.

Wanna see how it works? Try it [here](https://kabum.dougsilva.me/categoria/hardware).

## Installation and Usage
Install the [package](https://www.npmjs.com/package/feed-control) as a dependency of your project using your preferred package manager.
```
npm install feed-control
yarn add feed-control
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

### Creating the Feed element
We're going to need some CSS for the next step.
```
@import "~feed-control/css/feed.css";
```

1. Create a wrapper element with an `id` attribute set to the one you defined on the constructor of the `Feed` class.
2. Create some children elements that represent the screens (more on that later).
3. Create the `.feed-data` element, which is where the data returned from the server is appended into.
```
<div id="feed">
  <div class="feed-loading-screen feed-collapsible feed-expanded"></div>
  <div class="feed-error-screen feed-collapsible"></div>
  <div class="feed-nothing-here-screen feed-collapsible"></div>

  <div role="feed" aria-busy="false" data-target="" class="feed-data" aria-label=""></div>
</div>
```

Don't forget to set `data-target` to the path that returns the feed data.

> If the request has to be made to the current URL, omit it or set `data-target` to an empty string.

The request will also send a GET parameter named `page`. You should retrieve this parameter on the server to return the requested page.

Finally, set `aria-label` on the `role="feed"` element to describe the purpose of the feed. You can also use this to inform the user about the keyboard shortcuts they can use to navigate the feed:

| Keyboard shortcuts       | Function                              |
| ------------------------ | ------------------------------------- |
| PAGE UP                  | Navigate to the previous item         |
| PAGE DOWN                | Navigate to the next item             |
| CTRL + HOME              | Go to the first item                  |
| CTRL + END               | Go to the last item                   |

Before we start building the Ajax response template, let me explain a few things.

**Screens** are overlays for the `.feed-data` element. They are used during the initial loading process, when the request fails very early, or when there are no results. In other words, _screens are only used to announce the status of the initial request_. Once the feed has loaded items, control labels kick in.

**Control labels** are used to announce the status of the feed button, whether it's loading or ready for a new request or if there's nothing else to show. _They are only used after the initial request has completed successfully._

These types of elements exist so you can customize the responses given by the Feed. For example, you may want to set a `min-height` on the screens and center their contents, or maybe change the color scheme of a control label. In short, styling is completely up to you.

### Creating the Ajax response template
The response received from the URL specified through `data-target` should contain a paginated collection of `<article>` elements. The last of them should be the `.feed-control` element, within which the feed button and all of its control labels are located. These are the requirements for all, except the `.feed-control`:
- Provide the pagination metadata via data attributes.
- Indicate the first `<article>` of the set by giving it the class `.focus-me`, which tells the plugin to focus this element as soon as it is loaded. This ensures the correct TAB sequence is maintained.

```
<article class="feed-new-item focus-me" tabindex="-1" data-number-of-results="" data-page-size="" data-last-page="" aria-labelledby=""></article>
```

| Data attribute           | Description                                   |
| ------------------------ | --------------------------------------------- |
| `data-number-of-results` | The absolute total number of items            |
| `data-page-size`         | The number of items loaded per page           |
| `data-last-page`         | The total number of pages                     |

`aria-labelledby` should point to a label for the current `<article>` element. This gives screen reader users a short title or description for each item while browsing the feed with the provided keyboard navigation commands.

Now we create the last `<article>`, which holds the feed button and all of its labels.
```
<article class="feed-control feed-new-item" tabindex="-1">
  <button class="feed-control-label-ready feed-control-label feed-button feed-collapsible" type="button" data-label="fcl-ready">
    <span id="fcl-ready">Ready</span>
  </button>

  <div class="feed-control-label-loading feed-control-label feed-collapsible" data-label="fcl-loading">
    <span id="fcl-loading">Loading</span>
  </div>

  <button class="feed-control-label-error feed-control-label feed-button feed-collapsible" type="button" data-label="fcl-error">
    <span id="fcl-error">Error</span>
  </button>

  <div class="feed-control-label-nothing-else feed-control-label feed-collapsible" data-label="fcl-nothing-else">
    <span id="fcl-nothing-else">Nothing Else</span>
  </div>
</article>
```

The `.feed-control` element needs a label that corresponds to the currently visible control label. Each control label contains the attribute `data-label`, which takes an `id` that will be used to set the `aria-labelledby` of the `.feed-control` element.

Phew! That's it. If you got this far, I'd like to thank you for trying my plugin! Feel free to open issues about your questions, suggestions or bugs you may have found. Contributions are welcome, especially if they help reduce the amount of work needed to set this up.

Now go see if it's working!
