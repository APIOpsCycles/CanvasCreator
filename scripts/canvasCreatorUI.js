/* 
APIOps Cycles Canvas Creator
Creates canvases from json and localization files (note: current code requires the data is directly inserted in the Javascript file.
The JSON files are so big and the client side Javascript not the most efficient way, that also the JSON needs to be minimized with the script).
When you update the Javascript, also create the minimized file and raise version number to help cache to update.
Original author Marjukka Niinioja, licensed under Apache 2.0

 */

/* //default configuration for easily overriding the styles when calling from html. Put this in the html file before calling this script file
      const defaultStyles = {
        width: 1000,
        height: 712,
        headerHeight: 80,
        footerHeight: 30,
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5ff",
        borderColor: "#1a3987",
        fontColor: "#1a3987",
        contentFontColor: "#333",
        highlightColor: "#d7e3fe",
        sectionColor: "#ffffff",
        padding: 10,
        cornerRadius: 10,
        circleRadius: 14,
        lineSize: 1,
        shadowColor: "rgba(0, 0, 0, 0.2)",
        stickyNoteSize: 80,
        stickyNoteSpacing: 10,
        stickyNoteCornerRadius: 3,
        maxLineWidth: 70,
        stickyNoteColor: "#FFF399",
        stickyNoteBorderColor: "#333",
        defaultLocale: "en-US",
      }
  
*/

