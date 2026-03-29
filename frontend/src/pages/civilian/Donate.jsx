import { useState } from 'react';
import AppLayout from '../../components/Layout/AppLayout';

const PURPOSES = [
  { value: 'FLOOD_RELIEF', label: 'Flood Relief Fund' },
  { value: 'MEDICAL_AID', label: 'Medical Aid' },
  { value: 'FOOD_SUPPLY', label: 'Food & Water Supply' },
  { value: 'RESCUE_OPS', label: 'Rescue Operations' },
  { value: 'GENERAL', label: 'General Disaster Relief' },
];

const AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function Donate() {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [purpose, setPurpose] = useState('GENERAL');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [error, setError] = useState('');

  const finalAmount = customAmount || amount;

  function handleDonate() {
    if (!finalAmount || finalAmount < 1) {
      setError('Please enter a valid amount');
      return;
    }
    if (!donorName || !donorEmail) {
      setError('Please fill in your name and email');
      return;
    }
    setError('');
    alert(`Thank you ${donorName}! Payment of ₹${finalAmount} for ${purpose} will be enabled soon.`);
  }

  return (
    <AppLayout>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Donate for disaster relief</h1>
          <p style={styles.subtitle}>
            100% of your donation goes directly to disaster victims
          </p>
        </div>

        {/* Top impact stats */}
        <div style={styles.impactRow}>
          {[
            { label: 'Total donated', value: '₹2.4L', color: '#639922' },
            { label: 'Total donors', value: '384', color: '#378ADD' },
            { label: 'Families helped', value: '1,200+', color: '#7F77DD' },
            { label: 'Active campaigns', value: '5', color: '#EF9F27' },
          ].map((s) => (
            <div key={s.label} style={styles.impactCard}>
              <div style={{ ...styles.impactValue, color: s.color }}>{s.value}</div>
              <div style={styles.impactLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.grid}>

          {/* Left — Donation form */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Make a donation</div>

            {error && <div style={styles.error}>{error}</div>}

            {/* Purpose */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Select purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={styles.select}
              >
                {PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Quick amounts */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Select amount (₹)</label>
              <div style={styles.amountGrid}>
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(''); }}
                    style={{
                      ...styles.amountBtn,
                      ...(amount === a && !customAmount ? styles.amountBtnActive : {}),
                    }}
                  >
                    ₹{a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Or enter custom amount</label>
              <div style={styles.inputPrefix}>
                <span style={styles.prefix}>₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount('');
                  }}
                  style={styles.prefixInput}
                />
              </div>
            </div>

            {/* Donor info */}
            <div style={styles.twoCol}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Your name</label>
                <input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Full name"
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email address</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="For receipt"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Summary */}
            {finalAmount > 0 && (
              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Donation amount</span>
                  <span style={styles.summaryValue}>
                    ₹{Number(finalAmount).toLocaleString()}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Purpose</span>
                  <span style={styles.summaryValue}>
                    {PURPOSES.find(p => p.value === purpose)?.label}
                  </span>
                </div>
                <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
                  <span style={styles.summaryLabel}>Donor</span>
                  <span style={styles.summaryValue}>{donorName || '—'}</span>
                </div>
              </div>
            )}

            {/* Donate button */}
            <button onClick={handleDonate} style={styles.donateBtn}>
              {finalAmount
                ? `Donate ₹${Number(finalAmount).toLocaleString()}`
                : 'Select an amount'}
            </button>

            {/* Coming soon badge */}
            <div style={styles.comingSoon}>
              Payment integration coming soon — Razorpay (UPI, cards, netbanking)
            </div>
          </div>

          {/* Right panel */}
          <div style={styles.rightPanel}>

            {/* Where money goes */}
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Where your money goes</div>
              {[
                { label: 'Food & water', pct: 40, color: '#639922' },
                { label: 'Medical aid', pct: 30, color: '#378ADD' },
                { label: 'Rescue ops', pct: 20, color: '#EF9F27' },
                { label: 'Logistics', pct: 10, color: '#888780' },
              ].map((item) => (
                <div key={item.label} style={styles.allocationItem}>
                  <div style={styles.allocationTop}>
                    <span style={styles.allocationLabel}>{item.label}</span>
                    <span style={styles.allocationPct}>{item.pct}%</span>
                  </div>
                  <div style={styles.progressBg}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${item.pct}%`,
                      background: item.color,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent donors */}
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Recent donors</div>
              {[
                { name: 'Rahul S.', amount: '₹1,000', purpose: 'Flood Relief', time: '2 hr ago' },
                { name: 'Priya M.', amount: '₹500', purpose: 'Medical Aid', time: '5 hr ago' },
                { name: 'Anonymous', amount: '₹2,000', purpose: 'Food Supply', time: '1 day ago' },
              ].map((d, i) => (
                <div key={i} style={styles.donorItem}>
                  <div style={styles.donorAvatar}>
                    {d.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.donorName}>{d.name}</div>
                    <div style={styles.donorPurpose}>{d.purpose}</div>
                  </div>
                  <div style={styles.donorRight}>
                    <div style={styles.donorAmount}>{d.amount}</div>
                    <div style={styles.donorTime}>{d.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency campaigns */}
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Active campaigns</div>
              {[
                { name: 'North Kolkata Flood', raised: 65, target: '₹50,000' },
                { name: 'Cyclone Relief Fund', raised: 40, target: '₹1,00,000' },
              ].map((c) => (
                <div key={c.name} style={styles.campaignItem}>
                  <div style={styles.campaignName}>{c.name}</div>
                  <div style={styles.progressBg}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${c.raised}%`,
                      background: '#E24B4A',
                    }} />
                  </div>
                  <div style={styles.campaignMeta}>
                    <span style={styles.campaignPct}>{c.raised}% raised</span>
                    <span style={styles.campaignTarget}>Goal: {c.target}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  page: { maxWidth: '960px' },
  header: { marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' },
  subtitle: { fontSize: '14px', color: '#888780' },
  impactRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px', marginBottom: '24px' },
  impactCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px', textAlign: 'center' },
  impactValue: { fontSize: '24px', fontWeight: '500', marginBottom: '4px' },
  impactLabel: { fontSize: '12px', color: '#888780' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' },
  card: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '500', color: '#1a1a18' },
  error: { background: '#FCEBEB', color: '#A32D2D',
    border: '0.5px solid #F09595', borderRadius: '8px',
    padding: '10px 14px', fontSize: '13px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#444441' },
  select: { padding: '10px 12px', borderRadius: '8px',
    border: '0.5px solid #c8c7bf', fontSize: '14px',
    color: '#1a1a18', background: '#fff', outline: 'none' },
  amountGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  amountBtn: { padding: '10px', borderRadius: '8px',
    border: '0.5px solid #e0dfd7', background: '#f5f5f0',
    fontSize: '13px', color: '#1a1a18', cursor: 'pointer', fontWeight: '500' },
  amountBtnActive: { background: '#FCEBEB',
    border: '1.5px solid #E24B4A', color: '#A32D2D' },
  inputPrefix: { display: 'flex', alignItems: 'center',
    border: '0.5px solid #c8c7bf', borderRadius: '8px', overflow: 'hidden' },
  prefix: { padding: '10px 12px', background: '#f5f5f0',
    fontSize: '14px', color: '#888780',
    borderRight: '0.5px solid #c8c7bf' },
  prefixInput: { flex: 1, padding: '10px 12px', border: 'none',
    fontSize: '14px', color: '#1a1a18', outline: 'none' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { padding: '10px 12px', borderRadius: '8px',
    border: '0.5px solid #c8c7bf', fontSize: '14px',
    color: '#1a1a18', background: '#fff', outline: 'none' },
  summary: { background: '#f5f5f0', borderRadius: '8px',
    padding: '12px 16px', display: 'flex',
    flexDirection: 'column', gap: '0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between',
    padding: '6px 0', borderBottom: '0.5px solid #e0dfd7' },
  summaryLabel: { fontSize: '13px', color: '#888780' },
  summaryValue: { fontSize: '13px', fontWeight: '500', color: '#1a1a18' },
  donateBtn: { padding: '13px', background: '#E24B4A', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '15px',
    fontWeight: '500', cursor: 'pointer' },
  comingSoon: { fontSize: '11px', color: '#B4B2A9',
    textAlign: 'center', padding: '4px' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '14px' },
  infoCard: { background: '#ffffff', borderRadius: '12px',
    border: '0.5px solid #e0dfd7', padding: '16px' },
  infoTitle: { fontSize: '13px', fontWeight: '500',
    color: '#1a1a18', marginBottom: '14px' },
  allocationItem: { marginBottom: '10px' },
  allocationTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  allocationLabel: { fontSize: '12px', color: '#5F5E5A' },
  allocationPct: { fontSize: '12px', fontWeight: '500', color: '#1a1a18' },
  progressBg: { height: '4px', background: '#f5f5f0', borderRadius: '2px' },
  progressFill: { height: '100%', borderRadius: '2px' },
  donorItem: { display: 'flex', alignItems: 'center',
    gap: '10px', padding: '8px 0',
    borderBottom: '0.5px solid #f5f5f0' },
  donorAvatar: { width: '32px', height: '32px', borderRadius: '50%',
    background: '#E6F1FB', color: '#0C447C', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '500', flexShrink: 0 },
  donorName: { fontSize: '13px', fontWeight: '500', color: '#1a1a18' },
  donorPurpose: { fontSize: '11px', color: '#888780' },
  donorRight: { textAlign: 'right' },
  donorAmount: { fontSize: '13px', fontWeight: '500', color: '#639922' },
  donorTime: { fontSize: '10px', color: '#B4B2A9' },
  campaignItem: { marginBottom: '12px' },
  campaignName: { fontSize: '12px', fontWeight: '500',
    color: '#1a1a18', marginBottom: '6px' },
  campaignMeta: { display: 'flex', justifyContent: 'space-between', marginTop: '4px' },
  campaignPct: { fontSize: '11px', color: '#E24B4A' },
  campaignTarget: { fontSize: '11px', color: '#888780' },
};