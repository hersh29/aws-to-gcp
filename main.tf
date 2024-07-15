provider "google" {
  project = "aws-migration-429220"
  region  = "us-central1"
  credentials = file("/Downloads/aws-migration-429220-69599184f520.json")
}

resource "google_sql_database_instance" "instance" {
  name             = "postgres-gcp"
  database_version = "POSTGRES_16"
  region           = "us-central1"

  settings {
    tier = "db-f1-micro"
  }
}

resource "google_sql_database" "database" {
  name     = "postgres-gcp"
  instance = google_sql_database_instance.instance.name
}

resource "google_sql_user" "users" {
  name     = "postgres-gcp"
  instance = google_sql_database_instance.instance.name
  password = "CLf9TCacU8kVGgyYNyyM"
}
