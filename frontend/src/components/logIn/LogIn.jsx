import {  useState } from 'react';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import './LogIn.css';



import { Link, useNavigate } from 'react-router-dom';


export function LogIn(){

    const definitions = useSiteDefinitions();

    const api = definitions.api.data;

    const navigator = useNavigate();

    async function submitSignIn(event){
        event.preventDefault();
        
        const setError = definitions.error.change;

        const data = new FormData(event.target);
        const email = data.get('email');
        const username = data.get('username');
        const password = data.get('password');

        if (!password || !username || !email) return setError('All fields required.');

        try{
            const response = await api.post('/logIn', {
                username: username,
                password: password,
                email: email
            })

            localStorage.setItem('jwtAccess', response.data.accessToken);
            definitions.user.change(response.data.user);
            navigator('/');
        }catch(err) {
            return setError(err?.response?.data.error || err.message);
        }

    }


    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setconfirmPassword] = useState()


    return (   
        <div className='signin'>
            <span className='title-signin-card'>
                Log In
            </span>

            <form className='signin-card' onSubmit={submitSignIn}>
                <div className='field-signin-input'>
                    <label 
                        htmlFor='username' 
                        className='label username-label'>
                        Username:
                    </label>

                    <input 
                        name='username' 
                        onChange={(event) => setUsername(event.target.value)} className='input-signin username-input'>
                    </input>

                </div>

                <div className='field-signin-input'>
                    <label 
                        htmlFor='password' 
                        className='label email-password'>
                        Password:
                    </label>

                    <Password change={setPassword} value={password} name='password'/>
                </div>

                <div className='field-signin-input'>
                    <label htmlFor='username' className='label username-label'>
                        Email:
                    </label>
                    <input name='email' onChange={(event) => setUsername(event.target.value)} className='input-signin username-input'>
                    </input>
                </div>

                <button className='submit-signin-form'>
                    Log In
                </button>

                <Link className='link-signin' to='/signIn'>
                    Don't have an account? Click here
                </Link>
            </form>
        </div>

    )
}


function Password({change, value, name}){

    const definitions = useSiteDefinitions();


    const [view, setView] = useState(false);

    return(
        <div className='password-container'>
            <input
                type={view ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={(event) => change(event.target.value)}
                className='input-signin password-input'>
            </input>
            <button type='button'  className='view-button-password' onClick={() => setView(prev => !prev)}>
                <i className='material-icons' style={{color: 'var(--primary)'}}>
                    {view ? 'visibility' : 'visibility_off'}
                </i>
            </button>
        </div>
    )
}