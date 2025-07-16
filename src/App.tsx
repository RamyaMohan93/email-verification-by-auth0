import React from 'react';
import Auth0ProviderWrapper from './components/Auth0Provider';
import Auth0EmailVerification from './components/Auth0EmailVerification';

function App() {
  const handleVerificationComplete = () => {
    console.log('Email verification completed!');
  };

  return (
    <Auth0ProviderWrapper>
      <div className="App">
        <Auth0EmailVerification onComplete={handleVerificationComplete} />
      </div>
    </Auth0ProviderWrapper>
  );
}

export default App;