export const mockTenderDetail = {
  tenderId: "TND-001",
  title: "Supply and Installation of Smart Energy Meters",
  category: "Energy",
  description:
    "The authority invites bids for the supply, installation, and commissioning of smart energy meters, including integration with existing AMI infrastructure, training of personnel, and post-deployment support.",
  submissionDeadline: "2026-02-10T17:00:00Z",
  authority: {
    organizationName: "State Energy Department",
  },
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
        },
        {
          clauseId: "CL-02",
          clauseText: "The bidder must have an annual turnover of at least INR 50 crores.",
          isMandatory: true,
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
        },
        {
          clauseId: "CL-04",
          clauseText:
            "The solution must include head-end system integration and data concentrator units as needed.",
          isMandatory: false,
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
        },
        {
          clauseId: "CL-06",
          clauseText: "All prices must be quoted in INR and inclusive of applicable taxes and duties.",
          isMandatory: true,
        },
      ],
    },
  ],
};
