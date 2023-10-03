# vue-synapse-bg: Vue Component

A performant and configurable background element that generates a network of connected nodes over which subtle, dynamic signal traversal is simulated.

Framework-agnostic Web Component version: https://github.com/mhowen/synapse-bg-wc

## Installation

### From npm
Run `npm install vue-synapse-bg` in your project directory

### Install as Vue Plugin
Import the module *and the CSS rules*:
```js
// main.js
import SynapseBg from 'vue-synapse-bg';
import 'vue-synapse-bg/dist/style.css';
```
Then install SynapseBg as a plugin:
```js
// main.js
const app = createApp({});
app.use(SynapseBg);
```

## Usage

### Fill Container
Include `<SynapseBg />` anywhere within a template and it will dynamically change size to match its parent container

### Fill Viewport
Include `<SynapseBg />` anywhere within a template and include the `viewport` boolean attribute

### Example
```html
<SynapseBg
  color="hotpink"
  :network-size="10"
  :speed-scale="2"
  :tracer-scale="5"
  viewport
/>
```

## Configuration

### Attributes
`color`: Defines base color of rendered entities
- Can be any valid CSS <color> keyword or string in any common colorspace, e.g. `'darkslateblue'`, `'#483d8b'`, `'rgb(72 61 139)'`
- If omitted or invalid, defaults to black

`network-size`: Defines number of nodes generated for each network
- Must be an integer greater than or equal to 2
- If omitted or invalid, defaults to 5 for a relatively subtle effect

`speed-scale`: Multiplies base traversal speed of network Signals
- Base speed is one percent of one coordinate space unit per render cycle
- Must be a number greater than 0
- If omitted or invalid, defaults to 1

`tracer-scale`: Multiplies width at which Tracers are drawn along Signal path
- Base width is one coordinate space unit
- Must be a number greater than 0
- If omitted or invalid, defaults to 1