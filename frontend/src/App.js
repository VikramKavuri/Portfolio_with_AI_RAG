import React from 'react';
import Hero3D from './components/Hero3D';
import './App.css'; // Keeps your global Tailwind/CSS styles

function App() {
  // Simple handler to test the "Scroll" button interaction
  const handleScrollStart = () => {
    console.log("User clicked 'Scroll to Decode' - Transition logic will go here in Phase 2");
  };

  return (
    // Main container with the deep void background color
    <div className="bg-[#0a0a0f] min-h-screen text-white overflow-hidden">
      
      {/* Render ONLY the 3D Hero for testing.
        Passing handleScrollStart to test the bottom click trigger.
      */}
      <Hero3D onStart={handleScrollStart} />

    </div>
  );
}

export default App;
