require("dotenv").config()

// let data = 

fetch('https://assessment.ksensetech.com/api/submit-assessment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.YOUR_API_KEY
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => {
  console.log('Assessment Results:', data);
});