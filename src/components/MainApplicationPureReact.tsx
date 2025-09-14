import React from 'react';

export default function MainApplicationPureReact() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{
        color: '#2563eb',
        marginBottom: '2rem',
        fontSize: '2.5rem'
      }}>
        🏦 CMTAT + ICMA Platform
      </h1>

      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          marginBottom: '1rem',
          fontSize: '1.5rem',
          color: '#1e293b'
        }}>
          Pure React Test
        </h3>

        <p style={{
          lineHeight: '1.6',
          color: '#475569',
          marginBottom: '1rem'
        }}>
          This is a pure React version with zero external UI libraries.
          If this loads correctly, the issue is in Mantine or Next.js + Mantine interaction.
        </p>

        <p style={{
          color: '#059669',
          fontWeight: 'bold'
        }}>
          ✅ If you can see this green text, pure React + Next.js works!
        </p>
      </div>

      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h4 style={{
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          Debugging Information
        </h4>
        <ul style={{
          color: '#7f1d1d',
          paddingLeft: '1.5rem'
        }}>
          <li>No Mantine UI components</li>
          <li>No custom data providers</li>
          <li>No complex state management</li>
          <li>Pure React + Next.js only</li>
        </ul>
      </div>
    </div>
  );
}