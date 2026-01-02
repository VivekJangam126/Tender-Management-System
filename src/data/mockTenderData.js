export const mockTenderData = [
  {
    tenderId: "TND-001",
    title: "Supply and Installation of Smart Energy Meters",
    category: "Energy",
    description:
      "The authority invites bids for the supply, installation, and commissioning of smart energy meters, including integration with existing AMI infrastructure, training of personnel, and post-deployment support.",
    submissionDeadline: "2026-02-10T17:00:00Z",
    authority: {
      organizationId: "ORG-101",
      organizationName: "State Energy Department",
      industryDomain: "Power & Utilities",
    },
    createdAt: "2026-01-01T10:00:00Z",
    evaluationOverview: [
      { criteria: "Technical", weight: 60 },
      { criteria: "Financial", weight: 30 },
      { criteria: "Risk & Compliance", weight: 10 },
    ],
    sections: [
      {
        sectionId: "SEC-01",
        title: "Eligibility Criteria",
        sectionType: "ELIGIBILITY",
        content: "Bidders must satisfy the following eligibility conditions:",
        clauses: [
          {
            clauseId: "CL-01",
            clauseText:
              "The bidder must have executed at least three similar projects in the last five years.",
            isMandatory: true,
            importance: "HIGH",
          },
          {
            clauseId: "CL-02",
            clauseText: "The bidder must have an annual turnover of at least INR 50 crores.",
            isMandatory: true,
            importance: "HIGH",
          },
        ],
      },
      {
        sectionId: "SEC-02",
        title: "Technical Scope",
        sectionType: "TECHNICAL",
        content:
          "This section outlines the technical requirements, interoperability standards, and integration expectations.",
        clauses: [
          {
            clauseId: "CL-03",
            clauseText: "Meters must comply with IS 16444 and support DLMS/COSEM protocols.",
            isMandatory: true,
            importance: "HIGH",
          },
          {
            clauseId: "CL-04",
            clauseText:
              "The solution must include head-end system integration and data concentrator units as needed.",
            isMandatory: false,
            importance: "MEDIUM",
          },
        ],
      },
      {
        sectionId: "SEC-03",
        title: "Commercial Terms",
        sectionType: "FINANCIAL",
        content:
          "Commercial terms cover pricing structure, payment milestones, taxes, and statutory compliances.",
        clauses: [
          {
            clauseId: "CL-05",
            clauseText:
              "Payment will be released in milestones tied to delivery, installation, and successful commissioning.",
            isMandatory: true,
            importance: "HIGH",
          },
          {
            clauseId: "CL-06",
            clauseText: "All prices must be quoted in INR and inclusive of applicable taxes and duties.",
            isMandatory: true,
            importance: "MEDIUM",
          },
        ],
      },
    ],
    aiInsights: {
      summary: [
        "This tender targets a large-scale smart meter deployment with integration to existing AMI systems.",
        "Eligibility emphasizes proven experience and financial strength over the last three years.",
        "Technical scope requires standards compliance and remote upgrade capability.",
      ],
      risks: [
        {
          type: "Timeline",
          description: "Project schedule is tight relative to integration and rollout scope.",
          severity: "HIGH",
        },
        {
          type: "Integration",
          description: "Interoperability with current MDMS may require additional certification cycles.",
          severity: "MEDIUM",
        },
        {
          type: "Commercial",
          description: "Retention of 10% for 12 months affects cash flow planning.",
          severity: "MEDIUM",
        },
      ],
    },
  },
  {
    tenderId: "TND-002",
    title: "Development of Unified Citizen Services Mobile Application",
    category: "Technology",
    description: "Build and maintain a unified citizen services mobile app with secure authentication and payment integration.",
    submissionDeadline: "2026-01-15T12:00:00Z",
    authority: {
      organizationId: "ORG-202",
      organizationName: "Digital Services Authority",
      industryDomain: "E-Governance",
    },
    createdAt: "2026-01-02T09:30:00Z",
    evaluationOverview: [
      { criteria: "Technical", weight: 55 },
      { criteria: "Financial", weight: 35 },
      { criteria: "Service", weight: 10 },
    ],
    sections: [
      {
        sectionId: "SEC-01",
        title: "Eligibility Criteria",
        sectionType: "ELIGIBILITY",
        content: "Minimum 3 enterprise mobile rollouts in the last 4 years.",
        clauses: [
          {
            clauseId: "CL-01",
            clauseText: "Proposer must have ISO 27001 certification.",
            isMandatory: true,
            importance: "HIGH",
          },
        ],
      },
    ],
    aiInsights: {
      summary: [
        "Focus on secure citizen services delivery and mobile UX reliability.",
        "Eligibility centers on security credentials and prior enterprise launches.",
      ],
      risks: [
        {
          type: "Security",
          description: "Strict compliance with ISO and data protection adds upfront audit overhead.",
          severity: "MEDIUM",
        },
      ],
    },
  },
  {
    tenderId: "TND-003",
    title: "Design and Construction of Coastal Flood Barriers",
    category: "Infrastructure",
    description: "Design-build coastal flood barriers with environmental safeguards and community access provisions.",
    submissionDeadline: "2026-03-05T18:30:00Z",
    authority: {
      organizationId: "ORG-303",
      organizationName: "Coastal Protection Board",
      industryDomain: "Water & Environment",
    },
    createdAt: "2026-01-03T11:15:00Z",
    evaluationOverview: [
      { criteria: "Technical", weight: 50 },
      { criteria: "Financial", weight: 40 },
      { criteria: "Sustainability", weight: 10 },
    ],
    sections: [
      {
        sectionId: "SEC-01",
        title: "Eligibility Criteria",
        sectionType: "ELIGIBILITY",
        content: "Experience with coastal infrastructure projects.",
        clauses: [
          {
            clauseId: "CL-01",
            clauseText: "At least one flood barrier project completed in the last 7 years.",
            isMandatory: true,
            importance: "HIGH",
          },
        ],
      },
    ],
    aiInsights: {
      summary: [
        "Coastal protection project with sustainability weighting.",
        "Eligibility stresses demonstrated coastal works experience.",
      ],
      risks: [
        {
          type: "Environmental",
          description: "Permitting cycles could extend timelines.",
          severity: "MEDIUM",
        },
      ],
    },
  },
  {
    tenderId: "TND-004",
    title: "Procurement of Electric Buses and Charging Stations",
    category: "Transport",
    description: "Supply and commission electric buses with depot and opportunity charging infrastructure.",
    submissionDeadline: "2026-01-25T16:00:00Z",
    authority: {
      organizationId: "ORG-404",
      organizationName: "Metropolitan Transit Agency",
      industryDomain: "Urban Mobility",
    },
    createdAt: "2026-01-04T08:45:00Z",
    evaluationOverview: [
      { criteria: "Technical", weight: 55 },
      { criteria: "Financial", weight: 35 },
      { criteria: "Sustainability", weight: 10 },
    ],
    sections: [
      {
        sectionId: "SEC-01",
        title: "Technical Requirements",
        sectionType: "TECHNICAL",
        content: "Fleet specifications, battery range, and charging standards.",
        clauses: [
          {
            clauseId: "CL-01",
            clauseText: "Buses must support CCS2 fast charging.",
            isMandatory: true,
            importance: "HIGH",
          },
        ],
      },
    ],
    aiInsights: {
      summary: [
        "Fleet electrification with infrastructure scope.",
        "Charging standard compliance is a key requirement.",
      ],
      risks: [
        {
          type: "Infrastructure",
          description: "Grid upgrade dependencies could affect deployment timelines.",
          severity: "MEDIUM",
        },
      ],
    },
  },
  {
    tenderId: "TND-005",
    title: "Cloud Infrastructure Migration and Managed Services",
    category: "Technology",
    description: "Migrate legacy workloads to cloud with managed services and cost optimization.",
    submissionDeadline: "2026-02-20T14:00:00Z",
    authority: {
      organizationId: "ORG-505",
      organizationName: "National IT Directorate",
      industryDomain: "Information Technology",
    },
    createdAt: "2026-01-05T13:00:00Z",
    evaluationOverview: [
      { criteria: "Technical", weight: 60 },
      { criteria: "Financial", weight: 30 },
      { criteria: "Service", weight: 10 },
    ],
    sections: [
      {
        sectionId: "SEC-01",
        title: "Scope",
        sectionType: "OTHER",
        content: "Migration phases, landing zone, and managed services expectations.",
        clauses: [
          {
            clauseId: "CL-01",
            clauseText: "Must include 24x7 managed services for critical workloads.",
            isMandatory: true,
            importance: "HIGH",
          },
        ],
      },
    ],
    aiInsights: {
      summary: [
        "Focus on secure migration and ongoing managed services.",
        "Service reliability is a weighted criterion.",
      ],
      risks: [
        {
          type: "Migration",
          description: "Cutover windows may be tight for legacy workloads.",
          severity: "MEDIUM",
        },
      ],
    },
  },
  {
    tenderId: "TND-006",
    title: "Operation and Maintenance of Municipal Waste Processing Plant",
    category: "Environment",
    description: "Operate and maintain waste processing facility with compliance to pollution norms.",
    submissionDeadline: "2026-01-12T10:30:00Z",
    authority: {
      organizationId: "ORG-606",
      organizationName: "City Sanitation Council",
      industryDomain: "Waste Management",
    },
    createdAt: "2026-01-06T10:20:00Z",
    evaluationOverview: [
      { criteria: "Technical", weight: 50 },
      { criteria: "Financial", weight: 35 },
      { criteria: "Compliance", weight: 15 },
    ],
    sections: [
      {
        sectionId: "SEC-01",
        title: "Operations",
        sectionType: "OTHER",
        content: "Plant uptime, emissions control, and reporting obligations.",
        clauses: [
          {
            clauseId: "CL-01",
            clauseText: "Must maintain uptime SLAs per pollution control board guidelines.",
            isMandatory: true,
            importance: "HIGH",
          },
        ],
      },
    ],
    aiInsights: {
      summary: [
        "Operations-focused tender with compliance weighting.",
        "Uptime and emissions control are central obligations.",
      ],
      risks: [
        {
          type: "Compliance",
          description: "Non-compliance penalties may be material.",
          severity: "HIGH",
        },
      ],
    },
  },
];
