import 'dotenv/config';

export default {
  expo: {
    name: "Shredd",
    slug: "shredd",
    version: "1.0.6",
    orientation: "portrait",
    icon: "./assets/icons/appstore.png",
    userInterfaceStyle: "automatic",
    scheme: "shredd",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0B0C0C"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.shredd.fasting",
      icon: "./assets/icons/Assets.xcassets/AppIcon.appiconset/1024.png",
      buildNumber: "3"
    },
    android: {
      icon: "./assets/icons/playstore.png",
      adaptiveIcon: {
        foregroundImage: "./assets/icons/playstore.png",
        backgroundColor: "#0B0C0C"
      },
      package: "com.shredd.fasting"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    linking: {
      scheme: "shredd"
    },
       extra: {
         // Environment variables for RevenueCat
         REVENUECAT_IOS_API_KEY: process.env.REVENUECAT_IOS_API_KEY,
         REVENUECAT_ANDROID_API_KEY: process.env.REVENUECAT_ANDROID_API_KEY,
         // Feature flags
         USE_MOCK_PAYWALL: process.env.USE_MOCK_PAYWALL ?? 'false',
         ENABLE_REVENUECAT: process.env.ENABLE_REVENUECAT ?? 'false', // Disabled by default until Apple approval
         // EAS project configuration
         eas: {
           projectId: "8e1eb5c8-0003-4921-b785-8fe974c1eb8e"
         }
       }
  }
};
