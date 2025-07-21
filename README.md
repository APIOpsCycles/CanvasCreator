# APIOps Cycles Canvas Creator


![example API Business Model Canvas filled with the CanvasCreator](examples/Canvas_apiBusinessModelCanvas_en-US.svg)

See the same canvas exported from CanvasCreator as [SVG vector image](examples/Canvas_apiBusinessModelCanvas_en-US.svg) or [structured JSON](examples/Canvas_apiBusinessModelCanvas_en-US.json) that you can save to version control or your computer and upload again, to continue editing or share with your colleagues, customers or fellow students.

Example of localized version in German (de-DE) - join the translation effort by creating a pull request. See more info below.

![example of German canvas](examples/Canvas_apiBusinessModelCanvas_de-DE.svg)

## Overview
The **APIOps Cycles Canvas Creator** is a web-based tool designed to create and manage various API-related canvases, such as API Business Model Canvas, API Value Proposition Canvas, and others. The tool allows users to:

- Select a canvas type and language. 
- Add and manage sticky notes.
- Customize metadata.
- Export canvases as JSON or SVG.
- Work entirely in the browser with no server dependencies or saving data elsewhere.

For similar, but more integrated commercial tool, you can refer to one of our partners QriarLabs. Also for consulting or training services on how to use the canvases check our partner page for more information: [APIOps Partners](https://www.apiopscycles.com/partners)

## Features
- **Supports Multiple Canvases**: API Business Model, Value Proposition, Business Impact, Capacity, Customer Journey, Domain, Event, Interaction, Locations, and REST Canvases. Supports all canvases that are available at [the APIOps Cycles method website ](https://www.apiopscycles.com/) > Resources.
- **Localization Support**: JSON-based language switching (currently supports English, German, Finnish and French). To help with localization, contribute to the
     ```
     data/localizedData.json
     ```
- **Sticky Notes**: Users can create, edit, move, and delete sticky notes dynamically.
- **Mobile and touch support**: While the canvas it self does not scale for usability, the touch events for mobile devices and responsive styles have been implemented. Turn small devices in landscape position.  
- **Metadata Editing**: Allows customization of metadata (source, license, authors, website). Metadata will show at the footer of the canvas. **Do not edit the template metadata unless you are contributing to the canvas structure**. The canvases are licensed under CC-BY-SA 4.0, so share a like and mention original authors if you create any derivatives.
- **Export & Import**: Save and load canvases using JSON files. Allows saving data in version control or file server, or using it for other purposes. 
- **SVG Export**: Generate vector images for presentations and documentation (in slides, collaboration tools, print or web).

## Installation & Usage

You can use the Canvas Creator on our website [https://canvascreator.apiopscycles.com/](https://canvascreator.apiopscycles.com/) or install it on your server. We do not promise any SLAs, and as this tool is provided for free, the bandwidth may sometimes be limited. 

### 1. Hosting on Netlify (or Any Static Server)
This project can be hosted on any web server that allows execution of HTML and JavaScript. 

## File Structure
```
CanvasCreator/
├── index.html                 # Main HTML file
├── dist/                      # Bundled output from `npm run build`
│   ├── canvasCreator.js
│   └── canvasCreator.min.js
├── src/                       # Modular JavaScript source
│   ├── helpers.js
│   ├── main.js
│   └── index.js
├── scripts/                   # Build and helper scripts
│   ├── build.js
│   └── noteManager.js
├── styles/                    # Editable CSS sources
│   └── canvascreator.css
├── canvascreator.min.css      # Minified CSS version
├── data/                      # Canvas layouts and localization strings
│   ├── canvasData.json
│   └── localizedData.json
├── examples/                  # Sample canvases
├── tests/                     # Jest unit tests
├── img/                       # Images
└── LICENSE
```

## Build

Run `npm run build` to generate `dist/canvasCreator.js` and its minified
counterpart `dist/canvasCreator.min.js`. The `scripts/build.js` script
now also reads `data/canvasData.json` and `data/localizedData.json` and
inlines the latest content into the bundle. It strips the CommonJS
boilerplate from the source files, wraps them in a small UMD-style factory
for browser or Node use, and then uses
[Terser](https://github.com/terser/terser) for minification.

The `dist` directory is committed because `package.json` points to the
unminified bundle as its `main` entry. The minified bundle is loaded by
`index.html` using a version query (`dist/canvasCreator.min.js?v=1.0.1`) to
force browsers to fetch fresh code.

Run `npm run minify-css` to compress `styles/canvascreator.css` into
`canvascreator.min.css` using
[clean-css](https://github.com/jakubpawlowicz/clean-css). The stylesheet is
referenced in `index.html` with a version query
(`canvascreator.min.css?v=1.0.1`) so browsers fetch the latest build.

## How to Contribute
Contributions are welcome, especially localization help, bug fixing, or contributing libraries in other languages or frameworks!

Follow these steps to contribute:
1. **Fork the Repository**
2. **Create a New Branch**
   ```sh
   git checkout -b feature-your-feature-name
   ```
3. **Make Changes & Commit**
   ```sh
   git commit -m "Added new feature"
   ```
4. **Push Changes**
   ```sh
   git push origin feature-your-feature-name
   ```
5. **Submit a Pull Request**

## Testing
Unit tests run with [Jest](https://jestjs.io/). Install dependencies and run:

```sh
npm install
npm test
```

The test suite also runs automatically in GitHub Actions for each push and pull request.

## Versioning & Caching
Both the JavaScript and CSS files are referenced with version queries
(`dist/canvasCreator.min.js?v=1.0.1` and `canvascreator.min.css?v=1.0.1`).
Updating these query strings (or renaming the files) forces browsers to fetch
the latest build so cached versions don't persist.

## License
This project is licensed under the **Apache 2.0 License**. See the `LICENSE` file for details.

## Release Notes
See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## Contact
For any issues, feature requests, or questions, please create an issue in the [GitHub repository](https://github.com/APIOpsCycles/CanvasCreator/issues).

## Sponsors and partners
If your organization would like to support the method and gain more skills and visibility, check our partner page for more information: [APIOps Partners](https://www.apiopscycles.com/partners)
