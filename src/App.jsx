import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import TenderListingPage from './pages/TenderListingPage.jsx'
import TenderDetailPage from './pages/TenderDetailPage.jsx'
import TenderAnalysisPage from './pages/TenderAnalysisPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tenders" replace />} />
        <Route path="/tenders" element={<TenderListingPage />} />
        <Route path="/tenders/:tenderId" element={<TenderDetailPage />} />
        <Route path="/tenders/:tenderId/analysis" element={<TenderAnalysisPage />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center space-y-3 max-w-md">
                <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
                <p className="text-sm text-slate-600">Return to the tender listing to continue.</p>
                <a
                  href="/tenders"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  Back to Listing
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
