import 'dotenv/config';

export default {
  expo: {
    name: "Shredd",
    slug: "shredd",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0B0C0C"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.shredd.fasting"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png"
      },
      package: "com.shredd.fasting"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Environment variables for RevenueCat
      REVENUECAT_IOS_API_KEY: process.env.REVENUECAT_IOS_API_KEY,
      REVENUECAT_ANDROID_API_KEY: process.env.REVENUECAT_ANDROID_API_KEY,
      // EAS project configuration
      eas: {
        projectId: "8e1eb5c8-0003-4921-b785-8fe974c1eb8e"
      }
    }
  }
};
