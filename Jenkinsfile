pipeline {
    agent any
    
    environment {
        DOCKER_HOST = 'unix:///var/run/docker.sock'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Test') {
            steps {
                script {
                    sh 'docker version'
                    sh 'docker-compose version'
                    sh 'docker-compose build'
                    sh 'docker-compose up -d'
                    sh 'docker-compose logs'
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker-compose down || true'
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
