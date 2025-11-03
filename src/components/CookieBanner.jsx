import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookieConsent = document.cookie.includes('acceptCookies=true');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = "acceptCookies=true; max-age=31536000; path=/";
    setShowBanner(false);
  };

  return (
    showBanner && (
      <div style={{
        position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#333', color: 'white', padding: '15px', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p>
          Ce site utilise des cookies pour vous offrir la meilleure expérience de navigation. 
          En poursuivant votre navigation, vous acceptez leur utilisation. 
          <a href="/confidentiality" style={{ color: '#ffcc00' }}>En savoir plus</a>.
        </p>
        <button onClick={handleAccept} style={{
        padding: '10px', border: 'none', cursor: 'pointer',
        }} className='bg-orange-500 text-white'>
          Accepter
        </button>
      </div>
    )
  );
};

export default CookieBanner;