//load canvas layouts and localizations from json data
const canvasData = {
    apiBusinessModelCanvas: {
      id: "apiBusinessModelCanvas",
      layout: {
        columns: 5,
        rows: 3,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Alexander Osterwalder", "Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "keyPartners",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 2 },
          fillOrder: 7,
        },
        {
          id: "keyActivities",
          gridPosition: { column: 1, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 6,
        },
        {
          id: "keyResources",
          gridPosition: { column: 1, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 5,
        },
        {
          id: "apiValueProposition",
          gridPosition: { column: 2, row: 0, colSpan: 1, rowSpan: 2 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "developerRelations",
          gridPosition: { column: 3, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 3,
        },
        {
          id: "channels",
          gridPosition: { column: 3, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 4,
        },
        {
          id: "apiConsumerSegments",
          gridPosition: { column: 4, row: 0, colSpan: 1, rowSpan: 2 },
          fillOrder: 2,
        },
        {
          id: "costs",
          gridPosition: { column: 0, row: 2, colSpan: 2.5, rowSpan: 1 },
          fillOrder: 9,
        },
        {
          id: "benefits",
          gridPosition: { column: 2.5, row: 2, colSpan: 2.5, rowSpan: 1 },
          fillOrder: 8,
        },
      ],
    },
    apiValuePropositionCanvas: {
      id: "apiValuePropositionCanvas",
      layout: {
        columns: 4,
        rows: 3,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Alexander Osterwalder", "Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "tasks",
          gridPosition: { column: 0, row: 0, colSpan: 4, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
          journeySteps: true,
        },
        {
          id: "gainEnablingFeatures",
          gridPosition: { column: 0, row: 1, colSpan: 2, rowSpan: 1 },
          fillOrder: 2,
        },
        {
          id: "painRelievingFeatures",
          gridPosition: { column: 2, row: 1, colSpan: 2, rowSpan: 1 },
          fillOrder: 3,
        },
        {
          id: "apiProducts",
          gridPosition: { column: 0, row: 2, colSpan: 4, rowSpan: 1 },
          fillOrder: 4,
        },
      ],
    },
    businessImpactCanvas: {
      id: "businessImpactCanvas",
      layout: {
        columns: 3,
        rows: 2,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "availabilityRisks",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "securityRisks",
          gridPosition: { column: 1, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 3,
          highlight: true,
        },
        {
          id: "dataRisks",
          gridPosition: { column: 2, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 5,
          highlight: true,
        },
        {
          id: "mitigateAvailabilityRisks",
          gridPosition: { column: 0, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 2,
        },
        {
          id: "mitigateSecurityRisks",
          gridPosition: { column: 1, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 4,
        },
        {
          id: "mitigateDataRisks",
          gridPosition: { column: 2, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 6,
        },
      ],
    },
    capacityCanvas: {
      id: "capacityCanvas",
      layout: {
        columns: 3,
        rows: 3,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "currentBusinessVolumes",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "futureConsumptionTrends",
          gridPosition: { column: 1, row: 0, colSpan: 2, rowSpan: 1 },
          fillOrder: 2,
        },
        {
          id: "peakLoadAndAvailabilityRequirements",
          gridPosition: { column: 0, row: 1, colSpan: 3, rowSpan: 1 },
          fillOrder: 3,
        },
        {
          id: "cachingStrategies",
          gridPosition: { column: 0, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 4,
        },
        {
          id: "rateLimitingStrategies",
          gridPosition: { column: 1, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 5,
        },
        {
          id: "scalingStrategies",
          gridPosition: { column: 2, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 6,
        },
      ],
    },
    customerJourneyCanvas: {
      id: "customerJourneyCanvas",
      layout: {
        columns: 5,
        rows: 4,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "customerDiscoversNeed",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 2,
        },
        {
          id: "persona",
          gridPosition: { column: 1, row: 0, colSpan: 3, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "pains",
          gridPosition: { column: 0, row: 1, colSpan: 1, rowSpan: 2 },
          fillOrder: 5,
        },
        {
          id: "journeySteps",
          gridPosition: { column: 1, row: 1, colSpan: 3, rowSpan: 2 },
          fillOrder: 4,
          journeySteps: true,
        },
        {
          id: "customerNeedIsResolved",
          gridPosition: { column: 4, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 3,
        },
        {
          id: "gains",
          gridPosition: { column: 4, row: 1, colSpan: 1, rowSpan: 2 },
          fillOrder: 6,
        },
        {
          id: "inputsOutputs",
          gridPosition: { column: 0.5, row: 3, colSpan: 2, rowSpan: 1 },
          fillOrder: 7,
        },
        {
          id: "interactionProcessingRules",
          gridPosition: { column: 2.5, row: 3, colSpan: 2, rowSpan: 1 },
          fillOrder: 8,
        },
      ],
    },
    domainCanvas: {
      id: "domainCanvas",
      layout: {
        columns: 2,
        rows: 4,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "selectedCustomerJourneySteps",
          gridPosition: { column: 0, row: 0, colSpan: 2, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
          journeySteps: true,
        },
        {
          id: "coreEntitiesAndBusinessMeaning",
          gridPosition: { column: 0, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 2,
        },
        {
          id: "attributesAndBusinessImportance",
          gridPosition: { column: 1, row: 1, colSpan: 1, rowSpan: 2 },
          fillOrder: 3,
        },
        {
          id: "relationshipsBetweenEntities",
          gridPosition: { column: 0, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 4,
        },
        {
          id: "businessComplianceAndIntegrityRules",
          gridPosition: { column: 0, row: 3, colSpan: 1, rowSpan: 1 },
          fillOrder: 5,
        },
        {
          id: "securityAndPrivacyConsiderations",
          gridPosition: { column: 1, row: 3, colSpan: 1, rowSpan: 1 },
          fillOrder: 6,
        },
      ],
    },
    eventCanvas: {
      id: "eventCanvas",
      layout: {
        columns: 4,
        rows: 3,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "userTaskTrigger",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "inputEventPayload",
          gridPosition: { column: 0, row: 1, colSpan: 1, rowSpan: 2 },
          fillOrder: 2,
        },
        {
          id: "processingLogic",
          gridPosition: { column: 1, row: 1, colSpan: 2, rowSpan: 2 },
          fillOrder: 3,
        },
        {
          id: "outputEventResult",
          gridPosition: { column: 3, row: 1, colSpan: 1, rowSpan: 2 },
          fillOrder: 4,
        },
      ],
    },
    interactionCanvas: {
      id: "interactionCanvas",
      layout: {
        columns: 4,
        rows: 3,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "crudInteractions",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "crudInputOutputModels",
          gridPosition: { column: 0, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 2,
        },
        {
          id: "crudProcessingValidation",
          gridPosition: { column: 0, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 3,
        },
        {
          id: "queryDrivenInteractions",
          gridPosition: { column: 1, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 4,
          highlight: true,
        },
        {
          id: "queryDrivenInputOutputModels",
          gridPosition: { column: 1, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 5,
        },
        {
          id: "queryDrivenProcessingValidation",
          gridPosition: { column: 1, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 6,
        },
        {
          id: "commandDrivenInteractions",
          gridPosition: { column: 2, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 7,
          highlight: true,
        },
        {
          id: "commandDrivenInputOutputModels",
          gridPosition: { column: 2, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 8,
        },
        {
          id: "commandDrivenProcessingValidation",
          gridPosition: { column: 2, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 9,
        },
        {
          id: "eventDrivenInteractions",
          gridPosition: { column: 3, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 10,
          highlight: true,
        },
        {
          id: "eventDrivenInputOutputModels",
          gridPosition: { column: 3, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 11,
        },
        {
          id: "eventDrivenProcessingValidation",
          gridPosition: { column: 3, row: 2, colSpan: 1, rowSpan: 1 },
          fillOrder: 12,
        },
      ],
    },
    locationsCanvas: {
      id: "locationsCanvas",
      layout: {
        columns: 4,
        rows: 2,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "locationGroups",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "locationGroupCharacteristics",
          gridPosition: { column: 0, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 2,
        },
        {
          id: "locations",
          gridPosition: { column: 1, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 3,
          highlight: true,
        },
        {
          id: "locationCharacteristics",
          gridPosition: { column: 1, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 4,
        },
        {
          id: "locationDistances",
          gridPosition: { column: 2, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 5,
        },
        {
          id: "locationDistanceCharacteristics",
          gridPosition: { column: 2, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 6,
        },
        {
          id: "locationEndpoints",
          gridPosition: { column: 3, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 7,
        },
        {
          id: "locationEndpointCharacteristics",
          gridPosition: { column: 3, row: 1, colSpan: 1, rowSpan: 1 },
          fillOrder: 8,
        },
      ],
    },
    restCanvas: {
      id: "restCanvas",
      layout: {
        columns: 4,
        rows: 3,
      },
      metadata: {
        source: "APIOps Cycles",
        license: "CC-BY-SA 4.0",
        authors: ["Osaango Ltd"],
        website: "www.apiopscycles.com",
      },
      sections: [
        {
          id: "apiResources",
          gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 1,
          highlight: true,
        },
        {
          id: "apiResourceModel",
          gridPosition: { column: 0, row: 1, colSpan: 1, rowSpan: 2 },
          fillOrder: 2,
        },
        {
          id: "apiVerbs",
          gridPosition: { column: 1, row: 0, colSpan: 1, rowSpan: 1 },
          fillOrder: 3,
          highlight: true,
        },
        {
          id: "apiVerbExample",
          gridPosition: { column: 1, row: 1, colSpan: 3, rowSpan: 2 },
          fillOrder: 4,
        },
      ],
    },
  }
  
  const localizedData = {
    "de-DE": {
      apiBusinessModelCanvas: {
        title: "API-Geschäftsmodell Canvas",
        purpose:
          "Wie praktikabel und wiederverwendbar wird diese API sein? Haben wir einen Business Case aus Kosten-Nutzen-Sicht?",
        howToUse:
          "Fassen Sie das Wertversprechen einer API aus dem API-Wertversprechen-Canvas zusammen und folgen Sie dann der nummerierten Reihenfolge.",
        sections: {
          keyPartners: {
            section: "Schlüsselpartner",
            description: "Wer sind die wichtigsten beteiligten Stakeholder?",
          },
          keyActivities: {
            section: "Schlüsselaktivitäten",
            description:
              "Was sind die wichtigsten Maßnahmen, die der API-Anbieter ergreifen muss, um erfolgreich zu arbeiten?",
          },
          keyResources: {
            section: "Schlüsselressourcen",
            description:
              "Welche einzigartigen strategischen Vermögenswerte muss der API-Anbieter erwerben oder aufbauen?",
          },
          apiValueProposition: {
            section: "API-Wertversprechen",
            description: "Welchen Wert bietet die API den API-Konsumenten?",
          },
          developerRelations: {
            section: "Entwicklerbeziehungen",
            description:
              "Wie erreicht und unterstützt der API-Anbieter API-Konsumenten?",
          },
          channels: {
            section: "Kanäle",
            description:
              "Über welche Mechanismen interagieren API-Konsumenten mit der API?",
          },
          apiConsumerSegments: {
            section: "API-Konsumentensegmente",
            description: "Wer sind die Zielgruppen für die API?",
          },
          costs: {
            section: "Kosten",
            description:
              "Was sind die wesentlichen Kosten für die Erstellung, Bereitstellung und den Betrieb der API?",
          },
          benefits: {
            section: "Vorteile",
            description:
              "Was sind die wesentlichen Vorteile oder Einnahmequellen, die durch die API generiert werden?",
          },
        },
      },
    },
    "en-US": {
      apiBusinessModelCanvas: {
        title: "API Business Model Canvas",
        purpose:
          "How feasible and reusable will this API be? Do we have a business case from a cost - benefit point of view?",
        howToUse:
          "Summarize the value proposition of one API from the API Value Proposition Canvas, then follow the numbered sequence.",
        sections: {
          keyPartners: {
            section: "Key Partners",
            description: "Who are the key stakeholders involved?",
          },
          keyActivities: {
            section: "Key Activities",
            description:
              "What are the most important actions the API provider must take to operate successfully?",
          },
          keyResources: {
            section: "Key Resources",
            description:
              "What unique strategic assets must the API provider acquire or build?",
          },
          apiValueProposition: {
            section: "API Value Proposition",
            description: "What value does the API offer to API consumers?",
          },
          developerRelations: {
            section: "Developer Relations",
            description:
              "How does the API provider reach and support API consumers?",
          },
          channels: {
            section: "Channels",
            description:
              "Through which mechanisms do API consumers interact with the API?",
          },
          apiConsumerSegments: {
            section: "API Consumer Segments",
            description: "Who are the target audiences for the API?",
          },
          costs: {
            section: "Costs",
            description:
              "What are the significant costs involved in building, deploying, and operating the API?",
          },
          benefits: {
            section: "Benefits",
            description:
              "What are the significant benefits or revenue streams generated by the API?",
          },
        },
      },
      apiValuePropositionCanvas: {
        title: "API Value Proposition Canvas",
        purpose:
          "Does this API address the jobs, pains, and gains of API consumers?",
        howToUse:
          "Describe the API consumer's perspective, starting with their tasks, then their pains and gains, and finally the API's products and features.",
        sections: {
          tasks: {
            section: "Tasks",
            description: "What are the API consumers trying to achieve?",
          },
          gainEnablingFeatures: {
            section: "Gain Enabling Features",
            description: "What features enable API consumers to achieve gains?",
          },
          painRelievingFeatures: {
            section: "Pain Relieving Features",
            description: "What features help API consumers overcome pains?",
          },
          apiProducts: {
            section: "API Products",
            description:
              "What API products and features address the tasks, pains, and gains?",
          },
        },
      },
      businessImpactCanvas: {
        title: "Business Impact Canvas",
        purpose: "What are the potential business impacts of API failure?",
        howToUse:
          "Consider the potential impact on availability, security, and data for each API.",
        sections: {
          availabilityRisks: {
            section: "Availability Risks",
            description: "What are the potential risks to API availability?",
          },
          securityRisks: {
            section: "Security Risks",
            description:
              "What are the potential security risks associated with the API?",
          },
          dataRisks: {
            section: "Data Risks",
            description:
              "What are the potential risks to data integrity or confidentiality?",
          },
          mitigateAvailabilityRisks: {
            section: "Mitigate Availability Risks",
            description:
              "How can the API provider mitigate the availability risks?",
          },
          mitigateSecurityRisks: {
            section: "Mitigate Security Risks",
            description: "How can the API provider mitigate the security risks?",
          },
          mitigateDataRisks: {
            section: "Mitigate Data Risks",
            description: "How can the API provider mitigate the data risks?",
          },
        },
      },
      capacityCanvas: {
        title: "Capacity Canvas",
        purpose: "How much capacity is needed to support API consumption?",
        howToUse:
          "Analyze the current and future capacity requirements for each API.",
        sections: {
          currentBusinessVolumes: {
            section: "Current Business Volumes",
            description:
              "What are the current business volumes and transaction rates?",
          },
          futureConsumptionTrends: {
            section: "Future Consumption Trends",
            description: "What are the anticipated future consumption trends?",
          },
          peakLoadAndAvailabilityRequirements: {
            section: "Peak Load and Availability Requirements",
            description: "What are the peak load and availability requirements?",
          },
          cachingStrategies: {
            section: "Caching Strategies",
            description:
              "What caching strategies can be used to optimize performance?",
          },
          rateLimitingStrategies: {
            section: "Rate Limiting Strategies",
            description:
              "What rate limiting strategies can be used to manage consumption?",
          },
          scalingStrategies: {
            section: "Scaling Strategies",
            description:
              "What scaling strategies can be used to accommodate growth?",
          },
        },
      },
      customerJourneyCanvas: {
        title: "Customer Journey Canvas",
        purpose: "How do API consumers interact with the API over time?",
        howToUse:
          "Map the customer journey for each API, from initial discovery to ongoing use.",
        sections: {
          customerDiscoversNeed: {
            section: "Customer Discovers Need",
            description: "How does the customer discover the need for the API?",
          },
          persona: {
            section: "Persona",
            description: "Who is the typical customer or user of the API?",
          },
          pains: {
            section: "Pains",
            description: "What are the customer's pain points or challenges?",
          },
          journeySteps: {
            section: "Journey Steps",
            description:
              "What are the steps the customer takes in their journey?",
          },
          customerNeedIsResolved: {
            section: "Customer Need Is Resolved",
            description: "How is the customer's need ultimately resolved?",
          },
          gains: {
            section: "Gains",
            description: "What are the customer's gains or benefits?",
          },
          inputsOutputs: {
            section: "Inputs & Outputs",
            description: "What are the inputs and outputs at each step?",
          },
          interactionProcessingRules: {
            section: "Interaction & Processing Rules",
            description:
              "What are the interaction and processing rules at each step?",
          },
        },
      },
      domainCanvas: {
        title: "Domain Canvas",
        purpose:
          "What are the core entities and business rules related to the API?",
        howToUse:
          "Define the domain model for each API, including entities, attributes, and relationships.",
        sections: {
          selectedCustomerJourneySteps: {
            section: "Selected Customer Journey Steps",
            description:
              "Which customer journey steps are relevant to this domain?",
          },
          coreEntitiesAndBusinessMeaning: {
            section: "Core Entities & Business Meaning",
            description: "What are the core entities and their business meaning?",
          },
          attributesAndBusinessImportance: {
            section: "Attributes & Business Importance",
            description:
              "What are the key attributes of each entity and their business importance?",
          },
          relationshipsBetweenEntities: {
            section: "Relationships Between Entities",
            description: "What are the relationships between the entities?",
          },
          businessComplianceAndIntegrityRules: {
            section: "Business, Compliance & Integrity Rules",
            description:
              "What are the business, compliance, and integrity rules related to the entities?",
          },
          securityAndPrivacyConsiderations: {
            section: "Security & Privacy Considerations",
            description:
              "What are the security and privacy considerations related to the entities?",
          },
        },
      },
      eventCanvas: {
        title: "Event Canvas",
        purpose:
          "What events are relevant to the API, and how are they processed?",
        howToUse:
          "Define the events, their triggers, and the processing logic for each API.",
        sections: {
          userTaskTrigger: {
            section: "User Task / Trigger",
            description:
              "What user action or system event triggers this event operation?",
          },
          inputEventPayload: {
            section: "Input / Event Payload",
            description:
              "What data is included in the incoming event payload? Specify key attributes.",
          },
          processingLogic: {
            section: "Processing / Logic",
            description:
              "Describe the backend processing logic, including validations, transformations, or routing decisions.",
          },
          outputEventResult: {
            section: "Output / Event Result",
            description:
              "What resulting event or acknowledgment is produced? Include attributes of the output payload.",
          },
        },
      },
      interactionCanvas: {
        title: "Interaction Canvas",
        purpose:
          "What are the different types of interactions supported by the API?",
        howToUse:
          "Define the CRUD, query-driven, command-driven, and event-driven interactions for each API.",
        sections: {
          crudInteractions: {
            section: "CRUD Interactions",
            description:
              "What are the CRUD (Create, Read, Update, Delete) interactions supported by the API?",
          },
          crudInputOutputModels: {
            section: "CRUD Input & Output Models",
            description:
              "What are the input and output models for the CRUD interactions?",
          },
          crudProcessingValidation: {
            section: "CRUD Processing & Validation",
            description:
              "What are the processing and validation rules for the CRUD interactions?",
          },
          queryDrivenInteractions: {
            section: "Query-Driven Interactions",
            description:
              "What are the query-driven interactions supported by the API?",
          },
          queryDrivenInputOutputModels: {
            section: "Query-Driven Input & Output Models",
            description:
              "What are the input and output models for the query-driven interactions?",
          },
          queryDrivenProcessingValidation: {
            section: "Query-Driven Processing & Validation",
            description:
              "What are the processing and validation rules for the query-driven interactions?",
          },
          commandDrivenInteractions: {
            section: "Command-Driven Interactions",
            description:
              "What are the command-driven interactions supported by the API?",
          },
          commandDrivenInputOutputModels: {
            section: "Command-Driven Input & Output Models",
            description:
              "What are the input and output models for the command-driven interactions?",
          },
          commandDrivenProcessingValidation: {
            section: "Command-Driven Processing & Validation",
            description:
              "What are the processing and validation rules for the command-driven interactions?",
          },
          eventDrivenInteractions: {
            section: "Event-Driven Interactions",
            description:
              "What are the event-driven interactions supported by the API?",
          },
          eventDrivenInputOutputModels: {
            section: "Event-Driven Input & Output Models",
            description:
              "What are the input and output models for the event-driven interactions?",
          },
          eventDrivenProcessingValidation: {
            section: "Event-Driven Processing & Validation",
            description:
              "What are the processing and validation rules for the event-driven interactions?",
          },
        },
      },
      locationsCanvas: {
        title: "Locations Canvas",
        purpose: "What are the relevant locations and their characteristics?",
        howToUse:
          "Define the locations, their distances, and their endpoints for each API.",
        sections: {
          locationGroups: {
            section: "Location Groups",
            description: "What are the relevant location groups?",
          },
          locationGroupCharacteristics: {
            section: "Location Group Characteristics",
            description: "What are the characteristics of the location groups?",
          },
          locations: {
            section: "Locations",
            description: "What are the relevant locations within each group?",
          },
          locationCharacteristics: {
            section: "Location Characteristics",
            description: "What are the characteristics of the locations?",
          },
          locationDistances: {
            section: "Location Distances",
            description: "What are the distances between the locations?",
          },
          locationDistanceCharacteristics: {
            section: "Location Distance Characteristics",
            description:
              "What are the characteristics of the location distances?",
          },
          locationEndpoints: {
            section: "Location Endpoints",
            description: "What are the endpoints associated with the locations?",
          },
          locationEndpointCharacteristics: {
            section: "Location Endpoint Characteristics",
            description:
              "What are the characteristics of the location endpoints?",
          },
        },
      },
      restCanvas: {
        title: "REST Canvas",
        purpose: "How can the API be designed using RESTful principles?",
        howToUse:
          "Define the API resources, verbs, and example requests and responses.",
        sections: {
          apiResources: {
            section: "API Resources",
            description: "What are the key resources exposed by the API?",
          },
          apiResourceModel: {
            section: "API Resource Model",
            description: "What is the structure of the API resource model?",
          },
          apiVerbs: {
            section: "API Verbs",
            description:
              "What HTTP verbs are used to interact with the API resources?",
          },
          apiVerbExample: {
            section: "API Verb Example",
            description:
              "Provide an example of an API request and response for each verb.",
          },
        },
      },
    },
  }
  
  // Sticky note variables
  let currentColor = defaultStyles.stickyNoteColor
  let selectedNote = null
  
  // Placeholder function to load canvas data (replace with API call later)
  function loadCanvasData(canvasId) {
    // You can remove this function entirely since canvasData is already loaded
    return canvasData[canvasId]
  }
  
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
  
  let canvasDataForId = null
  let contentData = {}
  
  function loadCanvas(locale, canvasId) {
    // Access canvasData directly
    canvasDataForId = canvasData[canvasId]
  
    // Check if canvasDataForId is defined before accessing its properties
    if (!canvasDataForId) {
      console.error(`Canvas data not found for canvasId: ${canvasId}`)
      return // Or handle the error appropriately
    }
  
    // Initialize contentData based on the selected canvas
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
  
    let svg = d3.select("svg")
  
    //main
    const renderCanvas = (canvasData, contentData, localizedData) => {
      d3.select("svg").remove()
  
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
          `Template by: ${canvasData.metadata.source} | ${canvasData.metadata.license} | ${canvasData.metadata.authors} | <a href='http://${canvasData.metadata.website}' target='_blank'>${canvasData.metadata.website}</a>`,
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
            `Content by: ${contentData?.metadata?.source} | ${contentData?.metadata?.license} | ${contentData?.metadata?.authors} | <a href='http://${contentData?.metadata?.website}' target='_blank'>${contentData?.metadata?.website}</a>`,
          )
      }
  
      // Export the canvas content as JSON (attach listener only once)
      const exportJSONButton = document.getElementById("exportButton")
      if (!exportJSONButton.dataset.listenerAttached) {
        // Check if listener is already attached
        exportJSONButton.addEventListener("click", (event) => {
          // Gather the content data
          const exportData = {
            templateId: canvasData.id,
            metadata: {
              ...contentData.metadata, // Use contentData.metadata
              date: new Date().toISOString(),
            },
            sections: contentData.sections.map((section) => ({
              // Map sections to the new format
              sectionId: section.sectionId,
              stickyNotes: section.stickyNotes.map((note) => ({
                content: note.content.replace(/\n/g, ""), // Remove newlines
                position: note.position,
                size: note.size,
                color: note.color,
              })),
            })),
          }
          // Convert to JSON string
          const jsonString = JSON.stringify(exportData, null, 2)
  
          // Create a download link
          const link = document.createElement("a")
          link.href =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(jsonString)
          const filename = `${contentData.metadata.source}${contentData.templateId}_${locale}.json`
          link.download = filename
  
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
  
        exportJSONButton.dataset.listenerAttached = true // Mark the listener as attached
      }
  
      // Import canvas content from JSON
  
      const importButton = document.getElementById("importButton")
  
      if (!importButton.dataset.listenerAttached) {
        importButton.addEventListener("click", (event) => {
          event.stopPropagation() // Prevent event bubbling
          const input = document.createElement("input")
          input.type = "file"
          input.accept = ".json"
  
          // Add the onchange listener directly without storing it in a variable
          input.onchange = (event) => {
            const file = event.target.files[0]
            const reader = new FileReader()
            reader.onload = (event) => {
              const jsonData = JSON.parse(event.target.result)
  
              // Update canvasData with imported data
              canvasData.id = jsonData.templateId
              contentData.metadata = jsonData.metadata // Import metadata into contentData
              // Update the metadata form fields with the imported values
              document.getElementById("source").value = jsonData.metadata.source
              document.getElementById("license").value = jsonData.metadata.license
              document.getElementById("authors").value =
                jsonData.metadata.authors.join(",")
              document.getElementById("website").value = jsonData.metadata.website
  
              contentData.sections = jsonData.sections.map(
                (section, sectionIndex) => {
                  const canvasSection = canvasData.sections.find(
                    (s) => s.id === section.sectionId,
                  )
                  let nextX = 3 * defaultStyles.stickyNoteSpacing // Initial x-coordinate for sticky notes in this section
                  let nextY = defaultStyles.stickyNoteSize // Initial y-coordinate for sticky notes in this section
  
                  return {
                    sectionId: section.sectionId,
                    stickyNotes: section.stickyNotes.map((note) => {
                      const newNote = {
                        content: validateInput(
                          wrapText(svg, note.content.trim()),
                        ), // Validate the content
                        size: note.size || defaultStyles.stickyNoteSize,
                        color: note.color || defaultStyles.stickyNoteColor,
                      }
  
                      // Calculate position if not provided
                      if (!note.position) {
                        newNote.position = {
                          x:
                            canvasSection.gridPosition.column * cellWidth + nextX,
                          y:
                            canvasSection.gridPosition.row * cellHeight +
                            defaultStyles.headerHeight +
                            nextY,
                        }
  
                        // Update nextX and nextY for the next sticky note in this section
                        nextX +=
                          defaultStyles.stickyNoteSize +
                          defaultStyles.stickyNoteSpacing
                        if (
                          nextX + defaultStyles.stickyNoteSize >
                          canvasSection.gridPosition.colSpan * cellWidth
                        ) {
                          nextX = 2 * defaultStyles.stickyNoteSpacing
                          nextY +=
                            defaultStyles.stickyNoteSize +
                            defaultStyles.stickyNoteSpacing
                        }
                      } else {
                        newNote.position = note.position
                      }
  
                      return newNote
                    }),
                  }
                },
              )
  
              // Force a refresh of the SVG element
              svg = d3.select("svg")
              svg.node().innerHTML = svg.node().innerHTML
              // Update sticky notes on the canvas
              updateStickyNotes(contentData) // Pass contentData to updateStickyNotes
              updateFooter()
            }
            reader.readAsText(file)
          }
  
          input.click() // Trigger the file selection
        })
        importButton.dataset.listenerAttached = true // Mark the listener as attached
      }
  
      // Export the canvas content as SVG (attach listener only once)
      const exportSVGButton = document.getElementById("exportSVGButton")
      if (!exportSVGButton.dataset.listenerAttached) {
        // Check if listener is already attached
        exportSVGButton.addEventListener("click", (event) => {
          const svgNode = svg.node()
          const serializer = new XMLSerializer()
          const svgString = serializer.serializeToString(svgNode)
          const blob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8",
          })
          const link = document.createElement("a")
          link.href = URL.createObjectURL(blob)
          // Create a download link with the desired filename format
          const filename = `${contentData.metadata.source}${contentData.templateId}_${locale}.svg`
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
  
        exportSVGButton.dataset.listenerAttached = true // Mark the listener as attached
      }
  
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
  
  // Function to sanitize text input
  function sanitizeInput(text) {
    // You can use a library like DOMPurify for more robust sanitization
    // For now, a simple example to remove script tags:
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  }
  
  // Function to validate text input (limit length)
  function validateInput(text) {
    const maxLength = 200 // Set your desired maximum length
    if (text.length > maxLength) {
      return text.substring(0, maxLength)
    }
    return text
  }
  