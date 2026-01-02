import { useState } from 'react';

/**
 * STEP 3: Section-wise AI Assistance
 * 
 * AI GOVERNANCE RULES (NON-NEGOTIABLE):
 * - AI is advisory only, never decisive
 * - AI suggestions are explicitly user-triggered
 * - AI NEVER auto-modifies section content
 * - All AI interactions are logged for audit
 * - Suggestions can be: PENDING | ACCEPTED | REJECTED
 * - Accepted suggestions DO NOT auto-apply to content
 * 
 * This component operates on existing TENDER_SECTION entities from STEP 2.
 * It does NOT control navigation or block progression.
 */
export default function AIAssistPanel({ sections, aiSuggestions, setAISuggestions }) {
  
  // ============================================
  // LOCAL UI STATE (NOT WORKFLOW STATE)
  // ============================================
  
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ============================================
  // AI SUGGESTION OPERATIONS
  // ============================================
  
  /**
   * Generates mock AI suggestions for a section
   * In production: Would call AI service API
   * Now: Returns mock suggestions with random delay
   * 
   * AUDIT LOG: AI invocation event
   */
  const handleGenerateSuggestions = async (sectionId) => {
    const section = sections.find((s) => s.sectionId === sectionId);
    
    if (!section) return;
    
    // Audit log
    console.log('[AI AUDIT] Suggestion generation requested', {
      timestamp: new Date().toISOString(),
      sectionId: section.sectionId,
      sectionTitle: section.title,
      sectionType: section.sectionType,
      authorityAction: 'GENERATE_SUGGESTIONS',
    });
    
    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate mock suggestions based on section type
    const mockSuggestions = generateMockSuggestions(section);
    
    // Add to state
    setAISuggestions((prev) => {
      // Remove old suggestions for this section
      const filtered = prev.filter((s) => s.sectionId !== sectionId);
      return [...filtered, ...mockSuggestions];
    });
    
    setIsGenerating(false);
    
    console.log('[AI AUDIT] Suggestions generated', {
      timestamp: new Date().toISOString(),
      sectionId: section.sectionId,
      suggestionCount: mockSuggestions.length,
    });
  };
  
  /**
   * Handles accepting an AI suggestion
   * IMPORTANT: Does NOT auto-apply to section content
   * Authority must manually review and apply if desired
   * 
   * AUDIT LOG: Suggestion acceptance event
   */
  const handleAcceptSuggestion = (suggestionId) => {
    const suggestion = aiSuggestions.find((s) => s.suggestionId === suggestionId);
    
    // Audit log
    console.log('[AI AUDIT] Suggestion accepted', {
      timestamp: new Date().toISOString(),
      suggestionId,
      sectionId: suggestion?.sectionId,
      authorityAction: 'ACCEPT_SUGGESTION',
      note: 'Authority must manually apply changes to section content',
    });
    
    setAISuggestions((prev) =>
      prev.map((s) =>
        s.suggestionId === suggestionId
          ? { ...s, status: 'ACCEPTED' }
          : s
      )
    );
  };
  
  /**
   * Handles rejecting an AI suggestion
   * 
   * AUDIT LOG: Suggestion rejection event
   */
  const handleRejectSuggestion = (suggestionId) => {
    const suggestion = aiSuggestions.find((s) => s.suggestionId === suggestionId);
    
    // Audit log
    console.log('[AI AUDIT] Suggestion rejected', {
      timestamp: new Date().toISOString(),
      suggestionId,
      sectionId: suggestion?.sectionId,
      authorityAction: 'REJECT_SUGGESTION',
    });
    
    setAISuggestions((prev) =>
      prev.map((s) =>
        s.suggestionId === suggestionId
          ? { ...s, status: 'REJECTED' }
          : s
      )
    );
  };
  
  /**
   * Clears all suggestions for the selected section
   */
  const handleClearSuggestions = () => {
    if (!selectedSectionId) return;
    
    console.log('[AI AUDIT] Suggestions cleared', {
      timestamp: new Date().toISOString(),
      sectionId: selectedSectionId,
      authorityAction: 'CLEAR_SUGGESTIONS',
    });
    
    setAISuggestions((prev) =>
      prev.filter((s) => s.sectionId !== selectedSectionId)
    );
  };
  
  // ============================================
  // DERIVED DATA
  // ============================================
  
  const selectedSection = sections.find((s) => s.sectionId === selectedSectionId);
  const sectionsWithSuggestions = aiSuggestions.filter(
    (s) => s.sectionId === selectedSectionId
  );
  
  // ============================================
  // RENDER
  // ============================================
  
  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Sections Available
          </h3>
          <p className="text-sm text-gray-500">
            Complete Step 2 to create tender sections before using AI assistance.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200">
      <div className="border-b border-slate-200 px-8 py-5 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              AI Assistance <span className="text-base font-normal text-slate-600">(Optional)</span>
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Get AI-powered suggestions to improve your tender sections
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold text-blue-700">ADVISORY ONLY</span>
          </div>
        </div>
      </div>
      
      {/* Two-Panel Layout */}
      <div className="flex h-150">
        
        {/* Left Panel: Section Selection */}
        <SectionSelectionPanel
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          aiSuggestions={aiSuggestions}
        />
        
        {/* Right Panel: AI Suggestions */}
        <AISuggestionPanel
          section={selectedSection}
          suggestions={sectionsWithSuggestions}
          isGenerating={isGenerating}
          onGenerateSuggestions={handleGenerateSuggestions}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          onClearSuggestions={handleClearSuggestions}
        />
        
      </div>
    </div>
  );
}

