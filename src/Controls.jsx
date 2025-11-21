import React from 'react';

export function Controls({
    dimensions,
    setDimensions,
    openRatio,
    setOpenRatio,
    showPages,
    setShowPages,
    bindingType,
    setBindingType,
    coverColor,
    setCoverColor,
    onImageUpload
}) {
    const handleWheel = (e, key, min, max) => {
        // Prevent page scroll when hovering sliders
        e.target.blur(); // Remove focus to prevent native keyboard interaction conflict if needed, but mainly just handle state

        // Calculate new value
        const step = 1;
        const delta = e.deltaY < 0 ? step : -step; // Scroll up (negative delta) -> increase, Scroll down -> decrease

        setDimensions(prev => {
            const newValue = Math.min(Math.max(prev[key] + delta, min), max);
            return { ...prev, [key]: newValue };
        });
    };

    const handleOpenRatioWheel = (e) => {
        e.target.blur();
        const step = 0.01;
        const delta = e.deltaY < 0 ? step : -step;
        setOpenRatio(prev => Math.min(Math.max(prev + delta, 0), 1));
    };

    return (
        <div className="controls-container">
            <h1>TM 3DBOOK CLZ</h1>

            <div className="control-group">
                <label className="file-upload">
                    Upload Cover (Back + Spine + Front)
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                    />
                </label>
            </div>

            <div className="control-group">
                <label>
                    Cover Color:
                    <input
                        type="color"
                        value={coverColor}
                        onChange={(e) => setCoverColor(e.target.value)}
                        style={{ width: '100%', height: '35px', cursor: 'pointer', marginTop: '5px' }}
                    />
                </label>
            </div>

            <div className="control-group">
                <label>
                    Width: {dimensions.width} mm
                    <input
                        type="range"
                        min="100"
                        max="435"
                        step="1"
                        value={dimensions.width}
                        onChange={(e) => setDimensions(d => ({ ...d, width: parseFloat(e.target.value) }))}
                        onWheel={(e) => handleWheel(e, 'width', 100, 435)}
                    />
                </label>
            </div>

            <div className="control-group">
                <label>
                    Height: {dimensions.height} mm
                    <input
                        type="range"
                        min="100"
                        max="605"
                        step="1"
                        value={dimensions.height}
                        onChange={(e) => setDimensions(d => ({ ...d, height: parseFloat(e.target.value) }))}
                        onWheel={(e) => handleWheel(e, 'height', 100, 605)}
                    />
                </label>
            </div>

            <div className="control-group">
                <label>
                    Spine Thickness: {dimensions.spineWidth} mm
                    <input
                        type="range"
                        min="5"
                        max="100"
                        step="1"
                        value={dimensions.spineWidth}
                        onChange={(e) => setDimensions(d => ({ ...d, spineWidth: parseFloat(e.target.value) }))}
                        onWheel={(e) => handleWheel(e, 'spineWidth', 5, 100)}
                    />
                </label>
            </div>

            <div className="control-group">
                <label>
                    Open Book: {Math.round(openRatio * 100)}%
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={openRatio}
                        onChange={(e) => setOpenRatio(parseFloat(e.target.value))}
                        onWheel={handleOpenRatioWheel}
                    />
                </label>
            </div>

            <div className="control-group">
                <button onClick={() => setOpenRatio(openRatio > 0.5 ? 0 : 1)}>
                    {openRatio > 0.5 ? 'Close Book' : 'Open Book'}
                </button>
            </div>

            <div className="control-group">
                <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        checked={showPages}
                        onChange={(e) => setShowPages(e.target.checked)}
                    />
                    Show Pages (Full Book)
                </label>
            </div>

            <div className="control-group">
                <label>
                    Binding Type:
                    <select
                        value={bindingType}
                        onChange={(e) => setBindingType(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="swiss">Swiss (Flat)</option>
                        <option value="classic">Classic (Split)</option>
                    </select>
                </label>
            </div>

            <div className="instructions">
                <p>Left Click to Rotate</p>
                <p>Right Click to Pan</p>
                <p>Scroll to Zoom</p>
            </div>
        </div>
    );
}
