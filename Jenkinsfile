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
        
        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                        # Install Docker
                        curl -fsSL https://get.docker.com -o get-docker.sh
                        sh get-docker.sh || true
                        
                        # Install Docker Compose
                        curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                        chmod +x /usr/local/bin/docker-compose
                    '''
                }
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
