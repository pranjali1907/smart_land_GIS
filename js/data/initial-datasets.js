/**
 * Smart Land GIS - Initial Datasets with all 6 Parameters
 */

export const INITIAL_DATASETS = [
  {
    id: "dataset-sector-14",
    name: "Sector 14 - Greenfield Smart City Master Plan",
    description: "Integrated urban development zone featuring residential sectors, commercial boulevard, storm drainage grid, and riverfront flood protection buffers.",
    center: [28.6139, 77.2090],
    zoom: 15,
    isDefault: true,
    created: "2026-03-15",
    
    // 1. PLOTS
    plots: [
      {
        id: "PLT-101",
        plotNumber: "Plot #101",
        surveyNumber: "SY-204/1A",
        owner: "Urban Infrastructure Trust",
        zone: "Residential",
        status: "Available",
        coordinates: [
          [28.6150, 77.2060],
          [28.6150, 77.2080],
          [28.6135, 77.2080],
          [28.6135, 77.2060]
        ],
        length: 167.0,
        width: 195.0,
        area: 32565.0,
        perimeter: 724.0,
        roadAccess: {
          roadName: "North Central Avenue",
          roadType: "Arterial Road",
          distanceMeters: 4.5,
          frontageWidth: 167.0,
          status: "Direct Frontage"
        },
        drainage: {
          drainId: "DRN-01-NORTH",
          type: "Closed Box Culvert",
          distanceMeters: 6.0,
          status: "Connected"
        },
        electricityPole: {
          poleId: "EP-440-101",
          voltage: "440V LT",
          distanceMeters: 8.2,
          clearanceCompliant: true
        },
        lightPole: {
          poleId: "LP-LED-01",
          type: "LED Smart Luminaire",
          distanceMeters: 12.0,
          illuminated: true
        },
        floodRegion: {
          zoneCategory: "Low Risk",
          zoneCode: "Zone C",
          inundationDepthMeters: 0.1,
          status: "Safe from Flood"
        }
      },
      {
        id: "PLT-102",
        plotNumber: "Plot #102",
        surveyNumber: "SY-204/1B",
        owner: "Apex Metro Commercials",
        zone: "Commercial",
        status: "Under Development",
        coordinates: [
          [28.6150, 77.2085],
          [28.6150, 77.2110],
          [28.6135, 77.2110],
          [28.6135, 77.2085]
        ],
        length: 167.0,
        width: 244.0,
        area: 40748.0,
        perimeter: 822.0,
        roadAccess: {
          roadName: "North Central Avenue",
          roadType: "Arterial Road",
          distanceMeters: 5.0,
          frontageWidth: 167.0,
          status: "Direct Frontage"
        },
        drainage: {
          drainId: "DRN-01-NORTH",
          type: "Closed Box Culvert",
          distanceMeters: 5.5,
          status: "Connected"
        },
        electricityPole: {
          poleId: "EP-11K-02",
          voltage: "11kV HT",
          distanceMeters: 14.5,
          clearanceCompliant: true
        },
        lightPole: {
          poleId: "LP-LED-02",
          type: "High-Mast Floodlight",
          distanceMeters: 10.5,
          illuminated: true
        },
        floodRegion: {
          zoneCategory: "Low Risk",
          zoneCode: "Zone C",
          inundationDepthMeters: 0.0,
          status: "Safe from Flood"
        }
      },
      {
        id: "PLT-103",
        plotNumber: "Plot #103",
        surveyNumber: "SY-204/2A",
        owner: "State Logistics Development Corp",
        zone: "Industrial",
        status: "Allocated",
        coordinates: [
          [28.6130, 77.2060],
          [28.6130, 77.2080],
          [28.6115, 77.2080],
          [28.6115, 77.2060]
        ],
        length: 167.0,
        width: 195.0,
        area: 32565.0,
        perimeter: 724.0,
        roadAccess: {
          roadName: "Industrial Spine Road",
          roadType: "Collector Road",
          distanceMeters: 6.0,
          frontageWidth: 167.0,
          status: "Direct Frontage"
        },
        drainage: {
          drainId: "DRN-02-CENTRAL",
          type: "Open Concrete Swale",
          distanceMeters: 18.0,
          status: "Partial Connection"
        },
        electricityPole: {
          poleId: "EP-11K-03",
          voltage: "11kV HT",
          distanceMeters: 3.2,
          clearanceCompliant: false // Needs attention!
        },
        lightPole: {
          poleId: "LP-LED-03",
          type: "LED Smart Luminaire",
          distanceMeters: 28.0,
          illuminated: true
        },
        floodRegion: {
          zoneCategory: "Moderate Risk",
          zoneCode: "Zone B",
          inundationDepthMeters: 0.6,
          status: "Buffer Inundation Risk"
        }
      },
      {
        id: "PLT-104",
        plotNumber: "Plot #104",
        surveyNumber: "SY-204/2B",
        owner: "Riverfront Green Eco Ventures",
        zone: "Agricultural",
        status: "Available",
        coordinates: [
          [28.6130, 77.2085],
          [28.6130, 77.2115],
          [28.6115, 77.2115],
          [28.6115, 77.2085]
        ],
        length: 167.0,
        width: 293.0,
        area: 48931.0,
        perimeter: 920.0,
        roadAccess: {
          roadName: "East Dyke Pathway",
          roadType: "Access Road",
          distanceMeters: 35.0,
          frontageWidth: 80.0,
          status: "Secondary Access" // Needs attention!
        },
        drainage: {
          drainId: "DRN-03-RIVER",
          type: "Open Natural Channel",
          distanceMeters: 85.0,
          status: "Lacks Drainage" // Needs attention!
        },
        electricityPole: {
          poleId: "EP-440-104",
          voltage: "440V LT",
          distanceMeters: 45.0,
          clearanceCompliant: true
        },
        lightPole: {
          poleId: "LP-SOLAR-04",
          type: "Solar PV Powered LED",
          distanceMeters: 42.0,
          illuminated: false // Needs attention!
        },
        floodRegion: {
          zoneCategory: "High Risk",
          zoneCode: "Zone A",
          inundationDepthMeters: 1.8,
          status: "Severe 100-Year Floodplain" // Needs attention!
        }
      },
      {
        id: "PLT-105",
        plotNumber: "Plot #105",
        surveyNumber: "SY-205/1",
        owner: "Municipal Public Works Department",
        zone: "Public/Utility",
        status: "Allocated",
        coordinates: [
          [28.6160, 77.2060],
          [28.6160, 77.2090],
          [28.6152, 77.2090],
          [28.6152, 77.2060]
        ],
        length: 89.0,
        width: 293.0,
        area: 26077.0,
        perimeter: 764.0,
        roadAccess: {
          roadName: "North Central Avenue",
          roadType: "Arterial Road",
          distanceMeters: 4.0,
          frontageWidth: 293.0,
          status: "Direct Frontage"
        },
        drainage: {
          drainId: "DRN-01-NORTH",
          type: "Closed Box Culvert",
          distanceMeters: 4.0,
          status: "Connected"
        },
        electricityPole: {
          poleId: "EP-11K-01",
          voltage: "11kV HT",
          distanceMeters: 12.0,
          clearanceCompliant: true
        },
        lightPole: {
          poleId: "LP-LED-01",
          type: "High-Mast Floodlight",
          distanceMeters: 15.0,
          illuminated: true
        },
        floodRegion: {
          zoneCategory: "Low Risk",
          zoneCode: "Zone C",
          inundationDepthMeters: 0.0,
          status: "Safe from Flood"
        }
      },
      {
        id: "PLT-106",
        plotNumber: "Plot #106",
        surveyNumber: "SY-205/2",
        owner: "Green Meadows Housing Society",
        zone: "Residential",
        status: "Available",
        coordinates: [
          [28.6160, 77.2095],
          [28.6160, 77.2120],
          [28.6152, 77.2120],
          [28.6152, 77.2095]
        ],
        length: 89.0,
        width: 244.0,
        area: 21716.0,
        perimeter: 666.0,
        roadAccess: {
          roadName: "North Central Avenue",
          roadType: "Arterial Road",
          distanceMeters: 6.0,
          frontageWidth: 244.0,
          status: "Direct Frontage"
        },
        drainage: {
          drainId: "DRN-01-NORTH",
          type: "Closed Box Culvert",
          distanceMeters: 7.0,
          status: "Connected"
        },
        electricityPole: {
          poleId: "EP-440-106",
          voltage: "440V LT",
          distanceMeters: 10.0,
          clearanceCompliant: true
        },
        lightPole: {
          poleId: "LP-LED-06",
          type: "LED Smart Luminaire",
          distanceMeters: 14.0,
          illuminated: true
        },
        floodRegion: {
          zoneCategory: "Low Risk",
          zoneCode: "Zone C",
          inundationDepthMeters: 0.0,
          status: "Safe from Flood"
        }
      }
    ],

    // 2. ROADS
    roads: [
      {
        id: "RD-01",
        name: "North Central Avenue",
        type: "Arterial Road",
        widthMeters: 30.0,
        surface: "Asphalt Heavy Duty",
        coordinates: [
          [28.6151, 77.2050],
          [28.6151, 77.2130]
        ]
      },
      {
        id: "RD-02",
        name: "Central Sector Boulevard",
        type: "Arterial Road",
        widthMeters: 24.0,
        surface: "Concrete Dual Carriageway",
        coordinates: [
          [28.6134, 77.2050],
          [28.6134, 77.2130]
        ]
      },
      {
        id: "RD-03",
        name: "Industrial Spine Road",
        type: "Collector Road",
        widthMeters: 18.0,
        surface: "Bitumen Paved",
        coordinates: [
          [28.6114, 77.2050],
          [28.6114, 77.2130]
        ]
      },
      {
        id: "RD-04",
        name: "Cross Sector Connector 1",
        type: "Collector Road",
        widthMeters: 15.0,
        surface: "Asphalt",
        coordinates: [
          [28.6165, 77.2082],
          [28.6110, 77.2082]
        ]
      }
    ],

    // 3. DRAINAGE
    drainage: [
      {
        id: "DRN-01-NORTH",
        name: "North Central Storm Culvert",
        type: "Closed Box Culvert",
        widthMeters: 3.5,
        flowDirection: "Eastbound to Retention Basin",
        coordinates: [
          [28.6153, 77.2050],
          [28.6153, 77.2130]
        ]
      },
      {
        id: "DRN-02-CENTRAL",
        name: "Central Collector Swale",
        type: "Open Concrete Swale",
        widthMeters: 2.8,
        flowDirection: "Eastbound",
        coordinates: [
          [28.6132, 77.2050],
          [28.6132, 77.2130]
        ]
      },
      {
        id: "DRN-03-RIVER",
        name: "East Riverfront Outfall Channel",
        type: "Open Natural Channel",
        widthMeters: 6.0,
        flowDirection: "Southbound to Natural River",
        coordinates: [
          [28.6165, 77.2125],
          [28.6110, 77.2125]
        ]
      }
    ],

    // 4. ELECTRICITY POLES
    electricityPoles: [
      {
        id: "EP-11K-01",
        voltage: "11kV HT",
        type: "Lattice Steel Tower",
        coordinates: [28.6155, 77.2070],
        safeClearanceRadius: 10.0
      },
      {
        id: "EP-440-101",
        voltage: "440V LT",
        type: "Pre-stressed Concrete Pole",
        coordinates: [28.6148, 77.2065],
        safeClearanceRadius: 5.0
      },
      {
        id: "EP-11K-02",
        voltage: "11kV HT",
        type: "Lattice Steel Tower",
        coordinates: [28.6155, 77.2095],
        safeClearanceRadius: 10.0
      },
      {
        id: "EP-11K-03",
        voltage: "11kV HT",
        type: "Tubular Steel Pole",
        coordinates: [28.6131, 77.2062],
        safeClearanceRadius: 10.0
      },
      {
        id: "EP-440-104",
        voltage: "440V LT",
        type: "Pre-stressed Concrete Pole",
        coordinates: [28.6128, 77.2105],
        safeClearanceRadius: 5.0
      },
      {
        id: "EP-440-106",
        voltage: "440V LT",
        type: "Pre-stressed Concrete Pole",
        coordinates: [28.6156, 77.2110],
        safeClearanceRadius: 5.0
      }
    ],

    // 5. LIGHT POLES
    lightPoles: [
      {
        id: "LP-LED-01",
        type: "LED Smart Luminaire",
        wattage: "120W",
        status: "Operational",
        illuminationRadius: 35.0,
        coordinates: [28.6151, 77.2062]
      },
      {
        id: "LP-LED-02",
        type: "High-Mast Floodlight",
        wattage: "250W",
        status: "Operational",
        illuminationRadius: 50.0,
        coordinates: [28.6151, 77.2095]
      },
      {
        id: "LP-LED-03",
        type: "LED Smart Luminaire",
        wattage: "90W",
        status: "Operational",
        illuminationRadius: 30.0,
        coordinates: [28.6133, 77.2075]
      },
      {
        id: "LP-SOLAR-04",
        type: "Solar PV Powered LED",
        wattage: "60W",
        status: "Maintenance Needed",
        illuminationRadius: 25.0,
        coordinates: [28.6122, 77.2100]
      },
      {
        id: "LP-LED-05",
        type: "LED Smart Luminaire",
        wattage: "120W",
        status: "Operational",
        illuminationRadius: 35.0,
        coordinates: [28.6151, 77.2120]
      },
      {
        id: "LP-LED-06",
        type: "LED Smart Luminaire",
        wattage: "120W",
        status: "Operational",
        illuminationRadius: 35.0,
        coordinates: [28.6158, 77.2105]
      }
    ],

    // 6. FLOOD REGIONS
    floodRegions: [
      {
        id: "FL-ZONE-A",
        name: "River Bank High Inundation Basin",
        riskLevel: "High Risk",
        code: "Zone A",
        color: "#ef4444",
        description: "100-Year return period flood basin. Development prohibited without 2.5m structural elevation.",
        coordinates: [
          [28.6135, 77.2100],
          [28.6135, 77.2135],
          [28.6105, 77.2135],
          [28.6105, 77.2100]
        ]
      },
      {
        id: "FL-ZONE-B",
        name: "East Lowland Floodway Buffer",
        riskLevel: "Moderate Risk",
        code: "Zone B",
        color: "#f59e0b",
        description: "500-Year floodplain buffer with seasonal backwater risk during peak monsoon runoff.",
        coordinates: [
          [28.6140, 77.2075],
          [28.6140, 77.2105],
          [28.6110, 77.2105],
          [28.6110, 77.2075]
        ]
      }
    ]
  },
  {
    id: "dataset-industrial-hub",
    name: "Apex Logistics & Industrial Technology Park",
    description: "Heavy logistics zoning with high-voltage electrical grid, 36m arterial container roads, and dedicated stormwater reservoirs.",
    center: [28.4595, 77.0266],
    zoom: 15,
    isDefault: false,
    created: "2026-02-10",
    plots: [
      {
        id: "IND-201",
        plotNumber: "Industrial Lot #201",
        surveyNumber: "SY-88/1",
        owner: "Pacific Freight Hub",
        zone: "Industrial",
        status: "Allocated",
        coordinates: [
          [28.4610, 77.0240],
          [28.4610, 77.0270],
          [28.4590, 77.0270],
          [28.4590, 77.0240]
        ],
        length: 222.0,
        width: 293.0,
        area: 65046.0,
        perimeter: 1030.0,
        roadAccess: {
          roadName: "Logistics Heavy Corridor",
          roadType: "Arterial Road",
          distanceMeters: 6.0,
          frontageWidth: 293.0,
          status: "Direct Frontage"
        },
        drainage: {
          drainId: "DRN-IND-01",
          type: "Closed Box Culvert",
          distanceMeters: 8.0,
          status: "Connected"
        },
        electricityPole: {
          poleId: "EP-33K-01",
          voltage: "11kV HT",
          distanceMeters: 18.0,
          clearanceCompliant: true
        },
        lightPole: {
          poleId: "LP-HM-01",
          type: "High-Mast Floodlight",
          distanceMeters: 15.0,
          illuminated: true
        },
        floodRegion: {
          zoneCategory: "Low Risk",
          zoneCode: "Zone C",
          inundationDepthMeters: 0.0,
          status: "Safe from Flood"
        }
      },
      {
        id: "IND-202",
        plotNumber: "Industrial Lot #202",
        surveyNumber: "SY-88/2",
        owner: "Zenith Cold Storage Infra",
        zone: "Industrial",
        status: "Available",
        coordinates: [
          [28.4610, 77.0275],
          [28.4610, 77.0305],
          [28.4590, 77.0305],
          [28.4590, 77.0275]
        ],
        length: 222.0,
        width: 293.0,
        area: 65046.0,
        perimeter: 1030.0,
        roadAccess: {
          roadName: "Logistics Heavy Corridor",
          roadType: "Arterial Road",
          distanceMeters: 7.0,
          frontageWidth: 293.0,
          status: "Direct Frontage"
        },
        drainage: {
          drainId: "DRN-IND-01",
          type: "Closed Box Culvert",
          distanceMeters: 9.0,
          status: "Connected"
        },
        electricityPole: {
          poleId: "EP-33K-02",
          voltage: "11kV HT",
          distanceMeters: 20.0,
          clearanceCompliant: true
        },
        lightPole: {
          poleId: "LP-HM-02",
          type: "High-Mast Floodlight",
          distanceMeters: 18.0,
          illuminated: true
        },
        floodRegion: {
          zoneCategory: "Low Risk",
          zoneCode: "Zone C",
          inundationDepthMeters: 0.0,
          status: "Safe from Flood"
        }
      }
    ],
    roads: [
      {
        id: "RD-IND-01",
        name: "Logistics Heavy Corridor",
        type: "Arterial Road",
        widthMeters: 36.0,
        surface: "Reinforced Concrete",
        coordinates: [
          [28.4612, 77.0230],
          [28.4612, 77.0315]
        ]
      }
    ],
    drainage: [
      {
        id: "DRN-IND-01",
        name: "Industrial Main Trunk Drain",
        type: "Closed Box Culvert",
        widthMeters: 4.5,
        flowDirection: "East to Treatment Facility",
        coordinates: [
          [28.4615, 77.0230],
          [28.4615, 77.0315]
        ]
      }
    ],
    electricityPoles: [
      {
        id: "EP-33K-01",
        voltage: "11kV HT",
        type: "Lattice Tower",
        coordinates: [28.4618, 77.0255],
        safeClearanceRadius: 12.0
      },
      {
        id: "EP-33K-02",
        voltage: "11kV HT",
        type: "Lattice Tower",
        coordinates: [28.4618, 77.0290],
        safeClearanceRadius: 12.0
      }
    ],
    lightPoles: [
      {
        id: "LP-HM-01",
        type: "High-Mast Floodlight",
        wattage: "400W",
        status: "Operational",
        illuminationRadius: 60.0,
        coordinates: [28.4612, 77.0255]
      },
      {
        id: "LP-HM-02",
        type: "High-Mast Floodlight",
        wattage: "400W",
        status: "Operational",
        illuminationRadius: 60.0,
        coordinates: [28.4612, 77.0290]
      }
    ],
    floodRegions: [
      {
        id: "FL-IND-MOD",
        name: "South Retention Swale Buffer",
        riskLevel: "Moderate Risk",
        code: "Zone B",
        color: "#f59e0b",
        description: "Seasonal runoff ponding area.",
        coordinates: [
          [28.4585, 77.0240],
          [28.4585, 77.0310],
          [28.4570, 77.0310],
          [28.4570, 77.0240]
        ]
      }
    ]
  }
];
