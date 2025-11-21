import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { Book } from './Book';
import { Controls } from './Controls';
import './index.css';

function App() {
  const [imageUrl, setImageUrl] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: 150,  // mm
    height: 220, // mm
    spineWidth: 25 // mm
  });
  const [openRatio, setOpenRatio] = useState(0); // 0 (closed) to 1 (fully open)
  const [showPages, setShowPages] = useState(true);
  const [bindingType, setBindingType] = useState('classic');
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Optional: Auto-calculate aspect ratio to guess dimensions?
      // For now, we just load it.
    }
  };

  // Scale factor: 100mm = 1 Three.js unit
  const SCALE = 100;

  return (
    <div className="app-container">
      <div className="canvas-container">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6}>
              <Book
                imageUrl={imageUrl}
                width={dimensions.width / SCALE}
                height={dimensions.height / SCALE}
                spineWidth={dimensions.spineWidth / SCALE}
                realWidth={dimensions.width}
                realHeight={dimensions.height}
                realSpine={dimensions.spineWidth}
                openRatio={openRatio}
                showPages={showPages}
                bindingType={bindingType}
              />
            </Stage>
            <OrbitControls makeDefault autoRotate={false} enableDamping={false} />
          </Suspense>
        </Canvas>
      </div>

      <Controls
        dimensions={dimensions}
        setDimensions={setDimensions}
        openRatio={openRatio}
        setOpenRatio={setOpenRatio}
        showPages={showPages}
        setShowPages={setShowPages}
        bindingType={bindingType}
        setBindingType={setBindingType}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}

export default App;