/**
 * SectionSelectionPanel Component
 * Lists all sections for AI assistance selection
 */
function SectionSelectionPanel({ sections, selectedSectionId, onSelectSection, aiSuggestions }) {
  return (
    <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
      
      <div className="p-4 border-b border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-900">
          Select Section for AI Review
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {sections.map((section) => {
          const sectionSuggestions = aiSuggestions.filter((s) => s.sectionId === section.sectionId);
          const hassuggestions = sectionSuggestions.length > 0;
          const acceptedCount = sectionSuggestions.filter((s) => s.status === 'ACCEPTED').length;
          
          return (
            <button
              key={section.sectionId}
              onClick={() => onSelectSection(section.sectionId)}
              className={`
                w-full mb-2 p-3 rounded-lg border-2 text-left transition-all
                ${selectedSectionId === section.sectionId
                  ? 'border-blue-500 bg-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {section.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {section.sectionType}
                  </p>
                </div>
                {hassuggestions && (
                  <div className="ml-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      {acceptedCount > 0 ? `${acceptedCount} ✓` : `${sectionSuggestions.length} AI`}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * AISuggestionPanel Component
 * Displays AI suggestions and controls for selected section
 */
function AISuggestionPanel({
  section,
  suggestions,
  isGenerating,
  onGenerateSuggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
  onClearSuggestions,
}) {
  
  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm font-medium">Select a section to get AI suggestions</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col">
      
      {/* Section Header */}
      <div className="p-5 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {section.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {section.sectionType} • {section.isMandatory ? '🔴 Mandatory' : '⚪ Optional'}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGenerateSuggestions(section.sectionId)}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              '✨ Get AI Suggestions'
            )}
          </button>
          
          {suggestions.length > 0 && (
            <button
              onClick={onClearSuggestions}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              No AI suggestions yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Get AI Suggestions" to generate recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <AISuggestionCard
                key={suggestion.suggestionId}
                suggestion={suggestion}
                onAccept={() => onAcceptSuggestion(suggestion.suggestionId)}
                onReject={() => onRejectSuggestion(suggestion.suggestionId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AISuggestionCard Component
 * Individual AI suggestion with accept/reject controls
 */
function AISuggestionCard({ suggestion, onAccept, onReject }) {
  
  const isPending = suggestion.status === 'PENDING';
  const isAccepted = suggestion.status === 'ACCEPTED';
  const isRejected = suggestion.status === 'REJECTED';
  
  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all
        ${isPending ? 'border-blue-200 bg-blue-50' : ''}
        ${isAccepted ? 'border-green-200 bg-green-50' : ''}
        ${isRejected ? 'border-gray-200 bg-gray-50 opacity-60' : ''}
      `}
    >
      {/* AI Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Suggestion
        </div>
        
        {/* Status Badge */}
        {isAccepted && (
          <span className="px-2 py-1 bg-green-100 border border-green-200 rounded text-xs font-medium text-green-800">
            ✓ Accepted
          </span>
        )}
        {isRejected && (
          <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">
            ✗ Rejected
          </span>
        )}
      </div>
      
      {/* Suggestion Text */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {suggestion.text}
        </p>
      </div>
      
      {/* Governance Notice */}
      {isAccepted && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This suggestion has been marked as accepted. 
            You must manually apply changes to your section content if desired.
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      {isPending && (
        <div className="flex items-center gap-2">
          <button
            onClick={onAccept}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="flex-1 px-3 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Mock AI Suggestion Generator
 * Generates contextual suggestions based on section type and content
 * In production: Would call actual AI service
 */
function generateMockSuggestions(section) {
  const baseId = Date.now();
  
  // Generate suggestions based on section type
  const suggestionTemplates = {
    TECHNICAL: [
      'Consider adding specific technical specifications such as required certifications, compliance standards, or performance benchmarks.',
      'Include detailed compatibility requirements if the solution needs to integrate with existing systems.',
      'Specify measurable acceptance criteria for technical deliverables to avoid ambiguity during evaluation.',
    ],
    FINANCIAL: [
      'Clearly define the payment terms, milestone-based payments, and any advance payment conditions.',
      'Include provisions for price escalation or de-escalation based on market conditions if applicable.',
      'Specify the currency of payment and any foreign exchange risk management approach.',
    ],
    ELIGIBILITY: [
      'Add minimum years of experience required in similar projects to ensure qualified bidders.',
      'Include financial turnover requirements to verify the bidder\'s financial stability.',
      'Specify any mandatory certifications or licenses required to participate in this tender.',
    ],
    OTHER: [
      'Ensure all requirements are clear, measurable, and non-discriminatory.',
      'Consider adding timelines for each major deliverable to set clear expectations.',
      'Review for any potential ambiguities that might lead to disputes during contract execution.',
    ],
  };
  
  const templates = suggestionTemplates[section.sectionType] || suggestionTemplates.OTHER;
  
  // Generate 2-3 random suggestions
  const count = Math.min(templates.length, 2 + Math.floor(Math.random() * 2));
  const selectedTemplates = templates.slice(0, count);
  
  return selectedTemplates.map((text, index) => ({
    suggestionId: `suggestion-${baseId}-${index}`,
    sectionId: section.sectionId,
    text,
    status: 'PENDING',
    generatedAt: new Date().toISOString(),
  }));
}
