/* 
APIOps Cycles Canvas Creator
Creates canvases from json and localization files (note: current code requires the data is directly inserted in the Javascript file.
The JSON files are so big and the client side Javascript not the most efficient way, that also the JSON needs to be minimized with the script).
When you update the Javascript, also create the minimized file and raise version number to help cache to update.
Original author Marjukka Niinioja, licensed under Apache 2.0

 */

const {
  sanitizeInput,
  validateInput,
  distributeMissingPositions,
} = require('./helpers');
const defaultStyles = require('./defaultStyles');

//load canvas layouts and localizations from json data
const canvasData = require("../data/canvasData.json");
const localizedData = require("../data/localizedData.json");

  // No DOMPurify setup; sanitization is handled in helpers

  // Sticky note variables
  let currentColor = defaultStyles.stickyNoteColor
  let selectedNote = null
  // Track the currently selected canvas ID
  let canvasId = null
  // Track if current canvas has unsaved changes
  let unsavedChanges = false
  

  
  // Function to populate the locale selector
  function populateLocaleSelector() {
    const localeSelector = document.getElementById("locale")
    const locales = Object.keys(localizedData)
  
    // Add the "Select Locale" option first
    const selectOption = document.createElement("option")
    selectOption.value = ""
    selectOption.text = "Select Locale"
    localeSelector.add(selectOption)
  
    // Add locales only once
    locales.forEach((locale) => {
      const option = document.createElement("option")
      option.value = locale
      option.text = locale
      localeSelector.add(option)
    })
  }
  
  // Function to populate the canvas selector based on the selected locale
  function populateCanvasSelector(locale) {
    const canvasSelector = document.getElementById("canvas")
    canvasSelector.innerHTML = "" // Clear previous options
  
    // Get available canvas IDs from localizedData for the selected locale
    const canvasIds = Object.keys(localizedData[locale])
  
    canvasIds.forEach((canvasId) => {
      const option = document.createElement("option")
      option.value = canvasId
      // Access the localized title correctly
      option.text = localizedData[locale][canvasId].title
      canvasSelector.add(option)
    })
  }
  
  // Event listeners for locale and canvas selection
  document.getElementById("locale").addEventListener(
    "change",
    (event) => {
      const selectedLocale = event.target.value
  
      // Show the canvas selector after a locale is selected
      document.getElementById("canvasSelector").style.display = "block"
  
      populateCanvasSelector(selectedLocale)
  
      // Trigger canvas loading if a canvas is already selected
      const selectedCanvas = document.getElementById("canvas").value
      if (selectedCanvas) {
        //loadCanvas(selectedLocale, selectedCanvas);
        document.getElementById("canvasCreator").style.display = "flex"
      }
    },
    { once: true },
  )
  
  //add touch events to tool section.
  document.querySelectorAll(".canvas-tools").forEach((button) => {
    button.addEventListener(
      "touchstart",
      function (event) {
        event.preventDefault()
        this.click()
      },
      { passive: false },
    )
  })
  
  document.getElementById("canvas").addEventListener(
    "change",
    (event) => {
      const selectedLocale = document.getElementById("locale").value
      const selectedCanvas = event.target.value
      loadCanvas(selectedLocale, selectedCanvas)
    },
    { once: true },
  )
  
// Create file input once globally
const fileInput = document.createElement("input")
fileInput.type = "file"
fileInput.accept = "application/json"

