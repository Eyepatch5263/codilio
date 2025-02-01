@Library("Shared") _

pipeline {
    agent any
    parameters {
        string (name: "DOCKER_IMAGE_TAG", defaultValue: "", description: "Docker Image Tag")
    }
    environment {
        SONAR_HOME = tool "sonar"
    }
    stages {
        stage("Starting...") {
            steps {
                script {
                    hello()
                }
            }
        }
        stage ("Validate Paramters"){
            steps {
                script {
                    if (params.DOCKER_IMAGE_TAG == "") {
                        error("Docker Image Tag is required")
                    }
                }
            }
        }
        stage ("Workspace Cleanup"){
            steps {
                cleanWs()
            }
        }
        stage("Cloning Code") {
            steps {
                script {
                    clone_with_cred("codilio","main")
                }
            }
        }
        stage("Trivy: FIlesystem Scan") {
            steps {
                script {
                    trivy_scan()
                }
            }
        }
        stage("OWASP: Dependency Check") {
            steps {
                script {
                    owasp_dependency()
                }
            }
        }
        // in the sonar_analysis function, the first parameter is the name of the SonarQube server you have set up it is the name you have given under the manage_jenkins>Tools>SonarQube scanner installation
        // the second parameter is the name of the project you want to perform sonarqube
        // the third parameter is the name of the project_key this should be unique in the sonarqube sever from others(avoid using _ or -)
        stage("SonarQube: Code Analysis") {
            steps {
                script {
                    sonarqube_analysis("sonar","codilio","codilio")
                }
            }
        }
        stage ("SonarQube: Code Quality Gate"){
            steps {
                script{
                waitForQualityGate abortPipeline: false, credentialsId: "sonar"
                }
            }
        }
        stage("Build Docker Image") {
            steps {
                script {
                    docker_build("codilio-beta", "v1.0", "eyepatch5263")
                }
            }
        }
        stage("Push to Docker Hub") {
            steps {
                script {
                    docker_push("codilio-beta", "v1.0", "eyepatch5263")
                }
            }
        }
        stage("Starting Docker Container") {
            steps {
                script {
                    docker_compose()
                }
            }
        }
        
    }
    post {
        success {
            script {
                sh 'ls -la'
            }
            echo "Pipeline executed successfully"
            archiveArtifacts artifacts: "*.xml", followSymlinks: false
            build job: "Codilio-CD", parameters: [
                string(name: "DOCKER_IMAGE_TAG", value: "${params.DOCKER_IMAGE_TAG}")
            ]
        }
    }
}