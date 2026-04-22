import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheck, FiZap, FiAward, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Pricing() {
  const [loading, setLoading] = useState(null)
  const navigate = useNavigate()

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$9.99',
      period: '/ month',
      features: ['Unlimited File Size', 'All PDF Tools', 'Cloud Storage (50GB)', 'Priority Support', 'No Ads'],
      icon: <FiZap />,
      color: '#6366f1'
    },
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      price: '$24.99',
      period: '/ 3 months',
      features: ['Everything in Monthly', 'Cloud Storage (200GB)', 'Advanced OCR', 'Batch Processing', 'Team Collaboration'],
      icon: <FiAward />,
      color: '#a855f7',
      popular: true
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      price: '$79.99',
      period: '/ year',
      features: ['Everything in Quarterly', 'Cloud Storage (1TB)', 'Custom Branding', 'API Access', '24/7 Dedicated Manager'],
      icon: <FiShield />,
      color: '#ec4899'
    }
  ]

  const handleSubscribe = (planId) => {
    setLoading(planId)
    // Simulate payment method opening
    toast.loading(`Opening secure payment for ${planId} plan...`)
    
    setTimeout(() => {
      toast.dismiss()
      const confirmPayment = window.confirm(`Simulate payment for ${planId} plan?`)
      if (confirmPayment) {
        toast.success('Payment successful! Your account has been upgraded. 🎉')
        // In a real app, you'd call an API here
        navigate('/profile')
      }
      setLoading(null)
    }, 2000)
  }

  return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 16 }}>Simple, Transparent Pricing</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto' }}>
          Choose the plan that's right for you and unlock the full power of PDFtoolkit.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className="card animate-fade-up" 
            style={{ 
              padding: 40, 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border-light)',
              transform: plan.popular ? 'scale(1.05)' : 'none',
              zIndex: plan.popular ? 1 : 0
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>
                MOST POPULAR
              </div>
            )}
            
            <div style={{ fontSize: '2.5rem', color: plan.color, marginBottom: 20 }}>{plan.icon}</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>{plan.name}</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32 }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{plan.price}</span>
              <span style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
            </div>

            <div style={{ flex: 1, marginBottom: 40 }}>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    <FiCheck style={{ color: plan.color, flexShrink: 0 }} /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: 12, 
                border: 'none', 
                background: plan.popular ? plan.color : 'var(--bg-glass-hover)', 
                color: 'white', 
                fontWeight: 700, 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}
            >
              {loading === plan.id ? 'Processing...' : 'Get Started Now'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FiShield /> Secure payments via Stripe & PayPal. Cancel anytime.
        </p>
      </div>
    </div>
  )
}
