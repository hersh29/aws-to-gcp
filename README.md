# aws-to-gcp
A scalable data pipeline to fetch, store, and process data from a public API into AWS environment and then migrating the same over to GCP.

The project involves creating two AWS Lambda functions using **Node.js**. The first function, `fetch-data`, fetches data from a public API and stores it in an S3 bucket. The second function, `process-data`, retrieves this data from the S3 bucket and stores it in an AWS RDS PostgreSQL database `university-database`.

**`AWS Services Used`**

**Lambda functions**

Purpose: To run serverless functions for fetching data from a public API `https://www.back4app.com/` and storing data into an RDS PostgreSQL database `university-database`.

**S3 bucket**

Purpose: `college-data-bucket` to store the fetched data in a JSON format from the `fetch-data` lambda.

**RDS (PostgreSQL DB Instance)**

Purpose: `university-database` PostgreSQL database that populates from the `universities.json` file in the `college-data-bucket`

**VPC**

Purpose: To create an isolated network for your AWS resources.
Additional Steps for Internet Access to VPC: (Internet Access is required for the VPC since the migration steps using Terraform require access via Internet)
VPC with a CIDR block of 172.30.0.0/16
Subnets (public and private)
Internet Gateway
Route Tables
Security Groups
NAT Gateways
VPC Endpoints

**IAM**

Purpose: To manage permissions and roles for the AWS services to interact securely.
