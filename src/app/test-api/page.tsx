"use client";

export default function TestAPIPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://civicpath.onrender.com/api/v1';
    
    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>API Configuration Test</h1>
            <p><strong>API URL being used:</strong></p>
            <p style={{ background: '#f0f0f0', padding: '10px' }}>{apiUrl}</p>
            <p><strong>Expected:</strong> https://civicpath.onrender.com/api/v1</p>
            <p><strong>Match:</strong> {apiUrl === 'https://civicpath.onrender.com/api/v1' ? '✅ YES' : '❌ NO'}</p>
        </div>
    );
}
