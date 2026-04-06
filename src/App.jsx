import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MergePDF from './pages/tools/MergePDF'
import SplitPDF from './pages/tools/SplitPDF'
import CompressPDF from './pages/tools/CompressPDF'
import RotatePDF from './pages/tools/RotatePDF'
import WatermarkPDF from './pages/tools/WatermarkPDF'
import ProtectPDF from './pages/tools/ProtectPDF'
import ReorderPDF from './pages/tools/ReorderPDF'
import PDFInfo from './pages/tools/PDFInfo'
import AllTools from './pages/AllTools'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ImageToPDF from './pages/tools/ImageToPDF'
import ExtractText from './pages/tools/ExtractText'
import WordToPDF from './pages/tools/WordToPDF'
import NotFound from './pages/NotFound'
import PrivateRoute from './components/PrivateRoute'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <div className="app-wrapper">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<AllTools />} />
          <Route path="/tools/merge" element={<MergePDF />} />
          <Route path="/tools/split" element={<SplitPDF />} />
          <Route path="/tools/compress" element={<CompressPDF />} />
          <Route path="/tools/rotate" element={<RotatePDF />} />
          <Route path="/tools/watermark" element={<WatermarkPDF />} />
          <Route path="/tools/protect" element={<ProtectPDF />} />
          <Route path="/tools/reorder" element={<ReorderPDF />} />
          <Route path="/tools/info" element={<PDFInfo />} />
          <Route path="/tools/jpg-to-pdf" element={<ImageToPDF />} />
          <Route path="/tools/extract-text" element={<ExtractText />} />
          <Route path="/tools/word-to-pdf" element={<WordToPDF />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
