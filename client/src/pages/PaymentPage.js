import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "../components/layout";
import { confirmBooking } from "../api/movieApi";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!state || !state.bookingId) {
    return (
      <Layout>
        <div className="container app-shell-inner flex-center">
          <div className="glass-card error-state animate-entrance">
            <h2 className="premium-font">Session Expired</h2>
            <p className="page-subtitle">Your booking session has timed out. Please try again.</p>
            <button className="primary-btn" onClick={() => navigate("/")}>Go Home</button>
          </div>
        </div>
      </Layout>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    
    // Simple Validation
    if (paymentMethod === 'UPI' && !upiId.includes("@")) {
      setError("Please enter a valid UPI ID (e.g. name@bank)");
      return;
    }

    setLoading(true);
    
    // Simulate Processing Delay
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await confirmBooking(state.bookingId, { 
        paymentId: "ANTIGRAVITY_PAY_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        paymentMethod: paymentMethod
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/ticket/${state.bookingId}`, { state });
      }, 2500);
    } catch (error) {
      setError("Payment encountered an error. Please contact support or try another method.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container app-shell-inner checkout-wrapper">
        <header className="checkout-header animate-entrance">
          <h1 className="page-title premium-font">Secure Checkout</h1>
          <p className="page-subtitle">Complete your premium reservation</p>
        </header>

        {error && <div className="message-banner error">{error}</div>}

        <div className="checkout-grid">
          <section className="payment-form-section stagger-item">
            <div className="glass-card main-payment-card card-glow">
              <div className="payment-method-tabs">
                <button 
                  className={`method-tab ${paymentMethod === 'CARD' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <span className="icon">💳</span>
                  <span>CARD</span>
                </button>
                <button 
                  className={`method-tab ${paymentMethod === 'UPI' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <span className="icon">⚡</span>
                  <span>UPI</span>
                </button>
                <button 
                  className={`method-tab ${paymentMethod === 'QR' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('QR')}
                >
                  <span className="icon">🏁</span>
                  <span>QR CODE</span>
                </button>
              </div>

              <div className="tab-content">
                {paymentMethod === 'CARD' && (
                  <form className="modern-form animate-fade-in" onSubmit={handlePayment}>
                    <div className="card-input-box">
                      <div className="card-icon">🔐</div>
                      <input type="text" placeholder="Card Number" defaultValue="4242 4242 4242 4242" readOnly />
                    </div>
                    <div className="form-row">
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" readOnly />
                      <input type="text" placeholder="CVC" defaultValue="***" readOnly />
                    </div>
                    <input type="text" placeholder="Cardholder Name" defaultValue="ELITE CUSTOMER" readOnly />
                    
                    <button className="primary-btn checkout-submit" disabled={loading || success}>
                      {loading ? "Processing..." : success ? "Payment Successful!" : `Pay ₹${state.amount}`}
                    </button>
                  </form>
                )}

                {paymentMethod === 'UPI' && (
                  <form className="modern-form animate-fade-in" onSubmit={handlePayment}>
                    <div className="upi-input-group">
                      <label>Enter UPI ID (VPA)</label>
                      <input 
                        type="text" 
                        placeholder="username@upi" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                      <p className="helper-text">Accepts Google Pay, PhonePe, Paytm, and BHIM</p>
                    </div>
                    
                    <button className="primary-btn checkout-submit" disabled={loading || success || !upiId}>
                      {loading ? "Verifying..." : success ? "UPI Payment Success!" : `Pay ₹${state.amount}`}
                    </button>
                  </form>
                )}

                {paymentMethod === 'QR' && (
                  <div className="qr-payment-zone animate-fade-in">
                    <div className="qr-mock-container">
                      <svg viewBox="0 0 100 100" className="qr-svg">
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        <rect x="10" y="10" width="20" height="20" fill="black" />
                        <rect x="10" y="70" width="20" height="20" fill="black" />
                        <rect x="70" y="10" width="20" height="20" fill="black" />
                        <rect x="15" y="15" width="10" height="10" fill="white" />
                        <rect x="15" y="75" width="10" height="10" fill="white" />
                        <rect x="75" y="15" width="10" height="10" fill="white" />
                        <rect x="35" y="10" width="5" height="5" fill="black" />
                        <rect x="10" y="35" width="5" height="5" fill="black" />
                        <rect x="40" y="40" width="20" height="20" fill="#00b562" />
                      </svg>
                      <div className="scan-indicator"></div>
                    </div>
                    <p className="qr-instruction">Scan with any UPI App to pay</p>
                    <div className="waiting-pill">{loading ? "Confirming..." : "Waiting for scan..."}</div>

                    <button 
                      className="primary-btn checkout-submit" 
                      onClick={handlePayment}
                      disabled={loading || success}
                    >
                      {loading ? "Processing..." : success ? "Booking Done!" : "I Have Paid"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="order-summary-section stagger-item">
            <div className="glass-card summary-card">
              <h3 className="premium-font">Order Summary</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Movie</span>
                  <strong>{state.movie.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Theater</span>
                  <strong>{state.theater}</strong>
                </div>
                <div className="summary-row">
                  <span>Seats</span>
                  <strong>{state.selectedSeats.join(", ")}</strong>
                </div>
                <div className="divider"></div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span className="accent-text">₹{state.amount}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {success && (
          <div className="success-overlay animate-fade">
            <div className="success-content">
              <div className="checkmark">✓</div>
              <h2 className="premium-font">Booking Confirmed!</h2>
              <p>Preparing your digital tickets...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .checkout-wrapper { max-width: 1000px; margin: 4rem auto; min-height: 80vh; }
        .checkout-header { text-align: center; margin-bottom: 4rem; }
        
        .checkout-grid { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; }
        
        /* Payment Method Tabs */
        .payment-method-tabs {
          display: flex; gap: 10px; margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.05); padding: 8px; border-radius: 12px;
        }
        .method-tab {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px; background: transparent; border: none; border-radius: 8px;
          color: var(--text-muted); font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .method-tab.active { background: rgba(0, 181, 98, 0.15); color: var(--accent-green); }
        .method-tab:hover:not(.active) { background: rgba(255, 255, 255, 0.08); }
        .icon { font-size: 1.2rem; }

        .tab-content { min-height: 350px; }
        
        .modern-form { display: flex; flex-direction: column; gap: 1.2rem; }
        .card-input-box { position: relative; }
        .card-icon { position: absolute; left: 15px; top: 18px; font-size: 1.2rem; }
        .card-input-box input { padding-left: 50px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        /* UPI Section */
        .upi-input-group label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 700; }
        .upi-input-group input { font-size: 1.2rem; letter-spacing: 1px; }
        .helper-text { font-size: 0.75rem; color: var(--text-muted); margin-top: 10px; }

        /* QR Section */
        .qr-payment-zone { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .qr-mock-container { position: relative; width: 180px; height: 180px; padding: 15px; background: white; border-radius: 15px; margin-bottom: 1.5rem; }
        .qr-svg { width: 100%; height: 100%; }
        .scan-indicator { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green); animation: scanLine 3s infinite; }
        .qr-instruction { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem; }
        .waiting-pill { display: inline-block; padding: 8px 15px; background: rgba(255, 255, 255, 0.05); border-radius: 50px; font-size: 0.8rem; font-weight: 700; color: var(--accent-gold); }

        .checkout-submit { margin-top: 2rem; width: 100%; font-size: 1.2rem; padding: 1.2rem; }
        
        .summary-card { border-top: 4px solid var(--accent-gold); }
        .summary-details { display: flex; flex-direction: column; gap: 1.2rem; margin-top: 2rem; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.95rem; }
        .summary-row strong { color: var(--white); }
        .divider { height: 1px; background: var(--glass-border); margin: 0.5rem 0; }
        .total { font-size: 1.5rem; font-weight: 800; color: var(--white); }
        
        @keyframes scanLine { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .success-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(10, 25, 47, 0.95); z-index: 2000;
          display: flex; align-items: center; justify-content: center;
        }
        .success-content { text-align: center; }
        .checkmark { 
          width: 80px; height: 80px; background: var(--accent-cyan); color: var(--bg-deep);
          border-radius: 50%; font-size: 3rem; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 2rem; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
        
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .payment-method-tabs { flex-direction: column; }
        }
      `}</style>
    </Layout>
  );
}
