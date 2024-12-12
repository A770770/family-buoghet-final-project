pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Test') {
            steps {
                script {
                    // Build all services using docker-compose
                    sh 'docker compose build'
                    
                    // Start the services in detached mode
                    sh 'docker compose up -d'
                    
                    // Show the logs
                    sh 'docker compose logs'
                }
            }
        }
    }

    post {
        always {
            script {
                // Cleanup: Stop and remove containers
                sh 'docker compose down'
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
