# 🧪 Virtual Science Lab - Interactive Learning Platform

A comprehensive full-stack virtual laboratory website that simulates real-life science experiments in Chemistry, Physics, and Biology. Built with React, TypeScript, and Firebase for an immersive educational experience.

## ✨ Features

### 🧬 Multi-Lab Experience
- **Chemistry Lab**: Virtual workspace with interactive equipment, chemical reactions, pH testing, and safety protocols
- **Physics Lab**: Circuit building, Ohm's Law calculations, projectile motion simulations, and wave physics
- **Biology Lab**: Virtual microscope, DNA analysis, photosynthesis simulation, and cellular structure exploration

### 🔬 Interactive Simulations
- Real-time chemical reaction animations with color changes and bubble effects
- Dynamic circuit diagrams with live voltage, current, and resistance calculations
- 3D-style cell visualization with clickable organelles and detailed descriptions
- Projectile motion calculator with animated trajectory visualization

### 📊 Progress Tracking
- Personal experiment history with detailed results
- Achievement system with unlockable badges
- Performance analytics and score trending
- Lab-specific progress tracking

### 🔐 Authentication & Data Management
- Google Sign-in integration via Firebase Auth
- Secure user data storage in Firestore
- Real-time synchronization across devices
- Privacy-focused user management

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Styling**: Modern gradient themes with dark mode support

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd virtual-science-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Google Sign-in provider
   - Create a Firestore database in test mode
   - Copy `.env.example` to `.env` and add your Firebase configuration

4. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🧪 Lab Experiments

### Chemistry Lab
- **Acid-Base Reactions**: Mix HCl and NaOH to observe neutralization
- **pH Testing**: Real-time pH calculation and color indicators  
- **Molecular Interactions**: Visual representation of chemical bonds
- **Safety Protocols**: Built-in warnings for dangerous combinations

### Physics Lab  
- **Circuit Analysis**: Drag-and-drop components with Ohm's Law calculations
- **Projectile Motion**: Adjustable angle, velocity, and height parameters
- **Wave Physics**: Interactive wave simulations (coming soon)
- **Electrical Components**: Batteries, resistors, and light bulbs with realistic behavior

### Biology Lab
- **Virtual Microscopy**: Examine plant, animal, and bacterial cells at various magnifications
- **DNA Analysis**: Transcription and translation simulation with codon tables
- **Photosynthesis**: Environmental factors affecting oxygen and glucose production
- **Cellular Structure**: Interactive organelles with detailed descriptions

## 📱 Responsive Design

- **Mobile-First**: Optimized for smartphones and tablets
- **Progressive Enhancement**: Works across all screen sizes
- **Touch-Friendly**: Intuitive touch interactions for mobile users
- **Accessible**: WCAG compliant with keyboard navigation support

## 🏆 Achievement System

Students can unlock achievements by:
- Completing their first experiment
- Mastering specific lab techniques
- Achieving high scores consistently
- Exploring all three laboratory disciplines

## 📈 Progress Analytics

- **Experiment History**: Detailed log of all completed experiments
- **Score Tracking**: Performance trends over time
- **Lab Mastery**: Progress indicators for each scientific discipline
- **Time Investment**: Learning hours and engagement metrics

## 🔐 Security & Privacy

- **Firebase Security Rules**: Proper data access controls
- **User Data Protection**: GDPR-compliant data handling
- **Secure Authentication**: Google OAuth integration
- **Data Encryption**: All communications encrypted in transit

## 🌟 Educational Benefits

- **Safe Learning Environment**: No physical safety concerns
- **Unlimited Resources**: Virtual chemicals and equipment never run out
- **Instant Feedback**: Immediate results and explanations
- **Self-Paced Learning**: 24/7 access to all laboratory experiments
- **Cost-Effective**: No expensive lab equipment or materials needed

## 🎨 Design Philosophy

- **Apple-Level Aesthetics**: Clean, professional, and intuitive interface
- **Science-Themed**: Color-coded labs with appropriate iconography
- **Micro-Interactions**: Subtle animations enhance user engagement
- **Visual Hierarchy**: Clear information architecture for easy navigation

## 📚 Future Enhancements

- Advanced Physics simulations (optics, thermodynamics)
- 3D molecular modeling for Chemistry
- Human anatomy explorer for Biology
- Collaborative experiments for group learning
- Virtual reality (VR) integration
- AI-powered experiment suggestions

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions about the virtual labs, please:
- Check the documentation
- Submit an issue on GitHub
- Contact our support team

---

**Built with ❤️ for science education and interactive learning**