import { useState, useEffect } from 'react'
import useHttp from './http-hook'
import { useNavigate } from 'react-router-dom'

const useLoadProfile = () => {
    const [profileData, setProfileData] = useState(null)
    const { sendRequest, isLoading } = useHttp()
    const accessToken = localStorage.getItem('access');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            // Check if accessToken is truthy before proceeding
            if (accessToken) {
                try {
                    const userDetails = await sendRequest({
                        url: '/api/u/fetchUser',
                        method: 'POST',
                        body: JSON.stringify({
                            userId: localStorage.getItem('userId'),
                            token: accessToken
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })

                    // Save the fetched data to the state
                    setProfileData(userDetails[0]);
                } catch (error) {
                    console.error('Error:', error)
                }
            }
        }

        fetchProfile()
    }, [accessToken])

    function handleDestroyToken() {
        localStorage.removeItem('access')
        localStorage.removeItem('userId')
        setProfileData(null)
        navigate('/')
        // window.location.href = '/'
        // location.reload()
    }

    // Return the profileData, so it can be used by the component using this hook
    return { profileData, isLoading, handleDestroyToken }
}

export default useLoadProfile
