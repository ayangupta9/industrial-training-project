const { default: axios } = require('axios')

async function saveInterviewData (data) {
  const endpoint = 'https://api.rysyl.com/v1/add-to-interview'
  try {
    const response = await axios.post(endpoint, data)
    return response.data
  } catch (e) {
    console.error(e)
    return false
  }
}

module.exports = {
  saveInterviewData
}
