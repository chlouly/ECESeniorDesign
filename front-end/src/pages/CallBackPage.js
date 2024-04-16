// CallbackPage Component
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CallbackPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            exchangeCodeForTokens(code);
        }
    }, []);

    const exchangeCodeForTokens = async (code) => {
        try {
            const response = await axios.post('https://pokidips.auth.us-east-1.amazoncognito.com/oauth2/token', new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: '6ke1tj0bnmg6ij6t6354lfs30q',
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
            
        }
    };

    return (
        <div>Loading...</div>
    );
};

export default CallbackPage;
