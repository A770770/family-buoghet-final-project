pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    curl -fsSL https://get.docker.com -o get-docker.sh
                    sh get-docker.sh
                    curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                    chmod +x /usr/local/bin/docker-compose
                '''
            }
        }

        stage('Build and Test') {
            steps {
                sh 'docker-compose build'
                sh 'docker-compose up -d'
                sh 'docker-compose logs'
            }
        }
    }

    post {
        always {
            sh 'docker-compose down || true'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
