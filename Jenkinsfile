pipeline {
    agent any

    tools {
        // Uses system Node.js and Git by default on Windows
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Stage 1: Checkout Source Code ==='
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '=== Stage 2: Install Dependencies ==='
                echo 'Installing root orchestration dependencies...'
                bat 'npm install --prefer-offline --no-audit'

                echo 'Installing server backend dependencies...'
                bat 'npm --prefix server install --prefer-offline --no-audit'

                echo 'Installing client frontend dependencies...'
                bat 'npm --prefix client install --prefer-offline --no-audit'
            }
        }

        stage('Backend Validation') {
            steps {
                echo '=== Stage 3: Backend Validation ==='
                echo 'Checking backend syntax, models, controllers, and services...'
                bat 'node --check server/src/server.js'
                bat 'node --check server/src/app.js'
                bat 'node --check server/src/config/db.js'
                bat 'node --check server/src/controllers/authController.js'
                bat 'node --check server/src/controllers/attendanceController.js'
                bat 'node --check server/src/controllers/studentController.js'
                bat 'node --check server/src/controllers/adminController.js'
                echo 'Backend validation checks passed.'
            }
        }

        stage('Frontend Validation') {
            steps {
                echo '=== Stage 4: Frontend Validation ==='
                echo 'Checking frontend configuration and syntax...'
                bat 'node --check client/vite.config.js'
                bat 'node --check client/tailwind.config.js'
                bat 'node --check client/postcss.config.js'
                echo 'Frontend validation checks passed.'
            }
        }

        stage('Build') {
            steps {
                echo '=== Stage 5: Production Build ==='
                echo 'Generating optimized frontend production bundle with Vite...'
                bat 'npm --prefix client run build'
            }
        }
    }

    post {
        always {
            echo '=== Phase 6: Pipeline Execution Completed ==='
        }
        success {
            echo 'SUCCESS: Continuous Integration pipeline passed all stages.'
        }
        failure {
            echo 'FAILURE: One or more pipeline stages failed.'
        }
    }
}
