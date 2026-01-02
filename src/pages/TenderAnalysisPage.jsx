import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { mockTenderData } from "../data/mockTenderData";

function TenderAnalysisPage() {
  const { tenderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const tender = useMemo(
    () => mockTenderData.find((t) => t.tenderId === tenderId),
    [tenderId]
  );

  if (!tender) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center space-y-3 max-w-md">
          <h1 className="text-xl font-bold text-slate-900">Tender not found</h1>
          <p className="text-sm text-slate-600">The requested tender does not exist. Return to listing.</p>
          <button
            onClick={() => navigate("/tenders")}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Back to Listing
          </button>
        </div>
      </div>
    );
  }

  const sections = tender.sections || [];
  const aiInsights = tender.aiInsights || { summary: [], risks: [] };
  const deadline = new Date(tender.submissionDeadline);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const isClosingSoon = daysRemaining < 7;

  const [complianceState, setComplianceState] = useState({});
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const documentRef = useRef(null);
  const cameFromDetail = location.state?.fromDetail === true;

  const importantClauses = useMemo(() => {
    return sections.flatMap((section) =>
      section.clauses
        .filter((clause) => clause.isMandatory || clause.importance === "HIGH")
        .map((clause) => ({
          sectionTitle: section.title,
          clause,
        }))
    );
  }, [sections]);

  useEffect(() => {
    const el = documentRef.current;
    if (!el) return;

    const onScroll = () => {
      const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16;
      if (reachedBottom) setHasScrolledToEnd(true);
    };

    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleBack = () => navigate(`/tenders/${tenderId}`);

  const handleProceed = () => {
    if (!hasScrolledToEnd) return;
    navigate(`/tenders/${tender.tenderId}/proposal/start`);
  };

  const handleComplianceChange = (clauseId, value) => {
    setComplianceState((prev) => ({ ...prev, [clauseId]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/tenders")}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            ← Back to Tender Listing
          </button>
          <button
            onClick={handleBack}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Back to Details
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-start">
          {/* Left: Document */}
          <div
            ref={documentRef}
            className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6 h-[calc(100vh-200px)] overflow-y-auto"
          >
            {!cameFromDetail && (
              <div className="border border-amber-200 bg-amber-50 text-amber-900 text-sm rounded-lg p-3">
                Analysis is an optional, bidder-initiated step. Continue only if you intended to analyze this tender.
              </div>
            )}

            <AnalysisHeader
              tender={tender}
              daysRemaining={daysRemaining}
              isClosingSoon={isClosingSoon}
            />

            <TenderDocument tender={tender} sections={sections} />

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Private analysis only. No data is shared or submitted.
              </span>
              <button
                onClick={handleProceed}
                disabled={!hasScrolledToEnd}
                className={`inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  hasScrolledToEnd
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                👉 Proceed to Proposal Drafting
              </button>
            </div>
          </div>

          {/* Right: AI assistance panels */}
          <div className="space-y-4 sticky top-4">
            <AISummaryPanel
              summary={aiInsights.summary}
              deadline={deadline}
              daysRemaining={daysRemaining}
              isClosingSoon={isClosingSoon}
            />
            <RiskPanel risks={aiInsights.risks} />
            <ComplianceChecklistPanel
              clauses={importantClauses}
              complianceState={complianceState}
              onChange={handleComplianceChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisHeader({ tender, daysRemaining, isClosingSoon }) {
  const formattedDeadline = new Date(tender.submissionDeadline).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusLabel = isClosingSoon ? "Closing Soon" : "Open";
  const statusClasses = isClosingSoon
    ? "bg-amber-100 text-amber-800"
    : "bg-emerald-100 text-emerald-700";

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold text-slate-600">Tender Analysis (Private to You)</p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight text-slate-900">
            {tender.title}
          </h1>
          <p className="text-sm text-slate-700">Authority: {tender.authority.organizationName}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <span className="font-semibold text-slate-800">Submission Deadline:</span>
        <span>{formattedDeadline}</span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-800 font-semibold">{daysRemaining} days remaining</span>
      </div>
    </div>
  );
}

function TenderDocument({ tender, sections }) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Tender Description</h2>
        <p className="text-sm leading-relaxed text-slate-700 font-serif">
          {tender.description}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Tender Sections</h2>
        <div className="space-y-6">
          {sections.map((section) => (
            <TenderSection key={section.sectionId} section={section} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TenderSection({ section }) {
  return (
    <section className="space-y-2 border-t border-slate-200 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
          <p className="text-xs font-semibold text-slate-500">{section.sectionType}</p>
        </div>
      </div>
      <ClauseList clauses={section.clauses} />
    </section>
  );
}

function ClauseList({ clauses }) {
  return (
    <div className="space-y-3">
      {clauses.map((clause, index) => (
        <TenderClause key={clause.clauseId} clause={clause} index={index} />
      ))}
    </div>
  );
}

function TenderClause({ clause, index }) {
  return (
    <div className="flex gap-3 text-sm text-slate-800">
      <span className="text-slate-500 min-w-[2ch]">{index + 1}.</span>
      <div className="space-y-1">
        <p className="leading-relaxed font-serif select-text">{clause.clauseText}</p>
        <p className="text-xs text-slate-500">Mandatory: {clause.isMandatory ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}

function AISummaryPanel({ summary, deadline, daysRemaining, isClosingSoon }) {
  const formattedDeadline = deadline.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">AI Summary (Mock, Private)</h3>
        <span className="text-[11px] font-semibold text-slate-500">Read-only</span>
      </div>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
        {summary.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
      <div className="text-xs text-slate-600 border-t border-slate-200 pt-3 space-y-1">
        <div className="font-semibold text-slate-700">Deadline Reminder</div>
        <div>{formattedDeadline}</div>
        <div className={isClosingSoon ? "text-amber-700 font-semibold" : "text-slate-700"}>
          {isClosingSoon ? "Closing Soon" : "Open"} — {daysRemaining} days remaining
        </div>
      </div>
    </div>
  );
}

function RiskPanel({ risks }) {
  const severityClasses = {
    HIGH: "bg-amber-100 text-amber-800",
    MEDIUM: "bg-blue-100 text-blue-800",
    LOW: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Risk Identification</h3>
        <span className="text-[11px] font-semibold text-slate-500">Neutral, no recommendations</span>
      </div>
      <div className="space-y-3">
        {risks.map((risk, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{risk.type}</p>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${severityClasses[risk.severity] || "bg-slate-100 text-slate-700"}`}>
                {risk.severity}
              </span>
            </div>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">{risk.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceChecklistPanel({ clauses, complianceState, onChange }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Private Compliance Checklist</h3>
        <span className="text-[11px] font-semibold text-slate-500">Private – not shared</span>
      </div>
      <p className="text-xs text-slate-600">
        Mark internal stance for key clauses. Stored locally only, not submitted.
      </p>
      <div className="space-y-3">
        {clauses.map(({ clause, sectionTitle }) => (
          <div key={clause.clauseId} className="border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="text-[13px] font-semibold text-slate-800">
              {sectionTitle}: {clause.clauseText}
            </div>
            <div className="text-xs text-slate-500">Mandatory: {clause.isMandatory ? "Yes" : "No"}</div>
            <div className="flex gap-2 flex-wrap text-xs font-semibold">
              <CompliancePill
                label="Can comply"
                value="CAN"
                active={complianceState[clause.clauseId] === "CAN"}
                onClick={() => onChange(clause.clauseId, "CAN")}
              />
              <CompliancePill
                label="Needs clarification"
                value="CLARIFY"
                active={complianceState[clause.clauseId] === "CLARIFY"}
                onClick={() => onChange(clause.clauseId, "CLARIFY")}
              />
              <CompliancePill
                label="Cannot comply"
                value="CANNOT"
                active={complianceState[clause.clauseId] === "CANNOT"}
                onClick={() => onChange(clause.clauseId, "CANNOT")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompliancePill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-[11px] transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

export default TenderAnalysisPage;
