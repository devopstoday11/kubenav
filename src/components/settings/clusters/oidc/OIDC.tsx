import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  IonToast,
} from '@ionic/react';
import React, { useState } from 'react';

import { getOIDCLink } from '../../../../utils/api';
import { isBase64 } from '../../../../utils/helpers';
import { saveTemporaryCredentials } from '../../../../utils/storage';

const OIDC: React.FunctionComponent = () => {
  const [discoveryURL, setDiscoveryURL] = useState<string>('');
  const [clientID, setClientID] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [certificateAuthority, setCertificateAuthority] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleDiscoveryURL = (event) => {
    setDiscoveryURL(event.target.value);
  };

  const handleClientID = (event) => {
    setClientID(event.target.value);
  };

  const handleClientSecret = (event) => {
    setClientSecret(event.target.value);
  };

  const handleCertificateAuthority = (event) => {
    setCertificateAuthority(event.target.value);
  };

  const handleRefreshToken = (event) => {
    setRefreshToken(event.target.value);
  };

  const addOIDCProvider = async () => {
    if (discoveryURL === '' || clientID === '' || clientSecret === '') {
      setError('Discovery URL, Client ID and Client Secret are required.');
    } else {
      const ca = isBase64(certificateAuthority) ? atob(certificateAuthority) : certificateAuthority;

      saveTemporaryCredentials({
        clientID: clientID,
        clientSecret: clientSecret,
        idpIssuerURL: discoveryURL,
        refreshToken: refreshToken,
        certificateAuthority: ca,
        idToken: '',
        accessToken: '',
        expiry: 0,
      });

      if (refreshToken) {
        window.location.replace('/settings/clusters/oidc');
      } else {
        try {
          const url = await getOIDCLink(discoveryURL, clientID, clientSecret, ca);
          window.location.replace(url);
        } catch (err) {
          setError(err.message);
        }
      }
    }
  };

  return (
    <IonCard>
      <div className="card-header-image">
        <img alt="OIDC" src="/assets/card-header-oidc.png" />
      </div>
      <IonCardHeader>
        <IonCardTitle>OIDC Provider</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <p className="paragraph-margin-bottom">
          When you create the Client ID and Client Secret you have to allow <code>https://kubenav.io/oidc.html</code> as
          redirect URL.
        </p>
        <p className="paragraph-margin-bottom">
          When your OIDC provider uses self signed certificate you have to set the <b>Certificate Authority</b> field.
          You can also skip the redirect to the OIDC login page, by providing a valid refresh token.
        </p>

        <IonList className="paragraph-margin-bottom" lines="full">
          <IonItem>
            <IonLabel position="stacked">Discovery URL</IonLabel>
            <IonInput type="text" required={true} value={discoveryURL} onInput={handleDiscoveryURL} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Client ID</IonLabel>
            <IonInput type="text" required={true} value={clientID} onInput={handleClientID} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Client Secret</IonLabel>
            <IonInput type="text" required={true} value={clientSecret} onInput={handleClientSecret} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Certificate Authority (optional)</IonLabel>
            <IonTextarea autoGrow={true} value={certificateAuthority} onInput={handleCertificateAuthority} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Refresh Token (optional)</IonLabel>
            <IonTextarea autoGrow={true} value={refreshToken} onInput={handleRefreshToken} />
          </IonItem>
        </IonList>

        <IonButton expand="block" onClick={() => addOIDCProvider()}>
          Add OIDC Provider
        </IonButton>
      </IonCardContent>

      <IonToast isOpen={error !== ''} onDidDismiss={() => setError('')} message={error} duration={3000} />
    </IonCard>
  );
};

export default OIDC;
