import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const s3 = new AWS.S3();

const API_CONFIG = {
    url: 'https://parseapi.back4app.com/classes/Usuniversitieslist_University',
    headers: {
        'X-Parse-Application-Id': 'WPoPapCSspiuqzGv2mwbseL7vMY5VUN1xlrAbKee',
        'X-Parse-REST-API-Key': 'h9oo2SMR1nqQQQPQEeyCMYc5Mn5TlF2WbW0d3XLL',
    }
};

export const handler = async () => {
    try {
        // Fetch data from the API with pagination
        let allUniversities = [];
        let totalCount = 0;
        let skip = 0;
        const limit = 100;

        do {
            const response = await fetch(API_CONFIG.url + `?count=1&skip=${skip}&limit=${limit}&include=state,state.region`, {
                headers: API_CONFIG.headers
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data from API (${response.status}): ${response.statusText}`);
            }

            const data = await response.json();
            const universities = data.results;
            totalCount = data.count;

            allUniversities = [...allUniversities, ...universities];
            skip += limit;
        } while (skip < totalCount);

        // Save fetched data to S3
        const s3Params = {
            Bucket: 'college-data-bucket',
            Key: 'universities.json',
            Body: JSON.stringify(allUniversities),
            ContentType: 'application/json'
        };
        await s3.putObject(s3Params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify('Data fetched and inserted successfully!')
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred', error: error.message })
        };
    }
};
