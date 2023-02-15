import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FetchError = (props: { code: number }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (props.code === 403) {
            navigate("/logout");
        }
        else if (props.code >= 400)
            throw new Error('Something went wrong while fetching data');
    })
}

export default FetchError;