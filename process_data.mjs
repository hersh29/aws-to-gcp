import pkg from 'pg';
import AWS from 'aws-sdk';

const { Client } = pkg;
const s3 = new AWS.S3();

export const handler = async () => {
    const DB_CONFIG = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
        }
    };
    const client = new Client({
        ...DB_CONFIG,
        database: 'postgres'
    });

    try {
        // Connect to PostgreSQL
        await client.connect();

        // Check if the target database exists
        const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`;
        const checkDbResult = await client.query(checkDbQuery);

        if (checkDbResult.rowCount === 0) {
            // Create the target database if it does not exist
            const createDbQuery = `CREATE DATABASE "${process.env.DB_NAME}"`;
            await client.query(createDbQuery);
            console.log(`Database ${process.env.DB_NAME} created successfully`);
        }

        // Reconnect to the target database
        await client.end();
        const targetClient = new Client({
            ...DB_CONFIG,
            database: process.env.DB_NAME
        });

        await targetClient.connect();
        console.log(`Connected to the target database ${process.env.DB_NAME} successfully`);

        // Create the universities table if it does not exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS universities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                state_name VARCHAR(255),
                region_name VARCHAR(255)
            );
        `;
        await targetClient.query(createTableQuery);
        console.log('Universities table ensured');

        // Fetch data from S3
        const s3Params = {
            Bucket: 'college-data-bucket',
            Key: 'universities.json'
        };
        const s3Data = await s3.getObject(s3Params).promise();
        console.log("S3");
        console.log(s3Data);
        const allUniversities = JSON.parse(s3Data.Body.toString('utf-8'));

        // Insert data into PostgreSQL
        await Promise.all(allUniversities.map(async (uni) => {
            const insertSQL = `INSERT INTO universities (name, state_name, region_name) VALUES ($1, $2, $3)`;
            const values = [uni.name, uni.state.name, uni.state.region.name];
            await targetClient.query(insertSQL, values);
        }));

        console.log('Data inserted into the database successfully');

        await targetClient.end();

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