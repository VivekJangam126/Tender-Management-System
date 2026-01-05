import { useState, useEffect } from 'react';

/**
 * STEP 3: Final Review & Validation (Pre-Publish Gate)
 * 
 * GOVERNANCE RULES (NON-NEGOTIABLE):
 * - STEP 3 is READ-ONLY (no content editing)
 * - Issues are classified: BLOCKING | WARNING | PASS
 * - Blocking issues CANNOT be overridden (block progression)
 * - Warnings CAN be overridden with explicit justification
 * - All override actions are logged for audit
 * - No auto-fixing, no AI overrides
 * 
 * This component analyzes tender data integrity before STEP 4 publication.
 * It does NOT modify data or control navigation directly.
 */
export default function FinalReviewPanel({ tender, sections, setValidation }) {
  
  // ============================================
  // LOCAL UI STATE
  // ============================================
  
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedWarningIndex, setSelectedWarningIndex] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overriddenWarnings, setOverriddenWarnings] = useState([]);
  
  // ============================================
  // VALIDATION LOGIC
  // ============================================
  
  /**
   * Performs comprehensive review checks on tender data
   * Classifies all findings into three categories
   * Runs on every data change
   */
  useEffect(() => {
    const blockingIssues = [];
    const warnings = [];
    const passedChecks = [];
    
    // ============================================
    // BLOCKING CHECKS (Must be fixed before publication)
    // ============================================
    
    // Block 1: Tender title is required
    if (!tender.title || tender.title.trim() === '') {
      blockingIssues.push('Tender title is missing');
    }
    
    // Block 2: Description is required
    if (!tender.description || tender.description.trim() === '') {
      blockingIssues.push('Tender description is missing');
    }
    
    // Block 3: Category selection is required
    if (!tender.category) {
      blockingIssues.push('Tender category is not selected');
    }
    
    // Block 4: Submission deadline is required and must be future
    if (!tender.submissionDeadline) {
      blockingIssues.push('Submission deadline is not set');
    } else {
      const selectedDate = new Date(tender.submissionDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        blockingIssues.push('Submission deadline has already passed');
      }
    }
    
    // Block 5: At least one section must exist
    if (sections.length === 0) {
      blockingIssues.push('No tender sections defined');
    } else {
      // Block 6: All mandatory sections must have content
      const emptyMandatorySections = sections.filter(
        (s) => s.isMandatory && (!s.content || s.content.trim() === '')
      );
      
      if (emptyMandatorySections.length > 0) {
        blockingIssues.push(
          `${emptyMandatorySections.length} mandatory section(s) have no content`
        );
      }
      
      // Block 7: Section order integrity
      const hasOrderGap = sections.some(
        (s) => s.orderIndex === undefined || s.orderIndex === null
      );
      
      if (hasOrderGap) {
        blockingIssues.push('Section ordering is corrupted');
      }
      
      // Block 8: No duplicate section titles
      const titleCounts = {};
      sections.forEach((s) => {
        titleCounts[s.title] = (titleCounts[s.title] || 0) + 1;
      });
      
      const duplicates = Object.entries(titleCounts)
        .filter(([_, count]) => count > 1)
        .map(([title]) => title);
      
      if (duplicates.length > 0) {
        blockingIssues.push(
          `Duplicate section titles found: ${duplicates.join(', ')}`
        );
      }
    }
    
    // ============================================
    // WARNING CHECKS (Can be overridden)
    // ============================================
    
    // Warning 1: Reference ID recommendation
    if (!tender.referenceId) {
      warnings.push(
        'No Reference ID provided. Consider adding one for tracking purposes.'
      );
    }
    
    // Warning 2: Financial section check
    if (sections.length > 0) {
      const hasFinancialSection = sections.some(
        (s) => s.sectionType === 'FINANCIAL'
      );
      
      if (!hasFinancialSection) {
        warnings.push(
          'No Financial section found. Most tenders require clear financial terms.'
        );
      }
    }
    
    // Warning 3: Technical section check
    if (sections.length > 0) {
      const hasTechnicalSection = sections.some(
        (s) => s.sectionType === 'TECHNICAL'
      );
      
      if (!hasTechnicalSection) {
        warnings.push(
          'No Technical section found. Consider including technical requirements.'
        );
      }
    }
    
    // Warning 4: Eligibility section check
    if (sections.length > 0) {
      const hasEligibilitySection = sections.some(
        (s) => s.sectionType === 'ELIGIBILITY'
      );
      
      if (!hasEligibilitySection) {
        warnings.push(
          'No Eligibility section found. Recommended to define bidder qualifications.'
        );
      }
    }
    
    // Warning 5: Very short deadline
    if (tender.submissionDeadline) {
      const selectedDate = new Date(tender.submissionDeadline);
      const today = new Date();
      const daysUntil = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 7) {
        warnings.push(
          `Submission deadline is very soon (${daysUntil} days). Consider extending for wider participation.`
        );
      }
    }
    
    // Warning 6: Short section content
    if (sections.length > 0) {
      const shortSections = sections.filter(
        (s) => s.content && s.content.length < 100
      );
      
      if (shortSections.length > 0) {
        warnings.push(
          `${shortSections.length} section(s) have very brief content (< 100 characters). Consider providing more detail.`
        );
      }
    }
    
    // ============================================
    // PASSED CHECKS (Informational)
    // ============================================
    
    if (tender.title && tender.title.trim() !== '') {
      passedChecks.push('✓ Tender title is provided and valid');
    }
    
    if (tender.description && tender.description.trim() !== '') {
      passedChecks.push('✓ Tender description is provided');
    }
    
    if (tender.category) {
      passedChecks.push('✓ Tender category is defined');
    }
    
    if (tender.submissionDeadline) {
      const selectedDate = new Date(tender.submissionDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate >= today) {
        passedChecks.push('✓ Submission deadline is in the future');
      }
    }
    
    if (sections.length > 0) {
      passedChecks.push(`✓ Tender has ${sections.length} section(s) defined`);
    }
    
    if (sections.length > 0) {
      const mandatorySections = sections.filter((s) => s.isMandatory);
      const mandatoryWithContent = mandatorySections.filter(
        (s) => s.content && s.content.trim() !== ''
      );
      
      if (mandatorySections.length > 0 && mandatoryWithContent.length === mandatorySections.length) {
        passedChecks.push(`✓ All ${mandatorySections.length} mandatory section(s) have content`);
      }
    }
    
    // Audit log
    console.log('[REVIEW AUDIT] Final review completed', {
      timestamp: new Date().toISOString(),
      blockingIssuesCount: blockingIssues.length,
      warningsCount: warnings.length,
      passedChecksCount: passedChecks.length,
    });
    
    // Update parent validation state
    setValidation((prev) => ({
      ...prev,
      step3: {
        isValid: blockingIssues.length === 0,
        blockingIssues,
        warnings,
        passedChecks,
        overriddenWarnings: overriddenWarnings.map((w) => w.text),
      },
    }));
  }, [tender, sections, overriddenWarnings, setValidation]);
  
  // ============================================
  // OVERRIDE LOGIC
  // ============================================
  
  /**
   * Handles warning override submission
   * Logs the override action for audit
   */
  const handleSubmitOverride = (warningText) => {
    if (!overrideReason.trim()) {
      alert('Override reason is required');
      return;
    }
    
    // Audit log
    console.log('[REVIEW AUDIT] Warning overridden', {
      timestamp: new Date().toISOString(),
      warningText,
      overrideReason,
      authorityAction: 'OVERRIDE_WARNING',
    });
    
    setOverriddenWarnings([
      ...overriddenWarnings,
      {
        text: warningText,
        reason: overrideReason,
        overriddenAt: new Date().toISOString(),
      },
    ]);
    
    setOverrideReason('');
    setIsOverrideModalOpen(false);
    setSelectedWarningIndex(null);
  };
  
  // ============================================
  // DERIVED DATA
  // ============================================
  
  // Recompute on render (from validation state would be passed as prop in real app)
  const blockingIssues = [];
  const warnings = [];
  const passedChecks = [];
  
  // Quick recompute for display (in production, would use validation state from parent)
  const allBlockingIssues = getBlockingIssues(tender, sections);
  const allWarnings = getWarnings(tender, sections);
  const allPassedChecks = getPassedChecks(tender, sections);
  
  const unhandledWarnings = allWarnings.filter(
    (w) => !overriddenWarnings.some((ow) => ow.text === w)
  );
  
  const canProceedToStep5 = allBlockingIssues.length === 0;
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200">
      <div className="border-b border-slate-200 px-8 py-5 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Final Review & Validation
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Comprehensive check before publication. This is a read-only review.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canProceedToStep5 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-bold text-green-700">READY TO PUBLISH</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.47a9 9 0 1 1 9.84 0" />
                </svg>
                <span className="text-xs font-bold text-red-700">ISSUES DETECTED</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Review Content */}
      <div className="p-6 space-y-6">
        
        {/* Blocking Issues */}
        <BlockingIssuesList issues={allBlockingIssues} />
        
        {/* Warnings (with override controls) */}
        <WarningsList
          warnings={allWarnings}
          overriddenWarnings={overriddenWarnings}
          onOpenOverrideModal={(index) => {
            setSelectedWarningIndex(index);
            setIsOverrideModalOpen(true);
          }}
        />
        
        {/* Passed Checks */}
        <PassedChecksList checks={allPassedChecks} />
        
        {/* Governance Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Review Notice</p>
              <p>
                This review ensures tender integrity before publication. 
                {allBlockingIssues.length > 0 ? (
                  <span> Resolve blocking issues to proceed. </span>
                ) : (
                  <span> You can now proceed to publication. </span>
                )}
                All review decisions are logged for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Override Modal */}
      {isOverrideModalOpen && selectedWarningIndex !== null && (
        <OverrideReasonModal
          warning={allWarnings[selectedWarningIndex]}
          overrideReason={overrideReason}
          onReasonChange={setOverrideReason}
          onSubmit={() => handleSubmitOverride(allWarnings[selectedWarningIndex])}
          onCancel={() => {
            setIsOverrideModalOpen(false);
            setSelectedWarningIndex(null);
            setOverrideReason('');
          }}
        />
      )}
    </div>
  );
}

