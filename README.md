# 📐 Facebook Cover Photo Sizer (Desktop & Mobile Perfect)

A client-side web application and interactive sizing tool designed to solve Facebook's cover photo cropping dilemma across desktop computers and smartphones.

---

## 🎯 The Facebook Cover Problem Explained

Facebook displays cover photos at different aspect ratios depending on the device:
- **Desktop / PC**: Displays at **820 × 312 px** (~2.63:1 ratio). Facebook crops **24px off the top and 24px off the bottom** (48px each at 2x resolution).
- **Mobile Phones**: Displays at **640 × 360 px** (16:9 ratio). Facebook crops **90px off the left and 90px off the right** (180px each at 2x resolution).

### The Golden Formula: 1640 × 720 px Canvas
By designing on a **1640 × 720 px** base canvas and keeping all critical content (logos, text, headlines, faces) inside the centered **1280 × 624 px Universal Safe Zone**, your cover photo will look complete and sharp on both computers and phones without text cutoffs.

| Zone | Dimensions (2x Hi-Res) | Where Visible |
| :--- | :--- | :--- |
| **Universal Safe Zone** | **1280 × 624 px** (Centered) | **Visible on ALL devices** (PC, Phone, Tablet) |
| **Top & Bottom Strips** | 48px top, 48px bottom | Visible on **Mobile only** (Cropped on PC) |
| **Left & Right Wings** | 180px left, 180px right | Visible on **PC only** (Cropped on Mobile) |
| **Full Canvas** | **1640 × 720 px** | Standard export canvas |

---

## 🚀 Features

1. **Interactive Canvas Editor**:
   - **Smooth Drag & Pan**: Click and drag with mouse or touch to reposition your image.
   - **Precision Zoom**: Slider, +/- buttons, or mouse wheel zoom centered on your cursor.
   - **Quick Alignment Buttons**:
     - `Fill Cover`: Expands image to cover the entire 1640 × 720 canvas.
     - `Fit Safe Area`: Shrinks/centers image to fit entirely within the 1280 × 624 safe zone.
     - `Center`: Re-centers the image.
     - `Rotate 90°` & `Flip Horizontal / Vertical`.

2. **Smart Background Fill (Letterbox Handling)**:
   - If an uploaded photo doesn't fill the canvas, choose from:
     - **✨ Blurred Image (Smart Fill)**: Creates a blurred backdrop from your photo.
     - **🎨 Solid Color**: Color picker with hex codes.
     - **🌈 Subtle Dark Gradient**: Elegant dark slate gradient.
     - **⬜ Transparent**: For transparent PNG exports.

3. **Visual Safe Zone Guides**:
   - 🟢 **Universal Safe Zone**: Centered boundary box showing the guaranteed visible area.
   - 🟠 **Desktop Cutoff Warning**: Striped overlay showing the 48px top & bottom areas cropped on PC.
   - 🔵 **Mobile Cutoff Warning**: Striped overlay showing the 180px left & right areas cropped on phones.
   - 👤 **Profile Picture Overlap Guides**: Preview where circular avatars sit on Personal Profiles vs Business Pages.
   - 📐 **Rule of Thirds Grid**: Composition guides.
   - **Guide Opacity Slider**: Adjust overlay transparency from 15% to 100%.

4. **Live Device Simulation**:
   - **💻 Desktop Mockup Tab**: Realistic Facebook PC interface preview.
   - **📱 Mobile Mockup Tab**: Realistic iPhone / Android smartphone frame with mobile Facebook layout.
   - **⚡ Side-by-Side Dual View**: Live side-by-side comparison to test PC and Mobile simultaneous appearance.

5. **Export & Formats**:
   - High-Res 2x (1640 × 720 px) — Recommended by Meta for zero pixelation.
   - Standard 1x (820 × 360 px).
   - Dedicated Desktop Crop (1640 × 624 px).
   - Dedicated Mobile Crop (1280 × 720 px).
   - Formats: PNG (lossless), JPG (with quality slider), WebP.
   - Direct Download & One-Click "Copy to Clipboard".

---

## 💻 How to Run

### Method 1: Direct File
Simply double-click [`index.html`](file:///C:/Users/Total/.gemini/antigravity/scratch/fb-cover-sizer/index.html) in your browser. No build steps or node modules required!

### Method 2: Local Web Server
You can also run a local server:
```bash
cd "C:\Users\Total\.gemini\antigravity\scratch\fb-cover-sizer"
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.
