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
                        # Add jenkins user to sudoers
                        echo "jenkins ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/jenkins || true
                        
                        # Install Docker with sudo
                        curl -fsSL https://get.docker.com -o get-docker.sh
                        sudo sh get-docker.sh
                        sudo usermod -aG docker jenkins
                        
                        # Install Docker Compose with sudo
                        sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                        sudo chmod +x /usr/local/bin/docker-compose
                    '''
                }
            }
        }
        
        stage('Build and Test') {
            steps {
                script {
                    sh 'sudo docker version'
                    sh 'sudo docker-compose version'
                    sh 'sudo docker-compose build'
                    sh 'sudo docker-compose up -d'
                    sh 'sudo docker-compose logs'
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'sudo docker-compose down || true'
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
