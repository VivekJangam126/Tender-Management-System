import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockTenderData } from "../data/mockTenderData";

function TenderDetailPage() {
  const { tenderId } = useParams();
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

  const deadline = new Date(tender.submissionDeadline);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const isClosingSoon = daysRemaining < 7;

  const handleBack = () => navigate("/tenders");

  const handleAnalyze = () => {
    navigate(`/tenders/${tender.tenderId}/analysis`, { state: { fromDetail: true } });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-6">
          <button
            onClick={handleBack}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            ← Back to Tender Listing
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <TenderHeader
            title={tender.title}
            authorityName={tender.authority.organizationName}
            category={tender.category}
            deadline={deadline}
            daysRemaining={daysRemaining}
            isClosingSoon={isClosingSoon}
          />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Tender Description</h2>
            <p className="text-sm leading-relaxed text-slate-700 font-serif">
              {tender.description}
            </p>
          </section>

          <EvaluationOverview evaluation={tender.evaluationOverview} />

          <div className="space-y-6">
            {tender.sections.map((section) => (
              <TenderSection key={section.sectionId} section={section} />
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Document is read-only. No edits or proposals can be initiated here.
            </span>
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              👉 Analyze Tender
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenderHeader({ title, authorityName, category, deadline, daysRemaining, isClosingSoon }) {
  const formattedDeadline = deadline.toLocaleString(undefined, {
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
          <p className="text-xs font-semibold text-slate-600">Category: {category}</p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-700">Authority: {authorityName}</p>
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

function EvaluationOverview({ evaluation }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Evaluation Overview</h2>
      <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
        {evaluation.map((item) => (
          <div
            key={item.criteria}
            className="flex items-center justify-between px-4 py-3 text-sm text-slate-800"
          >
            <span className="font-semibold">{item.criteria}</span>
            <span className="text-slate-600">{item.weight}%</span>
          </div>
        ))}
      </div>
    </section>
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
      <p className="text-sm text-slate-700 leading-relaxed font-serif">{section.content}</p>
      <div className="space-y-2 mt-2">
        {section.clauses.map((clause, index) => (
          <TenderClause key={clause.clauseId} clause={clause} index={index} />
        ))}
      </div>
    </section>
  );
}

function TenderClause({ clause, index }) {
  return (
    <div className="flex gap-3 text-sm text-slate-800">
      <span className="text-slate-500 min-w-[2ch]">{index + 1}.</span>
      <div className="space-y-1">
        <p className="leading-relaxed font-serif">{clause.clauseText}</p>
        <p className="text-xs text-slate-500">Mandatory: {clause.isMandatory ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}

export default TenderDetailPage;
