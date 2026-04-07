import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../authentication/AuthContext';

type WithAuthRedirectProps = object

function withAuthRedirect<T extends WithAuthRedirectProps>(Component: React.ComponentType<T>) {
  return function AuthRedirectWrapper(props: T) {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
      if (!auth.username) {
        navigate('/login'); // Redirect to login if user is not authenticated
      }
    }, [auth.username, navigate]);

    // If the user is authenticated, render the wrapped component
    return auth.username ? <Component {...props} /> : null;
  };
}

export default withAuthRedirect;
