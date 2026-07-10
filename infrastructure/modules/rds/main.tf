variable "project_name"          { type = string }
variable "vpc_id"                { type = string }
variable "private_subnet_ids"    { type = list(string) }
variable "eks_security_group_id" { type = string }
variable "db_instance_class"     { type = string }

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.project_name}-rds-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_db_instance" "users" {
  identifier        = "${var.project_name}-users-db"
  engine            = "postgres"
  engine_version    = "16.9"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "users_db"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]

  multi_az                = false
  publicly_accessible     = false
  deletion_protection     = false
  skip_final_snapshot     = true
  backup_retention_period = 7

  tags = {
    Name = "${var.project_name}-users-db"
  }
}

resource "aws_db_instance" "products" {
  identifier        = "${var.project_name}-products-db"
  engine            = "postgres"
  engine_version    = "16.9"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "products_db"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]

  multi_az                = false
  publicly_accessible     = false
  deletion_protection     = false
  skip_final_snapshot     = true
  backup_retention_period = 7

  tags = {
    Name = "${var.project_name}-products-db"
  }
}

output "users_db_endpoint"    { value = aws_db_instance.users.endpoint }
output "products_db_endpoint" { value = aws_db_instance.products.endpoint }
output "db_endpoint"          { value = aws_db_instance.users.endpoint }