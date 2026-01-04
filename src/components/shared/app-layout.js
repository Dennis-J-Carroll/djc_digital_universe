import React from 'react'

const AppLayout = ({ children }) => {
  const metadata = {
    title: 'StudyGram',
    description: 'Instagram-like app for studying',
  }

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}

export default AppLayout