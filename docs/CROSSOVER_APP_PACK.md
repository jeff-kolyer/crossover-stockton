{
  "packName": "CROSSOVER_APP_PACK",
  "version": "0.7.0",
  "status": "combined renderer contract + canonical sample feed",
  "scope": "first public Crossover Stockton feed renderer",
  "format": "json.txt",
  "sourceFile": "CROSSOVER_APP_PACK(3).md",
  "changeSummary": [
    "Adds Verified as a first-class card type and CategoryStrip item after Signals.",
    "Clarifies that CategoryStrip remains text-only even with Verified added.",
    "Clarifies service card title icons use linked entity.kind, while domain chips use domain icons.",
    "Clarifies that service map markers may still use domain icons.",
    "Fixes currentRelevance schema around isCurrentlyRelevant.",
    "Normalizes stale_needs_recheck in service/gap filter state options.",
    "Adds mobile shell with Feed and Map as primary surfaces and Filters as modal/sheet.",
    "Clarifies mobile StickyBottomNav: Live Feed, Map, Filters.",
    "Keeps current relevance as the default feed predicate; no default date range drives the public live feed."
  ],
  "productIntent": {
    "summary": "Crossover Stockton is a feed-first civic product showing currently relevant support, gaps, forecasts/signals, verified records, civic work, posts, and map context.",
    "not": [
      "landing page",
      "marketing homepage",
      "generic analytics dashboard"
    ],
    "primaryInterface": "Feed cards + map context",
    "rules": [
      "Cards are the primary public browsing objects.",
      "The map mirrors the same visible records spatially.",
      "The feed is governed by current relevance, not by a default date range."
    ]
  },
  "runtime": {
    "runtime": "browser-native web app",
    "preferredStack": [
      "React",
      "TypeScript",
      "Tailwind CSS"
    ],
    "icons": "Lucide or equivalent outline icon set",
    "map": "Leaflet / React Leaflet if available",
    "fallbackMap": "styled fake map with equivalent marker behavior",
    "prototypeExclusions": [
      "auth",
      "backend",
      "persistence",
      "admin tools",
      "agent workflows",
      "production routing"
    ]
  },
  "cardTypes": [
    "gap",
    "service",
    "signal",
    "verified",
    "work",
    "post"
  ],
  "categoryContract": {
    "categoryOrder": [
      "all",
      "gaps",
      "services",
      "signals",
      "verified",
      "work",
      "posts"
    ],
    "displayLabels": {
      "all": "All",
      "gaps": "Gaps",
      "services": "Services",
      "signals": "Signals",
      "verified": "Verified",
      "work": "Work",
      "posts": "Posts"
    },
    "categoryToCardType": {
      "all": "*",
      "gaps": "gap",
      "services": "service",
      "signals": "signal",
      "verified": "verified",
      "work": "work",
      "posts": "post"
    },
    "rules": [
      "CategoryStrip is text-only app chrome.",
      "Verified appears after Signals.",
      "Do not use semantic card icons in the CategoryStrip.",
      "Do not use card type colors in the CategoryStrip.",
      "CategoryStrip owns broad type separation, so cards do not need type chips."
    ]
  },
  "layoutContract": {
    "desktop": {
      "breakpoint": "viewport.width >= 900px",
      "structure": [
        "AppRoot",
        "LeftRail",
        "MainApp",
        "TopBar",
        "CategoryStrip",
        "ContentSplit",
        "CardsPane",
        "MapPane"
      ],
      "split": {
        "CardsPane": "about 54% to 58%",
        "MapPane": "about 42% to 46%",
        "CardsPaneMinWidth": "560px",
        "MapPaneMinWidth": "420px"
      },
      "cardGrid": {
        "CardsPane.contentWidth < 760px": "1 column",
        "CardsPane.contentWidth >= 760px": "2 columns"
      },
      "topBarOrder": [
        "Crossover",
        "Stockton, CA",
        "● Refreshed 2 min ago",
        "Search locations, services, updates...",
        "Filters",
        "More"
      ],
      "leftRailItems": [
        "Logo mark only",
        "Live Feed",
        "Who We Are",
        "How AI Helps",
        "Data Sources",
        "Settings pinned bottom"
      ]
    },
    "mobile": {
      "breakpoint": "viewport.width < 900px",
      "structure": [
        "MobileApp",
        "MobileTopBar",
        "CategoryStrip",
        "ActiveSurface",
        "StickyBottomNav"
      ],
      "visibility": {
        "LeftRail": false,
        "TopBar": false,
        "ContentSplit": false,
        "MobileTopBar": true,
        "CategoryStrip": true,
        "ActiveSurface": true,
        "StickyBottomNav": true,
        "VisibleSurfaceCount": 1
      },
      "activeSurfaceValues": [
        "feed",
        "map",
        "detail"
      ],
      "defaultActiveSurface": "feed",
      "filtersModalState": "filtersModalOpen",
      "mobileTopBar": [
        "MenuButton",
        "CitySelector",
        "FreshnessIndicator",
        "SearchButton",
        "FiltersButton"
      ],
      "mobileTopBarVisualTarget": "☰   Stockton, CA   ● 2 min   Search   Filters",
      "categoryStrip": {
        "overflowX": "auto",
        "wrap": false,
        "labelsOnly": true
      },
      "feed": {
        "CardGrid.columns": 1,
        "bottomPadding": ">= StickyBottomNav.height + safe-area-inset-bottom + 24px"
      },
      "map": {
        "rule": "Map is its own active surface and must not appear stacked below the feed by default."
      },
      "stickyBottomNav": {
        "items": [
          "Live Feed",
          "Map",
          "Filters"
        ],
        "rules": [
          "Visible on mobile.",
          "Hidden on desktop.",
          "Fixed to bottom of viewport.",
          "Sits above safe-area inset.",
          "Active item is visually selected.",
          "Controls are thumb-sized, not tiny desktop tabs."
        ],
        "actions": {
          "Live Feed": "queryState.activeSurface = feed; queryState.filtersModalOpen = false",
          "Map": "queryState.activeSurface = map; queryState.filtersModalOpen = false",
          "Filters": "queryState.filtersModalOpen = true; preserve queryState.activeSurface"
        }
      },
      "tapTargets": {
        "InteractiveControl.minHeight": "44px",
        "InteractiveControl.minWidth": "44px",
        "ReadableText.minFontSize": "14px"
      }
    }
  },
  "iconContract": {
    "principle": "Small title-leading icons are allowed when specified; large decorative type icons and type chips are forbidden.",
    "titleLeadingIconRules": {
      "gap": "AlertTriangle",
      "signal": "Activity or TrendingUp",
      "verified": "ShieldCheck",
      "work": "Users",
      "post": "MessageSquare",
      "service": "linked_entity_kind_icon"
    },
    "entityKindIconMap": {
      "service_location": "MapPin",
      "organization": "Building2",
      "gap": "AlertTriangle",
      "route": "Route",
      "area": "Map",
      "event_location": "CalendarDays",
      "resource": "Package"
    },
    "serviceCardRule": {
      "titleIcon": "Use the primary linked entity.kind icon before the service card title.",
      "primaryEntityResolution": [
        "card.primaryEntityId",
        "first item in card.entityIds"
      ],
      "fallback": "MapPin",
      "examples": [
        {
          "cardTitle": "St. Mary's meal service is open",
          "linkedEntityKind": "organization",
          "titleIcon": "Building2",
          "domainChips": [
            "Food"
          ]
        },
        {
          "cardTitle": "Mobile hygiene unit arriving soon",
          "linkedEntityKind": "service_location",
          "titleIcon": "MapPin",
          "domainChips": [
            "Hygiene",
            "Water if applicable"
          ]
        },
        {
          "cardTitle": "Downtown restroom data needs recheck",
          "linkedEntityKind": "resource",
          "titleIcon": "Package",
          "domainChips": [
            "Hygiene"
          ]
        }
      ]
    },
    "domainIconRule": {
      "rule": "Domain icons appear in domain chips and services-provided chips.",
      "doNotUseDomainIconAsServiceTitleIcon": true,
      "domainIconMap": {
        "food": "Utensils",
        "water": "Droplet",
        "shelter": "House or Bed",
        "hygiene": "ShowerHead or Droplets",
        "charging": "Plug or Zap",
        "environment": "Leaf",
        "care": "HeartPulse",
        "mobility": "Bus or Route",
        "connectivity": "Wifi",
        "outreach": "HandHeart or Users",
        "storage": "Package",
        "safe_parking": "ParkingCircle"
      }
    },
    "mapMarkerIconRules": {
      "gap": "AlertTriangle",
      "service": "domain icon, green when open/opening soon",
      "signal": "Activity or TrendingUp",
      "verified": "ShieldCheck",
      "work": "Users",
      "post": "MessageSquare",
      "stale_closed_unknown": "gray marker treatment"
    }
  },
  "cardContract": {
    "requiredContent": [
      "Title",
      "Area/location",
      "Summary",
      "Optional operational/access line",
      "Status/severity/domain chips",
      "Evidence/confidence trust row",
      "Optional small media"
    ],
    "forbidden": [
      "Service/Gap/Signal/Verified/Work/Post type chips",
      "large card-type icons",
      "full-card category color fills",
      "generic Updated timestamps"
    ],
    "rules": [
      "Cards are mostly white and share one calm card family.",
      "Cards are sold by content, not by loud category labels.",
      "Gap cards may show a small AlertTriangle immediately before the title.",
      "Verified cards may show ShieldCheck as a small title-leading icon.",
      "Service cards use entity-kind title icons, not domain title icons.",
      "Domain chips inside service cards use domain icons such as Food, Shelter, Storage, Hygiene, Water, or Charging.",
      "Card time appears only when it changes what the user should believe or do."
    ],
    "trustRow": "Evidence label · confidence; optional freshness only when freshness affects trust."
  },
  "currentRelevanceContract": {
    "sourceOfTruth": "card.currentRelevance.isCurrentlyRelevant + type-specific state fields + evidenceState",
    "currentRelevanceShape": {
      "isCurrentlyRelevant": "boolean",
      "reason": "string",
      "evidenceBasis": "EvidenceState|string optional",
      "lastEvaluatedAt": "ISO datetime optional"
    },
    "visibleCardPredicate": [
      "card.publicState == public",
      "card.lifecycleState not in hidden, archived, expired",
      "card.currentRelevance.isCurrentlyRelevant == true",
      "active category/filter/search predicates still apply"
    ],
    "states": {
      "GapState": [
        "active",
        "watch",
        "resolved",
        "unconfirmed",
        "stale",
        "stale_needs_recheck"
      ],
      "ServiceState": [
        "open_now",
        "opening_soon",
        "closed",
        "temporarily_closed",
        "hours_changed",
        "capacity_limited",
        "unverified",
        "stale",
        "stale_needs_recheck",
        "unknown",
        "inactive"
      ],
      "SignalState": [
        "active",
        "forecasted",
        "watch",
        "elevated",
        "worsening",
        "improving",
        "holding",
        "expired"
      ],
      "VerificationState": [
        "recent_or_relevant",
        "stale",
        "conflicting",
        "needs_review"
      ],
      "WorkState": [
        "planned",
        "in_progress",
        "blocked",
        "completed",
        "paused"
      ],
      "PostState": [
        "active",
        "expired",
        "archived"
      ]
    }
  },
  "interactionContract": {
    "categoryClick": "sets activeCategory, clears selectedCardId, recomputes visible cards and markers",
    "feedSummarySectionClick": "uses section action to apply a category/filter shortcut",
    "cardClick": "selects card, highlights map marker, desktop replaces CardsPane with detail, mobile opens detail surface/sheet",
    "markerClick": "selects corresponding card and opens detail behavior for current viewport",
    "searchAndFilters": "recompute visible cards and map markers",
    "mobileSurfaceSwitch": {
      "feed": "queryState.activeSurface = feed; filtersModalOpen = false",
      "map": "queryState.activeSurface = map; filtersModalOpen = false",
      "filters": "queryState.filtersModalOpen = true; activeSurface is preserved"
    }
  },
  "sampleFeed": {
    "schemaVersion": "0.7.0-combined-sample-feed",
    "feedId": "stockton-ca-public-feed-demo",
    "generatedAt": "2026-04-30T15:07:00-07:00",
    "refreshedAt": "2026-04-30T15:05:00-07:00",
    "city": {
      "cityId": "stockton-ca",
      "cityName": "Stockton",
      "state": "CA",
      "country": "US",
      "timezone": "America/Los_Angeles",
      "mapCenter": {
        "lat": 37.9577,
        "lng": -121.2908
      },
      "defaultZoom": 12
    },
    "queryState": {
      "activeCityId": "stockton-ca",
      "activeCategory": "all",
      "activeFilters": {
        "domains": [],
        "evidenceStates": [],
        "statuses": [],
        "openOnly": false,
        "gapsOnly": false,
        "activeOnly": false,
        "includeStale": true,
        "currentRelevantOnly": true,
        "gapStates": [],
        "serviceStates": [],
        "signalStates": [],
        "workStates": [],
        "postStates": []
      },
      "searchQuery": "",
      "selectedCardId": null,
      "activeSurface": "feed",
      "sortMode": "importance",
      "filtersModalOpen": false,
      "previousSurface": null
    },
    "feedSummary": {
      "id": "feed-summary-stockton-public",
      "component": "FeedSummary",
      "displayLabel": "Crossover Stockton Feed",
      "renderMode": "compact_feed_summary",
      "sourceOfTruth": "feedSummary",
      "feedDescription": {
        "headline": "A public feed of currently relevant support, gaps, forecasts, and civic work in Stockton.",
        "summary": "Crossover uses AI-assisted review of public sources, partner updates, observations, and human reports to surface what is open, what is worsening, what needs verification, and what work is underway.",
        "generatedBy": "Crossover Stockton",
        "aiDisclosure": "AI helps gather, compare, summarize, and flag uncertainty. Records should be checked against listed sources before action.",
        "scope": "Public demo feed for Stockton, CA.",
        "visibilityModel": "The default feed is governed by current relevance, not by a fixed date range."
      },
      "backgroundImage": {
        "kind": "line_art",
        "name": "stockton-bridge-cityline",
        "placement": "center-right",
        "opacity": 0.14,
        "renderBehindContent": true
      },
      "sectionOrder": [
        "currentConditions",
        "forecast",
        "gaps",
        "openingSoon"
      ],
      "sections": {
        "currentConditions": {
          "id": "summary-current-conditions",
          "label": "Current conditions",
          "summary": "Food coverage is holding for now, but overnight access drops after 9 PM.",
          "icon": "Activity",
          "colorRole": "neutral",
          "cardIds": [
            "card-charging-gap-east-corridor",
            "card-overnight-risk-signal",
            "card-st-marys-open",
            "card-mobile-hygiene-arriving"
          ],
          "action": {
            "type": "clear_summary_filter",
            "activeCategory": "all",
            "filters": {
              "currentRelevantOnly": true
            }
          },
          "count": 4,
          "displayValue": "Live now",
          "role": "primary_live_condition_statement",
          "description": "Owns the main plain-language situation statement for the current feed.",
          "headline": "Charging and shelter support are thinning tonight."
        },
        "gaps": {
          "id": "summary-gaps",
          "label": "Gaps",
          "publicLabel": "Alerts",
          "count": 1,
          "headline": "1 active gap",
          "summary": "One high-severity charging gap needs attention in East Corridor.",
          "icon": "AlertTriangle",
          "colorRole": "gap",
          "cardIds": [
            "card-charging-gap-east-corridor"
          ],
          "action": {
            "type": "apply_filter",
            "activeCategory": "gaps",
            "filters": {
              "gapStates": [
                "active"
              ]
            }
          }
        },
        "forecast": {
          "id": "summary-forecast",
          "label": "Forecast",
          "headline": "Overnight risk rises after 6 PM.",
          "summary": "Pressure trend rises from 6 PM to 6 AM compared to recent baseline.",
          "deltaLabel": "+28%",
          "deltaDirection": "up",
          "icon": "TrendingUp",
          "colorRole": "signal",
          "cardIds": [
            "card-overnight-risk-signal"
          ],
          "pressureTrend": {
            "label": "Pressure trend",
            "deltaLabel": "+28%",
            "deltaDirection": "up",
            "timeWindowLabel": "6 PM–6 AM",
            "points": [
              {
                "label": "6 PM",
                "value": 42
              },
              {
                "label": "8 PM",
                "value": 45
              },
              {
                "label": "10 PM",
                "value": 48
              },
              {
                "label": "12 AM",
                "value": 53
              },
              {
                "label": "2 AM",
                "value": 57
              },
              {
                "label": "4 AM",
                "value": 61
              },
              {
                "label": "6 AM",
                "value": 66
              }
            ],
            "renderHints": {
              "detailLevel": "simple",
              "showYAxis": false,
              "showGrid": false,
              "showAreaFill": true,
              "showPointMarkers": false,
              "maxVisibleLabels": 3
            }
          },
          "action": {
            "type": "apply_filter",
            "activeCategory": "signals",
            "filters": {
              "signalStates": [
                "forecasted",
                "active"
              ]
            }
          }
        },
        "openingSoon": {
          "id": "summary-opening-soon",
          "label": "Opening soon",
          "count": 1,
          "headline": "1 service opening soon",
          "summary": "Mobile hygiene service is scheduled near Central Core.",
          "icon": "Clock",
          "colorRole": "open",
          "cardIds": [
            "card-mobile-hygiene-arriving"
          ],
          "action": {
            "type": "apply_filter",
            "activeCategory": "services",
            "filters": {
              "serviceStates": [
                "opening_soon"
              ]
            }
          }
        }
      },
      "rules": {
        "renderAsHero": false,
        "feedSummaryExplainsFeedItself": true,
        "currentConditionsOwnsLiveSituationCopy": true,
        "doNotDuplicateWithFindings": true,
        "allowedSections": [
          "currentConditions",
          "forecast",
          "gaps",
          "openingSoon"
        ],
        "doNotRenderFindingsAboveFeed": true,
        "doNotShowRefreshedOrDateRangeInsideSummary": true,
        "copyOwnership": {
          "feedDescription": "Explains what the Crossover Stockton feed is, how it is generated, and how to interpret it.",
          "currentConditions": "Owns the live plain-language condition headline and summary.",
          "forecast": "Owns pressure trend copy and chart data.",
          "gaps": "Owns active gap count and gap filter shortcut.",
          "openingSoon": "Owns near-term service availability shortcut."
        },
        "forbiddenDuplication": [
          "Do not copy currentConditions.headline into feedDescription.headline.",
          "Do not copy currentConditions.summary into feedDescription.summary.",
          "Do not render a separate Current signals card.",
          "Do not render findings groups as top summary cards when feedSummary exists."
        ]
      }
    },
    "findings": {
      "renderPolicy": "supporting_data_only_do_not_render_above_feed_when_feedSummary_exists",
      "groups": {
        "gaps": {
          "label": "Gaps",
          "summary": "One high-severity gap needs attention in East Corridor.",
          "cardIds": [
            "card-charging-gap-east-corridor"
          ]
        },
        "openingSoon": {
          "label": "Opening soon",
          "summary": "One mobile hygiene service is scheduled near Central Core.",
          "cardIds": [
            "card-mobile-hygiene-arriving"
          ]
        },
        "verifiedSupport": {
          "label": "Verified support",
          "summary": "Meal service and hygiene service records have recent source support.",
          "cardIds": [
            "card-st-marys-open",
            "card-hours-verified-hygiene"
          ]
        }
      },
      "notes": "Findings may group cards for details/filter shortcuts, but FeedSummary.sections are the only top summary sections."
    },
    "categoryOrder": [
      "all",
      "gaps",
      "services",
      "signals",
      "verified",
      "work",
      "posts"
    ],
    "categoryCounts": {
      "all": 9,
      "gaps": 1,
      "services": 4,
      "signals": 1,
      "verified": 1,
      "work": 1,
      "posts": 1
    },
    "map": {
      "center": {
        "lat": 37.9577,
        "lng": -121.2908
      },
      "zoom": 12,
      "selectedCardId": null,
      "showAllVisibleCards": true,
      "weather": {
        "temperatureLabel": "63°",
        "condition": "Partly cloudy",
        "wind": "Light winds",
        "icon": "CloudSun"
      },
      "areas": [
        {
          "id": "area-east-corridor-pressure",
          "name": "East Corridor pressure area",
          "severity": "high",
          "polygon": [
            {
              "lat": 37.9785,
              "lng": -121.2351
            },
            {
              "lat": 37.9922,
              "lng": -121.2068
            },
            {
              "lat": 37.9704,
              "lng": -121.1879
            },
            {
              "lat": 37.9362,
              "lng": -121.2045
            },
            {
              "lat": 37.9281,
              "lng": -121.2372
            }
          ],
          "cardIds": [
            "card-charging-gap-east-corridor",
            "card-overnight-risk-signal"
          ]
        }
      ]
    },
    "sources": [
      {
        "id": "src-city-cooling-notice",
        "type": "city_notice",
        "title": "Cooling center afternoon operations notice",
        "retrievedAt": "2026-04-30T13:02:00-07:00",
        "publisher": "City partner notice",
        "summary": "Notice lists water, restroom access, snacks, and charging at the North Edge cooling center.",
        "public": true
      },
      {
        "id": "src-st-marys-partner-update",
        "type": "partner_update",
        "title": "St. Mary's Dining Room afternoon meal update",
        "retrievedAt": "2026-04-30T12:14:00-07:00",
        "publisher": "Partner update",
        "summary": "Partner update confirms afternoon meal service is active until 2 PM.",
        "public": true
      },
      {
        "id": "src-mobile-hygiene-dispatch",
        "type": "partner_update",
        "title": "Mobile hygiene unit dispatch note",
        "retrievedAt": "2026-04-30T10:42:00-07:00",
        "publisher": "Outreach partner",
        "summary": "Mobile hygiene unit scheduled for Central Core with showers, restroom access, and hygiene supplies.",
        "public": true
      },
      {
        "id": "src-charging-field-report",
        "type": "field_report",
        "title": "East Corridor charging access field report",
        "retrievedAt": "2026-04-30T09:05:00-07:00",
        "publisher": "Field observation",
        "summary": "Field report found only one of five known public charging points active in the East Corridor area.",
        "public": true
      },
      {
        "id": "src-pressure-model",
        "type": "api",
        "title": "Overnight pressure model run",
        "retrievedAt": "2026-04-30T08:30:00-07:00",
        "publisher": "Crossover model output",
        "summary": "Model run indicates increased overnight pressure between 6 PM and 6 AM compared with recent baseline.",
        "public": true
      },
      {
        "id": "src-restroom-directory-stale",
        "type": "directory",
        "title": "Downtown restroom directory record",
        "retrievedAt": "2026-04-20T11:18:00-07:00",
        "publisher": "Public directory",
        "summary": "Directory record for downtown restroom access has not been checked in ten days.",
        "public": true
      },
      {
        "id": "src-shelter-work-note",
        "type": "manual_note",
        "title": "Overnight shelter coordination note",
        "retrievedAt": "2026-04-30T09:30:00-07:00",
        "publisher": "Crossover work note",
        "summary": "Partner outreach and placement coordination are underway for overnight shelter access.",
        "public": true
      },
      {
        "id": "src-donation-drive-post",
        "type": "human_report",
        "title": "Donation drive community post",
        "retrievedAt": "2026-04-30T08:04:00-07:00",
        "publisher": "Community post",
        "summary": "Community post announces blankets, meals, and hygiene kit collection this weekend.",
        "public": true
      }
    ],
    "entities": [
      {
        "id": "ent-east-corridor-charging-gap",
        "kind": "gap",
        "name": "East Corridor charging access gap",
        "domains": [
          "charging",
          "connectivity"
        ],
        "area": "East Corridor",
        "lat": 37.9654,
        "lng": -121.2321,
        "summary": "Public charging access is below expected coverage for evening and overnight needs.",
        "currentStatus": "Only 1 of 5 charging points active nearby.",
        "currentSeverity": "high",
        "verificationStatus": "source_supported",
        "lastCheckedAt": "2026-04-30T09:05:00-07:00",
        "sourceIds": [
          "src-charging-field-report"
        ],
        "public": true,
        "gapState": "active",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Evidence currently supports that the charging gap exists.",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        }
      },
      {
        "id": "ent-st-marys-dining-room",
        "kind": "organization",
        "name": "St. Mary's Dining Room",
        "domains": [
          "food"
        ],
        "area": "Central Core",
        "address": "545 W Sonora St, Stockton, CA",
        "lat": 37.9529,
        "lng": -121.2974,
        "summary": "Meal service location in Central Core.",
        "currentStatus": "Open until 2 PM",
        "verificationStatus": "verified",
        "lastCheckedAt": "2026-04-30T12:14:00-07:00",
        "sourceIds": [
          "src-st-marys-partner-update"
        ],
        "public": true
      },
      {
        "id": "ent-mobile-hygiene-central-core",
        "kind": "service_location",
        "name": "Mobile hygiene unit near Central Core",
        "domains": [
          "hygiene",
          "water"
        ],
        "area": "Central Core",
        "lat": 37.9492,
        "lng": -121.2871,
        "summary": "Mobile showers, restroom access, and hygiene supplies scheduled near Central Core.",
        "currentStatus": "Arrives 11:15 AM",
        "verificationStatus": "source_supported",
        "lastCheckedAt": "2026-04-30T10:42:00-07:00",
        "sourceIds": [
          "src-mobile-hygiene-dispatch"
        ],
        "public": true
      },
      {
        "id": "ent-north-edge-cooling-center",
        "kind": "service_location",
        "name": "North Edge cooling center",
        "domains": [
          "shelter",
          "water",
          "charging"
        ],
        "area": "North Edge",
        "address": "3600 N El Dorado St, Stockton, CA",
        "lat": 38.0125,
        "lng": -121.3032,
        "summary": "Cooling center with rest area, water, snacks, and charging.",
        "currentStatus": "Open until 2 PM",
        "verificationStatus": "source_supported",
        "lastCheckedAt": "2026-04-30T13:02:00-07:00",
        "sourceIds": [
          "src-city-cooling-notice"
        ],
        "public": true
      },
      {
        "id": "ent-downtown-restroom-record",
        "kind": "resource",
        "name": "Downtown restroom directory record",
        "domains": [
          "hygiene"
        ],
        "area": "Downtown",
        "lat": 37.9521,
        "lng": -121.2902,
        "summary": "Public restroom information that may be incomplete because it has not been checked recently.",
        "currentStatus": "Last checked 10 days ago",
        "verificationStatus": "stale",
        "lastCheckedAt": "2026-04-20T11:18:00-07:00",
        "sourceIds": [
          "src-restroom-directory-stale"
        ],
        "public": true,
        "serviceState": "stale_needs_recheck",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Stale record requires recheck.",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        }
      },
      {
        "id": "ent-south-works-shelter-access",
        "kind": "area",
        "name": "South Works shelter access",
        "domains": [
          "shelter",
          "outreach"
        ],
        "area": "South Works",
        "lat": 37.9142,
        "lng": -121.2731,
        "summary": "Area where overnight shelter placement coordination is underway.",
        "currentStatus": "Partner outreach active",
        "verificationStatus": "human_reported",
        "lastCheckedAt": "2026-04-30T09:30:00-07:00",
        "sourceIds": [
          "src-shelter-work-note"
        ],
        "public": true
      },
      {
        "id": "ent-hope-center-west-hills",
        "kind": "organization",
        "name": "Hope Center",
        "domains": [
          "outreach",
          "food",
          "hygiene"
        ],
        "area": "West Hills",
        "address": "343 W Main St, Stockton, CA",
        "lat": 37.9588,
        "lng": -121.3094,
        "summary": "Community partner hosting a donation drive.",
        "currentStatus": "Donation drive this weekend",
        "verificationStatus": "source_supported",
        "lastCheckedAt": "2026-04-30T08:04:00-07:00",
        "sourceIds": [
          "src-donation-drive-post"
        ],
        "public": true
      }
    ],
    "services": [
      {
        "id": "svc-st-marys-afternoon-meal",
        "entityId": "ent-st-marys-dining-room",
        "domain": "food",
        "name": "Afternoon meal service",
        "access": "walk_in",
        "eligibility": [
          "public",
          "walk-in"
        ],
        "normalSchedule": [
          {
            "days": [
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri"
            ],
            "opens": "11:00",
            "closes": "14:00"
          }
        ],
        "currentStatus": "open_now",
        "currentState": "open_now",
        "verificationStatus": "verified",
        "sourceIds": [
          "src-st-marys-partner-update"
        ],
        "public": true,
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Service state is relevant to current access decisions.",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        }
      },
      {
        "id": "svc-mobile-hygiene-central-core",
        "entityId": "ent-mobile-hygiene-central-core",
        "domain": "hygiene",
        "name": "Mobile hygiene service",
        "access": "walk_in",
        "eligibility": [
          "public"
        ],
        "currentStatus": "opening_soon",
        "currentState": "opening_soon",
        "verificationStatus": "source_supported",
        "sourceIds": [
          "src-mobile-hygiene-dispatch"
        ],
        "public": true,
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Service state is relevant to current access decisions.",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        }
      },
      {
        "id": "svc-north-edge-cooling-center",
        "entityId": "ent-north-edge-cooling-center",
        "domain": "shelter",
        "name": "Cooling center rest area",
        "access": "walk_in",
        "eligibility": [
          "public"
        ],
        "normalSchedule": [
          {
            "days": [
              "Thu"
            ],
            "opens": "10:00",
            "closes": "14:00"
          }
        ],
        "currentStatus": "open_now",
        "currentState": "open_now",
        "verificationStatus": "source_supported",
        "sourceIds": [
          "src-city-cooling-notice"
        ],
        "public": true,
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Service state is relevant to current access decisions.",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        }
      }
    ],
    "observations": [
      {
        "id": "obs-charging-gap-east-corridor",
        "type": "gap_observation",
        "domain": "charging",
        "entityIds": [
          "ent-east-corridor-charging-gap"
        ],
        "summary": "Only one of five known public charging points is active nearby.",
        "observedAt": "2026-04-30T09:05:00-07:00",
        "confidence": 0.74,
        "verificationStatus": "source_supported",
        "sourceIds": [
          "src-charging-field-report"
        ],
        "public": true,
        "supportsCurrentState": true
      },
      {
        "id": "obs-st-marys-open",
        "type": "availability_observation",
        "domain": "food",
        "entityIds": [
          "ent-st-marys-dining-room"
        ],
        "serviceIds": [
          "svc-st-marys-afternoon-meal"
        ],
        "summary": "Afternoon meal service is active until 2 PM.",
        "observedAt": "2026-04-30T12:14:00-07:00",
        "validFrom": "2026-04-30T11:00:00-07:00",
        "validUntil": "2026-04-30T14:00:00-07:00",
        "confidence": 0.97,
        "verificationStatus": "verified",
        "sourceIds": [
          "src-st-marys-partner-update"
        ],
        "public": true,
        "supportsCurrentState": true
      },
      {
        "id": "obs-mobile-hygiene-arriving",
        "type": "availability_observation",
        "domain": "hygiene",
        "entityIds": [
          "ent-mobile-hygiene-central-core"
        ],
        "serviceIds": [
          "svc-mobile-hygiene-central-core"
        ],
        "summary": "Mobile hygiene unit is scheduled to arrive near Central Core at 11:15 AM.",
        "observedAt": "2026-04-30T10:42:00-07:00",
        "validFrom": "2026-04-30T11:15:00-07:00",
        "confidence": 0.8,
        "verificationStatus": "source_supported",
        "sourceIds": [
          "src-mobile-hygiene-dispatch"
        ],
        "public": true,
        "supportsCurrentState": true
      },
      {
        "id": "obs-cooling-center-open",
        "type": "availability_observation",
        "domain": "shelter",
        "entityIds": [
          "ent-north-edge-cooling-center"
        ],
        "serviceIds": [
          "svc-north-edge-cooling-center"
        ],
        "summary": "Cooling center reopened with water, A/C rest area, snacks, and charging available.",
        "observedAt": "2026-04-30T13:02:00-07:00",
        "validUntil": "2026-04-30T14:00:00-07:00",
        "confidence": 0.84,
        "verificationStatus": "source_supported",
        "sourceIds": [
          "src-city-cooling-notice"
        ],
        "public": true,
        "supportsCurrentState": true
      },
      {
        "id": "obs-overnight-risk-pressure",
        "type": "signal_observation",
        "domain": "shelter",
        "entityIds": [
          "ent-east-corridor-charging-gap",
          "ent-south-works-shelter-access"
        ],
        "summary": "Pressure trend rises from 6 PM to 6 AM compared to recent baseline.",
        "observedAt": "2026-04-30T08:30:00-07:00",
        "validFrom": "2026-04-30T18:00:00-07:00",
        "validUntil": "2026-05-01T06:00:00-07:00",
        "confidence": 0.71,
        "verificationStatus": "model_inferred",
        "sourceIds": [
          "src-pressure-model"
        ],
        "public": true,
        "supportsCurrentState": true
      },
      {
        "id": "obs-downtown-restroom-stale",
        "type": "stale_record_observation",
        "domain": "hygiene",
        "entityIds": [
          "ent-downtown-restroom-record"
        ],
        "summary": "Last checked 10 days ago. Information may be incomplete.",
        "observedAt": "2026-04-20T11:18:00-07:00",
        "confidence": 0.45,
        "verificationStatus": "stale",
        "sourceIds": [
          "src-restroom-directory-stale"
        ],
        "public": true,
        "supportsCurrentState": true
      },
      {
        "id": "obs-hours-verified-hygiene",
        "type": "verification_observation",
        "domain": "hygiene",
        "entityIds": [
          "ent-mobile-hygiene-central-core",
          "ent-downtown-restroom-record"
        ],
        "summary": "Hours for four hygiene-related services were checked against partner or public sources.",
        "observedAt": "2026-04-30T08:18:00-07:00",
        "confidence": 0.91,
        "verificationStatus": "verified",
        "sourceIds": [
          "src-mobile-hygiene-dispatch",
          "src-restroom-directory-stale"
        ],
        "public": true,
        "supportsCurrentState": true
      }
    ],
    "workItems": [
      {
        "id": "work-overnight-shelter-access",
        "type": "work",
        "title": "Working on overnight shelter access",
        "summary": "Partner outreach and placement coordination underway for tonight.",
        "status": "in_progress",
        "domain": "shelter",
        "area": "South Works",
        "entityIds": [
          "ent-south-works-shelter-access"
        ],
        "relatedObservationIds": [
          "obs-overnight-risk-pressure"
        ],
        "sourceIds": [
          "src-shelter-work-note"
        ],
        "public": true,
        "publicState": "public",
        "createdAt": "2026-04-30T09:30:00-07:00",
        "startedAt": "2026-04-30T09:39:00-07:00",
        "updatedAt": "2026-04-30T09:39:00-07:00",
        "lifecycleState": "public"
      }
    ],
    "posts": [
      {
        "id": "post-donation-drive-weekend",
        "type": "post",
        "domain": "outreach",
        "title": "Donation drive this weekend",
        "body": "Blankets, meals, and hygiene kits needed at Hope Center.",
        "area": "West Hills",
        "publishedAt": "2026-04-30T08:04:00-07:00",
        "authorLabel": "Community partner",
        "entityIds": [
          "ent-hope-center-west-hills"
        ],
        "sourceIds": [
          "src-donation-drive-post"
        ],
        "public": true,
        "publicState": "public",
        "lifecycleState": "public"
      }
    ],
    "cards": [
      {
        "id": "card-charging-gap-east-corridor",
        "cityId": "stockton-ca",
        "type": "gap",
        "domain": "charging",
        "title": "Charging gap worsened",
        "area": "East Corridor",
        "summary": "Only 1 of 5 charging points active nearby.",
        "operationalLine": "Needs recheck later today.",
        "timestamp": "2026-04-30T09:05:00-07:00",
        "entityIds": [
          "ent-east-corridor-charging-gap"
        ],
        "observationIds": [
          "obs-charging-gap-east-corridor"
        ],
        "sourceIds": [
          "src-charging-field-report"
        ],
        "status": "high",
        "severity": "high",
        "confidence": 0.74,
        "evidenceState": "source_supported",
        "verificationStatus": "source_supported",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9654,
        "lng": -121.2321,
        "priority": 1,
        "renderHints": {
          "findingsGroup": "gaps",
          "mapIcon": "AlertTriangle",
          "mapColorRole": "gap",
          "cardPattern": "gap",
          "titleIcon": "AlertTriangle"
        },
        "details": {
          "whyShowing": "Charging access is below the active coverage expected for East Corridor evening needs.",
          "whatChanged": "Field report indicates four known charging points are unavailable or unconfirmed.",
          "whatCrossoverIsDoing": "Flagging the gap for recheck and cross-checking nearby alternatives.",
          "whatHappensNext": "If the gap persists into evening, it remains pinned near the top of the feed."
        },
        "gapState": "active",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Evidence currently supports that this gap exists.",
          "evidenceBasis": "source_supported",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-east-corridor-charging-gap",
        "resolvedEntityKind": "gap"
      },
      {
        "id": "card-overnight-risk-signal",
        "cityId": "stockton-ca",
        "type": "signal",
        "domain": "shelter",
        "title": "Overnight risk increased +28%",
        "area": "Citywide",
        "summary": "Pressure trend rises from 6 PM to 6 AM.",
        "operationalLine": "Forecast window: 6 PM–6 AM.",
        "timestamp": "2026-04-30T08:30:00-07:00",
        "entityIds": [
          "ent-east-corridor-charging-gap",
          "ent-south-works-shelter-access"
        ],
        "observationIds": [
          "obs-overnight-risk-pressure"
        ],
        "sourceIds": [
          "src-pressure-model"
        ],
        "status": "worsening",
        "severity": "moderate",
        "confidence": 0.71,
        "evidenceState": "model_inferred",
        "verificationStatus": "model_inferred",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9577,
        "lng": -121.2908,
        "priority": 2,
        "renderHints": {
          "findingsGroup": "forecast",
          "mapIcon": "Activity",
          "mapColorRole": "signal",
          "cardPattern": "signal_chart",
          "imageStyle": "sparkline",
          "titleIcon": "Activity"
        },
        "details": {
          "whyShowing": "The pressure trend is rising during the overnight window when shelter and charging access are most constrained.",
          "whatChanged": "The modeled overnight pressure is 28% higher than the recent baseline.",
          "whatCrossoverIsDoing": "Watching related gaps and surfacing open services that reduce overnight exposure.",
          "whatHappensNext": "The signal expires after the overnight window unless refreshed by new observations."
        },
        "signalState": "forecasted",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Forecast applies to the current/next overnight operating window.",
          "evidenceBasis": "model_inferred",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-east-corridor-charging-gap",
        "resolvedEntityKind": "gap"
      },
      {
        "id": "card-st-marys-open",
        "cityId": "stockton-ca",
        "type": "service",
        "domain": "food",
        "title": "St. Mary's meal service is open",
        "area": "Central Core",
        "summary": "Afternoon meal service is active until 2 PM.",
        "operationalLine": "Open until 2 PM",
        "timestamp": "2026-04-30T12:14:00-07:00",
        "entityIds": [
          "ent-st-marys-dining-room"
        ],
        "serviceIds": [
          "svc-st-marys-afternoon-meal"
        ],
        "observationIds": [
          "obs-st-marys-open"
        ],
        "sourceIds": [
          "src-st-marys-partner-update"
        ],
        "status": "open_now",
        "confidence": 0.97,
        "evidenceState": "verified",
        "verificationStatus": "verified",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9529,
        "lng": -121.2974,
        "priority": 3,
        "renderHints": {
          "findingsGroup": "verifiedSupport",
          "mapIcon": "Utensils",
          "mapColorRole": "open",
          "cardPattern": "service",
          "imageStyle": "food_service",
          "titleIcon": "Building2"
        },
        "serviceState": "open_now",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Service is currently open or active according to source evidence.",
          "evidenceBasis": "verified",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-st-marys-dining-room",
        "resolvedEntityKind": "organization"
      },
      {
        "id": "card-mobile-hygiene-arriving",
        "cityId": "stockton-ca",
        "type": "service",
        "domain": "hygiene",
        "title": "Mobile hygiene unit arriving soon",
        "area": "Central Core",
        "summary": "Showers, restroom access, and hygiene supplies scheduled near Central Core.",
        "operationalLine": "Arrives 11:15 AM",
        "timestamp": "2026-04-30T10:42:00-07:00",
        "entityIds": [
          "ent-mobile-hygiene-central-core"
        ],
        "serviceIds": [
          "svc-mobile-hygiene-central-core"
        ],
        "observationIds": [
          "obs-mobile-hygiene-arriving"
        ],
        "sourceIds": [
          "src-mobile-hygiene-dispatch"
        ],
        "status": "opening_soon",
        "confidence": 0.8,
        "evidenceState": "source_supported",
        "verificationStatus": "source_supported",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9492,
        "lng": -121.2871,
        "priority": 4,
        "renderHints": {
          "findingsGroup": "openingSoon",
          "mapIcon": "ShowerHead",
          "mapColorRole": "open",
          "cardPattern": "service",
          "imageStyle": "mobile_hygiene_van",
          "titleIcon": "MapPin"
        },
        "serviceState": "opening_soon",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Service is scheduled to arrive soon and remains useful before arrival.",
          "evidenceBasis": "source_supported",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-mobile-hygiene-central-core",
        "resolvedEntityKind": "service_location"
      },
      {
        "id": "card-cooling-center-reopened",
        "cityId": "stockton-ca",
        "type": "service",
        "domain": "shelter",
        "title": "Cooling center reopened",
        "area": "North Edge",
        "summary": "Water, A/C rest area, snacks, and charging available.",
        "operationalLine": "Open until 2 PM",
        "timestamp": "2026-04-30T13:02:00-07:00",
        "entityIds": [
          "ent-north-edge-cooling-center"
        ],
        "serviceIds": [
          "svc-north-edge-cooling-center"
        ],
        "observationIds": [
          "obs-cooling-center-open"
        ],
        "sourceIds": [
          "src-city-cooling-notice"
        ],
        "status": "open_now",
        "confidence": 0.84,
        "evidenceState": "source_supported",
        "verificationStatus": "source_supported",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 38.0125,
        "lng": -121.3032,
        "priority": 5,
        "renderHints": {
          "mapIcon": "House",
          "mapColorRole": "open",
          "cardPattern": "service",
          "imageStyle": "cooling_center",
          "titleIcon": "MapPin"
        },
        "serviceState": "open_now",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Service is currently open or active according to source evidence.",
          "evidenceBasis": "source_supported",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-north-edge-cooling-center",
        "resolvedEntityKind": "service_location"
      },
      {
        "id": "card-downtown-restroom-recheck",
        "cityId": "stockton-ca",
        "type": "service",
        "domain": "hygiene",
        "title": "Downtown restroom data needs recheck",
        "area": "Downtown",
        "summary": "Last checked 10 days ago. Information may be incomplete.",
        "operationalLine": "Last checked 10 days ago",
        "timestamp": "2026-04-20T11:18:00-07:00",
        "entityIds": [
          "ent-downtown-restroom-record"
        ],
        "observationIds": [
          "obs-downtown-restroom-stale"
        ],
        "sourceIds": [
          "src-restroom-directory-stale"
        ],
        "status": "stale",
        "confidence": 0.45,
        "evidenceState": "stale",
        "verificationStatus": "stale",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9521,
        "lng": -121.2902,
        "priority": 6,
        "renderHints": {
          "mapIcon": "ShowerHead",
          "mapColorRole": "stale",
          "cardPattern": "service_stale",
          "imageStyle": "restroom",
          "titleIcon": "Package"
        },
        "serviceState": "stale_needs_recheck",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Staleness is itself the reason this record remains visible.",
          "evidenceBasis": "stale",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-downtown-restroom-record",
        "resolvedEntityKind": "resource"
      },
      {
        "id": "card-hours-verified-hygiene",
        "cityId": "stockton-ca",
        "type": "verified",
        "domain": "hygiene",
        "title": "Hours verified for 4 hygiene services",
        "area": "Citywide",
        "summary": "Partner updates confirm today's shower and restroom hours.",
        "operationalLine": "Verified today",
        "timestamp": "2026-04-30T08:18:00-07:00",
        "entityIds": [
          "ent-mobile-hygiene-central-core",
          "ent-downtown-restroom-record"
        ],
        "observationIds": [
          "obs-hours-verified-hygiene"
        ],
        "sourceIds": [
          "src-mobile-hygiene-dispatch",
          "src-restroom-directory-stale"
        ],
        "status": "verified",
        "confidence": 0.91,
        "evidenceState": "verified",
        "verificationStatus": "verified",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9583,
        "lng": -121.2922,
        "priority": 7,
        "renderHints": {
          "mapIcon": "ShieldCheck",
          "mapColorRole": "verified",
          "cardPattern": "verified",
          "imageStyle": "checkmark",
          "titleIcon": "ShieldCheck"
        },
        "verificationState": "recent_or_relevant",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Verification supports active hygiene-service records.",
          "evidenceBasis": "verified",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-mobile-hygiene-central-core",
        "resolvedEntityKind": "service_location"
      },
      {
        "id": "card-overnight-shelter-work",
        "cityId": "stockton-ca",
        "type": "work",
        "domain": "shelter",
        "title": "Working on overnight shelter access",
        "area": "South Works",
        "summary": "Partner outreach and placement coordination underway for tonight.",
        "operationalLine": "Started this morning",
        "timestamp": "2026-04-30T09:39:00-07:00",
        "entityIds": [
          "ent-south-works-shelter-access"
        ],
        "observationIds": [
          "obs-overnight-risk-pressure"
        ],
        "workItemIds": [
          "work-overnight-shelter-access"
        ],
        "sourceIds": [
          "src-shelter-work-note"
        ],
        "status": "in_progress",
        "confidence": 0.78,
        "evidenceState": "human_reported",
        "verificationStatus": "human_reported",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9142,
        "lng": -121.2731,
        "priority": 8,
        "renderHints": {
          "mapIcon": "Users",
          "mapColorRole": "work",
          "cardPattern": "work",
          "imageStyle": "outreach_workers",
          "titleIcon": "Users"
        },
        "workState": "in_progress",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Work is currently underway and tied to an active/forecasted support need.",
          "evidenceBasis": "human_reported",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-south-works-shelter-access",
        "resolvedEntityKind": "area"
      },
      {
        "id": "card-donation-drive-post",
        "cityId": "stockton-ca",
        "type": "post",
        "domain": "outreach",
        "title": "Donation drive this weekend",
        "area": "West Hills",
        "summary": "Blankets, meals, and hygiene kits needed.",
        "operationalLine": "Posted today",
        "timestamp": "2026-04-30T08:04:00-07:00",
        "entityIds": [
          "ent-hope-center-west-hills"
        ],
        "postIds": [
          "post-donation-drive-weekend"
        ],
        "sourceIds": [
          "src-donation-drive-post"
        ],
        "status": "public",
        "confidence": 0.86,
        "evidenceState": "source_supported",
        "verificationStatus": "source_supported",
        "lifecycleState": "public",
        "publicState": "public",
        "lat": 37.9588,
        "lng": -121.3094,
        "priority": 9,
        "renderHints": {
          "mapIcon": "MessageSquare",
          "mapColorRole": "post",
          "cardPattern": "post",
          "imageStyle": "donation_box",
          "titleIcon": "MessageSquare"
        },
        "postState": "active",
        "currentRelevance": {
          "isCurrentlyRelevant": true,
          "reason": "Post remains within its public display window and is still useful.",
          "evidenceBasis": "source_supported",
          "lastEvaluatedAt": "2026-04-30T15:05:00-07:00"
        },
        "primaryEntityId": "ent-hope-center-west-hills",
        "resolvedEntityKind": "organization"
      }
    ],
    "renderContracts": {
      "feedSummary": {
        "moduleName": "FeedSummary",
        "placement": "CardsPane.topBeforeCardGrid",
        "source": "feedSummary",
        "height": "compact",
        "sections": "exactly feedSummary.sectionOrder",
        "displayRules": [
          "Render one compact top module from feedSummary only.",
          "FeedSummary.feedDescription explains what the feed is; it is not the live condition headline.",
          "Render sections in this order: Current conditions, Forecast, Gaps, Opening soon.",
          "Current conditions owns the live sentence: Charging and shelter support are thinning tonight.",
          "The Forecast section owns the pressure trend chart.",
          "Do not render findings.currentSignals or any extra Current signals card.",
          "Do not repeat top-bar refreshed time or date preset inside this module.",
          "Use backgroundImage as subtle decorative line art only."
        ]
      },
      "visibleCards": {
        "source": "cards",
        "defaultPredicate": "current_relevance",
        "rules": [
          "Do not apply a default datePreset to the public live feed.",
          "Show cards where currentRelevance.isCurrentlyRelevant is true.",
          "For gaps, gapState active/watch/unconfirmed/stale_needs_recheck controls visibility.",
          "For resolved gaps, hide from default feed unless history mode is active.",
          "Date filters are optional advanced filters, not default feed truth.",
          "For services/resources, serviceState open_now/opening_soon/capacity_limited/hours_changed/stale_needs_recheck controls visibility.",
          "Verified cards are included when card.type == verified and currentRelevance.isCurrentlyRelevant is true."
        ]
      },
      "categoryStrip": {
        "source": "categoryOrder",
        "order": [
          "All",
          "Gaps",
          "Services",
          "Signals",
          "Verified",
          "Work",
          "Posts"
        ],
        "rules": [
          "CategoryStrip is text-only app chrome.",
          "Verified appears after Signals.",
          "Do not use icons in CategoryStrip.",
          "Do not use semantic card colors in CategoryStrip.",
          "Category click filters visible cards by card.type except All, which shows all currently relevant cards."
        ],
        "categoryToCardType": {
          "all": "*",
          "gaps": "gap",
          "services": "service",
          "signals": "signal",
          "verified": "verified",
          "work": "work",
          "posts": "post"
        }
      },
      "mobile": {
        "mobileViewport": "viewport.width < 900px",
        "shell": [
          "MobileTopBar",
          "CategoryStrip",
          "ActiveSurface",
          "StickyBottomNav"
        ],
        "activeSurfaces": [
          "feed",
          "map",
          "detail"
        ],
        "filtersBehavior": "Filters opens a modal/sheet over the current surface; filters is not a primary activeSurface.",
        "defaultActiveSurface": "feed",
        "stickyBottomNav": [
          "Live Feed",
          "Map",
          "Filters"
        ],
        "rules": [
          "Mobile uses a separate shell, not a scaled-down desktop split.",
          "LeftRail, desktop TopBar, and ContentSplit are hidden on mobile.",
          "Mobile shows exactly one primary ActiveSurface at a time.",
          "Feed shows FeedView and one-column CardGrid.",
          "Map shows MapView as its own primary surface, not stacked below feed.",
          "Detail opens from card or marker tap as its own surface or sheet.",
          "Filters button opens FiltersModal or FiltersSheet and preserves the current activeSurface.",
          "Sticky controls remain visible on feed and map unless intentionally hidden by a modal.",
          "Feed and map add bottom safe-area padding so sticky controls do not cover content."
        ]
      }
    },
    "contractNotes": {
      "feedDefaultModel": "current_relevance_not_date_range",
      "rule": "The public feed is not filtered by a default date preset. Records appear because they are currently relevant, active, unresolved, open, opening soon, forecasted, active work, still-displayable posts, recently verified, or stale enough to require recheck.",
      "gapRule": "A gap is shown when evidence currently supports that the gap exists, or when the gap is on watch/stale and needs recheck. It is not shown merely because it was created within a recent date window.",
      "dateRangeRule": "Date ranges may exist inside advanced Filters for history/audit views, but no datePreset controls the default live feed.",
      "feedSummaryV067": "FeedSummary now describes the feed itself. The live situation sentence belongs only to sections.currentConditions.",
      "currentRelevance": "The public feed defaults to current relevance rather than a date preset. A gap appears because evidence currently supports an active/watch/stale gap state.",
      "verifiedCategory": "Verified is a first-class card type and CategoryStrip item placed after Signals. Verified cards use ShieldCheck as title and map icon.",
      "titleIconVsDomainChips": "Service card title-leading icons come from the linked entity.kind. Domain icons appear inside domain/service-provided chips and may be used for service map markers; they do not replace the entity-kind title icon.",
      "mobileFilters": "On mobile, Filters opens a modal/sheet over the current active surface. It is not an activeSurface value."
    },
    "filterOptions": {
      "datePresets": [
        "today",
        "last_7_days",
        "last_30_days",
        "this_month",
        "custom"
      ],
      "datePresetsUsage": "advanced_filters_only_not_default_feed_state",
      "defaultFeedPredicate": "current_relevance",
      "gapStates": [
        "active",
        "watch",
        "resolved",
        "unconfirmed",
        "stale",
        "stale_needs_recheck"
      ],
      "serviceStates": [
        "open_now",
        "opening_soon",
        "closed",
        "temporarily_closed",
        "hours_changed",
        "capacity_limited",
        "unverified",
        "stale",
        "stale_needs_recheck",
        "unknown",
        "inactive"
      ],
      "signalStates": [
        "forecasted",
        "active",
        "watch",
        "elevated",
        "worsening",
        "improving",
        "holding",
        "expired"
      ],
      "workStates": [
        "planned",
        "in_progress",
        "blocked",
        "completed",
        "paused"
      ],
      "postStates": [
        "active",
        "expired",
        "archived"
      ],
      "cardTypes": [
        "gap",
        "service",
        "signal",
        "verified",
        "work",
        "post"
      ],
      "categoryOrder": [
        "all",
        "gaps",
        "services",
        "signals",
        "verified",
        "work",
        "posts"
      ]
    },
    "currentRelevanceModel": {
      "sourceOfTruth": "card.currentRelevance + type-specific currentState fields + evidenceState",
      "visibleCardPredicate": [
        "card.publicState == public",
        "card.lifecycleState not in hidden, archived, expired",
        "card.currentRelevance.isCurrentlyRelevant == true",
        "active category/filter/search predicates still apply"
      ],
      "typeRules": {
        "gap": "show when gapState is active, watch, unconfirmed, or stale_needs_recheck; hide when resolved unless explicitly viewing history",
        "service": "show when serviceState is open_now, opening_soon, capacity_limited, hours_changed, or stale_needs_recheck",
        "signal": "show when signalState is active, forecasted, elevated, worsening, watch, or holding for the current/next operating window",
        "work": "show when workState is in_progress, blocked, planned, or paused and still relevant",
        "post": "show while postState is active or display_until has not passed",
        "verified": "show when verificationState is recent_or_relevant or supports currently visible records; category verified filters card.type == verified"
      }
    }
  },
  "acceptanceConditions": [
    "FeedSummary renders from feedSummary only.",
    "FeedSummary shows exactly currentConditions, forecast, gaps, openingSoon.",
    "Current Conditions owns the live sentence.",
    "Forecast owns the pressure trend.",
    "Findings do not render above feed when FeedSummary exists.",
    "No default last-7-days filter controls the live feed.",
    "VisibleCards derive from current relevance and active filters.",
    "CategoryStrip order is All, Gaps, Services, Signals, Verified, Work, Posts.",
    "CategoryStrip is text-only and does not use icons.",
    "Cards do not show type chips.",
    "Small title-leading icons may render only according to iconContract.",
    "Service card title icons use linked entity.kind.",
    "Service card domain chips use domain icons.",
    "St. Mary's resolves to entity.kind organization and may show Building2 before the title.",
    "Verified is a first-class card type with ShieldCheck.",
    "Gap cards use small AlertTriangle before title.",
    "Cards do not show generic timestamps.",
    "Cards show semantic access/observation/work/post time only when useful.",
    "Map markers derive from visible cards with coordinates.",
    "Map markers use semantic icons and colors, not default pins.",
    "Mobile uses MobileApp shell.",
    "Mobile shows one active surface at a time.",
    "Mobile Feed and Map are separate surfaces.",
    "Mobile Filters opens a modal/sheet, not a primary active surface.",
    "StickyBottomNav contains Live Feed, Map, Filters.",
    "Mobile card grid is one column.",
    "Mobile category strip scrolls horizontally and does not wrap.",
    "Sticky controls do not cover feed cards or map controls."
  ]
}