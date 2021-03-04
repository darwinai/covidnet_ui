import React from 'react';

const PreviewNotAvailable = () => (
    <svg width="100" height="100" className="thumbnail">
        <rect x="0" y="0" width="100" height="100" className="thumbnail" fill="#d2d2d2"/>
        <text x="50%" y="40%" alignmentBaseline="middle" textAnchor="middle">Preview not</text>    
        <text x="50%" y="60%" alignmentBaseline="middle" textAnchor="middle">available</text>    
    </svg>
);
export default PreviewNotAvailable;
