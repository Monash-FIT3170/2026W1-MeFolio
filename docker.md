## Dev Setup (Docker)

### Step 1 - Install Docker
Install Docker desktop

### Step 2 - Download the Docker Folder
Download and unzip the docker folder

### Step 3 - Open the Docker Folder
Open the docker folder in vscode and open a new terminal in the same directory

### Step 4 - Open the Compose the Docker Container in VScode
Install "Dev Containers" extension in VS Code, and then do the following:

Cmd + Shift + P → Reopen in Container

### Step 5 - Create Meteor App/MongoDB Connection
You should now be in the linux docker container 'app'.
open vscode terminal (this will now be inside the docker container), then run the following in order:

meteor create my-app (Only first time on creation)
cd my-app
meteor npm install
meteor run

Your meteor app should now be accessible in your browser on http://localhost:3000/

Your MongoDB database should be accessible from a separate docker container via MongoDB Compass on the following connect string: mongodb://localhost:27017

### Step 6 - Leave the devcontainer accessing the Docker Container
Once you are finished developing and wish to leave your development container, please use:

Cmd + Shift + P → Reopen folder locally

### (Optional) Step 7 - Kill/pause Docker containers to free Memory
After development has been completed you may use one of the following:

docker compose down (reccommended) -> Closes Docker containers, requiring them to be reopened (done by dev containers, reopen in dev container)

docker compose stop -> Pauses Docker containers, allowing them to be restarted quickly

Do Nothing -> Docker containers are actively running and will continue to use memory