// Ensure change handler is attached once
fileInput.addEventListener("change", function () {
  const file = fileInput.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = function (event) {
    try {
      const importedData = JSON.parse(event.target.result)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
      if (
        !importedData.templateId ||
        !importedData.metadata ||
        !importedData.sections
      ) {
        alert("Invalid JSON file format.")
        return
      }
  
      // Save the imported values
      canvasId = importedData.templateId
      contentData = importedData
      canvasDataForId = canvasData[canvasId]

      if (canvasDataForId) {
        // If sticky notes have no coordinates, distribute them evenly
        distributeMissingPositions(contentData, canvasDataForId)
      }
      
      if (!canvasDataForId) {
        alert("Canvas data not found for canvasId: " + canvasId)
        return
      }
      
      // Sync selectors
      const canvasSelector = document.getElementById("canvas")
      const canvasChangeHandler = canvasSelector.onchange
      canvasSelector.onchange = null
      canvasSelector.value = canvasId
      setTimeout(() => {
        canvasSelector.onchange = canvasChangeHandler
      }, 0)
      
      const locale = importedData.locale || "en-US"
      document.getElementById("locale").value = locale
      populateCanvasSelector(locale)
      document.getElementById("canvasSelector").style.display = "block"
      document.getElementById("canvasCreator").style.display = "flex"
      
      // Render canvas
      loadCanvas(locale, canvasId, true)
      
      // Mark as dirty
      unsavedChanges = true
      
      alert("Canvas imported successfully.")
      
    } catch (err) {
      alert("Failed to parse JSON: " + err.message)
      console.error(err)
    }
  }
  

  reader.readAsText(file)
  fileInput.value = "" // Reset so same file can be selected again
})

  


  let canvasDataForId = null
  let contentData = {}

  
  function loadCanvas(locale, canvasId, preserveContentData = false) {
    // Access canvasData directly
    canvasDataForId = canvasData[canvasId]
  
    if (!canvasDataForId) {
      console.error(`Canvas data not found for canvasId: ${canvasId}`)
      return
    }
  
    // Only reset contentData if NOT importing
    if (!preserveContentData) {
      contentData = {
        templateId: canvasId,
        locale: locale,
        metadata: {
          source: "",
          license: "",
          authors: [],
          website: "",
        },
        sections: canvasDataForId.sections
          ? canvasDataForId.sections.map((section) => ({
              sectionId: section.id,
              stickyNotes: [],
            }))
          : [],
      }
    }
  
    const fetchAPIOpsLogo = async (
      url,
      parentGroup,
      x = 0,
      y = 0,
      width = defaultStyles.headerHeight + 2 * defaultStyles.padding,
      height = defaultStyles.headerHeight + 2 * defaultStyles.padding,
    ) => {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch the logo SVG")
        const svgContent = await response.text()
        parentGroup
          .append("g")
          .attr(
            "transform",
            `translate(${x}, ${y}) scale(${width / 100}, ${height / 100})`,
          ) // Adjust scaling
          .html(svgContent)
      } catch (error) {}
    }
  
    let svg = d3.select("#canvasCreator svg")
  
    //main
    const renderCanvas = (canvasData, contentData, localizedData) => {
      d3.select("#canvasCreator svg").remove()
  
      const cellWidth = Math.floor(
        (defaultStyles.width -
          canvasData.layout.columns * defaultStyles.padding) /
          canvasData.layout.columns,
      )
  
      const cellHeight = Math.floor(
        (defaultStyles.height -
          defaultStyles.headerHeight -
          defaultStyles.footerHeight -
          4 * defaultStyles.padding) /
          canvasData.layout.rows,
      )
  
      const locale = contentData.locale || defaultStyles.defaultLocale // Default to en-US if not provided
      // Use canvasId to access the correct localized data
      const canvasId = contentData.templateId
      const localizedCanvasData = localizedData[locale][canvasId]
  
      // Check if contentData is empty
      if (Object.keys(contentData).length === 0) {
        // Create a new contentData structure based on canvasData
        contentData.templateId = canvasData.id
        contentData.locale = locale // Or any default locale you prefer
        contentData.metadata = {
          source: "",
          license: "",
          authors: [],
          website: "",
        }
        contentData.sections = canvasData.sections.map((section) => ({
          sectionId: section.id,
          stickyNotes: [], // Empty array for sticky notes
        }))
      }
  
      svg = d3
        .select("#canvasCreator")
        .append("svg")
        .attr("width", defaultStyles.width + defaultStyles.padding * 2)
        .attr("height", defaultStyles.height)
        .style("background-color", defaultStyles.backgroundColor)
  
      const logoUrl = "/img/apiops-cycles-logo2025-blue.svg"
  
      fetchAPIOpsLogo(
        logoUrl,
        svg,
        defaultStyles.padding,
        defaultStyles.padding / 2,
        defaultStyles.padding,
        defaultStyles.padding,
      )
  
      svg
        .append("text")
        .attr("x", defaultStyles.headerHeight + 2 * defaultStyles.padding)
        .attr("y", 2 * defaultStyles.padding)
        .attr("text-anchor", "start")
        .attr("font-family", defaultStyles.fontFamily)
        .attr("font-size", defaultStyles.fontSize + 4 + "px")
        .attr("font-weight", "bold")
        .attr("fill", defaultStyles.fontColor)
        .text(localizedCanvasData.title)
  
      svg
        .append("text")
        .attr("x", defaultStyles.headerHeight + 2 * defaultStyles.padding)
        .attr("y", defaultStyles.headerHeight - 3 * defaultStyles.padding)
        .attr("text-anchor", "start")
        .attr("font-family", defaultStyles.fontFamily)
        .attr("font-size", defaultStyles.fontSize + 2 + "px")
        .attr("fill", defaultStyles.fontColor)
        .text(localizedCanvasData.purpose)
  
      svg
        .append("text")
        .attr("x", defaultStyles.headerHeight + 2 * defaultStyles.padding)
        .attr("y", defaultStyles.headerHeight - defaultStyles.padding)
        .attr("text-anchor", "start")
        .attr("font-family", defaultStyles.fontFamily)
        .attr("font-size", defaultStyles.fontSize + 2 + "px")
        .attr("fill", defaultStyles.fontColor)
        .text(localizedCanvasData.howToUse)
  
      svg
        .append("text")
        .attr("x", defaultStyles.width / 2)
        .attr("y", defaultStyles.height - defaultStyles.footerHeight)
        .attr("text-anchor", "middle")
        .attr("font-family", defaultStyles.fontFamily)
        .attr("font-size", defaultStyles.fontSize)
        .attr("fill", defaultStyles.fontColor)
        .html(
          `Template by: ${canvasData.metadata.source} | ${canvasData.metadata.license} | ${canvasData.metadata.authors} | <a href='http://${canvasData.metadata.website}' target='_blank'>${canvasData.metadata.website}</a>`
        )
  
      canvasData.sections.forEach((block, index) => {
        const sectionId = block.id
        const localizedSection = localizedCanvasData.sections[sectionId]
  
        const x =
          block.gridPosition.column * cellWidth + 2 * defaultStyles.padding
        const y = block.gridPosition.row * cellHeight + defaultStyles.headerHeight
        const width = block.gridPosition.colSpan * cellWidth
        const height = block.gridPosition.rowSpan * cellHeight
        const style = { ...defaultStyles, ...block.style }
  
        svg
          .append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height)
          .attr("fill", style.sectionColor)
          .attr("stroke", style.borderColor)
          .attr("rx", style.cornerRadius)
          .attr("ry", style.cornerRadius)
          .attr("stroke-width", style.lineSize)
  
        if (block.highlight) {
          svg
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", style.highlightColor)
            .attr("stroke", style.borderColor)
            .attr("rx", style.cornerRadius)
            .attr("ry", style.cornerRadius)
            .attr("stroke-width", 2 * style.lineSize)
        }
  
        if (block.journeySteps) {
          const steps = ["", "", "", "", ""]
          const stepCount = steps.length
          const stepWidth = Math.max(
            width / stepCount - 2 * style.padding,
            style.stickyNoteSize,
          )
          const stepHeight = style.stickyNoteSize
          const arrowPadding = 0 // Space between the arrow and the box
  
          // Add a marker definition for arrowheads
          const defs = svg.append("defs")
          defs
            .append("marker")
            .attr("id", "arrowhead")
            .attr("markerWidth", 4)
            .attr("markerHeight", 7)
            .attr("refX", 5)
            .attr("refY", 3.5)
            .attr("orient", "auto")
            .append("polygon")
            .attr("points", "0 0, 5 3.5, 0 7")
            .attr("fill", style.borderColor)
  
          steps.forEach((step, i) => {
            const stepX = x + i * (stepWidth + 2 * style.stickyNoteSpacing)
            const stepCenterX = stepX + stepWidth / 2
            const stepCenterY = y + style.stickyNoteSize
  
            svg
              .append("rect")
              .attr("x", stepX)
              .attr(
                "y",
                y + style.stickyNoteSize / 2 + 2 * style.stickyNoteSpacing,
              )
              .attr("width", stepWidth)
              .attr("height", stepHeight)
              .attr("fill", "#fff")
              .attr("stroke", style.borderColor)
              .attr("stroke-width", style.lineSize)
              .attr("stroke-dasharray", 3 * style.lineSize)
              .attr("rx", style.cornerRadius / 2)
              .attr("ry", style.cornerRadius / 2)
  
            // Draw the arrow to the next step (if not the last step)
            if (i < steps.length - 1) {
              const nextStepX = stepX + stepWidth + 2 * style.stickyNoteSpacing
              const nextStepCenterX = nextStepX + stepWidth / 2
  
              svg
                .append("line")
                .attr("x1", stepCenterX + stepWidth / 2 + arrowPadding)
                .attr("y1", stepCenterY)
                .attr("x2", nextStepCenterX - stepWidth / 2 - arrowPadding)
                .attr("y2", stepCenterY)
                .attr("stroke", style.borderColor)
                .attr("stroke-width", 2 * style.lineSize)
                .attr("marker-end", "url(#arrowhead)")
            }
          })
        }
  
        // adding numbered circles to sections to indicate fill order
  
        svg
          .append("circle")
          .attr("cx", x + style.padding)
          .attr("cy", y + style.padding)
          .attr("r", style.circleRadius)
          .attr("fill", style.borderColor)
  
        svg
          .append("text")
          .attr("x", x + style.padding)
          .attr("y", y + style.padding + 5)
          .attr("text-anchor", "middle")
          .attr("font-family", style.fontFamily)
          .attr("font-size", style.fontSize + "px")
          .attr("fill", style.fontColor)
          .attr("fill", style.highlightColor)
          .text(block.fillOrder)
  
        svg
          .append("text")
          .attr("x", x + style.padding + style.circleRadius)
          .attr("y", y + style.padding + style.circleRadius)
          .attr("font-family", style.fontFamily)
          .attr("font-size", style.fontSize + "px")
          .attr("font-weight", "bold")
          .attr("fill", style.fontColor)
          .text(localizedSection.section)
  
        // split localized help texts i.e. descriptions to lines to fit to sections
  
        const description = localizedSection.description
  
        const descWords = description.split(" ")
        let descLine = ""
        let descLineNumber = 0
        const lineHeight = style.fontSize + 2
        const maxWidth = width - style.padding * 2
  
        const descGroup = svg.append("g")
        descWords.forEach((word) => {
          const testLine = descLine + word + " "
          const testText = descGroup
            .append("text")
            .attr("font-family", style.fontFamily)
            .attr("font-size", style.fontSize + "px")
            .attr("fill", style.fontColor)
            .attr("x", x + style.padding)
            .attr(
              "y",
              y +
                style.padding +
                style.circleRadius +
                2 * style.padding +
                descLineNumber * lineHeight,
            )
            .text(testLine)
  
          if (testText.node().getComputedTextLength() > maxWidth) {
            testText.remove()
            svg
              .append("text")
              .attr("x", x + style.padding)
              .attr(
                "y",
                y +
                  style.padding +
                  style.circleRadius +
                  2 * style.padding +
                  descLineNumber * lineHeight,
              )
              .attr("font-family", defaultStyles.fontFamily)
              .attr("font-size", style.fontSize + "px")
              .attr("fill", style.fontColor)
              .text(descLine)
            descLine = word + " "
            descLineNumber++
          } else {
            testText.remove()
            descLine = testLine
          }
        })
  
        svg
          .append("text")
          .attr("x", x + style.padding)
          .attr(
            "y",
            y +
              style.padding +
              style.circleRadius +
              2 * style.padding +
              descLineNumber * lineHeight,
          )
          .attr("font-family", style.fontFamily)
          .attr("font-size", style.fontSize + "px")
          .attr("fill", style.fontColor)
          .text(descLine)
      })
  
      const defs = svg.append("defs")
      const filter = defs.append("filter").attr("id", "shadow")
  
      filter
        .append("feDropShadow")
        .attr("dx", 3)
        .attr("dy", 3)
        .attr("stdDeviation", 2)
        .attr("flood-color", defaultStyles.shadowColor)
  
      // Function to update the footer text
      function updateFooter() {
        // Remove existing footer
        svg.selectAll("text.footer").remove()
  
        // Add content footer
        svg
          .append("text")
          .attr("class", "footer")
          .attr("x", defaultStyles.width / 2)
          .attr(
            "y",
            defaultStyles.height -
              defaultStyles.footerHeight -
              2 * defaultStyles.padding,
          )
          .attr("text-anchor", "middle")
          .attr("font-family", defaultStyles.fontFamily)
          .attr("font-size", defaultStyles.fontSize)
          .attr("fill", defaultStyles.fontColor)
          .html(
            `Content by: ${contentData?.metadata?.source} | ${contentData?.metadata?.license} | ${contentData?.metadata?.authors} | <a href='http://${contentData?.metadata?.website}' target='_blank'>${contentData?.metadata?.website}</a>`
          )
      }
  
      // Export the canvas content as JSON (attach listener only once)
      const exportJSONButton = document.getElementById("exportButton")
      exportJSONButton.onclick = () => {
        const exportData = {
          templateId: contentData.templateId,
          locale: contentData.locale,
          metadata: {
            ...contentData.metadata,
            date: new Date().toISOString(),
          },
          sections: contentData.sections.map((section) => ({
            sectionId: section.sectionId,
            stickyNotes: section.stickyNotes.map((note) => ({
              content: note.content.replace(/\n/g, ""),
              position: note.position,
              size: note.size,
              color: note.color,
            })),
          })),
        };
      
        const jsonString = JSON.stringify(exportData, null, 2);
        const link = document.createElement("a");
        link.href =
          "data:application/json;charset=utf-8," + encodeURIComponent(jsonString);
        const filename = `${contentData.metadata.source || "Canvas"}_${contentData.templateId}_${contentData.locale}.json`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
  
      // Import canvas content from JSON
  
      if (!importButton.dataset.listenerAttached) {
        importButton.addEventListener("click", () => {
          fileInput.click()
        })
        importButton.dataset.listenerAttached = "true"
      }
      
      
  
      // Export the canvas content as SVG (attach listener only once)
      const exportSVGButton = document.getElementById("exportSVGButton")
      exportSVGButton.onclick = () => {
        const svgNode = svg.node();
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgNode);
        const blob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const filename = `${contentData.metadata.source || "Canvas"}_${contentData.templateId}_${contentData.locale}.svg`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
  
      // Color selection
      const colorSwatches = document.querySelectorAll(".colorSwatch")
      colorSwatches.forEach((swatch) => {
        swatch.addEventListener("click", () => {
          currentColor = swatch.dataset.color // Update currentColor
          // In the color swatch click handler:
          if (selectedNote) {
            selectedNote.color = currentColor
            updateStickyNotes(contentData) // Pass contentData to updateStickyNotes
  
            // Unselect the sticky note after applying the color
            selectedNote = null
          }
        })
      })
  
      // Show metadata form
      document.getElementById("metadataButton").addEventListener("click", () => {
        document.getElementById("metadataForm").style.display = "block"
      })
  
      // Save metadata
      document.getElementById("saveMetadata").addEventListener("click", () => {
        contentData.metadata = {
          // Update contentData.metadata
          source: document.getElementById("source").value,
          license: document.getElementById("license").value,
          authors: document.getElementById("authors").value.split(","),
          website: document.getElementById("website").value,
        }
  
        // Hide the metadata form
        document.getElementById("metadataForm").style.display = "none"
  
        // Update the footer with the new metadata
        updateFooter()
      })
  
      function getEventCoordinates(event) {
        let x, y
        const svgRect = svg.node().getBoundingClientRect()
  
        if (event.type.startsWith("touch")) {
          const touch = event.changedTouches[0]
          x = touch.clientX - svgRect.left
          y = touch.clientY - svgRect.top
        } else {
          x = event.clientX - svgRect.left
          y = event.clientY - svgRect.top
        }
  
        return { x, y }
      }
  
      let lastTapTime = 0
      let lastClickTime = 0
  
      // Attach event listener to the entire SVG
      svg.on("click touchend", function (event) {
        event.preventDefault() // Prevent scrolling on mobile devices
  
        // Get correct event coordinates
        const { x, y } = getEventCoordinates(event)
  
        const now = new Date().getTime()
        const isTouch = event.type === "touchend"
  
        // Handle mouse double-click separately
        if (!isTouch) {
          if (now - lastClickTime < 300) {
            handleCreateStickyNote(event, "mouse")
          }
          lastClickTime = now
        }
        // Handle double-tap for touch
        else {
          if (now - lastTapTime < 300) {
            handleCreateStickyNote(event, "touch")
          }
          lastTapTime = now
        }
      })
  
      // Function to create a sticky note
      function handleCreateStickyNote(event, inputType) {
        let x, y
  
        if (inputType === "mouse") {
          x = event.offsetX - defaultStyles.stickyNoteSize / 2
          y = event.offsetY - defaultStyles.stickyNoteSize / 2
        } else if (inputType === "touch") {
          const touch = event.changedTouches[0]
  
          // Convert touch coordinates from viewport to SVG coordinates
          const svgRect = svg.node().getBoundingClientRect()
          x = touch.clientX - svgRect.left - defaultStyles.stickyNoteSize / 2
          y = touch.clientY - svgRect.top - defaultStyles.stickyNoteSize / 2
        }
  
        // Find the section that was clicked
        const clickedSection = canvasData.sections.find((section) => {
          const sectionRect = {
            x:
              section.gridPosition.column * cellWidth + 2 * defaultStyles.padding,
            y: section.gridPosition.row * cellHeight + defaultStyles.headerHeight,
            width: section.gridPosition.colSpan * cellWidth,
            height: section.gridPosition.rowSpan * cellHeight,
          }
          return isPointInRect(
            x + defaultStyles.stickyNoteSize / 2,
            y + defaultStyles.stickyNoteSize / 2,
            sectionRect,
          )
        })
  
        if (clickedSection) {
          const contentSection = contentData.sections.find(
            (section) => section.sectionId === clickedSection.id,
          )
          contentSection.stickyNotes.push({
            content: sanitizeInput(
              "Double-click on text to edit. Click and select color ",
            ),
            position: { x, y },
            size: defaultStyles.stickyNoteSize,
            color: currentColor,
          })
          updateStickyNotes(contentData)
        }
      }
  
      // Call updateStickyNotes to display initial sticky notes
      updateStickyNotes(contentData)
    }
  
    const updateStickyNotes = (contentData) => {
      svg.selectAll(".sticky-note").remove()
  
      if (!contentData || !contentData.sections) {
        return // Return early if contentData or its sections are not defined
      }
  
      contentData.sections.forEach((contentSection) => {
        // Find the corresponding section in canvasData using sectionId and templateId
        const canvasId = contentData.templateId // Get the canvas ID from contentData
        const canvasSection = canvasData[canvasId].sections.find(
          (section) => section.id === contentSection.sectionId,
        )
  
        if (contentSection.stickyNotes && contentSection.stickyNotes.length > 0) {
          const stickyNotes = svg
            .selectAll(`.sticky-note-${contentSection.sectionId}`)
            .data(contentSection.stickyNotes)
            .enter()
            .append("g")
            .attr("class", `sticky-note sticky-note-${contentSection.sectionId}`)
            .attr("id", (d, i) => `sticky-note-${contentSection.sectionId}-${i}`)
            .attr("transform", (d) => {
              // Calculate the y-coordinate with the offset for each section
              const y =
                (d.position.y || 0) + 0 * (canvasSection.gridPosition.row + 1)
              return `translate(${d.position.x || 0},${y})`
            })
  
          stickyNotes.on("click touchstart", function (event, d) {
            event.stopPropagation()
            event.preventDefault() // Prevents zooming when interacting with the canvas
            selectedNote = d
          })
  
          stickyNotes
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", defaultStyles.stickyNoteSize)
            .attr("height", defaultStyles.stickyNoteSize)
            .attr("fill", (d) => d.color || defaultStyles.stickyNoteColor)
            .attr("stroke", defaultStyles.stickyNoteBorderColor)
            .attr("rx", 3)
            .attr("ry", 3)
  
          stickyNotes
            .append("text")
            .attr("x", 5)
            .attr("y", 15)
            .attr("font-family", defaultStyles.fontFamily)
            .attr("font-size", defaultStyles.fontSize + "px")
            .attr("fill", defaultStyles.contentFontColor)
            .each(function (d) {
              d.content = wrapText(svg, d.content)
              const lines = d.content.split("\n")
              let lineHeight = 14
              for (let i = 0; i < lines.length; i++) {
                d3.select(this) // Select the current 'tspan' element using d3.select(this)
                  .append("tspan")
                  .attr("x", 5)
                  .attr("dy", i === 0 ? 0 : lineHeight)
                  .text(lines[i])
              }
            })
            .on("dblclick touchend", function (event, d) {
              event.stopPropagation()
              event.preventDefault() // Prevents browser zoom on double-tap
  
              const parentG = d3.select(this.parentNode)
  
              // Get the existing text element (no removal)
              const existingText = parentG.select("text")
  
              // Hide the existing text element
              parentG.select("text").style("visibility", "hidden")
  
              // Create an input field (overlay on top of existing text)
              const inputField = parentG
                .append("foreignObject")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", defaultStyles.stickyNoteSize)
                .attr("height", defaultStyles.stickyNoteSize)
                .append("xhtml:textarea")
                .attr("value", d.content)
                .style("font-family", defaultStyles.fontFamily)
                .style("font-size", defaultStyles.fontSize + "px")
                .style("width", "calc(100% + 0px)")
                .style("height", "calc(100% + 0px)")
                .style("border", "none")
                .style("padding", "5px")
                .style("resize", "none")
              //.style("white-space", "pre-wrap");
  
              // Delay the focus action slightly
              setTimeout(() => {
                inputField.node().focus()
              }, 0)
  
              // Append the existing text content to the textarea on focus
              inputField
                .on("focus", function () {
                  this.value = d.content.replace(/\n{2,}/g, "\n")
                })
                .on("blur", function (event, d) {
                  let newContent = this.value
  
                  // Sanitize and validate the input
                  newContent = sanitizeInput(newContent)
                  newContent = validateInput(newContent)
  
                  d.content = wrapText(svg, newContent)
  
                  // Update the existing text element with the new content
                  parentG
                    .select("text")
                    .selectAll("tspan") // Select all existing tspans
                    .remove() // Remove them before adding new ones
  
                  d3.select(this.parentNode).remove()
                  updateStickyNotes(contentData)
                })
            })
        }
      })
  
      svg.selectAll(".sticky-note").call(
        d3
          .drag()
          .on("start", function (event, d) {
            d3.select(this) // Add d3.select(this) here
              .attr("originalPosition", { x: d.position.x, y: d.position.y })
          })
          .on("drag", function (event, d) {
            d.position.x = event.x
            d.position.y = event.y
            d3.select(this).attr(
              "transform",
              `translate(${d.position.x},${d.position.y})`,
            )
          })
          .on("end", function (event, d) {
            // Do not updateStickyNotes here
          }),
      )
  
      //right click on mouse or long press on touch open alert to remove sticky note
      svg.on("contextmenu", function (event) {
        event.preventDefault() // Prevent default right-click menu
  
        // Get mouse coordinates relative to the SVG
        const x = event.offsetX
        const y = event.offsetY
  
        // Find the sticky note that was clicked
        let clickedNote = null
        for (let i = 0; i < contentData.sections.length; i++) {
          const section = contentData.sections[i]
          for (let j = 0; j < section.stickyNotes.length; j++) {
            const note = section.stickyNotes[j]
            if (
              x >= note.position.x &&
              x <= note.position.x + defaultStyles.stickyNoteSize &&
              y >= note.position.y &&
              y <= note.position.y + defaultStyles.stickyNoteSize
            ) {
              clickedNote = note
              break
            }
          }
          if (clickedNote) {
            break
          }
        }
  
        if (clickedNote) {
          if (confirm("Are you sure you want to delete this sticky note?")) {
            // Remove the sticky note from the data
            const section = contentData.sections.find((section) =>
              section.stickyNotes.includes(clickedNote),
            )
            section.stickyNotes = section.stickyNotes.filter(
              (note) => note !== clickedNote,
            )
  
            // Update the sticky notes on the canvas
            updateStickyNotes(contentData)
          }
        }
      })
    }
  
    function wrapText(svg, text) {
      // Normalize the text first to have only single newlines
      const normalizedText = text.replace(/\n{2,}/g, "\n")
      const words = normalizedText.split(" ")
      let line = ""
      const contentLines = []
  
      words.forEach((word) => {
        const testLine = line + word + " "
        const tempText = svg
          .append("text")
          .attr("font-family", defaultStyles.fontFamily)
          .attr("font-size", defaultStyles.fontSize + "px")
          .text(testLine)
  
        const testLineWidth = tempText.node().getComputedTextLength()
        tempText.remove()
  
        if (testLineWidth > defaultStyles.maxLineWidth) {
          contentLines.push(line)
          line = word + " "
        } else {
          line = testLine
        }
      })
  
      contentLines.push(line)
      return contentLines.join("\n")
    }
  
    // Function to check if a point is inside a rectangle
    function isPointInRect(x, y, rect) {
      return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
      )
    }
  
    // Render the canvas
    renderCanvas(canvasDataForId, contentData, localizedData)
  }
  
  let hasStickyNotes = false
  
  // Function to check for unsaved changes and show confirmation dialog
  function checkForUnsavedChanges(event) {
    if (contentData && contentData.sections) {
      hasStickyNotes = contentData.sections.some(
        (section) => section.stickyNotes.length > 0,
      )
  
      if (hasStickyNotes) {
        const message =
          "You have unsaved changes. Are you sure you want to leave this page?"
        event.preventDefault()
        event.returnValue = message
        return message // Return the message for other use cases
      }
    }
  }
  
  // Add beforeunload event listener
  window.addEventListener("beforeunload", checkForUnsavedChanges)
  
  // Event listeners for locale and canvas selection
  document.getElementById("locale").addEventListener("change", (event) => {
    const selectedLocale = event.target.value
  
    // Show the canvas selector after a locale is selected
    document.getElementById("canvasSelector").style.display = "block"
  
    populateCanvasSelector(selectedLocale)
  
    // Trigger canvas loading if a canvas is already selected
    const selectedCanvas = document.getElementById("canvas").value
    if (selectedCanvas) {
      loadCanvas(selectedLocale, selectedCanvas)
    }
  })
  
  document.getElementById("canvas").addEventListener("change", (event) => {
    const selectedLocale = document.getElementById("locale").value
    const selectedCanvas = event.target.value
    loadCanvas(selectedLocale, selectedCanvas)
  })
  
  // Initialize the locale selector
  populateLocaleSelector()
  
  // Add event listeners to locale and canvas selectors
  const localeSelector = document.getElementById("locale")
  const canvasSelector = document.getElementById("canvas")
  
  // Function to handle focus event on selectors
  function handleSelectorFocus(event) {
    // Check if contentData and its sections are defined
    if (contentData && contentData.sections) {
      hasStickyNotes = contentData.sections.some(
        (section) => section.stickyNotes.length > 0,
      )
      if (hasStickyNotes) {
        if (
          confirm(
            "Are you sure you want to remove sticky notes and change canvas?",
          )
        ) {
          // Reset sticky notes and reload canvas
  
          contentData.sections.forEach((section) => {
            section.stickyNotes = []
          })
          const selectedLocale = localeSelector.value
          const selectedCanvas = canvasSelector.value
          loadCanvas(selectedLocale, selectedCanvas)
          return false // Cancel the focus event
        } else {
          // Cancel the focus event
          event.target.blur()
        }
      }
    }
  }
  
  localeSelector.addEventListener("focus", handleSelectorFocus)
  canvasSelector.addEventListener("focus", handleSelectorFocus)
module.exports = { loadCanvas }
