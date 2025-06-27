import React from 'react'

export default function TestComponent({ title, subtitle }) {
  return (
    <div style={{
      width: '1200px',
      height: '630px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '48px',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {title || 'Test Component'}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '24px',
            opacity: '0.9'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
} 