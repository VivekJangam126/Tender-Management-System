import { useState } from 'react';

/**
 * STEP 4: Preview & Publish (Final Tender Release)
 * 
 * CRITICAL GOVERNANCE RULES (NON-NEGOTIABLE):
 * - Publishing is IRREVERSIBLE (status changes from DRAFT to PUBLISHED)
 * - This step is READ-ONLY (no edits, no deletions, no reordering)
 * - Preview shows exactly what bidders will see
 * - Publish requires explicit modal confirmation
 * - No undo, rollback, or unpublish options
 * - All previous steps become locked post-publish
 * - Audit log entry created on publish
 * 
 * This component finalizes the tender as a legal document.
 * It does NOT modify previous steps or allow regression.
 */
export default function PublishStep({ tender, sections, onPublish }) {
  
  // ============================================
  // LOCAL UI STATE
  // ============================================
  
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  const isPublished = tender.status === 'PUBLISHED';
  
  // ============================================
  // PUBLISH HANDLER
  // ============================================
  
  /**
   * Handles final publish confirmation
   * Updates tender to PUBLISHED state
   * Audit logs the action
   * 
   * CRITICAL: This is a one-way action
   */
  const handleConfirmPublish = () => {
    // Audit log
    console.log('[PUBLISH AUDIT] Tender published', {
      timestamp: new Date().toISOString(),
      tenderId: tender.tenderId || 'NEW_TENDER',
      tenderTitle: tender.title,
      sectionCount: sections.length,
      actionType: 'PUBLISH_TENDER',
      authorityOrganization: tender.authorityOrganizationName,
      irreversible: true,
    });
    
    // Call parent callback to update state
    onPublish({
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    });
    
    setIsPublishModalOpen(false);
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-6">
      
      {/* Post-Publish Status Banner */}
      {isPublished && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 shadow-md">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="1">
              <h3 className="text-lg font-bold text-green-900 mb-1">
                ✅ Tender Successfully Published
              </h3>
              <p className="text-green-800 text-sm mb-3 font-medium">
                This tender is now open for bidding. All changes are locked and audited.
              </p>
              <div className="text-xs text-green-700 space-y-1 font-medium">
                <p>
                  <span className="font-bold">Published at:</span> {new Date(tender.publishedAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-bold">Status:</span> PUBLISHED (Immutable)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Preview Container */}
      <TenderPreview
        tender={tender}
        sections={sections}
        isPublished={isPublished}
      />
      
      {/* Publish Action (Only for DRAFT status) */}
      {!isPublished && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ready to Publish?
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Final Reminder</p>
                  <p>
                    Publishing this tender will lock all content and make it visible to bidders. 
                    You will not be able to edit, delete, or unpublish. This action is permanent and audited.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Tender Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <span className="font-medium">Title:</span> {tender.title}</li>
                  <li>• <span className="font-medium">Sections:</span> {sections.length}</li>
                  <li>• <span className="font-medium">Deadline:</span> {new Date(tender.submissionDeadline).toLocaleDateString()}</li>
                  <li>• <span className="font-medium">Category:</span> {tender.category}</li>
                </ul>
              </div>
              
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Publish Tender
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Publish Confirmation Modal */}
      {isPublishModalOpen && (
        <PublishConfirmationModal
          tender={tender}
          onConfirm={handleConfirmPublish}
          onCancel={() => setIsPublishModalOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * TenderPreview Component
 * Read-only display of tender as bidders will see it
 */
function TenderPreview({ tender, sections, isPublished }) {
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      
      {/* Document Header */}
      <div className="bg-linear-to-r from-slate-50 to-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="1">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {tender.title}
              </h1>
              {tender.referenceId && (
                <p className="text-sm text-slate-600 font-medium">
                  Reference ID: <span className="font-mono font-bold text-slate-900">{tender.referenceId}</span>
                </p>
              )}
            </div>
            
            {isPublished && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-green-100 border-2 border-green-300 rounded-full ml-4">
                <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold text-green-900">PUBLISHED</span>
              </div>
            )}
          </div>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Category</p>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {tender.category || 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Submission Deadline</p>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {new Date(tender.submissionDeadline).toLocaleString()}
              </p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Authority</p>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {tender.authorityOrganizationName || 'Government Authority'}
              </p>
            </div>
            
            {isPublished && (
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Published</p>
                <p className="text-sm font-semibold text-slate-900 mt-2">
                  {new Date(tender.publishedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tender Description */}
      <div className="px-8 py-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">
            Overview
          </h2>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-medium">
            {tender.description}
          </div>
        </div>
      </div>
      
      {/* Sections Preview */}
      {sections.length > 0 ? (
        <div className="px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-6">
              Tender Sections ({sections.length})
            </h2>
            
            <div className="space-y-8">
              {sections.map((section, index) => (
                <SectionPreview
                  key={section.sectionId}
                  section={section}
                  sectionNumber={index + 1}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-8 py-8">
          <div className="max-w-4xl mx-auto text-center text-slate-500 font-medium">
            <p>No sections defined</p>
          </div>
        </div>
      )}
      
      {/* Footer Note */}
      <div className="bg-slate-50 border-t border-slate-200 px-8 py-6">
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-600 font-medium">
          {isPublished ? (
            <p>
              This tender was published on {new Date(tender.publishedAt).toLocaleDateString()}. 
              All content is locked and immutable.
            </p>
          ) : (
            <p>
              This is a preview of how bidders will see your tender. 
              Review carefully before publishing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SectionPreview Component
 * Individual section in read-only preview format
 */
function SectionPreview({ section, sectionNumber }) {
  
  const sectionTypeLabels = {
    TECHNICAL: 'Technical Requirements',
    FINANCIAL: 'Financial Terms',
    ELIGIBILITY: 'Eligibility Criteria',
    OTHER: 'Additional Information',
  };
  
  return (
    <div className="border-l-4 border-blue-500 pl-6 pb-6">
      <div className="flex items-start justify-between mb-3">
        <div className="1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
              {sectionNumber}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {section.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 ml-11">
            <span className="text-xs font-bold px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-full">
              {sectionTypeLabels[section.sectionType] || section.sectionType}
            </span>
            {section.isMandatory && (
              <span className="text-xs font-bold px-2.5 py-1.5 bg-red-50 text-red-700 rounded-full">
                Required
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="ml-11 text-slate-700 prose prose-sm max-w-none whitespace-pre-wrap font-medium">
        {section.content}
      </div>
    </div>
  );
}

/**
 * PublishConfirmationModal Component
 * Critical confirmation dialog for tender publication
 */
function PublishConfirmationModal({ tender, onConfirm, onCancel }) {
  
  const [hasReadWarning, setHasReadWarning] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-red-700 to-red-600 border-b-4 border-red-800 px-8 py-8">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.47a9 9 0 1 1 9.84 0" />
            </svg>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🚨 CONFIRM TENDER PUBLICATION
              </h2>
              <p className="text-sm text-red-100 font-bold">
                This action is IRREVERSIBLE and PERMANENT
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-8 py-8 space-y-6">
          
          {/* Critical Warning Box */}
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-red-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-red-900 mb-3 text-base">
                  ❌ Publishing will PERMANENTLY lock this tender.
                </p>
                <ul className="text-sm text-red-900 space-y-2 list-disc list-inside font-semibold">
                  <li>This action <span className="font-bold text-red-700 bg-red-100 px-1 rounded">CANNOT be undone</span></li>
                  <li>The tender will be <span className="font-bold text-red-700 bg-red-100 px-1 rounded">publicly visible</span> to all bidders</li>
                  <li>All content becomes <span className="font-bold text-red-700 bg-red-100 px-1 rounded">immutable</span></li>
                  <li>Changes require publishing a <span className="font-bold text-red-700 bg-red-100 px-1 rounded">new tender version</span></li>
                  <li>This action will be <span className="font-bold text-red-700 bg-red-100 px-1 rounded">fully audited</span></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Tender Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="font-bold text-slate-900 mb-4">
              📋 Tender Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Title:</span>
                <span className="font-bold text-slate-900">{tender.title}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Category:</span>
                <span className="font-bold text-slate-900">{tender.category}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Submission Deadline:</span>
                <span className="font-bold text-slate-900">
                  {new Date(tender.submissionDeadline).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Authority:</span>
                <span className="font-bold text-slate-900">
                  {tender.authorityOrganizationName}
                </span>
              </div>
            </div>
          </div>
          
          {/* Acknowledgment Checkbox */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReadWarning}
                onChange={(e) => setHasReadWarning(e.target.checked)}
                className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 mt-1"
              />
              <span className="text-sm text-amber-900 font-semibold">
                I understand that publishing this tender is <span className="font-bold">permanent and irreversible</span>. 
                I have reviewed all content and confirm it is accurate and complete.
              </span>
            </label>
          </div>
        </div>
        
          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-8 py-6 flex justify-end gap-4">
          <button
            onClick={onCancel}
              className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={!hasReadWarning}
              className={`
                px-6 py-2.5 text-sm font-bold rounded-lg transition-colors
              ${hasReadWarning
                  ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }
            `}
          >
              🚀 CONFIRM PUBLISH
          </button>
        </div>
      </div>
    </div>
  );
}
