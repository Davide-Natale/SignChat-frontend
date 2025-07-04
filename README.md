# SignChat-Frontend 

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#introduction">Introduction</a></li>
        <li><a href="#technologies">Technologies</a></li>
        <li><a href="#architecture">Architecture</a></li>
        <li><a href="#api-documentation">API Documentation</a></li>
      </ul>
    </li>
    <li>
      <a href="#get-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#project-configuration">Project Configuration</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#build-the-app-locally">Build the app locally</a></li>
        <li><a href="#build-the-app-remotely">Build the app remotely</a></li>
      </ul>
    </li>
  </ol>
</details>

## **About The Project**

### Introduction
There is a big problem today: deaf and non-deaf people often struggle to communicate.
This project aims to bridge this communication gap by developing a mobile application that incorporate an advanced sign language recognition algorithm, translating gestures into speech, and vice versa, making communication truly inclusive. By addressing this unmet need, we are not just enhancing accessibility but fostering a more connected and empathetic world.

The project consists of two main repositories:

- __[SignChat-backend](https://github.com/Davide-Natale/SignChat-backend.git)__ - A backend architecture managed through **Docker Compose**

- __[SignChat-frontend](https://github.com/Davide-Natale/SignChat-frontend.git)__ - A **React Native** mobile application written in **Typescript** based on **Expo**

### Technologies
The technologies used to develop this project are:
- `React Native(Expo)` → Mobile Application
- `Node.js + Express` → Backend API + Media Server
- `PostgreSQL + Redis` → Database
- `Python` → Translating microservices
- `Docker` → Orchestration

## **Get Started**

### Prerequisites
Before running the project, make sure the following requirements are met:

- **[Node.js](https://nodejs.org/)** (v22+)

- A **[Firebase Project](https://firebase.google.com/)**, used for FCM

- **EAS CLI**, used to generate remote builds:
  ```
  npm install -g eas-cli
  ```

- **Java Development Kit** (recommended: `JDK 17`), required for local builds

- An **[Expo Developer Account](https://expo.dev)**, required for remote builds with EAS

- **[Android Studio](https://developer.android.com/studio?hl=it)** (Optional), only needed if you want to use the Android Emulator.  
  For setup instructions with Expo, refer to the [official guide](https://docs.expo.dev/workflow/android-studio-emulator/)


### Project Configuration
Before using this project, make sure to configure it properly by following the instructions below:

1. **Clone the repository and install dependencies**

    ```
    git clone https://github.com/Davide-Natale/SignChat-frontend.git
    cd SignChat-frontend
    npm install
    ```

2. **Initialize EAS with your Expo Account**

    1. Log in with your Expo account, if you haven't already:
        ```
        eas login
        ```
      
    2. Remove old project linkage from `app.json`:  
        Open [`app.json`](app.json) and delete the following fields, if present
        ```
        "owner": <old_owner>,
        
        "eas": {
          "projectId": <old_project_id>
        }
        
        "updates": {
          "url": <old_url>
        }
        ```

    3. Initialize the project with **EAS**:
        ```
        eas init
        ```
        During initialization:
        - Select the correct **Expo** account, if needed
        - Choose to **Create a new project** 

        This will create a new project associated with your **Expo** account and link it with this project by regenerating the previously removed fields with correct information

    4. Generate `Android Keystore` (Optional):  
        This step is needed only if any android build haven't been generate yet, by running the following command:
        ```
        eas build --platform android --profile production
        ```
        You will be asked to generate a new **Android Keystore**, please answer `Yes`. This will start a new build generation after that Android Keystore has been generated, you can even cancel and remove this build from **Expo Dashboard**, since is not needed to complete it

    5. Generate **Firebase Service Account Key**:
        - Go to the **[Firebase Console](https://console.firebase.google.com/)**
        - Select your project and navigate to **Project Settings**
        - Move to the **Service accounts** tab
        - Click **Generate new private key**, this will download a `JSON` file
        - Move it to the **root directory** of the project

    6. Set up **Firebase Cloud Messagging (FCM)** with **EAS**:
        - Run the following command

          ```
          eas credentials
          ```
        - Select **Android**
        - Choose **production**
        - Select **Google Service Account**
        - Choose **Manage your Google Service Account Key for Push Notifications (FCM V1)**
        - Select **Set up a Google Service Account Key for Push Notifications (FCM V1)**
        - Choose **Upload a new service account key**
        - The command must automatically identify the `JSON` file placed in the root directory in the previous step; otherwise provide the path of `JSON` file previously downloaded
        - Once this is done, you can delete the `JSON` file, as it contains sensible data and should not be committed to `Version Control`

    7. Get `SHA-1 certificate` from **Expo Dashboard**:
        - Go to your **[Expo Dashboard](https://expo.dev)**
        - Select your project and navigate to **Credentials**
        - Select **Android**
        - Copy the **SHA-1 Fingerprint** listed in the `Android Keystore` section, you will use this in the next step

    8. Configure `google-service.json` with **Firebase**:
        - Go to the **[Firebase Console](https://console.firebase.google.com/)**
        - Select your project and navigate to **Project Settings**
        - Move to the **General** tab
        - Scroll to the **Your App** section and click **"Add app" > Android**
        - Enter the **Android package name**, this must match the one in [`app.json`](app.json):
          ```
          "android": {
            "package": "it.polito.SignChat"
          }
          ```
        - Provide the **SHA-1 certificate** copied in the previous step
        - Download `google-service.json` file and place it in the **root directory** of the project
        - Ensure that [`app.json`](app.json) includes the following:
          ```
          "android": {
            "googleServicesFile": "./google-services.json"
          }
          ```
3. **Update SERVER URL**  
  In order to correctly use your backed remember to update the `SERVER URL` before generating a build in the following files:
    - **[ContactsCard.tsx](./components/ContactsCard.tsx)**
    - **[axiosInstance.ts](./utils/axiosInstance.ts)**
    - **[webSocket.ts](./utils/webSocket.ts)**

## **Usage**
In order to build and use this mobile application, please refer to the commands described below:

### Build the app locally
To test the mobile app on Android Emulator or on a physical device via Debug USB

- Prebuild the project:
    ```
    npx expo prebuild
    ```

- Run the app:
    ```
    npx expo run:android
    ```

- Run the app, selecting a specific physical device or emulator: 
    ```
    npx expo run:android --device
    ```

### Build the app remotely
- Use `EAS` to generate a production build (APK):

    ```
    eas build --platform android --profile production
    ```
    After completion the `APK` file will be available for download on your **Expo Dashboard**.  
    You can even configure different profiles for each platform (android/ios) by modifing the [`eas.json`](eas.json) file

- App updates using `EAS`:  
    You can publish updates to your app without creating a new build using the following command
    ```
    eas update
    ```
    Only JavaScript changes are supported, native modification require a new build to be applied

<p align="right">
  <a href="#top">
    <img src="assets/icons/arrow-up-circle.svg" alt="Back to top" style="width: 20px; height: 20px;">
  </a>
</p>