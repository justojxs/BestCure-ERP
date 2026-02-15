import React from 'react';

export default function InvoiceTemplate({ order }) {
    if (!order) return null;

    const {
        orderNumber,
        invoiceNum, // fallback
        createdAt,
        customerName,
        items,
        subtotal,
        tax,
        total
    } = order;

    // Handle different prop names or fallbacks
    const displayId = orderNumber || invoiceNum || 'DRAFT';
    const displayDate = createdAt ? new Date(createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    const dueDate = new Date(new Date(displayDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", padding: '40px', maxWidth: '800px', margin: '0 auto', background: 'white', color: 'black' }}>

            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>INVOICE</h1>
                    <p style={{ fontSize: '14px', marginTop: '8px', color: '#444' }}>No: {displayId}</p>
                    <p style={{ fontSize: '14px', color: '#444' }}>Date: {displayDate}</p>
                    <p style={{ fontSize: '14px', color: '#444' }}>Due Date: {dueDate}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0d9488', margin: 0, textTransform: 'uppercase' }}>BEST CURE MEDICAL AND GENERAL ENTP</h2>
                    <p style={{ fontSize: '13px', marginTop: '6px', maxWidth: '300px', marginLeft: 'auto', lineHeight: '1.5', color: '#333' }}>
                        553/16, Civil Lines<br />
                        Gurgaon, Haryana 122001<br />
                        GST: 06ALGPK8117K1ZX<br />
                        Contact: 9354708361
                    </p>
                </div>
            </div>

            {/* Bill To */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', marginBottom: '8px', letterSpacing: '1px', fontWeight: '600' }}>Bill To:</h3>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>{customerName || 'Walk-in Customer'}</div>
                <div style={{ fontSize: '14px', color: '#444', marginTop: '4px' }}>
                    Customer Address Line 1<br />
                    City, State, Zip
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #000' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'black' }}>Description</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'black' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'black' }}>Unit Price</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'black' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '600' }}>{item.name}</td>
                            <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px' }}>{item.quantity || item.qty}</td>
                            <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '14px' }}>₹{item.price.toFixed(2)}</td>
                            <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '14px', fontWeight: '700' }}>₹{((item.quantity || item.qty) * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#444' }}>
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#444' }}>
                        <span>GST (18%):</span>
                        <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '2px solid #000', paddingTop: '16px', fontSize: '18px', fontWeight: '800' }}>
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Thank you for your business!</p>
                <p>Payment Terms: Net 30. Please include invoice number on your check.</p>
            </div>
        </div>
    );
}
