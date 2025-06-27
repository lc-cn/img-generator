import React from 'react'

// 基础卡片组件
export function Card({ title, subtitle, children, style = {} }: {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      width: '1200px',
      height: '630px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      ...style
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        color: 'white'
      }}>
        {title && (
          <h1 style={{
            fontSize: '48px',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p style={{
            fontSize: '24px',
            opacity: '0.9',
            marginBottom: '20px'
          }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

// 博客文章组件
export function BlogPost({ title, author, date, excerpt }: {
  title: string
  author: string
  date: string
  excerpt: string
}) {
  return (
    <div style={{
      width: '1200px',
      height: '630px',
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '60px',
      fontFamily: 'system-ui, sans-serif',
      color: 'white'
    }}>
      <div style={{
        borderLeft: '4px solid #007acc',
        paddingLeft: '30px'
      }}>
        <h1 style={{
          fontSize: '42px',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          {title}
        </h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px',
          fontSize: '18px',
          opacity: '0.8'
        }}>
          <span>By {author}</span>
          <span style={{ margin: '0 10px' }}>•</span>
          <span>{date}</span>
        </div>
        <p style={{
          fontSize: '24px',
          lineHeight: '1.5',
          opacity: '0.9'
        }}>
          {excerpt}
        </p>
      </div>
    </div>
  )
}

// 产品展示组件
export function ProductCard({ name, price, description, image }: {
  name: string
  price: string
  description: string
  image?: string
}) {
  return (
    <div style={{
      width: '1200px',
      height: '630px',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '40px'
      }}>
        {image && (
          <div style={{
            width: '200px',
            height: '200px',
            background: '#f0f0f0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#666'
          }}>
            {image}
          </div>
        )}
        <div>
          <h1 style={{
            fontSize: '36px',
            marginBottom: '10px',
            color: '#333'
          }}>
            {name}
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {description}
          </p>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ff6b6b'
          }}>
            {price}
          </div>
        </div>
      </div>
    </div>
  )
}

// 社交媒体卡片组件
export function SocialCard({ platform, username, content, avatar }: {
  platform: string
  username: string
  content: string
  avatar?: string
}) {
  const platformColors = {
    twitter: '#1DA1F2',
    facebook: '#4267B2',
    instagram: '#E4405F',
    linkedin: '#0077B5'
  }

  const bgColor = platformColors[platform as keyof typeof platformColors] || '#333'

  return (
    <div style={{
      width: '1200px',
      height: '630px',
      background: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '800px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {avatar && (
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f0f0f0',
              marginRight: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#666'
            }}>
              {avatar}
            </div>
          )}
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {username}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#666',
              textTransform: 'capitalize'
            }}>
              {platform}
            </div>
          </div>
        </div>
        <p style={{
          fontSize: '24px',
          lineHeight: '1.4',
          color: '#333'
        }}>
          {content}
        </p>
      </div>
    </div>
  )
} 