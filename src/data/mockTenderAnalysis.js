export const mockTenderAnalysis = {
  tender: {
    tenderId: "TND-001",
    title: "Supply and Installation of Smart Energy Meters",
    authorityName: "State Energy Department",
    submissionDeadline: "2026-02-10T17:00:00Z",
    description:
      "The authority invites bids for the supply, installation, commissioning, and lifecycle support of smart energy meters, including integration with existing AMI infrastructure and training for utility personnel.",
  },
  sections: [
    {
      sectionId: "SEC-01",
      title: "Eligibility Criteria",
      sectionType: "ELIGIBILITY",
      clauses: [
        {
          clauseId: "CL-01",
          clauseText: "Bidder must have executed at least three similar projects in the last five years.",
          isMandatory: true,
          importance: "HIGH",
        },
        {
          clauseId: "CL-02",
          clauseText: "Bidder must have an annual turnover of at least INR 50 crores for each of the last three financial years.",
          isMandatory: true,
          importance: "HIGH",
        },
      ],
    },
    {
      sectionId: "SEC-02",
      title: "Technical Requirements",
      sectionType: "TECHNICAL",
      clauses: [
        {
          clauseId: "CL-03",
          clauseText: "Meters must comply with IS 16444 and support DLMS/COSEM protocols with remote firmware upgrade capability.",
          isMandatory: true,
          importance: "HIGH",
        },
        {
          clauseId: "CL-04",
          clauseText: "Head-end system integration with existing MDMS must be demonstrated in a sandbox before rollout.",
          isMandatory: false,
          importance: "MEDIUM",
        },
      ],
    },
    {
      sectionId: "SEC-03",
      title: "Commercial Terms",
      sectionType: "FINANCIAL",
      clauses: [
        {
          clauseId: "CL-05",
          clauseText: "Payment milestones tied to delivery, installation, and successful commissioning with a 10% retention for 12 months.",
          isMandatory: true,
          importance: "HIGH",
        },
        {
          clauseId: "CL-06",
          clauseText: "All prices must be quoted in INR, inclusive of applicable taxes and duties.",
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
};
