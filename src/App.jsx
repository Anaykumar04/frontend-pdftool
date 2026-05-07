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
import Profile from './pages/Profile'
import QuickUpload from './pages/QuickUpload'
import Pricing from './pages/Pricing'
import ImageToPDF from './pages/tools/ImageToPDF'
import ExtractText from './pages/tools/ExtractText'
import WordToPDF from './pages/tools/WordToPDF'
import PageNumber from './pages/tools/PageNumber'
import DeletePage from './pages/tools/DeletePage'
import SignPDF from './pages/tools/SignPDF'
import AddStamp from './pages/tools/AddStamp'
import TranslatePDF from './pages/tools/TranslatePDF'
import PDFEditor from './pages/tools/PDFEditor'
import BackgroundColor from './pages/tools/BackgroundColor'
import FileConverter from './pages/tools/FileConverter'
import FillablePDF from './pages/tools/FillablePDF'
import PdfToJpg from './pages/tools/PdfToJpg'
import RemoveBlankPages from './pages/tools/RemoveBlankPages'
import FlattenPDF from './pages/tools/FlattenPDF'
import RepairPDF from './pages/tools/RepairPDF'
import HeaderFooter from './pages/tools/HeaderFooter'
import CropPDF from './pages/tools/CropPDF'
import PdfToWord from './pages/tools/PdfToWord'
import ComingSoonTool from './pages/ComingSoonTool'
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
          
          {/* Activated & Integrated Tools */}
          <Route path="/tools/page-number" element={<PageNumber />} />
          <Route path="/tools/delete-page" element={<DeletePage />} />
          <Route path="/tools/sign" element={<SignPDF />} />
          <Route path="/tools/add-stamp" element={<AddStamp />} />
          
          <Route path="/tools/json-to-pdf" element={<FileConverter title="JSON to PDF" type="JSON" icon="📊" endpoint="/pdf/json-to-pdf" colorClass="badge-purple" accept={{ 'application/json': ['.json'] }} />} />
          <Route path="/tools/xml-to-pdf" element={<FileConverter title="XML to PDF" type="XML" icon="📜" endpoint="/pdf/xml-to-pdf" colorClass="badge-blue" accept={{ 'application/xml': ['.xml'] }} />} />
          <Route path="/tools/email-to-pdf" element={<FileConverter title="Email to PDF" type="Email" icon="📧" endpoint="/pdf/email-to-pdf" colorClass="badge-orange" accept={{ 'text/plain': ['.txt', '.eml'] }} />} />
          <Route path="/tools/csv-to-pdf" element={<FileConverter title="CSV to PDF" type="CSV" icon="📊" endpoint="/pdf/csv-to-pdf" colorClass="badge-green" accept={{ 'text/csv': ['.csv'] }} />} />
          <Route path="/tools/extract-images" element={<FileConverter title="Extract Images" type="PDF" icon="🖼️" endpoint="/pdf/extract-images" colorClass="badge-pink" accept={{ 'application/pdf': ['.pdf'] }} />} />
          <Route path="/tools/translate-pdf" element={<TranslatePDF />} />

          <Route path="/tools/edit" element={<PDFEditor />} />
          <Route path="/tools/fillable-pdf" element={<FillablePDF />} />
          <Route path="/tools/background-color" element={<BackgroundColor />} />
          <Route path="/tools/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/tools/remove-blank-pages" element={<RemoveBlankPages />} />
          <Route path="/tools/flatten-pdf" element={<FlattenPDF />} />
          <Route path="/tools/repair-pdf" element={<RepairPDF />} />
          <Route path="/tools/header-footer" element={<HeaderFooter />} />
          <Route path="/tools/crop-pdf" element={<CropPDF />} />
          <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
          <Route path="/tools/ocr" element={<ComingSoonTool name="OCR PDF" category="Convert from PDF" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/quick-upload" element={<PrivateRoute><QuickUpload /></PrivateRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

