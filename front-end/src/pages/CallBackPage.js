// CallbackPage Component
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CallbackPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        console.log('Code:', code);
        if (code) {
            exchangeCodeForTokens(code);
        }
    }, []);

    const exchangeCodeForTokens = async (code) => {
        try {
            console.log('Exchanging code for tokens...');
            const response = await axios.post('https://pokidips.auth.us-east-1.amazoncognito.com/oauth2/token', new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: "6ke1tj0bnmg6ij6t6354lfs30q",
                client_secret: '1mvpj1rgggg4u3oho03r0h4rd3us2i80e8uaga21oal28lpcq89k',
                code: code,
                redirect_uri: 'https://pokidips.games/callback'
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { id_token, access_token } = response.data;
            localStorage.setItem('id_token', id_token);
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('isAuthenticated', 'true');

            navigate('/'); // Redirect to home or dashboard
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            // navigate('/login'); // Redirect to login on failure
            alert("Error exchanging code for tokens");
       
            // log the user out
            localStorage.removeItem('id_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('isAuthenticated');
            // Redirect to Cognito logout URL
            window.location.href = "https://pokidips.auth.us-east-1.amazoncognito.com/logout?client_id=6ke1tj0bnmg6ij6t6354lfs30q";
            
        }
    };

    return (
        <div>Loading...</div>
    );
};

export default CallbackPage;
