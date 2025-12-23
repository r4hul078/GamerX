import React, { useState } from 'react';
import './PaymentModal.css';

function PaymentModal({ isOpen, totalAmount, cartItems, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate card details
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        alert('Please fill in all payment details');
        setIsProcessing(false);
        return;
      }

      // Simulate API call to process payment
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/products/purchase/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            cardLastFour: cardNumber.slice(-4)
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment failed');
      }

      const result = await response.json();

      // Show success message
      alert(`✅ Payment successful!\nOrder ID: ${result.orderId}\nAmount: ₹${result.totalAmount.toFixed(2)}\n\nStock has been updated!`);

      // Call success callback
      onPaymentSuccess(result);

      // Close modal
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      alert(`❌ Payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-modal-body">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Total Amount:</span>
              <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="payment-methods">
            <h3>Payment Method</h3>
            <div className="method-options">
              <label className="method-option">
                <input
                  type="radio"
                  name="payment-method"
                  value="credit-card"
                  checked={paymentMethod === 'credit-card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💳 Credit/Debit Card</span>
              </label>
              <label className="method-option">
                <input
                  type="radio"
                  name="payment-method"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>📱 UPI</span>
              </label>
              <label className="method-option">
                <input
                  type="radio"
                  name="payment-method"
                  value="net-banking"
                  checked={paymentMethod === 'net-banking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>🏦 Net Banking</span>
              </label>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength="3"
                  required
                />
              </div>
            </div>

            <div className="payment-note">
              <p>💡 This is a mock payment gateway. Use any card details to proceed.</p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pay-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
