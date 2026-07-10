terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }

  # Remote state stored in S3 so it's shared and safe
  # We will create this S3 bucket manually before running terraform init
  backend "s3" {
    bucket         = "microservices-terraform-state-jean"
    key            = "production/terraform.tfstate"
    region         = "ca-central-1"
    use_lockfile   = true
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "microservices-app"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "jeanamenyaglo"
    }
  }
}