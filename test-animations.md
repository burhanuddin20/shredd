# 🎬 Animation Testing Guide

## How to Test the Animations

### 1. **Start the Development Server**

```bash
cd /Users/burhanuddin/Downloads/shredd
npx expo start
```

### 2. **Open on Device/Simulator**

- **iOS**: Press `i` in terminal or scan QR code with Camera app
- **Android**: Press `a` in terminal or scan QR code with Expo Go app
- **Web**: Press `w` in terminal

### 3. **Test Animation Triggers**

#### **🏠 Home Screen Testing**

1. **Open the app** - you'll see the Home screen
2. **Scroll down** to see the "Animation Demo" section
3. **Tap "🎖️ TRIGGER LEVEL UP"** - Watch the level up animation with:

   - Insignia scaling and rotation
   - Glowing aura pulse effect
   - Confetti burst
   - "LEVEL UP!" text with rank and XP

4. **Tap "🏅 TRIGGER ACHIEVEMENT"** - Watch the achievement animation with:
   - Badge fade-in and scale-up
   - Glowing ring expansion
   - "ACHIEVEMENT UNLOCKED" text
   - Confetti effect

#### **👤 Profile Screen Testing**

1. **Navigate to Profile tab** (bottom navigation)
2. **Tap any achievement badge** - Triggers achievement animation
3. **XP Progress Bar** - Automatically animates when level changes

### 4. **What You Should See**

#### **Level Up Animation:**

- ✅ Modal overlay with dark background
- ✅ Rank insignia scales up and rotates slightly
- ✅ Multiple glowing rings pulse outward
- ✅ Confetti particles burst in gold/green colors
- ✅ "LEVEL UP!" text slides up
- ✅ Shows new rank and XP earned
- ✅ Auto-closes after 4 seconds

#### **Achievement Animation:**

- ✅ Modal overlay with dark background
- ✅ Achievement badge fades in and scales up
- ✅ Glowing ring expands and disappears
- ✅ "ACHIEVEMENT UNLOCKED" text slides up
- ✅ Shows achievement name and description
- ✅ Confetti particles in bronze/silver/gold
- ✅ Auto-closes after 3 seconds

#### **XP Progress Bar:**

- ✅ Smooth filling animation
- ✅ Level and XP values scale when leveling up
- ✅ Progress bar resets and fills when leveling up

### 5. **Troubleshooting**

#### **If animations don't work:**

1. **Check console** for any errors
2. **Restart Metro** - Press `r` in terminal
3. **Clear cache** - Press `c` in terminal
4. **Check dependencies** - Make sure all packages installed

#### **If confetti doesn't show:**

- This is normal on web - confetti works best on mobile devices
- Try testing on iOS/Android simulator or device

#### **If animations are choppy:**

- Close other apps to free up memory
- Test on a physical device for best performance

### 6. **Production Notes**

- **Remove AnimationDemo** component before production
- **Integrate triggers** with actual game logic (fast completion, XP gains)
- **Add sound effects** using react-native-sound or expo-av
- **Customize timing** and effects based on user feedback

### 7. **Next Steps**

- Test on different devices and screen sizes
- Add haptic feedback for better UX
- Integrate with actual fasting completion logic
- Add more achievement types and animations

---

**Happy Testing! 🚀**
