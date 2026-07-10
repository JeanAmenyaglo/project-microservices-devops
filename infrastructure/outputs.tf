output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "ecr_user_service_url" {
  description = "ECR URL for user-service"
  value       = module.ecr.user_service_url
}

output "ecr_product_service_url" {
  description = "ECR URL for product-service"
  value       = module.ecr.product_service_url
}

output "ecr_frontend_url" {
  description = "ECR URL for frontend"
  value       = module.ecr.frontend_url
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}