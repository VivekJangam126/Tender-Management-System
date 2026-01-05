import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockTenderData } from "../data/mockTenderData";

/**
 * TenderListingPage
 * Read-only discovery of published, active tenders
 */
function TenderListingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorityFilter, setAuthorityFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");

  const categoryOptions = useMemo(() => {
    const set = new Set(mockTenderData.map((t) => t.category));
    return Array.from(set).sort();
  }, []);

  const authorityOptions = useMemo(() => {
    const set = new Set(mockTenderData.map((t) => t.authority.organizationName));
    return Array.from(set).sort();
  }, []);

  const filteredTenders = useMemo(() => {
    const now = new Date();
    return mockTenderData
      .filter((tender) => {
        const matchesSearch = tender.title
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());

        const matchesCategory =
          categoryFilter === "all" || tender.category === categoryFilter;

        const matchesAuthority =
          authorityFilter === "all" ||
          tender.authority.organizationName === authorityFilter;

        const deadlineDate = new Date(tender.submissionDeadline);
        const diffMs = deadlineDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let matchesDeadline = true;
        if (deadlineFilter === "7") {
          matchesDeadline = daysRemaining >= 0 && daysRemaining <= 7;
        } else if (deadlineFilter === "30") {
          matchesDeadline = daysRemaining >= 0 && daysRemaining <= 30;
        } else if (deadlineFilter === "beyond30") {
          matchesDeadline = daysRemaining > 30;
        }

        return matchesSearch && matchesCategory && matchesAuthority && matchesDeadline;
      })
      .sort((a, b) => new Date(a.submissionDeadline) - new Date(b.submissionDeadline));
  }, [searchTerm, categoryFilter, authorityFilter, deadlineFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    categoryFilter !== "all" ||
    authorityFilter !== "all" ||
    deadlineFilter !== "all";

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setAuthorityFilter("all");
    setDeadlineFilter("all");
  };

  const handleViewDetails = (tenderId) => {
    navigate(`/tenders/${tenderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <header className="mb-6">
          <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">TenderFlow</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">Active Tenders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse published opportunities. This page is read-only and keeps all bidders on equal footing.
          </p>
        </header>

        <TenderFilters
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          authorityFilter={authorityFilter}
          deadlineFilter={deadlineFilter}
          categories={categoryOptions}
          authorities={authorityOptions}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onAuthorityChange={setAuthorityFilter}
          onDeadlineChange={setDeadlineFilter}
        />

        <section className="mt-6">
          {filteredTenders.length === 0 ? (
            <EmptyState onClear={hasActiveFilters ? handleClearFilters : null} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenders.map((tender) => (
                <TenderCard
                  key={tender.tenderId}
                  tender={tender}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/**
 * TenderFilters
 * Lightweight, client-only filters for title, category, authority, deadline
 */
function TenderFilters({
  searchTerm,
  categoryFilter,
  authorityFilter,
  deadlineFilter,
  categories,
  authorities,
  onSearchChange,
  onCategoryChange,
  onAuthorityChange,
  onDeadlineChange,
}) {
  return (
    <div className="card p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Search by Title</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tenders..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Authority</label>
          <select
            value={authorityFilter}
            onChange={(e) => onAuthorityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All authorities</option>
            {authorities.map((auth) => (
              <option key={auth} value={auth}>
                {auth}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Deadline Window</label>
          <select
            value={deadlineFilter}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">Any deadline</option>
            <option value="7">Closing in 7 days</option>
            <option value="30">Closing in 30 days</option>
            <option value="beyond30">Beyond 30 days</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * TenderCard
 * Single tender presentation, read-only
 */
function TenderCard({ tender, onViewDetails }) {
  const deadlineDate = new Date(tender.submissionDeadline);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const statusLabel = daysRemaining < 7 ? "Closing Soon" : "Open";
  const statusClasses =
    daysRemaining < 7
      ? "bg-amber-100 text-amber-800"
      : "bg-emerald-100 text-emerald-700";

  const formattedDeadline = deadlineDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card h-full flex flex-col hover:shadow-lg transition-all duration-200">
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">{tender.category}</p>
            <h3
              className="text-base md:text-lg font-semibold text-gray-900 leading-tight"
              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {tender.title}
            </h3>
            <p className="text-xs text-gray-500">Tender ID: {tender.tenderId}</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-md shrink-0 ${statusClasses}`}>
            {statusLabel}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-800 shrink-0">Authority:</span>
            <span className="truncate">{tender.authority.organizationName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 shrink-0">Industry:</span>
            <span className="text-gray-600">{tender.authority.industryDomain}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-800 shrink-0">Deadline:</span>
            <span className="text-gray-600">{formattedDeadline}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 shrink-0">Days Left:</span>
            <span className="text-gray-900 font-semibold">{daysRemaining} days</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => onViewDetails(tender.tenderId)}
          className="btn-primary w-full"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

/**
 * EmptyState
 * Shown when filters return no tenders
 */
function EmptyState({ onClear }) {
  return (
    <div className="card p-10 md:p-16 text-center flex flex-col items-center gap-4">
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-.586-1.414l-4-4a2 2 0 00-2.828 0l-4 4A2 2 0 006 14v5a2 2 0 002 2z" />
      </svg>
      <div>
        <p className="text-base font-medium text-gray-900">No tenders found</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters to see more results</p>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="mt-2 btn-secondary"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default TenderListingPage;
