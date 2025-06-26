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
     data/localizationData.json
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
├── index.html            # Main HTML file.
├── canvasCreatorUI.v1_1.min.js  # Minified JS version
├── scripts/canvasCreatorUI.js     # Main JavaScript logic
├── canvasCreator.v1.min.css  # Minified CSS version
├── styles/canvasCreator.css     # Main CSS
├── data/canvasData.json       # Contains predefined canvas layouts
├── data/localizedData.json    # Stores localization strings
├── LICENSE               # Open-source license information
└── img/               # Images
```

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

## Versioning & Caching
JavaScript and CSS files should include a version number in the filename to ensure updates are reflected in users' browsers. Use a versioning pattern like `canvasCreatorUI.vX_Y.min.js`, where `X_Y` represents the version number. This prevents caching issues when updates are deployed.

## License
This project is licensed under the **Apache 2.0 License**. See the `LICENSE` file for details.

## Contact
For any issues, feature requests, or questions, please create an issue in the [GitHub repository](https://github.com/APIOpsCycles/CanvasCreator/issues).

## Sponsors and partners
If your organization would like to support the method and gain more skills and visibility, check our partner page for more information: [APIOps Partners](https://www.apiopscycles.com/partners)