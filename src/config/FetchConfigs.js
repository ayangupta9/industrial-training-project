let SERVER_BASE_URL

if (process.env.NODE_ENV === 'production') {
  SERVER_BASE_URL = 'https://session.rysyl.com'
} else {
  SERVER_BASE_URL = 'http://localhost:8080'
}

export { SERVER_BASE_URL }
