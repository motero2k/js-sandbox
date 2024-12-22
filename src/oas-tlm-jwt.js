// Status: WORKING
import axios from 'axios';
import jwt from 'jsonwebtoken';

const token = jwt.sign({ password: 'oas-telemetry-password' }, 'oas-telemetry-secret');

// Configure Axios to send the token in the headers of the request
axios.get('http://localhost:8080/telemetry/list', {
    headers: {
        'Cookie': `apiKey=${token}`
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.error('Error making the request:', error);
});