/**
 * BlockingIssuesList Component
 * Displays critical issues that prevent publication
 */
function BlockingIssuesList({ issues }) {
  
  if (issues.length === 0) {
    return null;
  }
  
  return (
    <div className="border-l-4 border-red-600 bg-red-50 p-5 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold text-red-900 text-base">
            ❌ Blocking Issues ({issues.length})
          </h3>
          <p className="text-sm text-red-700 mt-0.5 font-medium">
            Must be resolved before publication
          </p>
        </div>
      </div>
      
      <ul className="space-y-2 ml-9">
        {issues.map((issue, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-red-600 font-bold mt-0.5">✕</span>
            <span className="text-red-900 text-sm font-medium">{issue}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * WarningsList Component
 * Displays warnings that can be overridden with justification
 */
function WarningsList({ warnings, overriddenWarnings, onOpenOverrideModal }) {
  
  const unhandledWarnings = warnings.filter(
    (w) => !overriddenWarnings.some((ow) => ow.text === w)
  );
  
  if (warnings.length === 0) {
    return null;
  }
  
  return (
    <div className="border-l-4 border-amber-500 bg-amber-50 p-5 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-6 h-6 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.47a9 9 0 1 1 9.84 0" />
        </svg>
        <div>
          <h3 className="font-bold text-amber-900 text-base">
            ⚠️ Warnings ({warnings.length})
          </h3>
          <p className="text-sm text-amber-700 mt-0.5 font-medium">
            Review recommended. Can be overridden with justification.
          </p>
        </div>
      </div>
      
      <ul className="space-y-3 ml-9">
        {warnings.map((warning, index) => {
          const isOverridden = overriddenWarnings.some((ow) => ow.text === warning);
          
          return (
            <li key={index} className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-amber-200">
              <div className="flex items-start gap-2 1">
                <span className="text-amber-600 font-bold mt-0.5">!</span>
                <div className="1">
                  <p className="text-amber-900 text-sm font-medium">{warning}</p>
                  {isOverridden && (
                    <p className="text-xs text-green-700 mt-2 italic font-medium">
                      ✓ Override reason provided
                    </p>
                  )}
                </div>
              </div>
              
              {!isOverridden && (
                <button
                  onClick={() => onOpenOverrideModal(index)}
                  className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors shrink-0"
                >
                  Override
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * PassedChecksList Component
 * Displays successful validations (informational)
 */
function PassedChecksList({ checks }) {
  
  if (checks.length === 0) {
    return null;
  }
  
  return (
    <div className="border-l-4 border-green-600 bg-green-50 p-5 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold text-green-900 text-base">
            ✅ Passed Checks ({checks.length})
          </h3>
          <p className="text-sm text-green-700 mt-0.5 font-medium">
            Validation successful
          </p>
        </div>
      </div>
      
      <ul className="space-y-2 ml-9">
        {checks.map((check, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✔</span>
            <span className="text-green-900 text-sm font-medium">{check}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * OverrideReasonModal Component
 * Modal for authority to provide override justification
 */
function OverrideReasonModal({ warning, overrideReason, onReasonChange, onSubmit, onCancel }) {
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-red-700 to-red-600">
          <h3 className="text-lg font-bold text-white">
            ⚠️ Override Warning
          </h3>
        </div>
        
        {/* Warning Context */}
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
          <p className="text-sm text-amber-900 font-medium">
            <span className="font-bold">Warning:</span> {warning}
          </p>
        </div>
        
        {/* Form */}
        <div className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Override Reason
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={overrideReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Explain why you are overriding this warning. This will be logged for audit purposes."
              autoFocus
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs text-blue-900 font-medium">
              <span className="font-bold">Note:</span> This override will be logged with your authority context for compliance and audit purposes.
            </p>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!overrideReason.trim()}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Override
          </button>
        </div>
        
      </div>
    </div>
  );
}

/**
 * Helper function: Get blocking issues
 */
function getBlockingIssues(tender, sections) {
  const issues = [];
  
  if (!tender.title || tender.title.trim() === '') {
    issues.push('Tender title is missing');
  }
  
  if (!tender.description || tender.description.trim() === '') {
    issues.push('Tender description is missing');
  }
  
  if (!tender.category) {
    issues.push('Tender category is not selected');
  }
  
  if (!tender.submissionDeadline) {
    issues.push('Submission deadline is not set');
  } else {
    const selectedDate = new Date(tender.submissionDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      issues.push('Submission deadline has already passed');
    }
  }
  
  if (sections.length === 0) {
    issues.push('No tender sections defined');
  } else {
    const emptyMandatorySections = sections.filter(
      (s) => s.isMandatory && (!s.content || s.content.trim() === '')
    );
    
    if (emptyMandatorySections.length > 0) {
      issues.push(
        `${emptyMandatorySections.length} mandatory section(s) have no content`
      );
    }
    
    const hasOrderGap = sections.some(
      (s) => s.orderIndex === undefined || s.orderIndex === null
    );
    
    if (hasOrderGap) {
      issues.push('Section ordering is corrupted');
    }
    
    const titleCounts = {};
    sections.forEach((s) => {
      titleCounts[s.title] = (titleCounts[s.title] || 0) + 1;
    });
    
    const duplicates = Object.entries(titleCounts)
      .filter(([_, count]) => count > 1)
      .map(([title]) => title);
    
    if (duplicates.length > 0) {
      issues.push(
        `Duplicate section titles found: ${duplicates.join(', ')}`
      );
    }
  }
  
  return issues;
}

/**
 * Helper function: Get warnings
 */
function getWarnings(tender, sections) {
  const warnings = [];
  
  if (!tender.referenceId) {
    warnings.push(
      'No Reference ID provided. Consider adding one for tracking purposes.'
    );
  }
  
  if (sections.length > 0) {
    const hasFinancialSection = sections.some(
      (s) => s.sectionType === 'FINANCIAL'
    );
    
    if (!hasFinancialSection) {
      warnings.push(
        'No Financial section found. Most tenders require clear financial terms.'
      );
    }
  }
  
  if (sections.length > 0) {
    const hasTechnicalSection = sections.some(
      (s) => s.sectionType === 'TECHNICAL'
    );
    
    if (!hasTechnicalSection) {
      warnings.push(
        'No Technical section found. Consider including technical requirements.'
      );
    }
  }
  
  if (sections.length > 0) {
    const hasEligibilitySection = sections.some(
      (s) => s.sectionType === 'ELIGIBILITY'
    );
    
    if (!hasEligibilitySection) {
      warnings.push(
        'No Eligibility section found. Recommended to define bidder qualifications.'
      );
    }
  }
  
  if (tender.submissionDeadline) {
    const selectedDate = new Date(tender.submissionDeadline);
    const today = new Date();
    const daysUntil = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 7) {
      warnings.push(
        `Submission deadline is very soon (${daysUntil} days). Consider extending for wider participation.`
      );
    }
  }
  
  if (sections.length > 0) {
    const shortSections = sections.filter(
      (s) => s.content && s.content.length < 100
    );
    
    if (shortSections.length > 0) {
      warnings.push(
        `${shortSections.length} section(s) have very brief content (< 100 characters). Consider providing more detail.`
      );
    }
  }
  
  return warnings;
}

/**
 * Helper function: Get passed checks
 */
function getPassedChecks(tender, sections) {
  const checks = [];
  
  if (tender.title && tender.title.trim() !== '') {
    checks.push('✓ Tender title is provided and valid');
  }
  
  if (tender.description && tender.description.trim() !== '') {
    checks.push('✓ Tender description is provided');
  }
  
  if (tender.category) {
    checks.push('✓ Tender category is defined');
  }
  
  if (tender.submissionDeadline) {
    const selectedDate = new Date(tender.submissionDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate >= today) {
      checks.push('✓ Submission deadline is in the future');
    }
  }
  
  if (sections.length > 0) {
    checks.push(`✓ Tender has ${sections.length} section(s) defined`);
  }
  
  if (sections.length > 0) {
    const mandatorySections = sections.filter((s) => s.isMandatory);
    const mandatoryWithContent = mandatorySections.filter(
      (s) => s.content && s.content.trim() !== ''
    );
    
    if (mandatorySections.length > 0 && mandatoryWithContent.length === mandatorySections.length) {
      checks.push(`✓ All ${mandatorySections.length} mandatory section(s) have content`);
    }
  }
  
  return checks;
}
