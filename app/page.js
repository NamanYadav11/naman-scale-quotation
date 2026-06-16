'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    scaleType: 'platform',
    capacity: '50kg',
    quantity: 1,
    notes: ''
  });

  const [quotation, setQuotation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const scalePrice = {
      'platform': 5000,
      'mechanical': 3000,
      'digital': 8000,
      'hanging': 4000
    };

    const basePrice = scalePrice[formData.scaleType] || 5000;
    const totalPrice = basePrice * formData.quantity;
    const gst = totalPrice * 0.18;
    const grandTotal = totalPrice + gst;

    setQuotation({
      ...formData,
      basePrice,
      totalPrice,
      gst,
      grandTotal,
      date: new Date().toLocaleDateString('en-IN'),
      quotationId: `NSQ-${Date.now()}`
    });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ margin: '0', color: '#333' }}>Naman Scale</h1>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Quotation Generator</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Generate Quotation</h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Scale Type</label>
            <select
              name="scaleType"
              value={formData.scaleType}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            >
              <option value="platform">Platform Scale</option>
              <option value="mechanical">Mechanical Scale</option>
              <option value="digital">Digital Scale</option>
              <option value="hanging">Hanging Scale</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Capacity</label>
            <select
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            >
              <option value="10kg">10 kg</option>
              <option value="50kg">50 kg</option>
              <option value="100kg">100 kg</option>
              <option value="500kg">500 kg</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Generate Quotation
          </button>
        </form>

        {/* Quotation Display */}
        {quotation && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h2 style={{ marginTop: 0 }}>Quotation</h2>
            <div style={{ marginBottom: '15px' }}>
              <strong>Quotation ID:</strong> {quotation.quotationId}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Date:</strong> {quotation.date}
            </div>
            <hr />
            <div style={{ marginBottom: '15px' }}>
              <strong>Customer Name:</strong> {quotation.customerName}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Email:</strong> {quotation.email}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Phone:</strong> {quotation.phone}
            </div>
            <hr />
            <div style={{ marginBottom: '15px' }}>
              <strong>Scale Type:</strong> {quotation.scaleType}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Capacity:</strong> {quotation.capacity}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Quantity:</strong> {quotation.quantity}
            </div>
            <hr />
            <div style={{ marginBottom: '15px' }}>
              <strong>Price per Unit:</strong> ₹{quotation.basePrice.toLocaleString('en-IN')}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Total Price:</strong> ₹{quotation.totalPrice.toLocaleString('en-IN')}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>GST (18%):</strong> ₹{quotation.gst.toLocaleString('en-IN')}
            </div>
            <div style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
              Grand Total: ₹{quotation.grandTotal.toLocaleString('en-IN')}
            </div>
            {quotation.notes && (
              <div>
                <strong>Notes:</strong> {quotation.notes}
              </div>
            )}
            <button
              onClick={() => window.print()}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Print Quotation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
