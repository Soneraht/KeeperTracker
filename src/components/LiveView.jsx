import React from 'react';

export default function LiveView({ address }) {
  const encoded = encodeURIComponent(address);
  return (
    <div className="live-view-card">
      <div className="live-view-header">
        <div className="live-view-title"><span className="live-dot"/>Live View</div>
        <div className="live-address" title={address}>{address}</div>
      </div>
      <iframe
        className="live-view-map"
        src={`https://maps.google.com/maps?q=${encoded}&output=embed&z=16`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Live View χάρτης"
      />
      <button
        className="live-open-btn"
        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank")}
      >
        🗺️ Άνοιγμα στο Google Maps
      </button>
    </div>
  );
}