import { Link } from 'react-router-dom'
import { FiCheck, FiZap } from 'react-icons/fi'

const features = [
  'Merge, Split, Compress PDFs',
  'Rotate & Reorder Pages',
  'Add Watermark & Stamp',
  'Protect PDF with Password',
  'Image to PDF & Word to PDF',
  'Extract Text from PDF',
  'Sign & Fill PDF Forms',
  'PDF Info & Metadata',
  'No file size limits',
  'No registration required',
  'Files auto-deleted after 1 hour',
  'SSL encrypted transfers',
]

export default function Pricing() {
  return (
    <div className="container" style={{ padding:'80px 24px', maxWidth:900, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:64 }}>
        <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:20, background:'rgba(139,92,246,0.1)', color:'#a78bfa', fontSize:'0.85rem', fontWeight:600, marginBottom:16 }}>
          🎉 100% Free Forever
        </span>
        <h1 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, marginBottom:16 }}>
          All Tools. <span className="gradient-text">Zero Cost.</span>
        </h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'1.1rem', maxWidth:560, margin:'0 auto' }}>
          Every PDF tool on PDFtoolkit is completely free to use. No hidden fees, no subscriptions, no credit card required.
        </p>
      </div>

      {/* Single Free Plan Card */}
      <div style={{ maxWidth:560, margin:'0 auto 64px', background:'rgba(30,41,59,0.5)', backdropFilter:'blur(16px)', borderRadius:24, padding:48, border:'2px solid rgba(139,92,246,0.3)', boxShadow:'0 0 40px rgba(139,92,246,0.1)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'rgba(139,92,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>
            <FiZap style={{ color:'#a78bfa' }} />
          </div>
          <div>
            <h2 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:4 }}>Free Plan</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Everything included, always</p>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:32 }}>
          <span style={{ fontSize:'3.5rem', fontWeight:800, color:'var(--text-primary)' }}>$0</span>
          <span style={{ color:'var(--text-secondary)', fontSize:'1rem' }}>/ forever</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:40 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.9rem', color:'var(--text-secondary)' }}>
              <FiCheck style={{ color:'#10b981', flexShrink:0 }} />
              {f}
            </div>
          ))}
        </div>

        <Link to="/tools" style={{ textDecoration:'none' }}>
          <button style={{ width:'100%', padding:'16px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'white', fontWeight:700, fontSize:'1rem', cursor:'pointer', transition:'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform='none'}>
            🚀 Start Using Free Tools
          </button>
        </Link>
      </div>

      {/* FAQ */}
      <div style={{ textAlign:'center' }}>
        <h2 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:32 }}>Frequently Asked Questions</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, textAlign:'left' }}>
          {[
            { q:'Is it really free?', a:'Yes, 100%. All PDF tools are free with no hidden charges or limits.' },
            { q:'Do I need an account?', a:'No account needed for any tool. Create one to save your processing history.' },
            { q:'Are my files safe?', a:'All files are processed securely and automatically deleted after 1 hour.' },
            { q:'What file size is supported?', a:'Up to 50MB per file. For merge operations, up to 20 files at once.' },
          ].map(({ q, a }, i) => (
            <div key={i} style={{ background:'rgba(30,41,59,0.4)', borderRadius:16, padding:24, border:'1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:10 }}>{q}</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', lineHeight:1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

